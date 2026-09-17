/**
 * hppIngredients.js — Ingredient management for HPP Kalkulator
 * Handles populating the inventory dropdown, rendering ingredient cards,
 * and adding ingredients from stock with unit conversion.
 * Supports nested packaging levels (e.g., pack → bungkus → pcs).
 *
 * All functions attach to window.LakuHpp namespace.
 * Uses window.formatRupiah() from appUtils.js (no local formatRupiah).
 * Removed: addManualIngredient() (cepat mode deleted).
 */

/** Helper: get cumulative isi from nestedLevels */
function getCumulativeIsi(item) {
  if (!item.nestedLevels || item.nestedLevels.length === 0) return 1;
  return item.nestedLevels.reduce((prod, level) => prod * (level.isi || 1), 1);
}

/** Helper: get innermost unit from nestedLevels */
function getInnermostUnit(item) {
  if (!item.nestedLevels || item.nestedLevels.length === 0) return item.displayUnit || item.satuan || "pcs";
  const last = item.nestedLevels[item.nestedLevels.length - 1];
  return last.unit;
}

/** Helper: get innermost unit label */
function getInnermostUnitLabel(item) {
  const unit = getInnermostUnit(item);
  return window.LakuUnits.formatUnitLabel(unit);
}

/** Populate inventory dropdown, toggle empty state, update unit selector */
window.LakuHpp.refreshIngredientUI = function () {
  const emptyState = document.getElementById("hppInventoryEmpty");
  const addArea = document.getElementById("hppAddIngredientArea");
  const step2Desc = document.getElementById("hppStep2Desc");
  const select = document.getElementById("hppInventorySelect");
  const unitLabel = document.getElementById("hppJumlahPakaiUnitLabel");

  // Always show inventory mode UI (cepat mode removed)
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
      const usedIds = window.LakuHpp.ingredients
        .map((ing) => ing.inventoryId)
        .filter(Boolean);
      select.innerHTML = '<option value="">— Pilih bahan dari stok —</option>';
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
          // Show nesting info in dropdown if present
          let nestedText = "";
          if (item.nestedLevels && item.nestedLevels.length > 0) {
            const innermostLabel = getInnermostUnitLabel(item);
            const cumulativeIsi = getCumulativeIsi(item);
            nestedText = ` (1 ${displayUnit} = ${cumulativeIsi} ${innermostLabel})`;
          }
          select.innerHTML += `<option value="${item.id}">${item.nama} — ${window.formatRupiah(item.harga)}/${displayUnit} (Stok: ${stokDisplay} ${displayUnit})${nestedText}</option>`;
        }
      });

      // Populate compatible unit selector when selection changes
      const updateUnitSelector = () => {
        const selId = parseInt(select.value);
        const unitSel = document.getElementById("hppJumlahPakaiUnit");
        if (!unitSel) return;

        if (!selId) {
          unitSel.innerHTML = '<option value="">—</option>';
          unitSel.disabled = true;
          if (unitLabel) unitLabel.textContent = "Satuan";
          return;
        }
        const selItem = bahanInv.find((it) => it.id === selId);
        if (!selItem) {
          unitSel.innerHTML = '<option value="">—</option>';
          unitSel.disabled = true;
          if (unitLabel) unitLabel.textContent = "Satuan";
          return;
        }

        // Check if item has nested levels
        if (selItem.nestedLevels && selItem.nestedLevels.length > 0) {
          // For nested items, only allow innermost unit
          const innermostUnit = getInnermostUnit(selItem);
          const innermostLabel = getInnermostUnitLabel(selItem);
          unitSel.innerHTML = `<option value="${innermostUnit}" selected>${innermostLabel}</option>`;
          unitSel.disabled = true; // User can't change unit for nested items
          if (unitLabel) unitLabel.textContent = `Jumlah ${innermostLabel}`;
        } else {
          // Normal item: show compatible units
          const displayUnit = selItem.displayUnit || selItem.satuan || "pcs";
          const compatible = window.LakuUnits.getCompatibleUnits(displayUnit);
          unitSel.disabled = false;
          unitSel.innerHTML = compatible
            .map(
              (u) =>
                `<option value="${u}" ${u === displayUnit ? "selected" : ""}>${window.LakuUnits.formatUnitLabel(u)}</option>`
            )
            .join("");
          if (unitLabel) unitLabel.textContent = "Satuan";
        }
      };

      // Remove old handler before adding new one
      select.removeEventListener("change", select._satuanHandler);
      select._satuanHandler = updateUnitSelector;
      select.addEventListener("change", updateUnitSelector);
      updateUnitSelector();
    }
  }

  // Also update onboarding visibility based on inventory
  toggleOnboardingVisibility();

  // Render the ingredient cards
  window.LakuHpp.renderIngredients();
};

/** Render ingredient cards with remove handlers */
window.LakuHpp.renderIngredients = function () {
  const list = document.getElementById("hppIngredientList");
  const subtotal = document.getElementById("hppSubtotalBahan");
  const subtotalValue = document.getElementById("hppSubtotalBahanValue");

  if (!list) return;

  if (window.LakuHpp.ingredients.length === 0) {
    list.innerHTML = `
      <div class="text-center py-8 text-gray-400 text-sm bg-stone-50 rounded-2xl">
        Belum ada bahan dipilih. Tambahkan bahan di atas ya!
      </div>
    `;
    if (subtotal) subtotal.classList.add("hidden");
  } else {
    let totalBahan = 0;
    list.innerHTML = window.LakuHpp.ingredients
      .map((ing) => {
        const biaya = ing.jumlahPakai * ing.hargaBeli;
        totalBahan += biaya;
        return `
          <div class="flex items-center justify-between bg-stone-50 p-4 rounded-2xl border border-gray-100">
            <div class="flex-1 min-w-0">
              <div class="font-bold text-gray-800 text-sm truncate">${ing.nama}</div>
              <div class="text-xs text-gray-400 mt-0.5">
                ${ing.jumlahPakai} ${ing.satuan || "unit"} × ${window.formatRupiah(ing.hargaBeli)}/${ing.satuan || "unit"} = <span class="font-semibold text-gray-600">${window.formatRupiah(biaya)}</span>
              </div>
            </div>
            <button data-remove-ing="${ing.id}" class="text-rose-400 hover:text-rose-600 font-bold text-sm ml-3 cursor-pointer shrink-0 transition-colors" title="Hapus bahan">
              ${window.LakuIcons.svg("closeCircle", "0.85em")}
            </button>
          </div>
        `;
      })
      .join("");

    if (subtotal) subtotal.classList.remove("hidden");
    if (subtotalValue) subtotalValue.textContent = window.formatRupiah(totalBahan);
  }

  // Bind remove buttons
  list.querySelectorAll("[data-remove-ing]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = parseInt(btn.getAttribute("data-remove-ing"));
      window.LakuHpp.ingredients = window.LakuHpp.ingredients.filter((i) => i.id !== id);
      window.LakuHpp.refreshIngredientUI();
    });
  });
};

/** Add ingredient from stock inventory with unit conversion */
window.LakuHpp.addIngredientFromInventory = function () {
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

  // Check if item has nested levels
  if (item.nestedLevels && item.nestedLevels.length > 0) {
    // Nested item: price is per outermost unit, calculate per innermost unit
    const cumulativeIsi = getCumulativeIsi(item);
    const innermostUnit = getInnermostUnit(item);
    const innermostLabel = getInnermostUnitLabel(item);

    // User inputs quantity in innermost unit
    const qtyDisplay = window.LakuUnits.round2(jumlah);
    const hargaBeli = window.LakuUnits.round2(item.harga / cumulativeIsi);

    // For nested items, stok is stored in innermost units (total innermost available)
    // User inputs in innermost unit, so direct comparison
    if (qtyDisplay > item.stok) {
      window.showAlert({
        type: "error",
        title: "Stok Tidak Cukup",
        message: `${item.nama} tersedia: ${item.stok} ${innermostLabel} — Kamu butuh: ${qtyDisplay} ${innermostLabel}`,
      });
      return;
    }

    // For stock deduction later: qty in innermost units = qtyDisplay
    const qtyBase = qtyDisplay;

    window.LakuHpp.ingredients.push({
      id: nextUid(),
      inventoryId: item.id,
      nama: item.nama,
      hargaBeli, // per innermost unit
      jumlahPakai: qtyDisplay, // dalam innermost unit
      satuan: innermostUnit,
      nestedLevels: item.nestedLevels, // save for recipe storage
      // Internal data for stock deduct & conversion during edit:
      _qtyBase: qtyBase,
      _baseUnit: innermostUnit,
      _inputQty: jumlah,
      _inputUnit: inputUnit,
    });
  } else {
    // Normal item (no nesting)
    const displayUnit = item.displayUnit || item.satuan || "pcs";
    const baseUnit = item.baseUnit || window.LakuUnits.getBaseUnit(displayUnit) || displayUnit;

    // 1. Convert user input → baseUnit (for stock check & deduct)
    const qtyBase =
      inputUnit === baseUnit
        ? window.LakuUnits.round2(jumlah)
        : window.LakuUnits.convertUnit(jumlah, inputUnit, baseUnit);

    // 2. Convert user input → displayUnit (for price calculation per displayUnit)
    const qtyDisplay =
      inputUnit === displayUnit
        ? window.LakuUnits.round2(jumlah)
        : window.LakuUnits.convertUnit(jumlah, inputUnit, displayUnit);

    // 3. Validate: unit must be compatible
    if (qtyBase === null || qtyDisplay === null) {
      window.showAlert({
        type: "error",
        title: "Satuan Tidak Cocok",
        message: `Satuan "${inputUnit}" tidak kompatibel dengan satuan stok "${displayUnit}".`,
      });
      return;
    }

    // 4. Validate stock sufficient (compare base vs base)
    if (qtyBase > item.stok) {
      const stokDisplay =
        baseUnit === displayUnit
          ? window.LakuUnits.round2(item.stok)
          : window.LakuUnits.convertUnit(item.stok, baseUnit, displayUnit);
      window.showAlert({
        type: "error",
        title: "Stok Tidak Cukup",
        message: `${item.nama} tersedia: ${stokDisplay} ${displayUnit} — Kamu butuh: ${qtyDisplay} ${displayUnit}`,
      });
      return;
    }

    window.LakuHpp.ingredients.push({
      id: nextUid(),
      inventoryId: item.id,
      nama: item.nama,
      hargaBeli: item.harga, // per displayUnit
      jumlahPakai: qtyDisplay, // dalam displayUnit (match with price)
      satuan: displayUnit,
      // Internal data for stock deduct & conversion during edit:
      _qtyBase: qtyBase,
      _baseUnit: baseUnit,
      _inputQty: jumlah,
      _inputUnit: inputUnit,
    });
  }

  select.value = "";
  jumlahInput.value = "";
  window.LakuHpp.refreshIngredientUI();
};