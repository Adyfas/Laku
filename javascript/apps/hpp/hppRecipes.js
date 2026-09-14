/**
 * hppRecipes.js — Recipe CRUD for HPP Kalkulator
 * Handles saving, rendering, editing, duplicating, and deleting recipes.
 * Recipes are stored in localStorage under "laku_recipe_data".
 *
 * All functions attach to window.LakuHpp namespace.
 * Uses window.formatRupiah() from appUtils.js (no local formatRupiah).
 */

/** Save current form data as a new recipe or update existing one */
window.LakuHpp.saveCurrentRecipe = function () {
  const namaProduk =
    document.getElementById("hppNamaProduk")?.value.trim();
  const jumlahProduksi =
    parseInt(document.getElementById("hppJumlahProduksi")?.value) || 0;
  const satuan =
    document.getElementById("hppSatuanProduksi")?.value || "porsi";

  if (!namaProduk) {
    window.showAlert({ type: "warning", title: "Belum Lengkap", message: "Isi nama produk dulu ya!" });
    return;
  }
  if (jumlahProduksi <= 0) {
    window.showAlert({ type: "warning", title: "Belum Lengkap", message: "Isi jumlah produksi dulu ya!" });
    return;
  }
  if (window.LakuHpp.ingredients.length === 0) {
    window.showAlert({ type: "warning", title: "Belum Lengkap", message: "Tambahkan minimal satu bahan!" });
    return;
  }

  // Recalculate final values
  const totalBahan = window.LakuHpp.ingredients.reduce(
    (sum, ing) => sum + ing.jumlahPakai * ing.hargaBeli,
    0
  );
  const jam =
    parseFloat(document.getElementById("hppJamKerja")?.value) || 0;
  const upah = window.getRawNumber(
    document.getElementById("hppUpahPerJam")
  );
  const totalTenaga = jam * upah;
  const totalOverhead = window.LakuHpp.overheadItems.reduce(
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
  const hargaBulat = window.roundToNearest(hargaJual, 100);

  const recipe = {
    id: Date.now(),
    namaProduk,
    jumlahProduksi,
    satuanProduksi: satuan,
    bahanBaku: window.LakuHpp.ingredients.map((ing) => ({
      inventoryId: ing.inventoryId,
      namaBahan: ing.nama,
      hargaBeli: ing.hargaBeli,
      jumlahPakai: ing.jumlahPakai,
      satuan: ing.satuan,
      biayaTerhitung: ing.jumlahPakai * ing.hargaBeli,
      // Conversion data (for restoring original input & stock deduct):
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
    overhead: [...window.LakuHpp.overheadItems],
    biayaKemasan,
    totalBiayaBahan: totalBahan,
    totalBiaya,
    hppPerUnit,
    margin,
    hargaJual,
    hargaJualBulat: hargaBulat,
    tanggalDibuat: new Date().toISOString(),
  };

  if (window.LakuHpp.editingRecipeId) {
    // UPDATE existing recipe
    const recipes = loadRecipes();
    const idx = recipes.findIndex((r) => r.id === window.LakuHpp.editingRecipeId);
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
    // INSERT new recipe
    const recipes = loadRecipes();
    recipes.unshift(recipe);
    saveRecipes(recipes);
  }

  // Visual feedback
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

  window.LakuHpp.renderRecipeList();
};

/** Render recipe list: desktop table + mobile cards */
window.LakuHpp.renderRecipeList = function () {
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
        <td class="py-3.5 px-4 text-right font-semibold text-gray-800">${window.formatRupiah(r.hppPerUnit)}</td>
        <td class="py-3.5 px-4 text-right font-extrabold text-[#274c43]">${window.formatRupiah(r.hargaJualBulat)}</td>
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
          <span class="text-gray-500 font-medium">Modal/satuan</span>
          <span class="font-semibold text-gray-800">${window.formatRupiah(r.hppPerUnit)}</span>
        </div>
        <div class="flex items-center justify-between text-xs">
          <span class="text-gray-500 font-medium">Harga jual</span>
          <span class="font-extrabold text-[#274c43] text-base">${window.formatRupiah(r.hargaJualBulat)}</span>
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

  // Bind Edit / Duplicate / Delete actions
  tbody.querySelectorAll("[data-recipe-edit]").forEach((btn) =>
    btn.addEventListener("click", () =>
      window.LakuHpp.openRecipeForEdit(parseInt(btn.getAttribute("data-recipe-edit")))
    )
  );
  mobileList.querySelectorAll("[data-recipe-edit]").forEach((btn) =>
    btn.addEventListener("click", () =>
      window.LakuHpp.openRecipeForEdit(parseInt(btn.getAttribute("data-recipe-edit")))
    )
  );
  tbody.querySelectorAll("[data-recipe-duplicate]").forEach((btn) =>
    btn.addEventListener("click", () =>
      window.LakuHpp.duplicateRecipe(parseInt(btn.getAttribute("data-recipe-duplicate")))
    )
  );
  mobileList.querySelectorAll("[data-recipe-duplicate]").forEach((btn) =>
    btn.addEventListener("click", () =>
      window.LakuHpp.duplicateRecipe(parseInt(btn.getAttribute("data-recipe-duplicate")))
    )
  );
  tbody.querySelectorAll("[data-recipe-delete]").forEach((btn) =>
    btn.addEventListener("click", () =>
      window.LakuHpp.deleteRecipe(parseInt(btn.getAttribute("data-recipe-delete")))
    )
  );
  mobileList.querySelectorAll("[data-recipe-delete]").forEach((btn) =>
    btn.addEventListener("click", () =>
      window.LakuHpp.deleteRecipe(parseInt(btn.getAttribute("data-recipe-delete")))
    )
  );
};

/** Fill the wizard form with recipe data (for edit or duplicate) */
window.LakuHpp.prefillFromRecipe = function (recipe, newName) {
  const el = (id) => document.getElementById(id);

  // Step 1
  el("hppNamaProduk").value = newName ?? recipe.namaProduk;
  el("hppJumlahProduksi").value = recipe.jumlahProduksi;
  el("hppSatuanProduksi").value = recipe.satuanProduksi || "porsi";

  // Step 2 — ingredients (restore original user input if available)
  window.LakuHpp.ingredients = (recipe.bahanBaku || []).map((ing) => {
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

  // Step 3 — costs
  const tk = recipe.tenagaKerja || {};
  el("hppJamKerja").value = tk.jam || "";
  el("hppUpahPerJam").value = tk.upahPerJam || "";
  if (tk.upahPerJam) window.formatNumberInput(el("hppUpahPerJam"));
  window.LakuHpp.overheadItems = [...(recipe.overhead || [])];
  el("hppBiayaKemasan").value = recipe.biayaKemasan || "";
  if (recipe.biayaKemasan) window.formatNumberInput(el("hppBiayaKemasan"));

  // Step 4 — margin
  el("hppMarginSlider").value = recipe.margin ?? 30;
  el("hppMarginDisplay").textContent = `${recipe.margin ?? 30}%`;

  // Render & start from step 1
  goToStep(1);
  window.LakuHpp.renderIngredients();
  window.LakuHpp.renderOverhead();
};

/** Load a recipe into the form for editing */
window.LakuHpp.openRecipeForEdit = function (recipeId) {
  const recipe = loadRecipes().find((r) => r.id === recipeId);
  if (!recipe) return;
  window.LakuHpp.editingRecipeId = recipeId;
  window.LakuHpp.prefillFromRecipe(recipe);
  // Scroll to top of wizard
  document.getElementById("hppStep1")?.scrollIntoView({ behavior: "smooth", block: "start" });
};

/** Duplicate a recipe with a new name */
window.LakuHpp.duplicateRecipe = async function (recipeId) {
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

  window.LakuHpp.editingRecipeId = null; // ensure save will create new ID
  window.LakuHpp.prefillFromRecipe(recipe, newName.trim());
  document.getElementById("hppStep1")?.scrollIntoView({ behavior: "smooth", block: "start" });
};

/** Delete a recipe with confirmation */
window.LakuHpp.deleteRecipe = async function (recipeId) {
  const ok = await window.showCustomConfirm({
    title: "Hapus Resep",
    message: "Resep yang dihapus tidak bisa dikembalikan. Tetap hapus?",
    confirmText: "Ya, Hapus",
    cancelText: "Batal",
    isDanger: true,
  });
  if (!ok) return;
  saveRecipes(loadRecipes().filter((r) => r.id !== recipeId));
  window.LakuHpp.renderRecipeList();
};
