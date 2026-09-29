function getCumulativeIsi(item) {
  if (!item.nestedLevels || item.nestedLevels.length === 0) return 1;
  return item.nestedLevels.reduce((prod, level) => prod * (level.isi || 1), 1);
}

function getInnermostUnit(item) {
  if (!item.nestedLevels || item.nestedLevels.length === 0) return item.displayUnit || item.satuan || "pcs";
  const last = item.nestedLevels[item.nestedLevels.length - 1];
  return last.unit;
}
function getInnermostUnitLabel(item) {
  const unit = getInnermostUnit(item);
  return window.LakuUnits.formatUnitLabel(unit);
}

function getWorkingStock(item) {
  const displayUnit = item.displayUnit || item.satuan || "pcs";
  const converted = window.LakuUnits.toWorkingQuantity(item, item.stok || 0, displayUnit);
  return (converted.value || 0) + Number(item.looseQty || 0);
}

function getInputUnitPrice(item, inputUnit) {
  const displayUnit = item.displayUnit || item.satuan || "pcs";
  const oneInputInDisplay = item.nestedLevels?.length
    ? window.LakuUnits.convertNested(1, inputUnit, displayUnit, item)
    : window.LakuUnits.convertUnitExact(1, inputUnit, displayUnit);
  return oneInputInDisplay === null || !Number.isFinite(oneInputInDisplay)
    ? null
    : item.harga * oneInputInDisplay;
}

function getCompatibleUnitsForItem(item) {
  if (!item) return [];
  const displayUnit = item.displayUnit || item.satuan || "pcs";
  if (item.nestedLevels && item.nestedLevels.length > 0) {
    return Object.keys(window.LakuUnits.getNestedUnitMap(item));
  }
  return window.LakuUnits.getCompatibleUnits(displayUnit);
}

window.LakuHpp.refreshIngredientUI = function () {
  const emptyState = document.getElementById("hppInventoryEmpty");
  const addArea = document.getElementById("hppAddIngredientArea");
  const step2Desc = document.getElementById("hppStep2Desc");
  const select = document.getElementById("hppInventorySelect");
  const unitLabel = document.getElementById("hppJumlahPakaiUnitLabel");

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

    if (select) {
      const usedIds = window.LakuHpp.ingredients
        .map((ing) => ing.inventoryId)
        .filter(Boolean);
      const editingId = window.LakuHpp.editingIngredientId;
      const editingInventoryId = editingId
        ? window.LakuHpp.ingredients.find((i) => window.LakuHpp.idsEqual(i.id, editingId))?.inventoryId
        : null;
      if (editingInventoryId) {
        const idx = usedIds.indexOf(editingInventoryId);
        if (idx !== -1) usedIds.splice(idx, 1);
      }
      select.innerHTML = '<option value="">— Pilih bahan dari stok —</option>';
      bahanInv.forEach((item) => {
        if (!usedIds.includes(item.id)) {
          const displayUnit = item.displayUnit || item.satuan || "pcs";
          const stokDisplay = item.nestedLevels?.length
            ? window.LakuUnits.formatInventoryQuantity(item, getWorkingStock(item))
            : `${window.LakuUnits.round2(item.stok || 0)} ${window.LakuUnits.formatUnitLabel(displayUnit)}`;
          let nestedText = "";
          if (item.nestedLevels && item.nestedLevels.length > 0) {
            const relationText = item.nestedLevels.reduce((parts, level, index) => {
              const parentUnit = index === 0 ? displayUnit : item.nestedLevels[index - 1].unit;
              parts.push(`1 ${parentUnit} = ${level.isi} ${level.unit}`);
              return parts;
            }, []).join(" → ");
            nestedText = ` (${relationText})`;
          }
          select.innerHTML += `<option value="${item.id}">${window.LakuHpp.escapeHtml(item.nama)} — ${window.formatRupiah(item.harga)}/${displayUnit} (Stok: ${stokDisplay} ${displayUnit})${nestedText}</option>`;
        }
      });

      const updateUnitSelector = () => {
        const selId = select.value;
        const unitSel = document.getElementById("hppJumlahPakaiUnit");
        const unitHelper = document.getElementById("hppUnitHelper");
        if (!unitSel) return;

        if (!selId) {
          unitSel.innerHTML = '<option value="">—</option>';
          unitSel.disabled = true;
          if (unitLabel) unitLabel.textContent = "Satuan";
          if (unitHelper) unitHelper.textContent = "";
          return;
        }
        const selItem = bahanInv.find((it) => String(it.id) === String(selId));
        if (!selItem) {
          unitSel.innerHTML = '<option value="">—</option>';
          unitSel.disabled = true;
          if (unitLabel) unitLabel.textContent = "Satuan";
          if (unitHelper) unitHelper.textContent = "";
          return;
        }

        if (selItem.nestedLevels && selItem.nestedLevels.length > 0) {
          const nestedUnits = Object.keys(window.LakuUnits.getNestedUnitMap(selItem));
          const defaultUnit = selItem.displayUnit || selItem.satuan || nestedUnits[0];
          let optionsHtml = '';
          nestedUnits.forEach((unit) => {
            const selectedAttr = unit === defaultUnit ? ' selected' : '';
            optionsHtml += `<option value="${unit}"${selectedAttr}>${window.LakuUnits.formatUnitLabel(unit)}</option>`;
          });
          unitSel.innerHTML = optionsHtml;
          unitSel.disabled = false;
          if (unitLabel) unitLabel.textContent = "Satuan yang dipakai";
          if (unitHelper) {
            const relationText = selItem.nestedLevels.reduce((parts, level, index) => {
              const parentUnit = index === 0 ? (selItem.displayUnit || selItem.satuan) : selItem.nestedLevels[index - 1].unit;
              parts.push(`1 ${parentUnit} = ${level.isi} ${level.unit}`);
              return parts;
            }, []).join(" → ");
            unitHelper.innerHTML = `${window.LakuIcons.svg("info", "0.9em")} Hubungan satuan: ${relationText}. Pilih satuan sesuai cara pemakaian (contoh: jika memakai butir, pilih "butir").`;
          }
        } else {
          const displayUnit = selItem.displayUnit || selItem.satuan || "pcs";
          const compatible = window.LakuUnits.getCompatibleUnits(displayUnit);
          let optionsHtml = '';
          compatible.forEach((u) => {
            const selectedAttr = u === displayUnit ? ' selected' : '';
            optionsHtml += `<option value="${u}"${selectedAttr}>${window.LakuUnits.formatUnitLabel(u)}</option>`;
          });
          unitSel.innerHTML = optionsHtml;
          unitSel.disabled = false;
          if (unitLabel) unitLabel.textContent = "Satuan";
          if (unitHelper) {
            unitHelper.innerHTML = `${window.LakuIcons.svg("info", "0.9em")} Pilih satuan sesuai cara pemakaian. Akan dikonversi ke satuan stok (${window.LakuUnits.formatUnitLabel(displayUnit)}).`;
          }
        }
      };
      select.removeEventListener("change", select._satuanHandler);
      select._satuanHandler = updateUnitSelector;
      select.addEventListener("change", updateUnitSelector);
      updateUnitSelector();
    }
  }

  toggleOnboardingVisibility();
  window.LakuHpp.renderIngredients();
};

window.LakuHpp.renderIngredients = function () {
  const list = document.getElementById("hppIngredientList");
  const subtotal = document.getElementById("hppSubtotalBahan");
  const subtotalValue = document.getElementById("hppSubtotalBahanValue");

  if (!list) return;

  const inv = loadInventory();

  if (window.LakuHpp.ingredients.length === 0) {
    list.innerHTML = `
      <div class="text-center py-8 text-gray-400 text-sm bg-stone-50 rounded-2xl">
        Belum ada bahan dipilih. Tambahkan bahan di atas ya!
      </div>
    `;
    if (subtotal) subtotal.classList.add("hidden");
    if (list._ingredientClickHandler) {
      list.removeEventListener("click", list._ingredientClickHandler);
      list._ingredientClickHandler = null;
    }
    if (list._ingredientInputHandler) {
      list.removeEventListener("input", list._ingredientInputHandler);
      list.removeEventListener("change", list._ingredientInputHandler);
      list._ingredientInputHandler = null;
    }
    return;
  }

  let totalBahan = 0;
  list.innerHTML = window.LakuHpp.ingredients
    .map((ing) => {
      const biaya = ing.jumlahPakai * ing.hargaBeli;
      totalBahan += biaya;
      const shownQty = ing._inputQty ?? ing.jumlahPakai;
      const shownUnit = ing._inputUnit || ing.satuan || "unit";
      const shownPrice = ing._inputUnitPrice ?? ing.hargaBeli;
      const inventoryItem = inv.find((i) => String(i.id) === String(ing.inventoryId));
      const isMissing = !inventoryItem;
      const isEditing = window.LakuHpp.editingIngredientId && window.LakuHpp.idsEqual(window.LakuHpp.editingIngredientId, ing.id);
      const draft = window.LakuHpp.editingIngredientDraft || {};

      let warningHtml = "";
      if (isMissing) {
        warningHtml = `<div class="text-xs text-rose-500 mt-0.5">${window.LakuIcons.svg("alertTriangle", "0.85em")} Bahan ini sudah dihapus dari stok. Data snapshot tetap dipakai. Edit untuk mengganti atau hapus.</div>`;
      }

      if (isEditing) {
        const compatibleUnits = inventoryItem
          ? getCompatibleUnitsForItem(inventoryItem)
          : [];
        const unitOptions = compatibleUnits
          .map((u) => `<option value="${u}" ${draft.satuan === u ? "selected" : ""}>${window.LakuUnits.formatUnitLabel(u)}</option>`)
          .join("");
        return `
          <div class="flex flex-col gap-3 bg-stone-50 p-4 rounded-2xl border ${isMissing ? "border-rose-200" : "border-blue-200"}" data-ingredient-id="${ing.id}">
            <div class="flex items-center justify-between">
              <div class="flex-1 min-w-0">
                <div class="font-bold text-gray-800 text-sm truncate">${window.LakuHpp.escapeHtml(ing.nama)}</div>
                <div class="text-xs text-gray-400 mt-0.5">Mode edit: ubah jumlah dan satuan</div>
                ${warningHtml}
              </div>
            </div>
            <div class="flex flex-col sm:flex-row gap-2 items-stretch">
              <input type="number" data-edit-qty="${ing.id}" step="0.01" min="0.01" value="${draft.jumlahPakai ?? shownQty}" class="flex-1 bg-white text-black-main font-medium py-2.5 px-3 rounded-xl outline-none border border-gray-200 focus:border-blue-500 text-sm" placeholder="Jumlah" />
              <select data-edit-unit="${ing.id}" class="w-28 bg-white text-black-main font-medium py-2.5 px-2 rounded-xl outline-none border border-gray-200 focus:border-blue-500 text-sm cursor-pointer">
                <option value="">— Pilih satuan —</option>
                ${unitOptions}
              </select>
            </div>
            <div class="flex items-center justify-end gap-2 pt-1">
              <button data-cancel-edit-ing="${ing.id}" class="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2 px-3 rounded-xl transition-colors text-sm cursor-pointer">
                ${window.LakuIcons.svg("close", "0.85em")} Batal
              </button>
              <button data-save-edit-ing="${ing.id}" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-xl transition-colors shadow-sm text-sm cursor-pointer">
                ${window.LakuIcons.svg("save", "0.85em")} Simpan
              </button>
              ${isMissing ? `<button data-replace-ing="${ing.id}" class="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-3 rounded-xl transition-colors shadow-sm text-sm cursor-pointer">${window.LakuIcons.svg("refreshCw", "0.85em")} Ganti Bahan</button>` : ""}
            </div>
          </div>
        `;
      }

      return `
        <div class="flex items-center justify-between bg-stone-50 p-4 rounded-2xl border ${isMissing ? "border-rose-200" : "border-gray-100"}" data-ingredient-id="${ing.id}">
          <div class="flex-1 min-w-0">
            <div class="font-bold text-gray-800 text-sm truncate">${window.LakuHpp.escapeHtml(ing.nama)}</div>
            <div class="text-xs text-gray-400 mt-0.5">
              ${shownQty} ${shownUnit} × ${window.formatRupiah(shownPrice)}/${shownUnit} = <span class="font-semibold text-gray-600">${window.formatRupiah(biaya)}</span>
            </div>
            ${warningHtml}
          </div>
          <div class="flex items-center gap-2 ml-3 shrink-0">
            <button data-edit-ing="${ing.id}" class="text-blue-500 hover:text-blue-700 font-bold text-sm cursor-pointer transition-colors" title="Edit bahan">
              ${window.LakuIcons.svg("pencil", "0.85em")}
            </button>
            <button data-remove-ing="${ing.id}" class="text-rose-400 hover:text-rose-600 font-bold text-sm cursor-pointer transition-colors" title="Hapus bahan">
              ${window.LakuIcons.svg("closeCircle", "0.85em")}
            </button>
          </div>
        </div>
      `;
    })
    .join("");

  if (subtotal) subtotal.classList.remove("hidden");
  if (subtotalValue) subtotalValue.textContent = window.formatRupiah(totalBahan);
  if (list._ingredientClickHandler) {
    list.removeEventListener("click", list._ingredientClickHandler);
  }
  if (list._ingredientInputHandler) {
    list.removeEventListener("input", list._ingredientInputHandler);
    list.removeEventListener("change", list._ingredientInputHandler);
  }
  list._ingredientClickHandler = (e) => {
    const target = e.target.closest("button");
    if (!target) return;

    const ingredientEl = target.closest("[data-ingredient-id]");
    const ingredientId = ingredientEl?.getAttribute("data-ingredient-id");
    if (!ingredientId) return;

    if (target.hasAttribute("data-remove-ing")) {
      handleRemoveIngredient(ingredientId);
    } else if (target.hasAttribute("data-edit-ing")) {
      window.LakuHpp.startEditIngredient(ingredientId);
    } else if (target.hasAttribute("data-save-edit-ing")) {
      window.LakuHpp.saveInlineEditIngredient(ingredientId);
    } else if (target.hasAttribute("data-cancel-edit-ing")) {
      window.LakuHpp.cancelInlineEditIngredient(ingredientId);
    } else if (target.hasAttribute("data-replace-ing")) {
      window.LakuHpp.replaceIngredient(ingredientId);
    }
  };
  list.addEventListener("click", list._ingredientClickHandler);
  list._ingredientInputHandler = (e) => {
    const target = e.target;
    const ingredientEl = target.closest("[data-ingredient-id]");
    const ingredientId = ingredientEl?.getAttribute("data-ingredient-id");
    if (!ingredientId || window.LakuHpp.editingIngredientId !== ingredientId) return;

    if (target.hasAttribute("data-edit-qty")) {
      const value = parseFloat(target.value);
      if (Number.isFinite(value)) {
        window.LakuHpp.updateIngredientEditDraft(ingredientId, { jumlahPakai: value });
      }
    } else if (target.hasAttribute("data-edit-unit")) {
      window.LakuHpp.updateIngredientEditDraft(ingredientId, { satuan: target.value });
    }
  };
  list.addEventListener("input", list._ingredientInputHandler);
  list.addEventListener("change", list._ingredientInputHandler);
};

async function handleRemoveIngredient(id) {
  const ingredient = window.LakuHpp.ingredients.find((i) => window.LakuHpp.idsEqual(i.id, id));
  if (!ingredient) return;
  const ok = await window.showCustomConfirm({
    title: "Hapus Bahan?",
    message: `Yakin ingin menghapus "${ingredient.nama}" dari daftar?`,
  });
  if (ok) {
    window.LakuHpp.ingredients = window.LakuHpp.ingredients.filter((i) => !window.LakuHpp.idsEqual(i.id, id));
    window.LakuHpp.refreshIngredientUI();
    window.LakuHpp.saveSession();
  }
}

function getCompatibleUnitsForItem(item) {
  if (!item) return [];
  const displayUnit = item.displayUnit || item.satuan || "pcs";
  if (item.nestedLevels && item.nestedLevels.length > 0) {
    return Object.keys(window.LakuUnits.getNestedUnitMap(item));
  }
  return window.LakuUnits.getCompatibleUnits(displayUnit);
}

window.LakuHpp.startEditIngredient = function (id, draft) {
  if (window.LakuHpp.editingIngredientId && !window.LakuHpp.idsEqual(window.LakuHpp.editingIngredientId, id)) {
    const currentDraft = window.LakuHpp.editingIngredientDraft;
    if (currentDraft && (currentDraft.jumlahPakai || currentDraft.satuan)) {
      const saved = window.LakuHpp.saveInlineEditIngredient(window.LakuHpp.editingIngredientId);
      if (!saved) {
        window.showAlert({
          type: "warning",
          title: "Simpan Dulu",
          message: "Perbaiki data bahan yang sedang diedit sebelum berpindah.",
        });
        return;
      }
    } else {
      window.LakuHpp.cancelInlineEditIngredient(window.LakuHpp.editingIngredientId);
    }
  }

  const ingredient = window.LakuHpp.ingredients.find((i) => window.LakuHpp.idsEqual(i.id, id));
  if (!ingredient) return;

  const inventoryItem = loadInventory().find((i) => String(i.id) === String(ingredient.inventoryId));
  const isMissing = !inventoryItem;
  const initialDraft = draft || {
    jumlahPakai: ingredient._inputQty ?? ingredient.jumlahPakai,
    satuan: ingredient._inputUnit || ingredient.satuan || "",
  };

  window.LakuHpp.editingIngredientId = id;
  window.LakuHpp.editingIngredientDraft = initialDraft;
  window.LakuHpp.saveSession();
  window.LakuHpp.renderIngredients();
};

window.LakuHpp.replaceIngredient = function (ingredientId) {
  const ingredient = window.LakuHpp.ingredients.find((i) => window.LakuHpp.idsEqual(i.id, ingredientId));
  if (!ingredient) return;

  const select = document.getElementById("hppInventorySelect");
  const jumlahInput = document.getElementById("hppJumlahPakai");
  const unitSel = document.getElementById("hppJumlahPakaiUnit");
  if (!select || !jumlahInput || !unitSel) return;

  select.scrollIntoView({ behavior: "smooth", block: "center" });
  select.focus();

  window.LakuHpp._replacingIngredientId = ingredientId;
};

window.LakuHpp.updateIngredientEditDraft = function (id, updates) {
  if (!window.LakuHpp.idsEqual(window.LakuHpp.editingIngredientId, id)) return;
  window.LakuHpp.editingIngredientDraft = {
    ...window.LakuHpp.editingIngredientDraft,
    ...updates,
  };
  window.LakuHpp.saveSession();
};

window.LakuHpp.saveInlineEditIngredient = function (id) {
  const ingredient = window.LakuHpp.ingredients.find((i) => window.LakuHpp.idsEqual(i.id, id));
  if (!ingredient) return false;

  const draft = window.LakuHpp.editingIngredientDraft;
  if (!draft) return false;

  const jumlah = draft.jumlahPakai;
  const inputUnit = draft.satuan;

  const qtyValidation = window.LakuHpp.validatePositiveFinite(jumlah, "Jumlah pakai");
  if (!qtyValidation.valid || !inputUnit) {
    window.showAlert({
      type: "error",
      title: "Data Tidak Lengkap",
      message: "Isi jumlah dan pilih satuan terlebih dahulu.",
    });
    return false;
  }

  const inv = loadInventory();
  const item = inv.find((i) => String(i.id) === String(ingredient.inventoryId));
  if (!item) {
    window.showAlert({
      type: "error",
      title: "Bahan Tidak Ditemukan",
      message: "Bahan ini sudah tidak ada di stok. Gunakan tombol 'Ganti Bahan' untuk memilih bahan lain.",
    });
    return false;
  }

  const displayUnit = item.displayUnit || item.satuan || "pcs";
  const isNested = item.nestedLevels && item.nestedLevels.length > 0;
  const qtyWorking = isNested
    ? window.LakuUnits.toWorkingQuantity(item, jumlah, inputUnit).value
    : window.LakuUnits.convertUnitExact(jumlah, inputUnit, displayUnit);
  const qtyDisplay = isNested
    ? window.LakuUnits.convertNested(jumlah, inputUnit, displayUnit, item)
    : qtyWorking;
  const hargaBeli = item.harga;
  const inputUnitPrice = getInputUnitPrice(item, inputUnit);

  if (qtyWorking === null || qtyDisplay === null || !Number.isFinite(qtyWorking) || !Number.isFinite(qtyDisplay)) {
    window.showAlert({
      type: "error",
      title: "Satuan Tidak Cocok",
      message: `Satuan "${inputUnit}" tidak kompatibel dengan stok "${displayUnit}".`,
    });
    return false;
  }

  if (qtyWorking > getWorkingStock(item)) {
    const availableText = isNested
      ? window.LakuUnits.formatInventoryQuantity(item, getWorkingStock(item))
      : `${window.LakuUnits.round2(item.stok || 0)} ${window.LakuUnits.formatUnitLabel(displayUnit)}`;
    const neededText = `${window.LakuUnits.round2(jumlah)} ${window.LakuUnits.formatUnitLabel(inputUnit)}`;
    window.showAlert({
      type: "error",
      title: "Stok Tidak Cukup",
      message: `${item.nama} tersedia: ${availableText} — Kamu butuh: ${neededText}`,
    });
    return false;
  }

  const idx = window.LakuHpp.ingredients.findIndex((i) => window.LakuHpp.idsEqual(i.id, id));
  if (idx === -1) return false;

  window.LakuHpp.ingredients[idx] = {
    id: id,
    inventoryId: item.id,
    nama: item.nama,
    hargaBeli,
    jumlahPakai: qtyDisplay,
    satuan: displayUnit,
    nestedLevels: isNested ? item.nestedLevels : undefined,
    _qtyWorking: qtyWorking,
    _workingUnit: isNested ? getInnermostUnit(item) : displayUnit,
    _inputQty: jumlah,
    _inputUnit: inputUnit,
    _inputUnitPrice: inputUnitPrice,
  };

  window.LakuHpp.editingIngredientId = null;
  window.LakuHpp.editingIngredientDraft = null;
  window.LakuHpp.refreshIngredientUI();
  window.LakuHpp.saveSession();
  return true;
};

window.LakuHpp.cancelInlineEditIngredient = function (id) {
  if (!window.LakuHpp.idsEqual(window.LakuHpp.editingIngredientId, id)) return;
  window.LakuHpp.editingIngredientId = null;
  window.LakuHpp.editingIngredientDraft = null;
  window.LakuHpp.saveSession();
  window.LakuHpp.renderIngredients();
};

window.LakuHpp.saveEditedIngredient = function () {
  const select = document.getElementById("hppInventorySelect");
  const jumlahInput = document.getElementById("hppJumlahPakai");
  const unitSel = document.getElementById("hppJumlahPakaiUnit");
  if (!select || !jumlahInput || !unitSel) return;

  const id = window.LakuHpp.editingIngredientId;
  if (!id) return;

  const invId = select.value;
  const jumlah = parseFloat(jumlahInput.value);
  const inputUnit = unitSel.value;

  if (!invId || !Number.isFinite(jumlah) || jumlah <= 0 || !inputUnit) return;

  const inv = loadInventory();
  const item = inv.find((i) => String(i.id) === String(invId));
  if (!item) return;

  const displayUnit = item.displayUnit || item.satuan || "pcs";
  const isNested = item.nestedLevels && item.nestedLevels.length > 0;
  const qtyWorking = isNested
    ? window.LakuUnits.toWorkingQuantity(item, jumlah, inputUnit).value
    : window.LakuUnits.convertUnitExact(jumlah, inputUnit, displayUnit);
  const qtyDisplay = isNested
    ? window.LakuUnits.convertNested(jumlah, inputUnit, displayUnit, item)
    : qtyWorking;
  const hargaBeli = item.harga;
  const inputUnitPrice = getInputUnitPrice(item, inputUnit);

  if (qtyWorking === null || qtyDisplay === null || !Number.isFinite(qtyWorking) || !Number.isFinite(qtyDisplay)) {
    window.showAlert({
      type: "error",
      title: "Satuan Tidak Cocok",
      message: `Satuan "${inputUnit}" tidak kompatibel dengan stok "${displayUnit}".`,
    });
    return;
  }

  if (qtyWorking > getWorkingStock(item)) {
    const availableText = isNested
      ? window.LakuUnits.formatInventoryQuantity(item, getWorkingStock(item))
      : `${window.LakuUnits.round2(item.stok || 0)} ${window.LakuUnits.formatUnitLabel(displayUnit)}`;
    const neededText = `${window.LakuUnits.round2(jumlah)} ${window.LakuUnits.formatUnitLabel(inputUnit)}`;
    window.showAlert({
      type: "error",
      title: "Stok Tidak Cukup",
      message: `${item.nama} tersedia: ${availableText} — Kamu butuh: ${neededText}`,
    });
    return;
  }

  const idx = window.LakuHpp.ingredients.findIndex((i) => window.LakuHpp.idsEqual(i.id, id));
  if (idx === -1) return;

  window.LakuHpp.ingredients[idx] = {
    id: id,
    inventoryId: item.id,
    nama: item.nama,
    hargaBeli,
    jumlahPakai: qtyDisplay,
    satuan: displayUnit,
    nestedLevels: isNested ? item.nestedLevels : undefined,
    _qtyWorking: qtyWorking,
    _workingUnit: isNested ? getInnermostUnit(item) : displayUnit,
    _inputQty: jumlah,
    _inputUnit: inputUnit,
    _inputUnitPrice: inputUnitPrice,
  };

  window.LakuHpp.cancelEditIngredient();
  window.LakuHpp.refreshIngredientUI();
  window.LakuHpp.saveSession();
};

window.LakuHpp.cancelEditIngredient = function () {
  const select = document.getElementById("hppInventorySelect");
  const jumlahInput = document.getElementById("hppJumlahPakai");
  const unitSel = document.getElementById("hppJumlahPakaiUnit");
  const addBtn = document.getElementById("hppAddIngredientBtn");
  const cancelBtn = document.getElementById("hppCancelEditBtn");

  if (select) select.value = "";
  if (jumlahInput) jumlahInput.value = "";
  if (unitSel) {
    unitSel.innerHTML = '<option value="">—</option>';
    unitSel.disabled = true;
  }
  if (addBtn) {
    addBtn.innerHTML = "+ Tambah";
    addBtn.classList.add("bg-[#274c43]", "hover:bg-[#1f3d36]");
    addBtn.classList.remove("bg-emerald-600", "hover:bg-emerald-700");
  }
  if (cancelBtn) cancelBtn.remove();

  window.LakuHpp.editingIngredientId = null;
  window.LakuHpp.editingIngredientDraft = null;
  window.LakuHpp.refreshIngredientUI();
};

window.LakuHpp.addIngredientFromInventory = function () {
  if (window.LakuHpp._addingIngredient) return;
  window.LakuHpp._addingIngredient = true;

  try {
    if (window.LakuHpp.editingIngredientId) {
      const saved = window.LakuHpp.saveEditedIngredient();
      if (saved === false) return; // Validation edit mode
    }

    const select = document.getElementById("hppInventorySelect");
    const jumlahInput = document.getElementById("hppJumlahPakai");
    const unitSel = document.getElementById("hppJumlahPakaiUnit");
    if (!select || !jumlahInput || !unitSel) return;

    const invId = select.value;
    const jumlah = parseFloat(jumlahInput.value);
    const inputUnit = unitSel.value; // satuan yang dipilih user

    if (!invId) {
      window.showAlert({
        type: "warning",
        title: "Belum Lengkap",
        message: "Pilih bahan dari stok terlebih dahulu.",
      });
      return;
    }

    if (!Number.isFinite(jumlah) || jumlah <= 0) {
      window.showAlert({
        type: "warning",
        title: "Belum Lengkap",
        message: "Isi jumlah pakai bahan terlebih dahulu (harus berupa angka lebih dari 0).",
      });
      return;
    }

    if (!inputUnit) {
      window.showAlert({
        type: "warning",
        title: "Belum Lengkap",
        message: "Pilih satuan pemakaian bahan.",
      });
      return;
    }

    const inv = loadInventory();
    const item = inv.find((i) => String(i.id) === String(invId));
    if (!item) return;

    const displayUnit = item.displayUnit || item.satuan || "pcs";
    const isNested = item.nestedLevels && item.nestedLevels.length > 0;
    const qtyWorking = isNested
      ? window.LakuUnits.toWorkingQuantity(item, jumlah, inputUnit).value
      : window.LakuUnits.convertUnitExact(jumlah, inputUnit, displayUnit);
    const qtyDisplay = isNested
      ? window.LakuUnits.convertNested(jumlah, inputUnit, displayUnit, item)
      : qtyWorking;
    const hargaBeli = item.harga;
    const inputUnitPrice = getInputUnitPrice(item, inputUnit);

    if (qtyWorking === null || qtyDisplay === null || !Number.isFinite(qtyWorking) || !Number.isFinite(qtyDisplay)) {
      window.showAlert({
        type: "error",
        title: "Satuan Tidak Cocok",
        message: `Satuan "${inputUnit}" tidak kompatibel dengan stok "${displayUnit}".`,
      });
      return;
    }

    if (qtyWorking > getWorkingStock(item)) {
      const availableText = isNested
        ? window.LakuUnits.formatInventoryQuantity(item, getWorkingStock(item))
        : `${window.LakuUnits.round2(item.stok || 0)} ${window.LakuUnits.formatUnitLabel(displayUnit)}`;
      const neededText = `${window.LakuUnits.round2(jumlah)} ${window.LakuUnits.formatUnitLabel(inputUnit)}`;
      window.showAlert({
        type: "error",
        title: "Stok Tidak Cukup",
        message: `${item.nama} tersedia: ${availableText} — Kamu butuh: ${neededText}`,
      });
      return;
    }

    const replacingId = window.LakuHpp._replacingIngredientId;
    window.LakuHpp._replacingIngredientId = null;

    const newIngredient = {
      id: replacingId || window.LakuHpp.generateHppId("ing"),
      inventoryId: item.id,
      nama: item.nama,
      hargaBeli,
      jumlahPakai: qtyDisplay,
      satuan: displayUnit,
      nestedLevels: isNested ? item.nestedLevels : undefined,
      _qtyWorking: qtyWorking,
      _workingUnit: isNested ? getInnermostUnit(item) : displayUnit,
      _inputQty: jumlah,
      _inputUnit: inputUnit,
      _inputUnitPrice: inputUnitPrice,
    };

    if (replacingId) {
      const idx = window.LakuHpp.ingredients.findIndex((i) => window.LakuHpp.idsEqual(i.id, replacingId));
      if (idx !== -1) {
        window.LakuHpp.ingredients[idx] = newIngredient;
      }
    } else {
      window.LakuHpp.ingredients.push(newIngredient);
    }

    select.value = "";
    jumlahInput.value = "";
    window.LakuHpp.refreshIngredientUI();
    window.LakuHpp.saveSession();
  } finally {
    window.LakuHpp._addingIngredient = false;
  }
};