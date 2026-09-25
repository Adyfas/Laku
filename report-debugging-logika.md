# 📋 Laporan Debugging Logika Aplikasi LAKU

> **Project:** Aplikasi bantu UMKM hitung bisnis (Literasi Digital & Financial)  
> **Tema:** Interaktif, Edukatif, Informatif  
> **Tanggal Analisis:** 21 September 2026  
> **Scope:** Frontend (Vanilla JS + TailwindCSS) — Single Page App dengan Modal Apps

---

## 🔴 KATEGORI 1: KESALAHAN FUNDAMENTAL PERHITUNGAN (KRITIS)

### 1.1 Formula Margin HPP Salah — `hppCalc.js:313`
**File:** `javascript/apps/hpp/hppCalc.js`  
**Baris:** 313  
**Kode Masalah:**
```javascript
const hargaJual = hppPerUnit / (1 - safeMargin / 100);
```

**Kenapa Cacat Logika:**
- Rumus ini menghitung **Profit Margin** (keuntungan sebagai persentase dari *harga jual*)
- Tapi UI label: `"Keuntungan di atas modal (Margin)"` dan tooltip: `"Ini margin bersih: keuntungan di atas harga jual"`
- UMKM Indonesia umumnya berpikir **Markup on Cost** (keuntungan sebagai persentase dari *modal/HPP*)
- **Contoh nyata:** HPP Rp 10.000, margin 30%
  - Formula saat ini: Rp 10.000 / 0.7 = **Rp 14.286** (keuntungan Rp 4.286 = 30% dari 14.286)
  - Ekspektasi UMKM: Rp 10.000 × 1.3 = **Rp 13.000** (keuntungan Rp 3.000 = 30% dari 10.000)
- **Selisih:** Rp 1.286 per unit → signifikan untuk volume besar

**Kondisi Karena Ini Cacat:** UMKM menjual dengan harga lebih mahal dari ekspektasi mereka → persaingan harga kalah, pelanggan kabur, untung tidak sesuai perencanaan.

**Solusi:**
```javascript
// Opsi A: Ganti formula ke Markup on Cost (sesuai mental model UMKM)
const hargaJual = hppPerUnit * (1 + safeMargin / 100);

// Opsi B: Jaga formula Profit Margin tapi ubah SEMUA label UI jadi "Margin pada Harga Jual"
// dan tambah penjelasan: "30% margin = untung 30% dari harga jual, bukan dari modal"
```
**Rekomendasi:** Opsi A (lebih intuitif untuk UMKM gaptek).

---

### 1.2 Validasi Stok HPP vs Produksi Tidak Konsisten — `hppIngredients.js` vs `produksiClient.js`
**File:** `javascript/apps/hpp/hppIngredients.js` (baris 510-520) & `javascript/apps/produksi/produksiClient.js` (baris 72-86)

**Kode Masalah HPP (validasi saat input):**
```javascript
// hppIngredients.js:510-520
if (qtyWorking > getWorkingStock(item)) {
  // tolak input
}
```

**Kode Masalah Produksi (pengurangan stok):**
```javascript
// produksiClient.js:72-86
const applyWorkingDeduction = (item, requiredWorking) => {
  const displayUnit = getDisplayUnit(item);
  if (item.nestedLevels?.length) {
    const ratio = window.LakuUnits.getNestedRatio(item);
    const remaining = window.LakuUnits.round2(getWorkingStock(item) - requiredWorking);
    item.stok = Math.floor(remaining / ratio);      // ⚠️ Math.floor bisa kehilangan presisi
    item.looseQty = window.LakuUnits.round2(remaining - item.stok * ratio);
    return;
  }
  // ...
};
```

**Kenapa Cacat Logika:**
1. **HPP** memvalidasi dengan `qtyWorking > getWorkingStock()` — membandingkan *quantity working unit* dengan *total working stock*
2. **Produksi** mengurangi stok dengan `Math.floor(remaining / ratio)` — pembulatan ke bawah menyebabkan **kehilangan stok pecahan** (looseQty)
3. Ketika user input di HPP lolos validasi (mis. stok 10.5 kg, butuh 10.5 kg), tapi di produksi `Math.floor` membuat stok jadi 10 kg + 0.5 looseQty → **validasi HPP terlalu longgar**

**Kondisi Karena Ini Cacat:** User bisa lanjut HPP tapi saat produksi stok "tidak cukup" padahal HPP bilang cukup → inkonsistensi UX, user bingung.

**Solusi:**
- Gunakan fungsi validasi **yang sama** di HPP dan Produksi (extract ke `window.LakuUnits.validateStockSufficient(item, requiredQty, requiredUnit)`)
- Atau di HPP validasi dengan logika yang **mirip produksi** (hitung remaining setelah deduction, cek >= 0)

---

### 1.3 BEP Calculation Edge Case — `labaClient.js:22-27`
**File:** `javascript/apps/laba/labaClient.js`  
**Baris:** 22-27

**Kode Masalah:**
```javascript
let bepUnit = 0;
if (marginPerUnit > 0) {
  bepUnit = Math.ceil(totalBiayaTetap / marginPerUnit);
} else {
  bepUnit = "N/A (harga jual lebih murah dari modal bahan)";
}
```

**Kenapa Cacat Logika:**
- `bepUnit` bisa jadi **string** ("N/A...") atau **number**
- Baris 33: `document.getElementById("resBepUnit").textContent = typeof bepUnit === "number" ? `${bepUnit} Unit` : bepUnit;`
- Tapi kalau `marginPerUnit === 0` (harga jual == biaya variabel), `bepUnit = "N/A..."` tapi **tidak ada validasi** apakah `totalBiayaTetap > 0`
- Jika `totalBiayaTetap === 0` DAN `marginPerUnit === 0` → usaha "balik modal" tapi ditampilkan "N/A"

**Kondisi Karena Ini Cacat:** UMKM dengan biaya tetap nol (mis. warung di depan rumah, nggak sewa) tapi harga jual = modal bahan → ditampilkan "N/A" padahal seharusnya "BEP = 0 unit (langsung untung dari unit pertama)".

**Solusi:**
```javascript
if (marginPerUnit > 0) {
  bepUnit = Math.ceil(totalBiayaTetap / marginPerUnit);
} else if (marginPerUnit === 0) {
  bepUnit = totalBiayaTetap > 0 
    ? "Tidak pernah BEP (harga jual = modal bahan, tapi ada biaya tetap)"
    : "0 Unit (langsung untung, tidak ada biaya tetap)";
} else {
  bepUnit = "RUGI per unit (harga jual < modal bahan)";
}
```

---

## 🟠 KATEGORI 2: INKONSISTENSI DATA & STATE MANAGEMENT

### 2.1 Inventory Schema Migration Asumsi Berbahaya — `inventoryClient.js:214-227`
**File:** `javascript/apps/inventory/inventoryClient.js`  
**Baris:** 214-227

**Kode Masalah:**
```javascript
if ((item?.schemaVersion || 1) < INVENTORY_SCHEMA_VERSION) {
  const legacyUnit = nestedLevels.length > 0
    ? U.getNestedUnit(normalizedItem)
    : U.normalizeUnit(item?.storageUnit || baseUnit);
  const legacyValue = rawStok + normalizeQty(item?.looseQty ?? 0);
  const displayValue = nestedLevels.length > 0
    ? U.convertNested(legacyValue, legacyUnit, displayUnit, normalizedItem)
    : U.convertUnitExact(legacyValue, legacyUnit, displayUnit);
  // ...
}
```

**Kenapa Cacat Logika:**
- **Asumsi:** Data lama (v1) selalu menyimpan stok dalam `baseUnit` (satuan terkecil)
- **Realita:** User v1 bisa saja input stok dalam `displayUnit` (mis. "5 kg" bukan "5000 gram")
- Migration otomatis akan **salah konversi** → stok jadi 1000x atau 0.001x nilai asli
- Tidak ada **verifikasi/confirmasi** ke user saat migration

**Kondisi Karena Ini Cacat:** Data stok user rusak permanen setelah upgrade versi → kepercayaan hilang, data tidak bisa dipulihkan.

**Solusi:**
```javascript
// Tambah deteksi heuristik: jika stok > 1000 dan unit adalah kg/liter → kemungkinan sudah dalam base unit
// Atau: tampilkan modal konfirmasi migration pertama kali buka inventory v2
// Atau: simpan raw value asli, jangan migrate otomatis, biarkan user yang adjust manual
```

---

### 2.2 Dashboard Summary Duplikasi Logika — `app.js:118-180`
**File:** `javascript/core/app.js`  
**Baris:** 118-180

**Kode Masalah:**
```javascript
// Saldo Kas - dihitung di sini
const kasRaw = localStorage.getItem("laku_cashbook_data");
// ... hitung totalMasuk, totalKeluar, saldo

// Total Piutang - dihitung di sini
const utangRaw = localStorage.getItem("laku_utang_data");
// ... hitung totalPiutang

// Total Stok - dihitung di sini
const invRaw = localStorage.getItem("laku_inventory_data");
// ... hitung lowCount
```

**Kenapa Cacat Logika:**
- Logika perhitungan **sama persis** dengan yang ada di masing-masing module (`kasClient.js`, `utangClient.js`, `inventoryClient.js`)
- **DRY violation** → kalau ada perubahan formula di module, dashboard jadi **out of sync**
- Contoh: `kasClient.js` hitung saldo di `renderTable()`, tapi `app.js` hitung ulang di `updateDashboardState()`

**Kondisi Karena Ini Cacat:** Dashboard menampilkan angka berbeda dengan yang di dalam module → user bingung mana yang benar.

**Solusi:**
- Buat **shared utility functions** di `appUtils.js` atau namespace `window.LakuCalc`:
  ```javascript
  window.LakuCalc = {
    getKasSummary: () => ({ masuk, keluar, saldo }),
    getUtangSummary: () => ({ piutang, utang, dueToday }),
    getInventorySummary: () => ({ total, low, empty }),
  };
  ```
- Semua module (dashboard, kas, utang, inventory) **panggil fungsi yang sama**

---

### 2.3 Session Storage Race Condition HPP — `hppClient.js:317-360`
**File:** `javascript/apps/hpp/hppClient.js`  
**Baris:** 317-360 (fungsi `restoreHppDraft`)

**Kode Masalah:**
```javascript
function restoreHppDraft(state) {
  // ...
  window.LakuHpp.ingredients = state.ingredients || [];
  // Normalize overhead items: ensure each has an ID
  const rawOverhead = state.overheadItems || [];
  window.LakuHpp.overheadItems = rawOverhead.map((item, idx) => {
    if (item.id) return item;
    return { ...item, id: "ovh_" + Date.now() + "_" + idx + "_" + Math.random().toString(36).substr(2, 9) };
  });
  // ...
  // Note: unit selector for pending ingredient will be refreshed by refreshIngredientUI
}
```

**Kenapa Cacat Logika:**
- `Date.now()` + `Math.random()` untuk generate ID → **bisa collision** kalau user cepat buka/tutup modal
- `refreshIngredientUI()` dipanggil **setelah** restore, tapi `hppInventorySelect` event handler `change` sudah terpasang di `initHppAppLogic` → **race condition** antara restore dan UI ready
- `editingIngredientDraft` / `editingOverheadDraft` direstore tapi `startEditIngredient/Overhead` tidak dipanggil otomatis → state edit **hanging** (UI tidak masuk mode edit tapi state bilang sedang edit)

**Kondisi Karena Ini Cacat:** User buka HPP, tutup cepat, buka lagi → bahan/overhead hilang, atau UI stuck di mode edit yang tidak terlihat.

**Solusi:**
- Gunakan `window.LakuHpp.generateHppId()` yang sudah ada (consistent counter + timestamp)
- Restore **edit mode** secara eksplisit: `if (state.editingIngredientId) window.LakuHpp.startEditIngredient(...)`
- Tambah flag `window.LakuHpp._restoring = true` saat restore, skip `saveSession()` di event handlers

---

## 🟡 KATEGORI 3: GUIDED TOUR ENGINE BUGS (PENGALAMAN USER)

### 3.1 Orphan DOM Elements & Memory Leak — `guidedTour.js:465-482, 866-891`
**File:** `javascript/core/guidedTour.js`

**Kode Masalah:**
```javascript
function _removeDOM() {
  if (rootContainer) {
    rootContainer.style.display = "none";
    try { rootContainer.innerHTML = ""; } catch (e) {}
    rootContainer.remove();
    // ... nullify refs
  }
}

// _finishTour() baris 866-891: fallback cleanup yang redundan tapi tidak lengkap
var ids = ["lakuTourContainer", "lakuTourFrame", "lakuTourPopover"];
for (var i = 0; i < ids.length; i++) {
  var orphan = document.getElementById(ids[i]);
  if (orphan) orphan.remove();
}
// TAPI: popoverArrow, svgMask, cutoutRect, pulseRing TIDAK dibersihkan oleh ID
```

**Kenapa Cacat Logika:**
- `rootContainer.innerHTML = ""` menghapus children tapi **event listeners** di `popover`, `svgMask` tetap attached ke removed nodes
- `popoverArrow` adalah child langsung `popover` (bukan di dalam `rootContainer.innerHTML` karena `popover.appendChild(popoverArrow)` di baris 459) → **tidak terhapus** oleh `innerHTML = ""`
- `engineRafId` (requestAnimationFrame loop) **tidak selalu dibatalkan** tepat waktu → callback terus jalan setelah tour selesai
- `startTimeoutId` bisa **re-trigger** `_goToStep(0)` setelah `_finishTour()` jika timing race condition

**Kondisi Karena Ini Cacat:** 
- User buka/tutup tour berulang → DOM pollution, memory leak, performansi turun
- Click handler di `svgMask` (baris 423-425) tetap aktif di orphan SVG → click di body tertangkap

**Solusi:**
```javascript
function _removeDOM() {
  if (!rootContainer) return;
  
  // 1. Stop RAF loop SEBELUM hapus DOM
  if (engineRafId) { cancelAnimationFrame(engineRafId); engineRafId = null; }
  if (startTimeoutId) { clearTimeout(startTimeoutId); startTimeoutId = null; }
  
  // 2. Remove event listeners explicitly
  if (svgMask) { svgMask.removeEventListener("click", ...); }
  if (popover) { /* remove button listeners */ }
  
  // 3. Remove ALL created elements by reference, not ID
  [spotlightFrame, popover, popoverArrow, svgMask].forEach(el => el?.remove());
  
  // 4. Nullify ALL refs
  rootContainer = svgMask = cutoutRect = spotlightFrame = popover = popoverArrow = currentTargetEl = null;
  hiddenEls = [];
}
```

---

### 3.2 Hidden Element Restoration Bug — `guidedTour.js:792-819`
**File:** `javascript/core/guidedTour.js`  
**Baris:** 792-819 (fungsi `_goToStep`)

**Kode Masalah:**
```javascript
if (el.classList.contains("hidden")) {
  el.classList.remove("hidden");
  el.setAttribute("data-tour-was-hidden", "true");
  hiddenEls.push(el);
  wasHidden = true;
}
// ...
if (step.highlightParent && el.parentElement) {
  var parent = el.parentElement;
  while (parent && parent !== document.body) {
    // ...
    if (parent.classList.contains("hidden")) {
      parent.classList.remove("hidden");
      parent.setAttribute("data-tour-was-hidden", "true");
      hiddenEls.push(parent);
      wasHidden = true;
    }
    currentTargetEl = parent;  // ⚠️ OVERWRITE currentTargetEl ke parent!
    break;
  }
}
```

**Kenapa Cacat Logika:**
- `currentTargetEl` di-overwrite ke **parent** saat `highlightParent: true`
- `_restoreHiddenElements()` mengembalikan `hidden` ke **semua** elemen di `hiddenEls` (termasuk parent)
- Tapi `el` (target asli) **juga** di `hiddenEls` → **kedua-duanya** dikembalikan ke hidden
- **Masalah:** Parent mungkin container besar (mis. `#kasForm` wrapper) → **seluruh form jadi hidden** setelah tour!

**Kondisi Karena Ini Cacat:** Setelah tour selesai, form input/section utama jadi `hidden` → user tidak bisa input data.

**Solusi:**
```javascript
// Hanya unhide parent untuk keperluan spotlight, JANGAN simpan ke hiddenEls
// Atau: clone parent bounds tanpa unhide parent asli
if (step.highlightParent && el.parentElement) {
  var parent = el.parentElement;
  while (parent && parent !== document.body) {
    var pRect = parent.getBoundingClientRect();
    if (pRect.width > 80 && pRect.height > 40) {
      currentTargetEl = parent; // untuk bounds calculation saja
      break;
    }
    parent = parent.parentElement;
  }
}
// JANGAN unhide parent, JANGAN push ke hiddenEls
```

---

### 3.3 Tour Step Selector Tidak Match Saat Modal Belum Render — `app.js:329-334`
**File:** `javascript/core/app.js`  
**Baris:** 329-334

**Kode Masalah:**
```javascript
// Trigger per-module tour on first visit
if (window.LakuTour && !window.LakuTour.isCompleted(appKey)) {
  setTimeout(function () {
    window.LakuTour.start(appKey);
  }, 600);
}
```

**Kenapa Cacat Logika:**
- `openAppModal()` render UI module **async** (ada `setTimeout 10ms` untuk animasi, lalu `renderHppApp()` dll)
- Tour start di `setTimeout 600ms` tapi **tidak menunggu** `renderXxxApp()` selesai
- Selector tour (mis. `#hppStepIndicator`) **belum ada di DOM** → tour skip step atau error

**Kondisi Karena Ini Cacat:** Tour tidak muncul atau stuck di step pertama karena element tidak ditemukan.

**Solusi:**
```javascript
window.openAppModal = (appKey) => {
  // ... existing code ...
  
  // Render app DULU, baru start tour
  const renderPromise = new Promise(resolve => {
    if (appKey === "hpp" && typeof renderHppApp === "function") {
      renderHppApp(modalAppContent);
      resolve();
    } // ... dst untuk module lain
  });
  
  renderPromise.then(() => {
    renderLearnReturnBar(appKey);
    if (window.LakuTour && !window.LakuTour.isCompleted(appKey)) {
      setTimeout(() => window.LakuTour.start(appKey), 300); // kurangi delay, UI sudah ready
    }
  });
};
```

---

## 🟢 KATEGORI 4: EDGE CASES & UX GAPTEK

### 4.1 Number Input Formatting Mengganggu Input Desimal — `appUtils.js:8-18`
**File:** `javascript/core/appUtils.js`  
**Baris:** 8-18

**Kode Masalah:**
```javascript
window.formatNumberInput = function (input) {
  let raw = oldVal.replace(/\D/g, "");
  // ...
  let formatted = raw.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  input.value = formatted;
};
```

**Kenapa Cacat Logika:**
- Menghapus **SEMUA non-digit** termasuk **titik desimal** (`.`)
- User input `0.5` → jadi `05` → formatted `05` → **nilai jadi 5 bukan 0.5**
- UMKM butuh input desimal untuk kg, liter, dll (mis. `0.5 kg`, `1.5 liter`)

**Kondisi Karena Ini Cacat:** User tidak bisa input qty pecahan di HPP/Inventory → data tidak akurat.

**Solusi:**
```javascript
window.formatNumberInput = function (input) {
  let val = input.value;
  // Hanya format bagian integer, biarkan desimal
  const parts = val.split(".");
  if (parts.length > 2) val = parts[0] + "." + parts.slice(1).join(""); // hanya 1 titik
  parts[0] = parts[0].replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  input.value = parts.join(".");
};
```

---

### 4.2 LocalStorage Key Hardcoded di Banyak Tempat — Maintenance Nightmare
**Files:** `app.js`, `kasClient.js`, `utangClient.js`, `inventoryClient.js`, `labaClient.js`, `produksiClient.js`, `promoClient.js`, `hppClient.js`, `hppRecipes.js`

**Ditemukan 9+ localStorage key hardcoded:**
- `laku_cashbook_data` (kas)
- `laku_utang_data` (utang)
- `laku_inventory_data` (inventory)
- `laku_recipe_data` (HPP resep)
- `laku_produksi_data` (produksi)
- `laku_laba_data` (laba)
- `laku_promo_data` (promo)
- `laku_hpp_session` (HPP session)
- `laku_learn_state` (learn)
- `laku_tour_completed` (tour)
- `status` (profile)

**Kenapa Cacat Logika:**
- Typo di satu tempat → data terpisah, bug sulit deteksi
- Tidak bisa **migrasi/rename key** tanpa cari-replace manual di 10+ file
- Tidak ada **versioning** per key (beberapa pakai schemaVersion, beberapa tidak)

**Solusi:**
```javascript
// Buat constants di appUtils.js atau config terpisah
window.LakuStorage = {
  KEYS: {
    CASHBOOK: "laku_cashbook_data",
    UTANG: "laku_utang_data",
    INVENTORY: "laku_inventory_data",
    RECIPE: "laku_recipe_data",
    PRODUCTION: "laku_produksi_data",
    LABA: "laku_laba_data",
    PROMO: "laku_promo_data",
    HPP_SESSION: "laku_hpp_session",
    LEARN: "laku_learn_state",
    TOUR: "laku_tour_completed",
    PROFILE: "status",
  },
  // Helper dengan versioning
  get: (key, defaultValue = []) => { ... },
  set: (key, value) => { ... },
};
```

---

### 4.3 Notification Permission UX Buruk — `utangClient.js:245-263`
**File:** `javascript/apps/utang/utangClient.js`  
**Baris:** 245-263

**Kode Masalah:**
```javascript
const enableNotifBtn = document.getElementById("enableNotifBtn");
if (enableNotifBtn) {
  if ("Notification" in window && Notification.permission === "granted") {
    // hide banner
  } else {
    enableNotifBtn.addEventListener("click", () => {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") { /* hide banner */ }
      });
    });
  }
}
```

**Kenapa Cacat Logika:**
- Jika user **blokir** notifikasi (`permission === "denied"`), tombol tetap ada tapi **click tidak melakukan apa-apa** (tidak ada feedback)
- Tidak ada **penjelasan cara enable manual** via browser settings
- Banner tidak auto-hide kalau permission `denied` → UI noise permanen

**Kondisi Karena Ini Cacat:** User yang blokir notif sees tombol yang "mati" tanpa penjelasan → frustrasi.

**Solusi:**
```javascript
Notification.requestPermission().then((permission) => {
  if (permission === "granted") {
    notifBanner.classList.add("hidden");
    checkDueNotifications();
  } else if (permission === "denied") {
    // Tampilkan panduan manual
    enableNotifBtn.outerHTML = `
      <div class="text-xs text-rose-600 bg-rose-50 p-2 rounded-xl">
        ${LakuIcons.svg("alertTriangle", "1em")} Notifikasi diblokir. 
        Aktifkan di pengaturan browser: <b>Site Settings > Notifications > Allow</b>
      </div>
    `;
  }
});
```

---

### 4.4 Learn Module Streak Timezone Bug — `learnState.js:145-170`
**File:** `javascript/pages/learn/learnState.js`  
**Baris:** 145-170

**Kode Masalah:**
```javascript
function todayString() {
  var now = new Date();
  var month = now.getMonth() + 1;
  var day = now.getDate();
  return now.getFullYear() + "-" + (month < 10 ? "0" + month : month) + "-" + (day < 10 ? "0" + day : day);
}

function touchStreak() {
  var today = todayString();
  if (I.state.streak.lastDate === today) return;
  if (I.state.streak.lastDate === yesterdayString()) {
    I.state.streak.count += 1;
  } else {
    I.state.streak.count = 1;
  }
  I.state.streak.lastDate = today;
  saveState();
}
```

**Kenapa Cacat Logika:**
- Menggunakan `new Date()` lokal → **timezone dependent**
- User buka app jam 23:00 WIB (hari ini), besok buka jam 01:00 WIB (sudah hari baru tapi useranggap "malam tadi") → streak **reset** padahal user masih hari yang sama
- `yesterdayString()` pakai `setDate(now.getDate() - 1)` → **tidak handle DST/leap year** dengan benar

**Kondisi Karena Ini Cacat:** Streak reset tidak adil untuk user yang buka app lintas midnight → gamifikasi gagal motivate.

**Solusi:**
```javascript
// Gunakan UTC date untuk konsistensi, atau simpan timestamp lastActive
function todayString() {
  var now = new Date();
  // Normalize ke UTC midnight untuk konsistensi cross-timezone
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())).toISOString().split("T")[0];
}

// Atau simpan lastActive timestamp, cek apakah < 48 jam
function touchStreak() {
  var now = Date.now();
  var last = I.state.streak.lastActive || 0;
  var diffHours = (now - last) / 36e5;
  if (diffHours < 24) return; // sudah hari ini
  if (diffHours < 48) I.state.streak.count += 1;
  else I.state.streak.count = 1;
  I.state.streak.lastActive = now;
  saveState();
}
```

---

### 4.5 Unit Conversion Packaging Unit Rejection Terlalu Ketat — `unitConversion.js:143-145`
**File:** `javascript/core/unitConversion.js`  
**Baris:** 143-145

**Kode Masalah:**
```javascript
if (from !== to && (PACKAGING_UNITS.has(from) || PACKAGING_UNITS.has(to))) {
  return null;
}
```

**Kenapa Cacat Logika:**
- Menolak **semua** konversi yang melibatkan `bungkus`, `pack`, `botol`, `dus`, `roll`, `lembar`
- Tapi **nested packaging** (mis. `1 dus = 10 bungkus`, `1 bungkus = 5 pcs`) **butuh** konversi antar packaging unit
- `getCompatibleUnits()` (baris 181) juga return `[u]` saja untuk packaging unit → user **tidak bisa pilih satuan lain** di dropdown HPP

**Kondisi Karena Ini Cacat:** User punya stok `1 dus` tapi mau input `5 bungkus` di HPP → dropdown satuan hanya tampil `dus` → tidak bisa input `bungkus` walau nestedLevels sudah didefinisikan.

**Solusi:**
```javascript
function convertUnitExact(value, fromUnit, toUnit) {
  const from = normalizeUnit(fromUnit);
  const to = normalizeUnit(toUnit);
  
  // Jika KEDUANYA packaging unit, coba cek nestedLevels di item
  if (PACKAGING_UNITS.has(from) && PACKAGING_UNITS.has(to)) {
    // Return null tapi biarkan caller (convertNested) handle via item.nestedLevels
    return null; // convertNested akan handle ini
  }
  // Jika SATU packaging unit, satu base unit → allow via convertNested
  // ... rest of function
}

// Di getCompatibleUnits: untuk nested item, return SEMUA unit dari nestedLevels
function getCompatibleUnits(unit, item) {
  if (item?.nestedLevels?.length) {
    return Object.keys(getNestedUnitMap(item));
  }
  // ... existing logic
}
```

---

## 📊 RINGKASAN PRIORITAS PERBAIKAN

| Prioritas | Issue | File | Estimasi Effort | Impact |
|-----------|-------|------|-----------------|--------|
| **P0 - Blocker** | Formula Margin HPP salah | `hppCalc.js:313` | 30 menit | **Sangat Tinggi** - UMKM rugi/kecewa |
| **P0 - Blocker** | Validasi Stok HPP vs Produksi inkonsisten | `hppIngredients.js`, `produksiClient.js` | 2 jam | **Tinggi** - User bingung, data corrupt |
| **P1 - Critical** | Inventory Migration Asumsi Berbahaya | `inventoryClient.js:214` | 1 jam | **Tinggi** - Data rusak permanen |
| **P1 - Critical** | Dashboard Summary Duplikasi Logika | `app.js`, `kasClient.js`, dll | 1.5 jam | **Sedang** - Inkonsistensi angka |
| **P1 - Critical** | Tour Orphan DOM & Memory Leak | `guidedTour.js` | 1.5 jam | **Sedang** - Performansi degrade |
| **P2 - Major** | Tour Hidden Element Restoration Bug | `guidedTour.js:792` | 45 menit | **Sedang** - Form jadi hidden |
| **P2 - Major** | Tour Start Race Condition | `app.js:329` | 30 menit | **Sedang** - Tour tidak jalan |
| **P2 - Major** | Number Input Block Desimal | `appUtils.js:8` | 30 menit | **Tinggi** - Input qty pecahan gagal |
| **P3 - Minor** | LocalStorage Key Hardcoded | 10+ files | 2 jam | **Rendah** - Maintenance cost |
| **P3 - Minor** | Notif Permission UX | `utangClient.js:245` | 30 menit | **Rendah** - UX minor |
| **P3 - Minor** | Learn Streak Timezone | `learnState.js:145` | 45 menit | **Rendah** - Gamifikasi unfair |
| **P3 - Minor** | Unit Conversion Packaging | `unitConversion.js:143` | 1 jam | **Sedang** - Fleksibilitas input |

---

## 🎯 REKOMENDASI STRATEGIS

### Quick Wins (Hari 1-2):
1. **Fix formula margin HPP** → ganti ke markup on cost
2. **Fix number input desimal** → allow titik desimal
3. **Fix tour race condition** → tunggu render selesai sebelum start tour
4. **Fix tour hidden element bug** → jangan unhide parent ke hiddenEls

### Structural Fixes (Minggu 1):
5. **Centralize calculation utilities** → `window.LakuCalc` shared functions
6. **Unify stock validation** → single source of truth untuk HPP & Produksi
7. **Fix inventory migration** → add confirmation atau heuristic detection
8. **Cleanup guided tour DOM** → proper event listener removal, RAF cancellation

### Tech Debt Reduction (Minggu 2):
9. **Constants for localStorage keys** → single source of truth
10. **Timezone-agnostic streak** → UTC date atau timestamp-based
11. **Packaging unit conversion** → support nestedLevels di dropdown HPP
12. **Add integration tests** untuk critical paths (HPP→Produksi→Inventory flow)

---

## 📝 CATATAN TAMBAHAN

> **Arsitektur Overall:** Modular & clean separation (App, Core, Apps, Pages). Good use of namespaces (`window.LakuHpp`, `window.LakuUnits`, `window.LakuTour`, `window.LakuLearnState`). Session persistence via localStorage/sessionStorage well implemented.

> **Area Paling Rentan:** 
> 1. **HPP Calculation Engine** — business logic core, bug di sini = user rugi uang nyata
> 2. **Guided Tour Engine** — complex DOM manipulation, race conditions, memory leaks
> 3. **Inventory ↔ HPP ↔ Produksi Integration** — 3 module share data, inconsistency = data corrupt

> **Testing Gap:** Tidak ada unit/integration test. Rekomendasi tambah Vitest/Jest untuk:
> - `window.LakuUnits` conversion functions
> - `window.LakuHpp.calculateValues()` 
> - `window.LakuTour` start/stop/cleanup
> - Inventory migration scenarios

---

*Report ini dihasilkan dari analisis static code review. Disarankan validasi dengan manual testing pada flow kritis: HPP → Simpan Resep → Produksi → Cek Stok Inventory → Dashboard Summary.*