const RECIPE_SCHEMA_VERSION = 2;
window.LakuHpp.saveCurrentRecipe = function () {
  const namaProduk =
    document.getElementById("hppNamaProduk")?.value.trim();
  const jumlahProduksiValidation = window.LakuHpp.validatePositiveFinite(
    document.getElementById("hppJumlahProduksi")?.value,
    "Jumlah produksi"
  );
  const satuan =
    document.getElementById("hppSatuanProduksi")?.value || "porsi";

  if (!namaProduk) {
    window.showAlert({ type: "warning", title: "Belum Lengkap", message: "Isi nama produk dulu ya!" });
    return;
  }
  if (!jumlahProduksiValidation.valid) {
    window.showAlert({ type: "warning", title: "Belum Lengkap", message: jumlahProduksiValidation.message });
    return;
  }
  if (window.LakuHpp.ingredients.length === 0) {
    window.showAlert({ type: "warning", title: "Belum Lengkap", message: "Tambahkan minimal satu bahan!" });
    return;
  }

  const jam =
    parseFloat(document.getElementById("hppJamKerja")?.value) || 0;
  const upah = window.getRawNumber(
    document.getElementById("hppUpahPerJam")
  );
  const biayaKemasan = window.getRawNumber(
    document.getElementById("hppBiayaKemasan")
  );
  const margin =
    parseFloat(document.getElementById("hppMarginSlider")?.value) || 30;
  const values = window.LakuHpp.calculateValues({
    jam,
    upah,
    biayaKemasan,
    jumlahProduksi: jumlahProduksiValidation.value,
    margin,
  });

  const recipe = {
    id: window.LakuHpp.generateHppId("rec"),
    schemaVersion: RECIPE_SCHEMA_VERSION,
    namaProduk,
    jumlahProduksi: jumlahProduksiValidation.value,
    satuanProduksi: satuan,
    bahanBaku: window.LakuHpp.ingredients.map((ing) => ({
      inventoryId: ing.inventoryId,
      namaBahan: ing.nama,
      hargaBeli: ing.hargaBeli,
      jumlahPakai: ing.jumlahPakai,
      satuan: ing.satuan,
      biayaTerhitung: ing.jumlahPakai * ing.hargaBeli,
      inputQty: ing._inputQty ?? ing.jumlahPakai,
      inputUnit: ing._inputUnit || ing.satuan,
      calculationQty: ing.jumlahPakai,
      calculationUnit: ing.satuan,
      ...(ing._inputUnitPrice !== undefined ? { inputUnitPrice: ing._inputUnitPrice } : {}),
      ...(ing.nestedLevels ? { nestedLevels: ing.nestedLevels } : {}),
      ...(ing._qtyBase !== undefined ? { _qtyBase: ing._qtyBase } : {}),
      ...(ing._baseUnit ? { _baseUnit: ing._baseUnit } : {}),
      ...(ing._inputQty !== undefined ? { _inputQty: ing._inputQty } : {}),
      ...(ing._inputUnit ? { _inputUnit: ing._inputUnit } : {}),
      ...(ing._inputUnitPrice !== undefined ? { _inputUnitPrice: ing._inputUnitPrice } : {}),
    })),
    tenagaKerja: {
      jam,
      upahPerJam: upah,
      total: values.totalTenaga,
    },
    overhead: [...window.LakuHpp.overheadItems],
    biayaKemasan,
    totalBiayaBahan: values.totalBahan,
    totalBiaya: values.totalBiaya,
    hppPerUnit: values.hppPerUnit,
    margin: values.margin,
    hargaJual: values.hargaJual,
    hargaJualBulat: values.hargaJualBulat,
    tanggalDibuat: new Date().toISOString(),
  };

  if (window.LakuHpp.editingRecipeId) {
    const recipes = loadRecipes();
    const idx = recipes.findIndex((r) => window.LakuHpp.idsEqual(r.id, window.LakuHpp.editingRecipeId));
    if (idx === -1) {
      window.showAlert({ type: "error", title: "Gagal Menyimpan", message: "Resep tidak ditemukan!" });
      return;
    }
    recipes[idx] = {
      ...recipes[idx],
      ...recipe,
      id: window.LakuHpp.editingRecipeId,
      tanggalDibuat: recipes[idx].tanggalDibuat,
      tanggalDiubah: new Date().toISOString(),
    };
    saveRecipes(recipes);
    window.LakuHpp.editingRecipeId = null;
  } else {
    const recipes = loadRecipes();
    recipes.unshift(recipe);
    saveRecipes(recipes);
  }

  const simpanBtn = document.getElementById("hppSimpanResep");
  if (simpanBtn) {
    simpanBtn.innerHTML = window.LakuIcons.svg("checkCircle", "1em") + " Tersimpan!";
    simpanBtn.className =
      "flex-1 bg-emerald-600 text-white font-bold py-4 rounded-2xl transition-all shadow-md text-base cursor-pointer";
    setTimeout(() => {
      simpanBtn.innerHTML = window.LakuIcons.svg("save", "1em") + " Simpan Resep";
      simpanBtn.className =
        "flex-1 bg-[#274c43] hover:bg-[#1f3d36] text-white font-bold py-4 rounded-2xl transition-all shadow-md text-base cursor-pointer";
    }, 2000);
  }

  if (window.LakuHpp.resetForm) {
    window.LakuHpp.resetForm();
  } else {
    window.LakuHpp.clearSession();
    window.LakuHpp.ingredients = [];
    window.LakuHpp.overheadItems = [];
    window.LakuHpp.editingRecipeId = null;
    window.LakuHpp.currentStep = 1;
    window.LakuHpp.refreshIngredientUI();
    window.LakuHpp.renderOverhead();
    window.LakuHpp.refreshRecipeList();
    goToStep(1);
  }

  window.LakuHpp.refreshRecipeList();
};


window.LakuHpp.renderRecipeList = function (paginatedItems) {
  const tbody = document.getElementById("recipeTableBody");
  const mobileList = document.getElementById("recipeMobileList");
  if (!tbody || !mobileList) return;

  const paginationData = window.LakuHpp.paginationController
    ? window.LakuHpp.paginationController.getPaginatedData()
    : { items: [], totalItems: 0, totalPages: 1, currentPage: 1, pageSize: 10, startIdx: 0, endIdx: 0 };
  const recipes = paginatedItems !== undefined ? paginatedItems : paginationData.items;

  if (recipes.length === 0) {
    const emptyHtml = `
      <div class="py-8 text-center text-gray-400 text-sm bg-stone-50 rounded-2xl">
        Belum ada resep tersimpan. Selesaikan perhitungan di atas lalu klik "Simpan Resep"!
      </div>
    `;
    tbody.innerHTML = `<tr><td colspan="6" class="py-2">${emptyHtml}</td></tr>`;
    mobileList.innerHTML = emptyHtml;
    if (tbody._recipeClickHandler) {
      tbody.removeEventListener("click", tbody._recipeClickHandler);
      tbody._recipeClickHandler = null;
    }
    if (mobileList._recipeClickHandler) {
      mobileList.removeEventListener("click", mobileList._recipeClickHandler);
      mobileList._recipeClickHandler = null;
    }
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
      <button data-recipe-edit="${window.LakuHpp.escapeHtml(r.id)}" class="bg-stone-100 hover:bg-[#274c43] hover:text-white text-gray-600 font-bold py-1.5 px-3 rounded-lg text-xs transition-all cursor-pointer">Edit</button>
      <button data-recipe-duplicate="${window.LakuHpp.escapeHtml(r.id)}" class="bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 font-bold py-1.5 px-3 rounded-lg text-xs transition-all cursor-pointer">Duplikat</button>
      <button data-recipe-delete="${window.LakuHpp.escapeHtml(r.id)}" class="text-stone-400 hover:text-rose-600 font-semibold text-xs cursor-pointer">Hapus</button>
    `;

    desktopHtml += `
      <tr class="hover:bg-stone-50/80 transition-colors">
        <td class="py-3.5 px-4">
          <div class="font-bold text-gray-800">${window.LakuHpp.escapeHtml(r.namaProduk)} ${badgeDiubah}</div>
          <div class="text-[11px] text-gray-400">${tgl} • ${r.bahanBaku?.length || 0} bahan</div>
        </td>
        <td class="py-3.5 px-4 text-center text-xs font-medium text-gray-600">${window.LakuHpp.escapeHtml(String(r.jumlahProduksi))} ${window.LakuHpp.escapeHtml(r.satuanProduksi)}</td>
        <td class="py-3.5 px-4 text-right font-semibold text-gray-800">${window.formatRupiah(r.hppPerUnit)}</td>
        <td class="py-3.5 px-4 text-right font-extrabold text-[#274c43]">${window.formatRupiah(r.hargaJualBulat)}</td>
        <td class="py-3.5 px-4 text-center text-xs font-bold text-amber-700">${window.LakuHpp.escapeHtml(String(r.margin))}%</td>
        <td class="py-3.5 px-4 text-center space-x-1.5 whitespace-nowrap">${actionButtons}</td>
      </tr>
    `;

    mobileHtml += `
      <div class="bg-white border border-stone-200/90 rounded-2xl p-4 shadow-xs space-y-3">
        <div class="flex items-center justify-between">
          <h4 class="text-base font-bold text-gray-900">${window.LakuHpp.escapeHtml(r.namaProduk)} ${badgeDiubah}</h4>
          <span class="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-md">${window.LakuHpp.escapeHtml(String(r.margin))}%</span>
        </div>
        <div class="text-[11px] text-gray-400">${tgl} • ${window.LakuHpp.escapeHtml(String(r.jumlahProduksi))} ${window.LakuHpp.escapeHtml(r.satuanProduksi)} • ${r.bahanBaku?.length || 0} bahan</div>
        <div class="border-t border-gray-100 pt-2 flex items-center justify-between text-xs">
          <span class="text-gray-500 font-medium">Modal/satuan</span>
          <span class="font-semibold text-gray-800">${window.formatRupiah(r.hppPerUnit)}</span>
        </div>
        <div class="flex items-center justify-between text-xs">
          <span class="text-gray-500 font-medium">Harga jual</span>
          <span class="font-extrabold text-[#274c43] text-base">${window.formatRupiah(r.hargaJualBulat)}</span>
        </div>
        <div class="pt-2 flex items-center justify-between gap-2 border-t border-gray-100">
          <div class="flex items-center gap-2">
            <button data-recipe-edit="${window.LakuHpp.escapeHtml(r.id)}" class="bg-stone-100 hover:bg-[#274c43] hover:text-white text-gray-600 font-bold py-1.5 px-3 rounded-lg text-xs transition-all cursor-pointer">Edit</button>
            <button data-recipe-duplicate="${window.LakuHpp.escapeHtml(r.id)}" class="bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 font-bold py-1.5 px-3 rounded-lg text-xs transition-all cursor-pointer">Duplikat</button>
          </div>
          <button data-recipe-delete="${window.LakuHpp.escapeHtml(r.id)}" class="text-stone-400 hover:text-rose-600 font-semibold text-xs cursor-pointer">Hapus</button>
        </div>
      </div>
    `;
  });

  tbody.innerHTML = desktopHtml;
  mobileList.innerHTML = mobileHtml;

  if (tbody._recipeClickHandler) {
    tbody.removeEventListener("click", tbody._recipeClickHandler);
  }
  if (mobileList._recipeClickHandler) {
    mobileList.removeEventListener("click", mobileList._recipeClickHandler);
  }

  const handleRecipeAction = (e, listEl) => {
    const target = e.target.closest("button");
    if (!target) return;

    const recipeId = target.getAttribute("data-recipe-edit") ||
                     target.getAttribute("data-recipe-duplicate") ||
                     target.getAttribute("data-recipe-delete");
    if (!recipeId) return;

    if (target.hasAttribute("data-recipe-edit")) {
      window.LakuHpp.openRecipeForEdit(recipeId);
    } else if (target.hasAttribute("data-recipe-duplicate")) {
      window.LakuHpp.duplicateRecipe(recipeId);
    } else if (target.hasAttribute("data-recipe-delete")) {
      window.LakuHpp.deleteRecipe(recipeId);
    }
  };

  tbody._recipeClickHandler = (e) => handleRecipeAction(e, tbody);
  mobileList._recipeClickHandler = (e) => handleRecipeAction(e, mobileList);
  tbody.addEventListener("click", tbody._recipeClickHandler);
  mobileList.addEventListener("click", mobileList._recipeClickHandler);
};

window.LakuHpp.prefillFromRecipe = function (recipe, newName) {
  const el = (id) => document.getElementById(id);
  el("hppNamaProduk").value = newName ?? recipe.namaProduk;
  el("hppJumlahProduksi").value = recipe.jumlahProduksi;
  el("hppSatuanProduksi").value = recipe.satuanProduksi || "porsi";
  window.LakuHpp.ingredients = (recipe.bahanBaku || []).map((ing) => {
    const restored = {
      id: window.LakuHpp.generateHppId("ing"),
      inventoryId: ing.inventoryId || null,
      nama: ing.namaBahan,
      hargaBeli: ing.hargaBeli,
      jumlahPakai: ing.jumlahPakai,
      satuan: ing.satuan || "unit",
      ...(ing.nestedLevels ? { nestedLevels: ing.nestedLevels } : {}),
    };
    if (ing._inputQty !== undefined && ing._inputUnit) {
      restored._inputQty = ing._inputQty;
      restored._inputUnit = ing._inputUnit;
      if (ing._inputUnitPrice !== undefined) restored._inputUnitPrice = ing._inputUnitPrice;
      if (ing._qtyBase !== undefined) restored._qtyBase = ing._qtyBase;
      if (ing._baseUnit) restored._baseUnit = ing._baseUnit;
    }
    return restored;
  });

  const tk = recipe.tenagaKerja || {};
  el("hppJamKerja").value = tk.jam || "";
  el("hppUpahPerJam").value = tk.upahPerJam || "";
  if (tk.upahPerJam) window.formatNumberInput(el("hppUpahPerJam"));
  window.LakuHpp.overheadItems = [...(recipe.overhead || [])].map((item) => ({
    ...item,
    id: item.id || window.LakuHpp.generateHppId("ovh"),
  }));
  el("hppBiayaKemasan").value = recipe.biayaKemasan || "";
  if (recipe.biayaKemasan) window.formatNumberInput(el("hppBiayaKemasan"));

  el("hppMarginSlider").value = recipe.margin ?? 30;
  el("hppMarginDisplay").textContent = `${recipe.margin ?? 30}%`;

  goToStep(1);
  window.LakuHpp.renderIngredients();
  window.LakuHpp.renderOverhead();
};

window.LakuHpp.openRecipeForEdit = function (recipeId) {
  const recipe = loadRecipes().find((r) => window.LakuHpp.idsEqual(r.id, recipeId));
  if (!recipe) return;
  window.LakuHpp.editingRecipeId = recipeId;
  window.LakuHpp.prefillFromRecipe(recipe);
  if (typeof window.LakuHpp.toggleBuatBaruButtons === "function") {
    window.LakuHpp.toggleBuatBaruButtons(true);
  }
  document.getElementById("hppStep1")?.scrollIntoView({ behavior: "smooth", block: "start" });
};

window.LakuHpp.duplicateRecipe = async function (recipeId) {
  const recipe = loadRecipes().find((r) => window.LakuHpp.idsEqual(r.id, recipeId));
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

  window.LakuHpp.editingRecipeId = null; // ensure save will create new ID
  window.LakuHpp.prefillFromRecipe(recipe, newName.trim());
  document.getElementById("hppStep1")?.scrollIntoView({ behavior: "smooth", block: "start" });
};

window.LakuHpp.deleteRecipe = async function (recipeId) {
  const ok = await window.showCustomConfirm({
    title: "Hapus Resep",
    message: "Resep yang dihapus tidak bisa dikembalikan. Tetap hapus?",
    confirmText: "Ya, Hapus",
    cancelText: "Batal",
    isDanger: true,
  });
  if (!ok) return;
  saveRecipes(loadRecipes().filter((r) => !window.LakuHpp.idsEqual(r.id, recipeId)));
  if (window.LakuHpp.idsEqual(window.LakuHpp.editingRecipeId, recipeId)) {
    window.LakuHpp.editingRecipeId = null;
  }
  window.LakuHpp.refreshRecipeList();
};
