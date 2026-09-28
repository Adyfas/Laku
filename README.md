# Laku — Solusi Praktis Kelola Usaha UMKM

> **Laku** adalah aplikasi web pendamping keuangan harian untuk pelaku UMKM Indonesia:
> memisahkan uang pribadi dan uang dagang, mencatat transaksi, menghitung modal &
> harga jual, serta belajar lewat cerita interaktif — semuanya dalam Bahasa Indonesia
> dan dirancang agar mudah dipakai pemilik usaha yang gagap teknologi (*gaptek-friendly*).
>
> Dibuat untuk kompetisi **SISWA INVENTION 2026** (Universitas Udayana),
> subtema *"Empowering Digital Business for a Smarter Economy"*.

- Motto: *"Bersama Laku, UMKM Tumbuh Lebih Mudah."*
- Sifat proyek: **website statis murni** — HTML + CSS + JavaScript vanilla, **tanpa npm,
  tanpa bundler, tanpa framework JS** (sesuai aturan lomba).
- Halaman: **6** (`index`, `app`, `about`, `learn`, `kontak`, `404`) — dalam batas
  maksimal 7 halaman.
- Penyimpanan data: **`localStorage` peramban** (tanpa backend / database).

---

## Daftar Isi

1. [Masalah → Solusi](#1-masalah--solusi)
2. [Tata Cara Menjalankan Project](#2-tata-cara-menjalankan-project)
3. [Pengenalan Page](#3-pengenalan-page)
4. [Rumus yang Dipakai di Aplikasi](#4-rumus-yang-dipakai-di-aplikasi)
5. [Fitur Aplikasi](#5-fitur-aplikasi)
6. [Tech Stack](#6-tech-stack)
7. [Struktur Folder](#7-struktur-folder)
8. [Sumber & Kredit Aset](#8-sumber--kredit-aset)
9. [Pengujian & Catatan](#9-pengujian--catatan)

---

## 1. Masalah → Solusi

### 1.1 Masalah

UMKM adalah salah satu sektor penting perekonomian Indonesia — membuka lapangan kerja,
mendorong pertumbuhan ekonomi, dan meratakan kesejahteraan. Namun dalam praktiknya
pelaku UMKM menghadapi banyak kendala, terutama **pengelolaan keuangan, pencatatan
usaha, branding, dan pemanfaatan teknologi digital**.

Tiga masalah inti yang disasar Laku:

1. **Keuangan pribadi dan keuangan usaha tercampur.** Uang masuk dan keluar sering
   hanya dicatat di buku tulis biasa — bahkan tidak dicatat sama sekali — sehingga
   pemilik sulit mengetahui kondisi usaha yang sebenarnya.
2. **Penetapan harga yang salah.** Modal sering dihitung asal ("modal dikali 2, jadi
   harga jual"), lupa memasukkan tenaga kerja sendiri, listrik, bensin, dan kemasan.
3. **Literasi digital rendah.** Banyak pelaku usaha belum terbiasa memakai media
   digital untuk belajar, mencatat transaksi, menghitung laba rugi, atau
   mengembangkan usaha secara profesional — sehingga tertinggal di era teknologi.

> *"Mengelola usaha bukan sekadar menjual produk. Ini adalah tentang keteraturan
> keuangan dan keterbukaan terhadap teknologi."* — halaman utama Laku

### 1.2 Solusi: tiga pilar Laku

Website Laku menjawab masalah di atas lewat tiga pilar:

| Pilar | Isi |
|---|---|
| **Informasi** | Dasar pengelolaan keuangan UMKM, pentingnya memisahkan uang pribadi dan uang usaha, dasar literasi digital, kesalahan umum UMKM, tips memulai usaha yang tertata. |
| **Edukasi** | Pembelajaran interaktif: ringkasan materi poin singkat, video pembelajaran, kuis setelah materi, checklist kesiapan digital, dan cerita visual-novel **Bu Siti** (6 skenario masalah nyata UMKM). |
| **Interaktif** | Alat bantu yang langsung bisa dipakai: **kalkulator harga jual (HPP)**, pencatatan pemasukan/pengeluaran (buku kas), simulasi laba rugi + BEP, pencatatan utang-piutang, stok inventaris dan pencatatan produksi. |

### 1.3 Tujuan & manfaat (ringkas)

- Menyediakan informasi pengelolaan keuangan yang mudah dipahami.
- Meningkatkan literasi digital pelaku UMKM.
- Membantu pencatatan keuangan usaha secara sederhana (termasuk lewat kuis dan fitur edukatif).
- Memberi alat bantu sederhana — kalkulator laba rugi, pencatatan usaha — agar UMKM
  berkembang lebih tertata, profesional, dan adaptif terhadap era digital.

---

## 2. Tata Cara Menjalankan Project

### 2.1 Prasyarat

- **Hanya peramban modern** (Chrome / Firefox / Safari terbaru, desktop maupun mobile).
- **Tidak perlu Node.js, npm, atau proses build apa pun** — repo ini tidak memiliki
  `package.json`, `node_modules`, maupun konfigurasi bundler.

### 2.2 Menjalankan secara lokal

Karena situs memakai path absolut (`/icons/...`, `/manifest.json`, `/sw.js`), situs
**tidak bisa dibuka langsung lewat `file://`**. Jalankan lewat server statis dari
folder `FE/`:

```bash
cd FE
npx serve
# lalu buka http://localhost:3000
```

Alternatif lain yang setara: ekstensi **Live Server** (VS Code), atau
`firebase emulators:start` bila sudah memasang Firebase CLI.

Alur buka: `index.html` (landing) → `app.html` (ruang kerja) → `learn.html` (edukasi).

### 2.3 Deploy ke Firebase Hosting

Project Firebase: **`laku-umkm`** (lihat `.firebaserc`).

```bash
cd FE
firebase login
firebase deploy
```

Konfigurasi penting di `firebase.json`:

- `hosting.public: "."` — deploy langsung dari folder `FE/`.
- Rewrite `"**" → "/index.html"` — halaman tak dikenal jatuh ke landing.
- `Cache-Control: max-age=31536000` untuk `*.js|css` dan gambar.
- **Pengecualian**: `/sw.js` memakai `no-cache, no-store, must-revalidate` agar
  pembaruan service worker tidak tertahan cache setahun.

### 2.4 Data & reset

- Seluruh data usaha (profil, kas, stok, utang, resep, dsb.) tersimpan di
  **`localStorage`** dengan prefix `laku_` — tidak ada akun, tidak ada server.
- Reset data: tombol **Reset Profil Usaha** di dashboard `app.html`, atau hapus
  *site data* lewat pengaturan peramban.

---

## 3. Pengenalan Page

| File | Judul | Fungsi |
|---|---|---|
| `index.html` | Laku | **Landing page**: hero ("Uang Usaha Tertata & Bisnis Lebih Terarah"), statistik UMKM, video dokumenter, section masalah sehari-hari, grid 6 kartu fitur, CTA ke aplikasi. |
| `app.html` | Buat Profile - Laku | **Ruang kerja aplikasi**: registrasi profil usaha → dashboard (kas, piutang, stok, produksi) → 7 modul terbuka sebagai modal layar penuh. Lihat [Fitur](#5-fitur-aplikasi) dan [Rumus](#4-rumus-yang-dipakai-di-aplikasi). |
| `about.html` | About \| Laku | **Tentang Laku**: 3 pilar pendampingan, section Dampak & Masalah, Solusi Laku, Nilai Laku, testimoni UMKM, CTA aplikasi. |
| `learn.html` | Belajar \| Laku | **Edukasi interaktif Bu Siti**: cerita visual-novel **Bu Siti** (6 skenario masalah nyata UMKM) dengan pilihan → insight → aksi → hasil, XP, streak, badge, dan checklist kesiapan digital. |
| `kontak.html` | Kontak - Laku | **Kontak**: form nama/email/pesan (submit dialihkan ke kanal kontak resmi) + info kontak `+62 8318-2719-413` / `contact.adyfas@gmail.com`. |
| `404.html` | 404 \| Laku | **Halaman error**: "404 — Halaman Tidak Ditemukan" + tombol kembali ke beranda. |

**Deep-link yang didukung:**

- `app.html?open=hpp|produksi|kas|utang|inventory|laba` — membuka modul langsung
  (`javascript/core/app.js:370`).
- `learn.html?scenario=s1..s6` — melompat ke skenario Bu Siti tertentu.
- Dari modul aplikasi ada bar "Kembali ke Belajar" menuju skenario terkait.

---

## 4. Rumus yang Dipakai di Aplikasi

> Semua rumus di bawah dikutip dari kode sumber (format `file:baris`) dan disertai
> contoh angka yang dihitung tuntas. Output uang memakai `window.formatRupiah`
> (`javascript/core/appUtils.js:37`) — format `id-ID`, 0 desimal
> (contoh: `50000` → `"Rp 50.000"`).

### 4.1 HPP — Hitung Modal & Harga Jual

Mesin hitung: `window.LakuHpp.calculateValues`
(`javascript/apps/hpp/hppCalc.js:291`).

| # | Komponen | Rumus |
|---|---|---|
| 1 | Total bahan baku | `totalBahan = Σ (jumlahPakaiᵢ × hargaBeliᵢ)` (`hppCalc.js:307`) |
| 2 | Total tenaga kerja | `totalTenaga = jamKerja × upahPerJam` (`hppCalc.js:315`) |
| 3 | Total overhead | `totalOverhead = Σ biaya item (gas, listrik, …)` (`hppCalc.js:316`) |
| 4 | Total modal | `totalBiaya = totalBahan + totalTenaga + totalOverhead + biayaKemasan` (`hppCalc.js:323`) |
| 5 | HPP per unit | `hppPerUnit = totalBiaya / jumlahProduksi` (`hppCalc.js:325`) |
| 6 | Harga jual | `hargaJual = hppPerUnit / (1 − margin/100)` (`hppCalc.js:327`) |
| 7 | Harga jual bulat | `ceil(hargaJual / 100) × 100` via `window.roundToNearest` (`appUtils.js:47`) |

**Aturan validasi:** jumlah produksi dipaksa > 0 (fallback 1);
margin di-clamp `0–99` (default 30, `MAX_MARGIN = 99`, `hppCalc.js:10,305`) —
margin 100% dicegah agar tidak terjadi pembagian nol.

**Contoh tuntas** (harga bahan mengikuti data contoh `test.js:20,33,46`):

- Bahan: beras `0,5 kg × Rp 13.000 = Rp 6.500`, minyak `0,2 L × Rp 17.000 = Rp 3.400`,
  telur `2 × Rp 2.000 = Rp 4.000` → **totalBahan = Rp 13.900**
- Tenaga kerja: `2 jam × Rp 15.000 = Rp 30.000`
- Overhead: gas Rp 10.000 + listrik Rp 5.000 = **Rp 15.000**
- Kemasan: **Rp 6.500**
- Total modal: `13.900 + 30.000 + 15.000 + 6.500 = Rp 65.400`
- Produksi 10 porsi → HPP/unit: `65.400 / 10 = Rp 6.540`
- Margin 30% → harga jual: `6.540 / (1 − 0,30) = 6.540 / 0,7 = Rp 9.342,86…`
  → tampil **Rp 9.343** → dibulatkan ke atas kelipatan 100 → **Rp 9.400**

> ⚠️ **Margin di Laku ≠ markup.** Margin adalah persen dari *harga jual*, bukan dari
> modal. Dengan contoh di atas, markup sederhana (`6.540 × 1,3`) hanya menghasilkan
> Rp 8.502 — selisih Rp 841 dari harga jual yang benar (Rp 9.343).

Rumus pendukung HPP: biaya per bahan `jumlahPakai × hargaBeli`
(`hppIngredients.js:231`, disimpan saat simpan resep `hppRecipes.js:66`), harga per
satuan input (`hppIngredients.js:44`), serta konversi satuan & validasi stok bahan
(`hppIngredients.js:720`, `hppIngredients.js:34` — lihat §4.7).

### 4.2 Laba Rugi Bulanan & BEP

Sumber: `javascript/apps/laba/labaClient.js:16-27`.

```
totalOmzet           = totalQty × hargaJual
totalBiayaVariabel   = totalQty × biayaVariabelPerUnit
totalBiayaKeseluruhan = totalBiayaVariabel + totalBiayaTetap
labaBersih           = totalOmzet − totalBiayaKeseluruhan
marginPerUnit        = hargaJual − biayaVariabelPerUnit
bepUnit              = ceil(totalBiayaTetap / marginPerUnit)
```

Jika `marginPerUnit ≤ 0`, BEP tampil
`"N/A (harga jual lebih murah dari modal bahan)"`.
Status usaha: `labaBersih > 0` → **USAHA UNTUNG**; `= 0` → **BALIK MODAL SAJA**;
`< 0` → **RUGI** (`labaClient.js:39-54`).

**Contoh tuntas:** jual 500 pcs/bulan @ Rp 15.000, modal bahan Rp 8.000/pcs,
biaya tetap Rp 1.500.000:

- Omzet: `500 × 15.000 = Rp 7.500.000`
- Biaya variabel: `500 × 8.000 = Rp 4.000.000`
- Total biaya: `4.000.000 + 1.500.000 = Rp 5.500.000`
- Laba bersih: `7.500.000 − 5.500.000 = Rp 2.000.000` → **USAHA UNTUNG**
- Margin/unit: `15.000 − 8.000 = Rp 7.000`
- BEP: `ceil(1.500.000 / 7.000) = ceil(214,29) = 215 Unit`

### 4.3 Buku Kas

Sumber: `javascript/apps/kas/kasClient.js:99-153`
(dashboard memakai rumus identik di `javascript/core/app.js:127`).

```
totalMasuk  = Σ nominal transaksi "pemasukan"
totalKeluar = Σ nominal transaksi "pengeluaran"
saldoAkhir  = totalMasuk − totalKeluar
```

**Contoh** (mengikuti data contoh `test.js:79-112`): masuk
Rp 450.000 + Rp 850.000 = **Rp 1.300.000**; keluar Rp 120.000 + Rp 75.000 =
**Rp 195.000** → saldo **Rp 1.105.000**.

### 4.4 Inventaris & Status Stok

Sumber: `javascript/apps/inventory/inventoryClient.js:415-426`.

```
workingStock   = konversi(stok → satuan kerja) + looseQty
workingMinimum = konversi(minStok → satuan kerja)

Habis      jika workingStock ≤ 0
Stok Tipis jika workingStock ≤ workingMinimum
Aman       selain itu
```

**Contoh:** beras (stok 15, min 5) → **Aman**; telur (stok 4, min 10) →
**Stok Tipis**; daging ayam (stok 0) → **Habis**.
Ringkasan dashboard: `"5 Item (2 Tipis)"` (`app.js:172`).
Batas simpan: `stok = max(0, round2(input))`, isi kemasan `= max(1, input)`
(`inventoryClient.js:110`).

### 4.5 Utang & Piutang

Sumber: `javascript/apps/utang/utangClient.js`.

```
sisa            = totalAmount − paidAmount            (:92)
totalPiutang    = Σ sisa (type = piutang, belum lunas) (:97)
totalUtang      = Σ sisa (type = utang, belum lunas)   (:98)
bayar cicil     = paidAmount_baru
                = min(totalAmount, paidAmount_lama + bayar)  (:265)
```

**Contoh** (mengikuti data contoh `test.js:114-145`): tagihan Rp 250.000 sudah
dibayar Rp 100.000 → sisa **Rp 150.000**; total piutang **Rp 550.000**; total
utang **Rp 150.000**. Bayar Rp 200.000 atas sisa Rp 150.000 →
`min(250.000, 300.000) = 250.000` → **Lunas**.

Status tempo (`:127`): terlambat jika `dueDate < hariIni`, jatuh tempo hari ini jika
sama — memicu notifikasi peramban (`:63`) dan tombol pengingat WhatsApp
(`wa.me/<nomor>?text=…`, `:148`; awalan `0` diubah ke `62`).

### 4.6 Produksi Barang

Sumber: `javascript/apps/produksi/produksiClient.js`.

```
kebutuhanBahan = qtyBahanPerPorsi × jumlahProduksi        (:63)
kurang         = kebutuhan − stokTersedia  (jika > 0, produksi ditolak) (:196)

# Potong stok kemasan bertingkat (mis. dus → bungkus):
sisa     = round2(stokKerja − kebutuhan)
stok     = floor(sisa / ratio)          # kemasan utuh
looseQty = round2(sisa − stok × ratio)  # sisa isi      (:77)

# Potong stok biasa:
stok = max(0, round2(stok − kebutuhan))                                (:83)

totalBiaya   = quantity × hppPerUnit
totalRevenue = quantity × hargaJualBulat
totalProfit  = quantity × (hargaJualBulat − hppPerUnit)                (:102)
```

**Contoh:** resep memakai beras 0,5 kg/porsi, produksi 10 porsi → butuh **5 kg**,
stok 15 kg → sisa **10 kg**. Kemasan bertingkat: tersedia 35 bungkus, dipakai 8 →
sisa 27 → **2 Dus + 7 Bungkus** (ratio 10).
Profit: HPP Rp 4.261, jual Rp 5.500, 3 porsi → biaya Rp 12.783, pendapatan
Rp 16.500, **profit Rp 3.717**. Riwayat produksi diringkas: total profit,
total quantity, dan rata-rata profit (`:318`).

### 4.7 Konversi Satuan (pendukung)

Sumber: `javascript/core/unitConversion.js`.

- Basis faktor: berat → gram (`kg: 1000, gram: 1, mg: 0,001`), volume → ml
  (`liter: 1000, ml: 1`), cacah → pcs (`butir: 1, dosin: 12, lusin: 144, …`) (`:7`).
- Rumus konversi segrup: `hasil = (nilai × faktorFrom) / faktorTo` (`:155`).
  Contoh: `500 gram → kg = (500 × 1) / 1000 = 0,5 kg`;
  `2 dosin → pcs = (2 × 12) / 1 = 24 pcs`.
- Kemasan bertingkat: rasio kumulatif `ratioᵢ = ratioᵢ₋₁ × isiᵢ` (`:239`).
  Contoh `dus → bungkus (10) → pcs (5)`: `{dus: 1, bungkus: 10, pcs: 50}` —
  `2 dus = (2 × 50) / 1 = 100 pcs`; `3 pcs = (3 × 10) / 50 = 0,6 bungkus` (`:268`).
- Tampilan stok: `outer = floor(value / ratio)`, `loose = round2(value − outer × ratio)`
  (`:294`) — contoh `123 pcs` (ratio 50) → **"2 Dus + 23 Pcs"**.
- Pengaman: satuan diskrit (pcs, butir, …) menolak pecahan (`:215`); kemasan
  (`dus, pack, botol, …`) tidak bisa dikonversi silang (`:143`); pembulatan
  anti floating-point `round2(x) = round((x + ε) × 100) / 100` (`:86`) —
  contoh `0,1 + 0,2 → 0,3`.

### 4.8 Gamifikasi Learn — XP & Level (pendukung)

Sumber: `javascript/pages/learn/`.

```
level = floor(max(0, XP) / 120) + 1            (learnState.js:137, learnData.js:17)
```

Contoh: XP 250 → `floor(250/120) + 1 = Level 3`.
Perolehan XP: jawaban benar percobaan pertama **10**, percobaan kedua **6**
(`learnScenario.js:185`, maks 2 percobaan); praktik di aplikasi **+8**
(`learnRender.js:314`) atau **+5** (`learnActions.js:39`); selesai skenario **+20**
+ streak harian (`learnRender.js:361`). Streak: lanjut jika terakhir kemarin,
reset ke 1 jika terputus (`learnState.js:162`).

### 4.9 Format Angka (pendukung)

Sumber: `javascript/core/appUtils.js` — dipakai semua input rupiah & tampilan.

- Pemisah ribuan: `50000 → "50.000"` (`:16`).
- Angka mentah: `"Rp 1.500.000" → 1500000` (`:27`).
- Rupiah: `50000 → "Rp 50.000"` (`:37`).
- Bulat ke atas kelipatan 100: `3791 → 3800` (`:49`).

> ⚠️ **Perilaku penting:** `formatRupiah` mengubah **semua nilai negatif menjadi
> `"Rp 0"`** (`appUtils.js:38`). Artinya tampilan angka rugi / saldo minus tidak
> pernah bertanda minus — statusnya tetap terdeteksi lewat perbandingan
> (`labaBersih < 0` → "RUGI"), hanya tampilannya yang dinolkan.

### 4.10 Catatan kejujuran rumus

- **Tidak ada** rumus PPN/pajak, diskon, markup, bunga, maupun berat bersih/gross
  di seluruh basis kode.
- Fungsi `getCumulativeIsi()` (`hppIngredients.js:13`) adalah kode mati yang tidak
  pernah dipanggil — bukan fitur aktif.
- Perhitungan "stok tipis" di dashboard memakai `stok <= minStok` mentah
  (`app.js:172`), sedangkan modul Inventaris memakai satuan kerja hasil konversi
  (`inventoryClient.js:425`) — hasilnya sama hanya untuk item non-nested.

---

## 5. Fitur Aplikasi

### 5.1 Enam modul (`app.html`, dibuka sebagai modal layar penuh)

| Modul | Nama di UI | Fungsi singkat | Data (`localStorage`) |
|---|---|---|---|
| `hpp` | Hitung Modal & Harga Jual | Wizard 4 langkah: info produk → pilih bahan dari stok (+ konversi satuan) → biaya tambahan (jam × tarif, gas/listrik, kemasan) → slider margin → harga jual. Resep tersimpan (tambah/edit/duplikat). | `laku_recipe_data`, `laku_hpp_session` |
| `kas` | Catat Keuangan Harian | Tambah transaksi pemasukan/pengeluaran (nominal, kategori, tanggal, keterangan); ringkasan masuk/keluar/saldo; riwayat + hapus. | `laku_cashbook_data` |
| `inventory` | Stok Barang & Bahan | CRUD barang: nama, kategori, harga beli, satuan (termasuk bersarang, mis. `1 dus = 30 butir`), stok, batas minimum; badge Aman / Stok Tipis / Habis. | `laku_inventory_data` |
| `utang` | Catat Utang & Piutang | Catat tagihan (nama, nominal, No. WA, jatuh tempo); bayar/cicil; status sisa/Lunas/terlambat; pengingat WhatsApp + notifikasi peramban. | `laku_utang_data` |
| `laba` | Cek Untung Rugi Bulanan | Simulasi target jual, harga, modal bahan, biaya rutin → omzet, beban, laba bersih, BEP + status untung/rugi/impas. | `laku_laba_data` |
| `produksi` | Catat Produksi Barang | Pilih resep + jumlah → stok bahan otomatis berkurang; riwayat produksi + ringkasan profit (transaksi tidak bisa diubah). | `laku_produksi_data` |

### 5.2 Fitur lintas modul

- **Registrasi profil usaha** (nama + nama usaha) sebelum dashboard terbuka; tombol Reset Profil.
- **Dashboard ringkas**: saldo kas, total piutang, status stok, produksi — semua bisa diklik.
- **Guided tour** per modul (`LakuTour`, 8 tur, tombol "Bantuan").
- **Popup kustom** pengganti `alert/confirm` bawaan (`popup.js`).
- **Deep-link** `?open=` dan `?scenario=` (lihat §3).
- **Bahasa gaptek-friendly**: istilah akuntansi diganti analogi sehari-hari
  ("Modal yang dikeluarkan" bukan "HPP", "Untung yang kamu mau" bukan "Margin").

---

## 6. Tech Stack

| Teknologi | Keterangan |
|---|---|
| HTML5 statis (6 halaman) | `index, app, about, learn, kontak, 404.html` |
| Tailwind CSS v4 via CDN | `<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4">` + blok `@theme` inline per halaman |
| Vanilla JavaScript | Tanpa framework/bundler; global scope via tag `<script>` berurutan |
| CSS kustom | `css/global.css` (font, keyframes, navbar), `css/learn.css`, `css/tour.css` |
| Font Manrope (self-hosted) | `font/Manrope-VariableFont_wght.ttf` — lisensi SIL Open Font |
| Penyimpanan | `localStorage` saja (tanpa backend) |
| Hosting | Firebase Hosting (`firebase.json`, project `laku-umkm`) |
| PWA | `manifest.json` + `sw.js` (cache app-shell, Tailwind runtime) + `icons/` + registrasi SW & tombol Install di `app.html` |
| AI opsional | Groq Chat Completions (saat ini nonaktif, fallback template lokal) |
| Ikon | SVG inline bergaya Lucide + `javascript/core/icons.js` + 50 file di `assets/icons/` |
| Animasi | `IntersectionObserver` (fade-in, reveal, count-up, marquee) di `animations.js` |
| Pengujian | QA manual (lihat §9) — belum ada unit test |

---

## 7. Struktur Folder

```
FE/
├── index.html  app.html  about.html  learn.html  kontak.html  404.html
├── README.md
├── firebase.json  .firebaserc  manifest.json  sw.js  test.js
├── css/        global.css, learn.css, tour.css
├── font/       Manrope (variable + 7 static weights)
├── icons/      icon-192.png, icon-512.png
├── assets/
│   ├── images/     (karakter Bu Siti, mockup aplikasi)
│   ├── icons/      (50 ikon SVG)
│   └── videos/     (Laku-Video-UMKM.mp4)
└── javascript/
    ├── core/   app.js, appUtils.js, navbar.js, popup.js, animations.js,
    │           unitConversion.js, icons.js, pagination.js, guidedTour.js
    ├── apps/   hpp/ (5 file), produksi/, kas/, utang/, inventory/,
    │           laba/  (tiap modul: *App.js + *Client.js)
    └── pages/  landingpage.js, contact.js, learn.js
                learn/ learnData.js, learnState.js, learnDOM.js,
                       learnScenario.js, learnRender.js, learnActions.js,
                       learnDebug.js
```

Dokumen perencanaan (di folder induk, bukan bagian deploy): `main.md`, `QWEN.md`,
`Plan.md`, `TASK.md`, `TESTING_GUIDE.md`, `test.md`, `learn-*.md`,
`report-debugging-logika.md`, `planning-production.md`, proposal & guide book lomba.

---

## 8. Sumber & Kredit Aset

Aplikasi memakai sejumlah foto dan satu video dari pihak luar. Daftar lengkapnya:

### 8.1 Foto eksternal

| Halaman (baris) | Sumber | Isi / pemakaian |
|---|---|---|
| `index.html:123` | `encrypted-tbn0.gstatic.com` (thumbnail Google) | Ilustrasi kartu hero "Mulai Belajar" |
| `index.html:279` | `www.pnm.co.id` | Thumbnail dokumenter ("apa-itu-umkm") |
| `index.html:454` | `bisnisukm.com` | Foto "UMKM Indonesia" (izin usaha UMKM) |
| `about.html:184, 194` | `plus.unsplash.com` (Unsplash+) | 2 foto ilustrasi section Dampak |
| `about.html:269, 287` | `encrypted-tbn0.gstatic.com` (thumbnail Google) | Foto profil testimoni (2× gambar sama) |
| `app.html:91` | `chub.fisipol.ugm.ac.id` (FISIPOL UGM) | Foto "Pedagang UMKM Indonesia" (`Pasar.jpg`) |

### 8.2 Video eksternal

Rekaman layar dokumentasi (`Screen_Recording_2026-…mov`) di akun Cloudinary tim
(`res.cloudinary.com/gjs6suvk`) — dipakai di kartu video navbar ke-7 halaman
(`index.html:67,275`, `about.html:63`, `app.html:66`, `kontak.html:65`,
`learn.html:70`, `404.html:66`).

### 8.3 Aset milik sendiri / bebas lisensi

- `assets/images/` (karakter Bu Siti, mockup aplikasi), `assets/videos/Laku-Video-UMKM.mp4`,
  `assets/icons/` (50 SVG), `icons/` (favicon PWA).
- Font **Manrope** — SIL Open Font License, bebas dipakai.
- Tailwind CSS (CDN, MIT), ikon bergaya Lucide (ISC).

### 8.4 ⚠️ Peringatan lisensi (untuk panitia & tim)

1. **URL `encrypted-tbn0.gstatic.com` bukan CDN** — melainkan pratinjau hasil pencarian
   Google yang bisa kedaluwarsa/diblokir hotlink. Disarankan mengganti 3 foto ini
   dengan aset milik sendiri sebelum penilaian final.
2. **`plus.unsplash.com/premium_photo-…` adalah tier berbayar (Unsplash+)** dengan
   lisensi lebih ketat dari Unsplash biasa — perlu verifikasi hak pakai.
3. Foto dari **Kompas, Amartha, dan Magnific tidak lagi dipakai** (sudah ikut terhapus bersama
   `learn-beta.html`); foto dari **UGM, PNM, dan bisnisukm.com** hanya dipakai
   sebagai ilustrasi edukatif dengan kredit pada tabel di atas.
4. Teks `alt` beberapa gambar lama masih generik/kosong — masuk daftar perbaikan.

---

## 9. Pengujian & Catatan

- **QA manual**: `TESTING_GUIDE.md` berisi 24 test case (TC-01…TC-24) + skrip data dummy
  (`test.js`, dimuat dengan cara odkomen baris `<!-- <script src="./test.js"></script> -->`).
- **Belum ada unit/integration test** (rekomendasi: Vitest/Jest).
- **Kesesuaian aturan lomba**: 6 halaman (maks 7) · statis tanpa build · Tailwind via CDN ·
  tanpa framework JS (React/Angular/Vue) · Bahasa Indonesia.
- **Riwayat perbaikan terbaru**: judul `learn.html`/`404.html` dibetulkan, registrasi
  service worker + tombol Install PWA diaktifkan kembali (dengan header `no-cache`
  untuk `/sw.js`).

---

© 2026 Laku — *"Bersama Laku, UMKM Tumbuh Lebih Mudah."*
