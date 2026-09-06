/**
 * hppAppClient.js — Logika Interaktif Kalkulator HPP (Recipe-Based)
 * Integrasi inventory, multi-step wizard, perhitungan otomatis.
 */
function initHppAppLogic() {
  const RECIPE_KEY = "laku_recipe_data";
  const INVENTORY_KEY = "laku_inventory_data";

  // === State ===
  let currentStep = 1;
  let currentMode = "resep"; // "resep" or "cepat"
  let ingredients = []; // { id, inventoryId|null, nama, hargaBeli, jumlahPakai, satuan }
  let overheadItems = []; // { nama, biaya }
  let editingRecipeId = null; // ID resep yang sedang diedit (null = resep baru)
  let _uidCounter = 0;
  const nextUid = () => ++_uidCounter + Date.now();

  // === Helpers ===
  const formatRupiah = (num) => {
    if (!num || num < 0 || isNaN(num) || !isFinite(num)) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  const loadInventory = () => {
    const raw = localStorage.getItem(INVENTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  };

  const loadRecipes = () => {
    const raw = localStorage.getItem(RECIPE_KEY);
    return raw ? JSON.parse(raw) : [];
  };

  const saveRecipes = (recipes) => {
    localStorage.setItem(RECIPE_KEY, JSON.stringify(recipes));
  };

  const roundToNearest = (num, nearest = 100) => {
    if (!num || num <= 0) return 0;
    return Math.ceil(num / nearest) * nearest;
  };

  // === Step Navigation ===
  const goToStep = (step) => {
    // Hide all steps
    for (let i = 1; i <= 4; i++) {
      const el = document.getElementById(`hppStep${i}`);
      if (el) el.classList.add("hidden");
    }
    // Show target step
    const target = document.getElementById(`hppStep${step}`);
    if (target) target.classList.remove("hidden");

    // Update step dots
    for (let i = 1; i <= 4; i++) {
      const dot = document.getElementById(`stepDot${i}`);
      if (!dot) continue;
      if (i === step) {
        dot.className = "w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold bg-[#274c43] text-white transition-all";
      } else if (i < step) {
        dot.className = "w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold bg-emerald-100 text-emerald-700 transition-all";
      } else {
        dot.className = "w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold bg-gray-200 text-gray-400 transition-all";
      }
    }

    currentStep = step;

    // If going to step 2, refresh inventory
    if (step === 2) refreshIngredientUI();
    // If going to step 4, recalculate
    if (step === 4) calculateAll();
  };

  // === Ingredient UI ===
  const refreshIngredientUI = () => {
    const emptyState = document.getElementById("hppInventoryEmpty");
    const addArea = document.getElementById("hppAddIngredientArea");
    const manualArea = document.getElementById("hppManualIngredientArea");
    const step2Desc = document.getElementById("hppStep2Desc");
    const select = document.getElementById("hppInventorySelect");

    if (currentMode === "resep") {
      // Show inventory mode UI
      if (manualArea) manualArea.classList.add("hidden");
      if (step2Desc) step2Desc.textContent = "Pilih bahan dari stok yang sudah kamu catat.";

      const inv = loadInventory();
      const bahanInv = inv.filter(
        (item) =>
          item.kategori === "Bahan Baku Utama" ||
          item.kategori === "Kemasan / Packaging"
      );

      if (bahanInv.length === 0) {
        if (emptyState) emptyState.classList.remove("hidden");
        if (addArea) addArea.classList.add("hidden");
      } else {
        if (emptyState) emptyState.classList.add("hidden");
        if (addArea) addArea.classList.remove("hidden");

        // Populate select (exclude already-added items)
        if (select) {
          const usedIds = ingredients
            .map((ing) => ing.inventoryId)
            .filter(Boolean);
          select.innerHTML =
            '<option value="">— Pilih bahan dari stok —</option>';
          bahanInv.forEach((item) => {
            if (!usedIds.includes(item.id)) {
              const displayUnit = item.displayUnit || item.satuan || "pcs";
              const stokDisplay = item.baseUnit
                ? window.LakuUnits.round2(
                    window.LakuUnits.convertUnit(
                      item.stok,
                      item.baseUnit,
                      displayUnit
                    ) ?? item.stok
                  )
                : item.stok;
              select.innerHTML += `<option value="${item.id}">${item.nama} — ${formatRupiah(item.harga)}/${displayUnit} (Stok: ${stokDisplay} ${displayUnit})</option>`;
            }
          });

          // Populate dropdown satuan kompatibel saat pilihan berubah
          const updateUnitSelector = () => {
            const selId = parseInt(select.value);
            const unitSel = document.getElementById("hppJumlahPakaiUnit");
            if (!unitSel) return;

            if (!selId) {
              unitSel.innerHTML = '<option value="">—</option>';
              unitSel.disabled = true;
              return;
            }
            const selItem = bahanInv.find((it) => it.id === selId);
            if (!selItem) {
              unitSel.innerHTML = '<option value="">—</option>';
              unitSel.disabled = true;
              return;
            }
            const displayUnit = selItem.displayUnit || selItem.satuan || "pcs";
            const compatible = window.LakuUnits.getCompatibleUnits(displayUnit);
            unitSel.disabled = false;
            unitSel.innerHTML = compatible
              .map(
                (u) =>
                  `<option value="${u}" ${u === displayUnit ? "selected" : ""}>${window.LakuUnits.formatUnitLabel(u)}</option>`
              )
              .join("");
          };
          select.removeEventListener("change", select._satuanHandler);
          select._satuanHandler = updateUnitSelector;
          select.addEventListener("change", updateUnitSelector);
          updateUnitSelector();
        }
      }
    } else {
      // Show manual mode UI
      if (emptyState) emptyState.classList.add("hidden");
      if (addArea) addArea.classList.add("hidden");
      if (manualArea) manualArea.classList.remove("hidden");
      if (step2Desc)
        step2Desc.textContent =
          "Masukkan nama bahan dan harganya sendiri.";
    }

    renderIngredients();
  };

  const renderIngredients = () => {
    const list = document.getElementById("hppIngredientList");
    const subtotal = document.getElementById("hppSubtotalBahan");
    const subtotalValue = document.getElementById("hppSubtotalBahanValue");

    if (!list) return;

    if (ingredients.length === 0) {
      list.innerHTML = `
        <div class="text-center py-8 text-gray-400 text-sm bg-stone-50 rounded-2xl">
          Belum ada bahan dipilih. Tambahkan bahan di atas ya!
        </div>
      `;
      if (subtotal) subtotal.classList.add("hidden");
    } else {
      let totalBahan = 0;
      list.innerHTML = ingredients
        .map((ing) => {
          const biaya = ing.jumlahPakai * ing.hargaBeli;
          totalBahan += biaya;
          return `
            <div class="flex items-center justify-between bg-stone-50 p-4 rounded-2xl border border-gray-100">
              <div class="flex-1 min-w-0">
                <div class="font-bold text-gray-800 text-sm truncate">${ing.nama}</div>
                <div class="text-xs text-gray-400 mt-0.5">
                  ${ing.jumlahPakai} ${ing.satuan || "unit"} × ${formatRupiah(ing.hargaBeli)}/${ing.satuan || "unit"} = <span class="font-semibold text-gray-600">${formatRupiah(biaya)}</span>
                </div>
              </div>
              <button data-remove-ing="${ing.id}" class="text-rose-400 hover:text-rose-600 font-bold text-sm ml-3 cursor-pointer shrink-0 transition-colors" title="Hapus bahan">
                ✕
              </button>
            </div>
          `;
        })
        .join("");

      if (subtotal) subtotal.classList.remove("hidden");
      if (subtotalValue) subtotalValue.textContent = formatRupiah(totalBahan);
    }

    // Bind remove buttons
    list.querySelectorAll("[data-remove-ing]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = parseInt(btn.getAttribute("data-remove-ing"));
        ingredients = ingredients.filter((i) => i.id !== id);
        refreshIngredientUI();
      });
    });
  };

  const addIngredientFromInventory = () => {
    const select = document.getElementById("hppInventorySelect");
    const jumlahInput = document.getElementById("hppJumlahPakai");
    const unitSel = document.getElementById("hppJumlahPakaiUnit");
    if (!select || !jumlahInput || !unitSel) return;

    const invId = parseInt(select.value);
    const jumlah = parseFloat(jumlahInput.value);
    const inputUnit = unitSel.value; // satuan yang dipilih user

    if (!invId || !jumlah || jumlah <= 0 || !inputUnit) return;

    const inv = loadInventory();
    const item = inv.find((i) => i.id === invId);
    if (!item) return;

    const displayUnit = item.displayUnit || item.satuan || "pcs";
    const baseUnit = item.baseUnit || window.LakuUnits.getBaseUnit(displayUnit) || displayUnit;

    // 1. Konversi input user → baseUnit (untuk cek stok & deduct)
    const qtyBase =
      inputUnit === baseUnit
        ? window.LakuUnits.round2(jumlah)
        : window.LakuUnits.convertUnit(jumlah, inputUnit, baseUnit);

    // 2. Konversi input user → displayUnit (untuk kalkulasi harga per displayUnit)
    const qtyDisplay =
      inputUnit === displayUnit
        ? window.LakuUnits.round2(jumlah)
        : window.LakuUnits.convertUnit(jumlah, inputUnit, displayUnit);

    // 3. Validasi: satuan harus kompatibel
    if (qtyBase === null || qtyDisplay === null) {
      alert(
        `Satuan "${inputUnit}" tidak kompatibel dengan satuan stok "${displayUnit}".`
      );
      return;
    }

    // 4. Validasi stok cukup (banding base vs base)
    if (qtyBase > item.stok) {
      const stokDisplay =
        baseUnit === displayUnit
          ? window.LakuUnits.round2(item.stok)
          : window.LakuUnits.convertUnit(item.stok, baseUnit, displayUnit);
      alert(
        `Stok tidak cukup!\n\n${item.nama} tersedia: ${stokDisplay} ${displayUnit}\nKamu butuh: ${qtyDisplay} ${displayUnit}`
      );
      return;
    }

    ingredients.push({
      id: nextUid(),
      inventoryId: item.id,
      nama: item.nama,
      hargaBeli: item.harga, // per displayUnit
      jumlahPakai: qtyDisplay, // dalam displayUnit (match dgn harga)
      satuan: displayUnit,
      // Data internal utk deduct stok & konversi saat edit:
      _qtyBase: qtyBase,
      _baseUnit: baseUnit,
      _inputQty: jumlah,
      _inputUnit: inputUnit,
    });

    select.value = "";
    jumlahInput.value = "";
    refreshIngredientUI();
  };

  const addManualIngredient = () => {
    const namaInput = document.getElementById("hppManualNama");
    const hargaInput = document.getElementById("hppManualHarga");
    const jumlahInput = document.getElementById("hppManualJumlah");
    const unitSel = document.getElementById("hppManualSatuan");
    if (!namaInput || !hargaInput || !jumlahInput || !unitSel) return;

    const nama = namaInput.value.trim();
    const harga = window.getRawNumber(hargaInput);
    const jumlah = parseFloat(jumlahInput.value);
    const satuan = unitSel.value || "pcs";

    if (!nama || !harga || !jumlah || jumlah <= 0) return;

    ingredients.push({
      id: nextUid(),
      inventoryId: null,
      nama,
      hargaBeli: harga,
      jumlahPakai: window.LakuUnits.round2(jumlah),
      satuan,
    });

    namaInput.value = "";
    hargaInput.value = "";
    jumlahInput.value = "";
    renderIngredients();
  };

  // === Overhead UI ===
  const renderOverhead = () => {
    const list = document.getElementById("hppOverheadList");
    if (!list) return;

    if (overheadItems.length === 0) {
      list.innerHTML = `
        <div class="text-center py-3 text-amber-700/60 text-xs">Kosong — isi kalau ada biaya lain.</div>
      `;
    } else {
      list.innerHTML = overheadItems
        .map(
          (item, i) => `
          <div class="flex items-center justify-between bg-white p-3 rounded-xl border border-amber-200/50">
            <div class="flex items-center gap-2">
              <span class="text-sm font-medium text-gray-700">${item.nama}</span>
              <span class="text-sm font-bold text-amber-800">${formatRupiah(item.biaya)}</span>
            </div>
            <button data-remove-ovh="${i}" class="text-rose-400 hover:text-rose-600 font-bold text-xs cursor-pointer transition-colors" title="Hapus">✕</button>
          </div>
        `
        )
        .join("");
    }

    // Bind remove buttons
    list.querySelectorAll("[data-remove-ovh]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.getAttribute("data-remove-ovh"));
        overheadItems.splice(idx, 1);
        renderOverhead();
      });
    });
  };

  const addOverhead = () => {
    const namaInput = document.getElementById("hppOverheadNama");
    const biayaInput = document.getElementById("hppOverheadBiaya");
    if (!namaInput || !biayaInput) return;

    const nama = namaInput.value.trim();
    const biaya = window.getRawNumber(biayaInput);

    if (!nama || biaya <= 0) return;

    overheadItems.push({ nama, biaya });
    namaInput.value = "";
    biayaInput.value = "";
    renderOverhead();
  };

  // === Calculation ===
  const calculateAll = () => {
    // Total bahan
    const totalBahan = ingredients.reduce(
      (sum, ing) => sum + ing.jumlahPakai * ing.hargaBeli,
      0
    );

    // Tenaga kerja
    const jam =
      parseFloat(document.getElementById("hppJamKerja")?.value) || 0;
    const upah = window.getRawNumber(
      document.getElementById("hppUpahPerJam")
    );
    const totalTenaga = jam * upah;

    // Update tenaga display
    const tenagaDisplay = document.getElementById("hppTotalTenaga");
    const tenagaValue = document.getElementById("hppTotalTenagaValue");
    if (jam > 0 && upah > 0) {
      if (tenagaDisplay) tenagaDisplay.classList.remove("hidden");
      if (tenagaValue) tenagaValue.textContent = formatRupiah(totalTenaga);
    } else {
      if (tenagaDisplay) tenagaDisplay.classList.add("hidden");
    }

    // Overhead
    const totalOverhead = overheadItems.reduce(
      (sum, item) => sum + item.biaya,
      0
    );

    // Kemasan
    const biayaKemasan = window.getRawNumber(
      document.getElementById("hppBiayaKemasan")
    );

    // Grand total
    const totalBiaya = totalBahan + totalTenaga + totalOverhead + biayaKemasan;

    // Jumlah produksi
    const jumlahProduksi =
      parseInt(document.getElementById("hppJumlahProduksi")?.value) || 1;
    const satuan =
      document.getElementById("hppSatuanProduksi")?.value || "unit";

    // HPP per unit
    const hppPerUnit =
      jumlahProduksi > 0 ? totalBiaya / jumlahProduksi : 0;

    // Margin
    const margin =
      parseInt(document.getElementById("hppMarginSlider")?.value) || 30;

    // Harga jual
    const hargaJual = hppPerUnit * (1 + margin / 100);
    const hargaBulat = roundToNearest(hargaJual, 100);

    // Update summary displays
    const el = (id) => document.getElementById(id);
    if (el("hppRingkasanBahan"))
      el("hppRingkasanBahan").textContent = formatRupiah(totalBahan);
    if (el("hppRingkasanTenaga"))
      el("hppRingkasanTenaga").textContent = formatRupiah(totalTenaga);
    if (el("hppRingkasanOverhead"))
      el("hppRingkasanOverhead").textContent = formatRupiah(totalOverhead);
    if (el("hppRingkasanKemasan"))
      el("hppRingkasanKemasan").textContent = formatRupiah(biayaKemasan);
    if (el("hppRingkasanTotal"))
      el("hppRingkasanTotal").textContent = formatRupiah(totalBiaya);
    if (el("hppRingkasanHpp"))
      el("hppRingkasanHpp").textContent = formatRupiah(hppPerUnit);
    if (el("hppRingkasanSatuan"))
      el("hppRingkasanSatuan").textContent = satuan;
    if (el("hppHargaJual"))
      el("hppHargaJual").textContent = formatRupiah(hargaJual);
    if (el("hppHargaBulat"))
      el("hppHargaBulat").textContent = `Dibulatkan: ${formatRupiah(hargaBulat)}`;
    if (el("hppMarginDisplay"))
      el("hppMarginDisplay").textContent = `${margin}%`;
  };

  // === Mode Switching ===
  const switchMode = async (mode) => {
    // Confirm before clearing ingredients
    if (ingredients.length > 0 && mode !== currentMode) {
      const ok = await window.showCustomConfirm({
        title: "Ganti Mode Perhitungan",
        message: "Bahan yang sudah kamu tambahkan akan terhapus kalau ganti mode. Tetap ganti?",
        confirmText: "Ya, Ganti",
        cancelText: "Batal",
        isDanger: true,
      });
      if (!ok) return;
    }

    currentMode = mode;
    ingredients = []; // clear on switch

    const btnResep = document.getElementById("hppModeResep");
    const btnCepat = document.getElementById("hppModeCepat");

    if (mode === "resep") {
      if (btnResep)
        btnResep.className =
          "flex-1 py-2.5 px-4 rounded-2xl text-sm font-bold transition-all bg-[#274c43] text-white cursor-pointer";
      if (btnCepat)
        btnCepat.className =
          "flex-1 py-2.5 px-4 rounded-2xl text-sm font-bold transition-all bg-transparent text-gray-500 hover:bg-gray-100 cursor-pointer";
    } else {
      if (btnResep)
        btnResep.className =
          "flex-1 py-2.5 px-4 rounded-2xl text-sm font-bold transition-all bg-transparent text-gray-500 hover:bg-gray-100 cursor-pointer";
      if (btnCepat)
        btnCepat.className =
          "flex-1 py-2.5 px-4 rounded-2xl text-sm font-bold transition-all bg-[#274c43] text-white cursor-pointer";
    }

    refreshIngredientUI();
  };

  // === Save Recipe ===
  const saveCurrentRecipe = () => {
    const namaProduk =
      document.getElementById("hppNamaProduk")?.value.trim();
    const jumlahProduksi =
      parseInt(document.getElementById("hppJumlahProduksi")?.value) || 0;
    const satuan =
      document.getElementById("hppSatuanProduksi")?.value || "porsi";

    if (!namaProduk) {
      alert("Isi nama produk dulu ya!");
      return;
    }
    if (jumlahProduksi <= 0) {
      alert("Isi jumlah produksi dulu ya!");
      return;
    }
    if (ingredients.length === 0) {
      alert("Tambahkan minimal satu bahan!");
      return;
    }

    // Recalculate final values
    const totalBahan = ingredients.reduce(
      (sum, ing) => sum + ing.jumlahPakai * ing.hargaBeli,
      0
    );
    const jam =
      parseFloat(document.getElementById("hppJamKerja")?.value) || 0;
    const upah = window.getRawNumber(
      document.getElementById("hppUpahPerJam")
    );
    const totalTenaga = jam * upah;
    const totalOverhead = overheadItems.reduce(
      (sum, item) => sum + item.biaya,
      0
    );
    const biayaKemasan = window.getRawNumber(
      document.getElementById("hppBiayaKemasan")
    );
    const totalBiaya =
      totalBahan + totalTenaga + totalOverhead + biayaKemasan;
    const hppPerUnit =
      jumlahProduksi > 0 ? totalBiaya / jumlahProduksi : 0;
    const margin =
      parseInt(document.getElementById("hppMarginSlider")?.value) || 30;
    const hargaJual = hppPerUnit * (1 + margin / 100);
    const hargaBulat = roundToNearest(hargaJual, 100);

    const recipe = {
      id: Date.now(),
      namaProduk,
      jumlahProduksi,
      satuanProduksi: satuan,
      mode: currentMode,
      bahanBaku: ingredients.map((ing) => ({
        inventoryId: ing.inventoryId,
        namaBahan: ing.nama,
        hargaBeli: ing.hargaBeli,
        jumlahPakai: ing.jumlahPakai,
        satuan: ing.satuan,
        biayaTerhitung: ing.jumlahPakai * ing.hargaBeli,
        // Data konversi (utk restore input asli & deduct stok):
        ...(ing._qtyBase !== undefined ? { _qtyBase: ing._qtyBase } : {}),
        ...(ing._baseUnit ? { _baseUnit: ing._baseUnit } : {}),
        ...(ing._inputQty !== undefined ? { _inputQty: ing._inputQty } : {}),
        ...(ing._inputUnit ? { _inputUnit: ing._inputUnit } : {}),
      })),
      tenagaKerja: {
        jam,
        upahPerJam: upah,
        total: totalTenaga,
      },
      overhead: [...overheadItems],
      biayaKemasan,
      totalBiayaBahan: totalBahan,
      totalBiaya,
      hppPerUnit,
      margin,
      hargaJual,
      hargaJualBulat: hargaBulat,
      tanggalDibuat: new Date().toISOString(),
    };

    if (editingRecipeId) {
      // UPDATE resep existing
      const recipes = loadRecipes();
      const idx = recipes.findIndex((r) => r.id === editingRecipeId);
      if (idx === -1) {
        alert("Resep tidak ditemukan!");
        return;
      }
      recipes[idx] = {
        ...recipes[idx],
        ...recipe,
        id: editingRecipeId,
        tanggalDibuat: recipes[idx].tanggalDibuat,
        tanggalDiubah: new Date().toISOString(),
      };
      saveRecipes(recipes);
      editingRecipeId = null;
    } else {
      // INSERT resep baru
      const recipes = loadRecipes();
      recipes.unshift(recipe);
      saveRecipes(recipes);
    }

    // Visual feedback
    const simpanBtn = document.getElementById("hppSimpanResep");
    if (simpanBtn) {
      simpanBtn.textContent = "✅ Tersimpan!";
      simpanBtn.className =
        "flex-1 bg-emerald-600 text-white font-bold py-4 rounded-2xl transition-all shadow-md text-base cursor-pointer";
      setTimeout(() => {
        simpanBtn.textContent = "💾 Simpan Resep";
        simpanBtn.className =
          "flex-1 bg-[#274c43] hover:bg-[#1f3d36] text-white font-bold py-4 rounded-2xl transition-all shadow-md text-base cursor-pointer";
      }, 2000);
    }

    renderRecipeList();
  };

  // === Recipe List UI ===
  const renderRecipeList = () => {
    const tbody = document.getElementById("recipeTableBody");
    const mobileList = document.getElementById("recipeMobileList");
    if (!tbody || !mobileList) return;

    const recipes = loadRecipes();

    if (recipes.length === 0) {
      const emptyHtml = `
        <div class="py-8 text-center text-gray-400 text-sm bg-stone-50 rounded-2xl">
          Belum ada resep tersimpan. Selesaikan perhitungan di atas lalu klik "Simpan Resep"!
        </div>
      `;
      tbody.innerHTML = `<tr><td colspan="6" class="py-2">${emptyHtml}</td></tr>`;
      mobileList.innerHTML = emptyHtml;
      return;
    }

    let desktopHtml = "";
    let mobileHtml = "";

    recipes.forEach((r) => {
      const tgl = new Date(r.tanggalDibuat).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
      const badgeDiubah = r.tanggalDiubah
        ? `<span class="text-[10px] text-emerald-600 font-semibold">• diedit</span>`
        : "";

      const actionButtons = `
        <button data-recipe-edit="${r.id}" class="bg-stone-100 hover:bg-[#274c43] hover:text-white text-gray-600 font-bold py-1.5 px-3 rounded-lg text-xs transition-all cursor-pointer">Edit</button>
        <button data-recipe-duplicate="${r.id}" class="bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 font-bold py-1.5 px-3 rounded-lg text-xs transition-all cursor-pointer">Duplikat</button>
        <button data-recipe-delete="${r.id}" class="text-stone-400 hover:text-rose-600 font-semibold text-xs cursor-pointer">Hapus</button>
      `;

      desktopHtml += `
        <tr class="hover:bg-stone-50/80 transition-colors">
          <td class="py-3.5 px-4">
            <div class="font-bold text-gray-800">${r.namaProduk} ${badgeDiubah}</div>
            <div class="text-[11px] text-gray-400">${tgl} • ${r.bahanBaku?.length || 0} bahan</div>
          </td>
          <td class="py-3.5 px-4 text-center text-xs font-medium text-gray-600">${r.jumlahProduksi} ${r.satuanProduksi}</td>
          <td class="py-3.5 px-4 text-right font-semibold text-gray-800">${formatRupiah(r.hppPerUnit)}</td>
          <td class="py-3.5 px-4 text-right font-extrabold text-[#274c43]">${formatRupiah(r.hargaJualBulat)}</td>
          <td class="py-3.5 px-4 text-center text-xs font-bold text-amber-700">${r.margin}%</td>
          <td class="py-3.5 px-4 text-center space-x-1.5 whitespace-nowrap">${actionButtons}</td>
        </tr>
      `;

      mobileHtml += `
        <div class="bg-white border border-stone-200/90 rounded-2xl p-4 shadow-xs space-y-3">
          <div class="flex items-center justify-between">
            <h4 class="text-base font-bold text-gray-900">${r.namaProduk} ${badgeDiubah}</h4>
            <span class="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-md">${r.margin}%</span>
          </div>
          <div class="text-[11px] text-gray-400">${tgl} • ${r.jumlahProduksi} ${r.satuanProduksi} • ${r.bahanBaku?.length || 0} bahan</div>
          <div class="border-t border-gray-100 pt-2 flex items-center justify-between text-xs">
            <span class="text-gray-500 font-medium">HPP / ${r.satuanProduksi}</span>
            <span class="font-semibold text-gray-800">${formatRupiah(r.hppPerUnit)}</span>
          </div>
          <div class="flex items-center justify-between text-xs">
            <span class="text-gray-500 font-medium">Harga jual</span>
            <span class="font-extrabold text-[#274c43] text-base">${formatRupiah(r.hargaJualBulat)}</span>
          </div>
          <div class="pt-2 flex items-center justify-between gap-2 border-t border-gray-100">
            <div class="flex items-center gap-2">
              <button data-recipe-edit="${r.id}" class="bg-stone-100 hover:bg-[#274c43] hover:text-white text-gray-600 font-bold py-1.5 px-3 rounded-lg text-xs transition-all cursor-pointer">Edit</button>
              <button data-recipe-duplicate="${r.id}" class="bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 font-bold py-1.5 px-3 rounded-lg text-xs transition-all cursor-pointer">Duplikat</button>
            </div>
            <button data-recipe-delete="${r.id}" class="text-stone-400 hover:text-rose-600 font-semibold text-xs cursor-pointer">Hapus</button>
          </div>
        </div>
      `;
    });

    tbody.innerHTML = desktopHtml;
    mobileList.innerHTML = mobileHtml;

    // Bind aksi Edit / Duplikat / Hapus
    tbody.querySelectorAll("[data-recipe-edit]").forEach((btn) =>
      btn.addEventListener("click", () =>
        openRecipeForEdit(parseInt(btn.getAttribute("data-recipe-edit")))
      )
    );
    mobileList.querySelectorAll("[data-recipe-edit]").forEach((btn) =>
      btn.addEventListener("click", () =>
        openRecipeForEdit(parseInt(btn.getAttribute("data-recipe-edit")))
      )
    );
    tbody.querySelectorAll("[data-recipe-duplicate]").forEach((btn) =>
      btn.addEventListener("click", () =>
        duplicateRecipe(parseInt(btn.getAttribute("data-recipe-duplicate")))
      )
    );
    mobileList.querySelectorAll("[data-recipe-duplicate]").forEach((btn) =>
      btn.addEventListener("click", () =>
        duplicateRecipe(parseInt(btn.getAttribute("data-recipe-duplicate")))
      )
    );
    tbody.querySelectorAll("[data-recipe-delete]").forEach((btn) =>
      btn.addEventListener("click", () =>
        deleteRecipe(parseInt(btn.getAttribute("data-recipe-delete")))
      )
    );
    mobileList.querySelectorAll("[data-recipe-delete]").forEach((btn) =>
      btn.addEventListener("click", () =>
        deleteRecipe(parseInt(btn.getAttribute("data-recipe-delete")))
      )
    );
  };

  // === Edit / Duplicate / Delete Recipe ===
  // Isi ulang semua wizard dari data resep yang tersimpan
  const prefillFromRecipe = (recipe, newName) => {
    const el = (id) => document.getElementById(id);

    // Step 1
    el("hppNamaProduk").value = newName ?? recipe.namaProduk;
    el("hppJumlahProduksi").value = recipe.jumlahProduksi;
    el("hppSatuanProduksi").value = recipe.satuanProduksi || "porsi";

    // Mode (tanpa konfirmasi & tanpa clear ingredients)
    currentMode = recipe.mode || "resep";
    const btnResep = el("hppModeResep");
    const btnCepat = el("hppModeCepat");
    if (currentMode === "resep") {
      btnResep.className = "flex-1 py-2.5 px-4 rounded-2xl text-sm font-bold transition-all bg-[#274c43] text-white cursor-pointer";
      btnCepat.className = "flex-1 py-2.5 px-4 rounded-2xl text-sm font-bold transition-all bg-transparent text-gray-500 hover:bg-gray-100 cursor-pointer";
    } else {
      btnResep.className = "flex-1 py-2.5 px-4 rounded-2xl text-sm font-bold transition-all bg-transparent text-gray-500 hover:bg-gray-100 cursor-pointer";
      btnCepat.className = "flex-1 py-2.5 px-4 rounded-2xl text-sm font-bold transition-all bg-[#274c43] text-white cursor-pointer";
    }

    // Step 2 — bahan (restore input asli user kalau ada)
    ingredients = (recipe.bahanBaku || []).map((ing) => {
      const restored = {
        id: nextUid(),
        inventoryId: ing.inventoryId || null,
        nama: ing.namaBahan,
        hargaBeli: ing.hargaBeli,
        jumlahPakai: ing.jumlahPakai,
        satuan: ing.satuan || "unit",
      };
      if (ing._inputQty !== undefined && ing._inputUnit) {
        restored._inputQty = ing._inputQty;
        restored._inputUnit = ing._inputUnit;
        if (ing._qtyBase !== undefined) restored._qtyBase = ing._qtyBase;
        if (ing._baseUnit) restored._baseUnit = ing._baseUnit;
      }
      return restored;
    });

    // Step 3 — biaya
    const tk = recipe.tenagaKerja || {};
    el("hppJamKerja").value = tk.jam || "";
    el("hppUpahPerJam").value = tk.upahPerJam || "";
    if (tk.upahPerJam) window.formatNumberInput(el("hppUpahPerJam"));
    overheadItems = [...(recipe.overhead || [])];
    el("hppBiayaKemasan").value = recipe.biayaKemasan || "";
    if (recipe.biayaKemasan) window.formatNumberInput(el("hppBiayaKemasan"));

    // Step 4 — margin
    el("hppMarginSlider").value = recipe.margin ?? 30;
    el("hppMarginDisplay").textContent = `${recipe.margin ?? 30}%`;

    // Render & mulai dari step 1
    goToStep(1);
    renderIngredients();
    renderOverhead();
  };

  const openRecipeForEdit = (recipeId) => {
    const recipe = loadRecipes().find((r) => r.id === recipeId);
    if (!recipe) return;
    editingRecipeId = recipeId;
    prefillFromRecipe(recipe);
    // Scroll ke atas wizard
    document.getElementById("hppStep1")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const duplicateRecipe = async (recipeId) => {
    const recipe = loadRecipes().find((r) => r.id === recipeId);
    if (!recipe) return;

    const newName = await window.showCustomPrompt({
      title: "Duplikat Resep",
      message: `Beri nama baru untuk salinan "${recipe.namaProduk}". Semua data bahan & biaya ikut tersalin, tinggal kamu ubah yang perlu.`,
      placeholder: `Contoh: ${recipe.namaProduk} Pedas`,
      defaultValue: `${recipe.namaProduk} (Copy)`,
      confirmText: "Duplikat",
      cancelText: "Batal",
    });
    if (!newName || !newName.trim()) return;

    editingRecipeId = null; // pastikan save akan buat ID baru
    prefillFromRecipe(recipe, newName.trim());
    document.getElementById("hppStep1")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const deleteRecipe = async (recipeId) => {
    const ok = await window.showCustomConfirm({
      title: "Hapus Resep",
      message: "Resep yang dihapus tidak bisa dikembalikan. Tetap hapus?",
      confirmText: "Ya, Hapus",
      cancelText: "Batal",
      isDanger: true,
    });
    if (!ok) return;
    saveRecipes(loadRecipes().filter((r) => r.id !== recipeId));
    renderRecipeList();
  };

  // === Event Binding ===
  const bindEvents = () => {
    const el = (id) => document.getElementById(id);

    // Step 1: Next
    el("hppStep1Next")?.addEventListener("click", () => {
      const nama = el("hppNamaProduk")?.value.trim();
      const jumlah = parseInt(el("hppJumlahProduksi")?.value);
      if (!nama) {
        alert("Isi nama produk dulu ya!");
        return;
      }
      if (!jumlah || jumlah <= 0) {
        alert("Isi jumlah produksi dulu ya!");
        return;
      }
      goToStep(2);
    });

    // Step 2: Back, Next
    el("hppStep2Back")?.addEventListener("click", () => goToStep(1));
    el("hppStep2Next")?.addEventListener("click", () => {
      if (ingredients.length === 0) {
        alert("Tambahkan minimal satu bahan ya!");
        return;
      }
      goToStep(3);
    });

    // Step 3: Back, Next
    el("hppStep3Back")?.addEventListener("click", () => goToStep(2));
    el("hppStep3Next")?.addEventListener("click", () => goToStep(4));

    // Step 4: Back, Save
    el("hppStep4Back")?.addEventListener("click", () => goToStep(3));
    el("hppSimpanResep")?.addEventListener("click", saveCurrentRecipe);

    // Mode toggle
    el("hppModeResep")?.addEventListener("click", () =>
      switchMode("resep")
    );
    el("hppModeCepat")?.addEventListener("click", () =>
      switchMode("cepat")
    );

    // Add ingredient from inventory
    el("hppAddIngredientBtn")?.addEventListener(
      "click",
      addIngredientFromInventory
    );

    // Enter key on jumlah pakai input → add ingredient from inventory
    el("hppJumlahPakai")?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        addIngredientFromInventory();
      }
    });

    // Add manual ingredient
    el("hppAddManualBtn")?.addEventListener("click", addManualIngredient);

    // Enter key on manual jumlah input → add manual ingredient
    el("hppManualJumlah")?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        addManualIngredient();
      }
    });

    // Add overhead
    el("hppAddOverheadBtn")?.addEventListener("click", addOverhead);

    // Go to inventory
    el("hppGoToInventory")?.addEventListener("click", () => {
      window.closeAppModal();
      setTimeout(() => window.openAppModal("inventory"), 300);
    });

    // Margin slider — recalc on change
    el("hppMarginSlider")?.addEventListener("input", () => {
      calculateAll();
    });

    // Real-time update for step 3 inputs
    ["hppJamKerja", "hppUpahPerJam", "hppBiayaKemasan"].forEach(
      (id) => {
        el(id)?.addEventListener("input", () => {
          if (currentStep >= 3) calculateAll();
        });
      }
    );

    // Enter key on overhead biaya input → add overhead
    el("hppOverheadBiaya")?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        addOverhead();
      }
    });
  };

  // === Init ===
  goToStep(1);
  renderOverhead();
  renderRecipeList();
  bindEvents();

  // Set initial mode button states
  switchMode("resep");
}

function renderHppApp(container) {
  if (!container) return;
  container.innerHTML = getHppAppUI();
  initHppAppLogic();
}
