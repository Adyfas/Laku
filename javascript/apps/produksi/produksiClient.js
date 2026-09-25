/**
 * produksiClient.js - Immutable production transactions and stock deduction.
 * A recipe is only a plan; stock changes only after production confirmation.
 */
(function () {
  "use strict";

  const PRODUCTION_KEY = "laku_produksi_data";
  const INVENTORY_KEY = "laku_inventory_data";
  const RECIPE_KEY = "laku_recipe_data";
  const TOUR_DEMO_RECIPE_ID = "__tour_demo_recipe__";
  let tourDemoHistoryVisible = false;
  let tourDemoMode = false;

  const TOUR_DEMO_RECIPE = {
    id: TOUR_DEMO_RECIPE_ID,
    namaProduk: "Nasi Goreng Spesial",
    satuanProduksi: "porsi",
    hppPerUnit: 4261,
    hargaJualBulat: 5500,
    bahanBaku: [
      { namaBahan: "Beras", jumlahPakai: 0.5, satuan: "kg" },
      { namaBahan: "Telur", jumlahPakai: 2, satuan: "butir" },
    ],
  };

  const escapeHtml = (value) => String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const readArray = (key) => {
     try {
       const raw = localStorage.getItem(key);
       const data = raw ? JSON.parse(raw) : [];
       return Array.isArray(data) ? data : [];
     } catch (error) {
       console.error(`Gagal membaca ${key}:`, error);
       return [];
     }
   };
   

   const getDisplayUnit = (item) => item.displayUnit || item.satuan || "pcs";

  const getWorkingUnit = (item) => window.LakuUnits.getNestedUnit(item);

  const getWorkingStock = (item) => {
    const displayUnit = getDisplayUnit(item);
    const converted = window.LakuUnits.toWorkingQuantity(item, Number(item.stok || 0), displayUnit);
    return (converted.value || 0) + Number(item.looseQty || 0);
  };

  const getIngredientQuantity = (ingredient) => Number(
    ingredient.calculationQty ?? ingredient.jumlahPakai ?? ingredient.inputQty ?? 0
  );

  const getIngredientUnit = (ingredient) => ingredient.calculationUnit || ingredient.satuan || ingredient.inputUnit;

  const getRequiredWorkingQuantity = (item, ingredient, productionQuantity) => {
    const quantity = getIngredientQuantity(ingredient) * productionQuantity;
    const unit = getIngredientUnit(ingredient);
    const workingUnit = getWorkingUnit(item);
    const converted = item.nestedLevels?.length
      ? window.LakuUnits.convertNested(quantity, unit, workingUnit, item)
      : window.LakuUnits.convertUnitExact(quantity, unit, getDisplayUnit(item));

    return { quantity: converted, unit: workingUnit };
  };

  const applyWorkingDeduction = (item, requiredWorking) => {
    const displayUnit = getDisplayUnit(item);
    if (item.nestedLevels?.length) {
      const ratio = window.LakuUnits.getNestedRatio(item);
      const remaining = window.LakuUnits.round2(getWorkingStock(item) - requiredWorking);
      item.stok = Math.floor(remaining / ratio);
      item.looseQty = window.LakuUnits.round2(remaining - item.stok * ratio);
      return;
    }

    const remaining = window.LakuUnits.round2(Number(item.stok || 0) - requiredWorking);
    item.stok = Math.max(0, remaining);
    item.displayUnit = displayUnit;
    item.satuan = displayUnit;
  };

  const formatStock = (item) => {
    if (item.nestedLevels?.length) {
      return window.LakuUnits.formatInventoryQuantity(item, getWorkingStock(item));
    }
    return `${window.LakuUnits.round2(item.stok || 0)} ${window.LakuUnits.formatUnitLabel(getDisplayUnit(item))}`;
  };

  const calculateProfit = (recipe, quantity) => {
    const cost = Number(recipe.hppPerUnit ?? recipe.biayaPerUnit ?? 0);
    const price = Number(recipe.hargaJualBulat ?? recipe.hargaJual ?? 0);
    return {
      biayaPerUnit: cost,
      hargaJual: price,
      totalBiaya: quantity * cost,
      totalRevenue: quantity * price,
      totalProfit: quantity * (price - cost),
    };
};
 
   const buildShortageMessage = (shortages) => shortages
     .map((item) => `${item.nama}: kurang ${window.LakuUnits.round2(item.missing)} ${window.LakuUnits.formatUnitLabel(item.unit)}`)
     .join("<br>");

   // Filter function for Produksi recipes
   const produksiFilterFn = (item, state) => {
     const searchTerm = (state.searchTerm || "").toLowerCase().trim();
     if (searchTerm && (item.namaProduk || "").toLowerCase().indexOf(searchTerm) === -1) {
       return false;
     }
     return true;
   };

   // Initialize shared pagination controller
   const pagination = window.LakuPagination.createPaginationController({
     storageKey: "laku_produksi_ui_state",
     getData: () => readArray(RECIPE_KEY),
     filterFn: produksiFilterFn,
     elements: {
       searchInput: "produksiSearchInput",
       pageSizeSelect: "produksiPageSizeSelect",
       prevPage: "produksiPrevPage",
       nextPage: "produksiNextPage",
       currentPage: "produksiCurrentPage",
       totalPages: "produksiTotalPages",
       startIndex: "produksiStartIndex",
       endIndex: "produksiEndIndex",
       totalCount: "produksiTotalCount",
       paginationContainer: "produksiPagination",
       clearFilters: "produksiClearFilters",
     },
     onChange: (items, pagination) => renderRecipes(items),
     defaultPageSize: 10,
     debounceMs: 300,
   });

   async function produce(recipeId, quantity) {
    if (String(recipeId) === TOUR_DEMO_RECIPE_ID) {
      const demoQuantity = Number(quantity);
      if (!Number.isFinite(demoQuantity) || demoQuantity <= 0) {
        window.showAlert({ type: "warning", title: "Jumlah belum benar", message: "Contoh jumlah produksi harus lebih dari 0." });
        return { ok: false, reason: "invalid_demo_quantity" };
      }
      const confirmed = await window.showCustomConfirm({
        title: "Contoh Konfirmasi Produksi",
        message: `Contoh: produksi ${TOUR_DEMO_RECIPE.namaProduk} sebanyak ${demoQuantity} ${TOUR_DEMO_RECIPE.satuanProduksi}? Data contoh tidak akan mengubah stok asli.`,
        confirmText: "Ya, Coba",
        cancelText: "Batal",
      });
      if (!confirmed) return { ok: false, reason: "cancelled" };
      tourDemoHistoryVisible = true;
      window.showAlert({ type: "success", title: "Contoh selesai", message: "Ini hanya simulasi tour. Stok dan data asli tidak diubah." });
      renderHistory();
      return { ok: true, demo: true };
    }

    const recipe = readArray(RECIPE_KEY).find((item) => String(item.id) === String(recipeId));
    const productionQuantity = Number(quantity);
    if (!recipe || !Number.isFinite(productionQuantity) || productionQuantity <= 0) {
      window.showAlert({ type: "warning", title: "Jumlah belum benar", message: "Masukkan jumlah produksi lebih dari 0." });
      return { ok: false, reason: "invalid_quantity" };
    }

    const confirmed = await window.showCustomConfirm({
      title: "Konfirmasi Produksi",
      message: `Anda yakin ingin memproduksi ${recipe.namaProduk} sebanyak ${productionQuantity} ${recipe.satuanProduksi || "unit"}?`,
      confirmText: "Ya",
      cancelText: "Batal",
    });
    if (!confirmed) return { ok: false, reason: "cancelled" };

    const inventoryBefore = readArray(INVENTORY_KEY);
    const inventoryAfter = JSON.parse(JSON.stringify(inventoryBefore));
    const shortages = [];
    const requirements = [];

    for (const ingredient of recipe.bahanBaku || []) {
      const item = inventoryAfter.find((entry) => String(entry.id) === String(ingredient.inventoryId));
      if (!item) {
        shortages.push({ nama: ingredient.namaBahan || "Bahan", missing: getIngredientQuantity(ingredient) * productionQuantity, unit: getIngredientUnit(ingredient) });
        continue;
      }
      const required = getRequiredWorkingQuantity(item, ingredient, productionQuantity);
      if (required.quantity === null || !Number.isFinite(required.quantity)) {
        shortages.push({ nama: item.nama, missing: getIngredientQuantity(ingredient) * productionQuantity, unit: getIngredientUnit(ingredient) });
        continue;
      }
      const available = getWorkingStock(item);
      if (required.quantity > available + Number.EPSILON) {
        shortages.push({ nama: item.nama, missing: required.quantity - available, unit: required.unit });
      }
      requirements.push({ item, ingredient, required, available });
    }

    if (shortages.length > 0) {
      window.showAlert({ type: "error", title: "Stok belum cukup", message: buildShortageMessage(shortages) });
      return { ok: false, reason: "insufficient_stock", shortages };
    }

    requirements.forEach(({ item, required }) => applyWorkingDeduction(item, required.quantity));
    const profit = calculateProfit(recipe, productionQuantity);
    const production = {
      id: `prod_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      recipeId: recipe.id,
      namaProduk: recipe.namaProduk,
      quantity: productionQuantity,
      satuan: recipe.satuanProduksi || "unit",
      ...profit,
      ingredients: requirements.map(({ item, ingredient, required }) => ({
        inventoryId: item.id,
        nama: item.nama,
        qtyUsed: required.quantity,
        satuan: required.unit,
        inputQty: getIngredientQuantity(ingredient),
        inputUnit: getIngredientUnit(ingredient),
      })),
      createdAt: new Date().toISOString(),
    };

    const historyBefore = localStorage.getItem(PRODUCTION_KEY);
    const inventorySerialized = JSON.stringify(inventoryAfter);
    const historyAfter = JSON.stringify([production, ...readArray(PRODUCTION_KEY)]);
    try {
      localStorage.setItem(INVENTORY_KEY, inventorySerialized);
      localStorage.setItem(PRODUCTION_KEY, historyAfter);
    } catch (error) {
      if (inventoryBefore.length) localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventoryBefore));
      else localStorage.removeItem(INVENTORY_KEY);
      if (historyBefore === null) localStorage.removeItem(PRODUCTION_KEY);
      else localStorage.setItem(PRODUCTION_KEY, historyBefore);
      window.showAlert({ type: "error", title: "Produksi gagal disimpan", message: "Data tidak diubah karena penyimpanan gagal." });
      return { ok: false, reason: "storage_error" };
    }

    window.showAlert({ type: "success", title: "Produksi berhasil", message: `${recipe.namaProduk} sudah dicatat dan stok bahan telah dikurangi.` });
    return { ok: true, production, inventory: inventoryAfter };
  }
function renderRecipes(paginatedItems) {
    const target = document.getElementById("produksiRecipeList");
    if (!target) return;

    // Render paginated items from the shared pagination controller
    const recipes = paginatedItems !== undefined ? paginatedItems : pagination.getPaginatedData().items;

    if (recipes.length === 0) {
      if (!tourDemoMode) {
        target.innerHTML = `<div class="bg-white border border-gray-100 rounded-2xl p-8 text-center text-sm text-gray-400">Belum ada resep. Buat resep terlebih dahulu di Hitung Modal.</div>`;
        return;
      }
      target.innerHTML = `
        <div class="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-xs text-amber-800">
          Ini contoh alur Produksi. Data contoh tidak disimpan dan tidak mengurangi stok asli.
        </div>
        <div class="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-4 justify-between" data-tour-demo="produksi-recipe">
          <div>
            <div class="flex items-center gap-2">
              <h3 class="font-bold text-gray-800">${TOUR_DEMO_RECIPE.namaProduk}</h3>
              <span class="text-[10px] font-bold uppercase bg-amber-100 text-amber-800 px-2 py-1 rounded-md">Contoh</span>
            </div>
            <p class="text-xs text-gray-400">2 bahan · Beras 0,5 kg · Telur 2 butir · Harga jual ${window.formatRupiah(TOUR_DEMO_RECIPE.hargaJualBulat)}</p>
          </div>
          <div class="flex items-center gap-2">
            <input type="number" min="0.01" step="any" value="3" data-produksi-qty="${TOUR_DEMO_RECIPE.id}" class="w-24 bg-stone-50 border border-gray-200 rounded-xl px-3 py-2 text-sm" aria-label="Jumlah produksi contoh" />
            <button type="button" data-produksi-id="${TOUR_DEMO_RECIPE.id}" class="bg-[#274c43] text-white font-bold px-4 py-2 rounded-xl text-sm cursor-pointer">Produksi</button>
          </div>
        </div>
      `;
      bindRecipeButtons(target);
      return;
    }

    target.innerHTML = recipes.map((recipe) => `
      <div class="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div>
          <h3 class="font-bold text-gray-800">${escapeHtml(recipe.namaProduk)}</h3>
          <p class="text-xs text-gray-400">${recipe.bahanBaku?.length || 0} bahan · Harga jual ${window.formatRupiah(recipe.hargaJualBulat ?? recipe.hargaJual ?? 0)}</p>
        </div>
        <div class="flex items-center gap-2">
          <input type="number" min="0.01" step="any" value="1" data-produksi-qty="${recipe.id}" class="w-24 bg-stone-50 border border-gray-200 rounded-xl px-3 py-2 text-sm" aria-label="Jumlah produksi" />
          <button type="button" data-produksi-id="${recipe.id}" class="bg-[#274c43] text-white font-bold px-4 py-2 rounded-xl text-sm cursor-pointer">Produksi</button>
        </div>
      </div>
    `).join("");

    bindRecipeButtons(target);
  }

  function bindRecipeButtons(target) {
    target.querySelectorAll("[data-produksi-id]").forEach((button) => {
      button.addEventListener("click", async () => {
        const recipeId = button.dataset.produksiId;
        const input = target.querySelector(`[data-produksi-qty="${recipeId}"]`);
        const originalText = button.textContent;
        button.disabled = true;
        button.textContent = "Saya cek inventaris dulu";
        await produce(recipeId, input?.value);
        button.disabled = false;
        button.textContent = originalText;
        renderHistory();
      });
    });
  }

  function renderHistory() {
    const target = document.getElementById("produksiHistoryList");
    const summary = document.getElementById("produksiSummary");
    if (!target || !summary) return;
    const history = readArray(PRODUCTION_KEY);
    const hasRealHistory = history.length > 0;
    const hasDemoHistory = !hasRealHistory && tourDemoMode;
    const totalProfit = hasRealHistory
      ? history.reduce((sum, item) => sum + Number(item.totalProfit || 0), 0)
      : hasDemoHistory ? 3717 : 0;
    const totalQuantity = hasRealHistory
      ? history.reduce((sum, item) => sum + Number(item.quantity || 0), 0)
      : hasDemoHistory ? 3 : 0;
    summary.innerHTML = [
      [hasDemoHistory ? "Contoh Total Profit" : "Total Profit", window.formatRupiah(totalProfit)],
      [hasDemoHistory ? "Contoh Total Produksi" : "Total Produksi", `${totalQuantity} kali produksi`],
      [hasDemoHistory ? "Contoh Rata-rata Profit" : "Rata-rata Profit", window.formatRupiah(hasRealHistory ? totalProfit / history.length : 0)],
    ].map(([label, value]) => `<div class="bg-white border border-gray-100 rounded-2xl p-4"><div class="text-xs text-gray-400">${label}</div><div class="text-lg font-extrabold text-[#274c43] mt-1">${value}</div></div>`).join("");

    if (history.length === 0 && !tourDemoMode) {
      target.innerHTML = `<div class="bg-white border border-gray-100 rounded-2xl p-8 text-center text-sm text-gray-400">Belum ada riwayat produksi.</div>`;
      return;
    }

    if (history.length === 0 && !tourDemoHistoryVisible) {
      target.innerHTML = `
        <div class="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-xs text-amber-800">Belum ada produksi asli. Ringkasan di atas adalah contoh agar alurnya mudah dipahami.</div>
        <div class="bg-white border border-gray-100 rounded-2xl p-4" data-tour-demo="produksi-history">
          <div class="flex items-center justify-between gap-3">
            <div><h3 class="font-bold text-gray-800">Contoh: Nasi Goreng Spesial</h3><p class="text-xs text-gray-400">3 porsi · contoh saja · belum tersimpan</p></div>
            <div class="text-right"><div class="text-xs text-gray-400">Contoh Profit</div><div class="font-extrabold text-emerald-700">${window.formatRupiah(3717)}</div></div>
          </div>
        </div>
      `;
      return;
    }
    target.innerHTML = `<div class="space-y-3">${history.map((item) => `
      <div class="bg-white border border-gray-100 rounded-2xl p-4">
        <div class="flex items-center justify-between gap-3">
          <div><h3 class="font-bold text-gray-800">${escapeHtml(item.namaProduk)}</h3><p class="text-xs text-gray-400">${item.quantity} ${escapeHtml(item.satuan)} · ${new Date(item.createdAt).toLocaleString("id-ID")}</p></div>
          <div class="text-right"><div class="text-xs text-gray-400">Profit</div><div class="font-extrabold text-emerald-700">${window.formatRupiah(item.totalProfit)}</div></div>
        </div>
      </div>
    `).join("")}</div>`;
  }

  function bindTabs() {
    const resepTab = document.getElementById("produksiTabResep");
    const historyTab = document.getElementById("produksiTabRiwayat");
    const resepPanel = document.getElementById("produksiPanelResep");
    const historyPanel = document.getElementById("produksiPanelRiwayat");
    const showHistory = () => {
      resepPanel?.classList.add("hidden");
      historyPanel?.classList.remove("hidden");
      resepTab?.classList.replace("text-[#274c43]", "text-gray-400");
      resepTab?.classList.replace("border-[#274c43]", "border-transparent");
      historyTab?.classList.replace("text-gray-400", "text-[#274c43]");
      historyTab?.classList.replace("border-transparent", "border-[#274c43]");
    };
    const showRecipes = () => {
      historyPanel?.classList.add("hidden");
      resepPanel?.classList.remove("hidden");
      historyTab?.classList.replace("text-[#274c43]", "text-gray-400");
      historyTab?.classList.replace("border-[#274c43]", "border-transparent");
      resepTab?.classList.replace("text-gray-400", "text-[#274c43]");
      resepTab?.classList.replace("border-transparent", "border-[#274c43]");
    };
    resepTab?.addEventListener("click", showRecipes);
    historyTab?.addEventListener("click", showHistory);
  }

  function initProduksiAppLogic() {
    bindTabs();
    // Initial render via shared pagination controller
    pagination.refresh();
    renderHistory();
  }

  document.addEventListener("laku-tour-start", (event) => {
    if (event.detail?.moduleKey !== "produksi") return;
    tourDemoMode = true;
    tourDemoHistoryVisible = false;
    pagination.refresh();
    renderHistory();
  });

  document.addEventListener("laku-tour-finish", (event) => {
    if (event.detail?.moduleKey !== "produksi") return;
    tourDemoMode = false;
    tourDemoHistoryVisible = false;
    pagination.refresh();
    renderHistory();
  });

  window.LakuProduksi = { produce, renderRecipes: () => pagination.refresh(), renderHistory, initProduksiAppLogic };

  window.renderProduksiApp = function (container) {
    if (!container) return;
    container.innerHTML = getProduksiAppUI();
    initProduksiAppLogic();
  };
})();
