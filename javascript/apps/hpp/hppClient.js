window.LakuHpp = {
  ingredients: [],       // { id, inventoryId|null, nama, hargaBeli, jumlahPakai, satuan }
  overheadItems: [],     // { nama, biaya }
  editingRecipeId: null, // ID resep yang sedang diedit (null = resep baru)
  currentStep: 1,
  _uidCounter: 0,
};

/** Helper HTML XSS */
window.LakuHpp.escapeHtml = function (value) {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};
window.LakuHpp.idsEqual = function (id1, id2) {
  if (id1 === null || id1 === undefined || id2 === null || id2 === undefined) return false;
  return String(id1) === String(id2);
};

window.LakuHpp.validatePositiveFinite = function (val, fieldName) {
  if (val === null || val === undefined || String(val).trim() === "") {
    return { valid: false, message: `${fieldName} wajib diisi.`, value: 0 };
  }
  let num;
  if (typeof val === "number") {
    num = val;
  } else {
    const str = String(val).trim();
    if (/^\d+(\.\d+)?$/.test(str)) {
      num = parseFloat(str);
    } else if (/^\d+(,\d+)?$/.test(str)) {
      num = parseFloat(str.replace(",", "."));
    } else if (typeof window.getRawNumber === "function") {
      num = window.getRawNumber(str);
    } else {
      num = parseFloat(str);
    }
  }
  if (isNaN(num) || !isFinite(num) || num <= 0) {
    return { valid: false, message: `${fieldName} harus bernilai angka lebih besar dari 0.`, value: 0 };
  }
  return { valid: true, message: "", value: num };
};

window.LakuHpp.generateHppId = function (prefix = "hpp") {
  window.LakuHpp._uidCounter++;
  return `${prefix}_${Date.now()}_${window.LakuHpp._uidCounter}_${Math.random().toString(36).substr(2, 9)}`;
};

function nextUid() {
  window.LakuHpp._uidCounter++;
  return window.LakuHpp._uidCounter + Date.now();
}

window.LakuHpp.initPaginationController = function () {
  window.LakuHpp.paginationController = window.LakuPagination.createPaginationController({
    storageKey: "laku_hpp_ui_state",
    getData: loadRecipes,
    filterFn: (item, state) => {
      const searchTerm = (state.searchTerm || "").toLowerCase().trim();
      if (searchTerm && (item.namaProduk || "").toLowerCase().indexOf(searchTerm) === -1) {
        return false;
      }
      return true;
    },
    elements: {
      searchInput: "hppSearchInput",
      pageSizeSelect: "hppPageSizeSelect",
      prevPage: "hppPrevPage",
      nextPage: "hppNextPage",
      currentPage: "hppCurrentPage",
      totalPages: "hppTotalPages",
      startIndex: "hppStartIndex",
      endIndex: "hppEndIndex",
      totalCount: "hppTotalCount",
      paginationContainer: "hppPagination",
    },
    onChange: (items) => window.LakuHpp.renderRecipeList(items),
    defaultPageSize: 10,
    debounceMs: 300,
  });
};

window.LakuHpp.refreshRecipeList = function () {
  if (window.LakuHpp.paginationController) {
    window.LakuHpp.paginationController.refresh();
  } else {
    window.LakuHpp.renderRecipeList();
  }
};

const HPP_SESSION_KEY = "laku_hpp_session";
const HPP_SESSION_VERSION = 3;

function loadHppSession() {
  try {
    const raw = sessionStorage.getItem(HPP_SESSION_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data && data.version === HPP_SESSION_VERSION) {
      return data;
    }
    if (data && data.version === 2) {
      return migrateSessionV2toV3(data);
    }
    return null;
  } catch (e) {
    return null;
  }
}

function migrateSessionV2toV3(v2State) {
  return {
    ...v2State,
    version: HPP_SESSION_VERSION,
    editingIngredientDraft: null,
    editingOverheadDraft: null,
  };
}

function saveHppSession(state) {
  try {
    sessionStorage.setItem(HPP_SESSION_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn("Failed to save HPP session", e);
  }
}

function clearHppSession() {
  try {
    sessionStorage.removeItem(HPP_SESSION_KEY);
  } catch (e) {}
}

window.LakuHpp.captureDraft = captureHppDraft;
window.LakuHpp.saveSession = function() { saveHppSession(captureHppDraft()); };
window.LakuHpp.clearSession = clearHppSession;

window.LakuHpp.toggleBuatBaruButtons = function(show) {
  const el = (id) => document.getElementById(id);
  const buttons = [
    "hppStep1BuatBaru",
    "hppStep2BuatBaru",
    "hppStep3BuatBaru",
    "hppStep4BuatBaru"
  ];
  buttons.forEach((id) => {
    const btn = el(id);
    if (btn) {
      if (show) btn.classList.remove("hidden");
      else btn.classList.add("hidden");
    }
  });
};

window.LakuHpp.resetForm = function() {
  clearHppSession();
  window.LakuHpp.ingredients = [];
  window.LakuHpp.overheadItems = [];
  window.LakuHpp.editingRecipeId = null;
  window.LakuHpp.editingIngredientId = null;
  window.LakuHpp.editingOverheadId = null;
  window.LakuHpp.editingIngredientDraft = null;
  window.LakuHpp.editingOverheadDraft = null;
  window.LakuHpp.currentStep = 1;
  const el = (id) => document.getElementById(id);
  el("hppNamaProduk").value = "";
  el("hppJumlahProduksi").value = "";
  el("hppSatuanProduksi").value = "porsi";
  el("hppJamKerja").value = "";
  el("hppUpahPerJam").value = "";
  el("hppBiayaKemasan").value = "";
  el("hppMarginSlider").value = 30;
  if (el("hppMarginDisplay")) el("hppMarginDisplay").textContent = "30%";
  if (el("hppInventorySelect")) el("hppInventorySelect").value = "";
  if (el("hppJumlahPakai")) el("hppJumlahPakai").value = "";
  if (el("hppJumlahPakaiUnit")) {
    el("hppJumlahPakaiUnit").innerHTML = '<option value="">—</option>';
    el("hppJumlahPakaiUnit").disabled = true;
  }
  if (typeof window.LakuHpp.cancelEditIngredient === "function") {
    window.LakuHpp.cancelEditIngredient();
  }
  if (typeof window.LakuHpp.cancelEditOverhead === "function") {
    window.LakuHpp.cancelEditOverhead();
  }
  window.LakuHpp.toggleBuatBaruButtons(false);
  window.LakuHpp.refreshIngredientUI();
  window.LakuHpp.renderOverhead();
  window.LakuHpp.refreshRecipeList();
  goToStep(1);
};

let inventoryUpdatedHandler = null;
let storageHandler = null;

function captureHppDraft() {
  const el = (id) => document.getElementById(id);
  const pendingSelect = el("hppInventorySelect");
  const pendingQty = el("hppJumlahPakai");
  const pendingUnit = el("hppJumlahPakaiUnit");
  const pendingIngredient = {
    inventoryId: pendingSelect ? parseInt(pendingSelect.value) || "" : "",
    jumlahPakai: pendingQty ? pendingQty.value : "",
    satuan: pendingUnit ? pendingUnit.value : ""
  };
  const pendingOverheadNama = el("hppOverheadNama")?.value.trim() || "";
  const pendingOverheadBiaya = el("hppOverheadBiaya")?.value || "";
  const pendingOverhead = { nama: pendingOverheadNama, biaya: pendingOverheadBiaya };
  const product = {
    namaProduk: el("hppNamaProduk")?.value.trim() || "",
    jumlahProduksi: el("hppJumlahProduksi")?.value || "",
    satuanProduksi: el("hppSatuanProduksi")?.value || "porsi"
  };
  const costs = {
    jamKerja: el("hppJamKerja")?.value || "",
    upahPerJam: el("hppUpahPerJam")?.value || "",
    biayaKemasan: el("hppBiayaKemasan")?.value || ""
  };
  const margin = parseInt(el("hppMarginSlider")?.value) || 30;
  const editingRecipeId = window.LakuHpp.editingRecipeId;
  const editingIngredientId = window.LakuHpp.editingIngredientId || null;
  const editingOverheadId = window.LakuHpp.editingOverheadId || null;
  const editingIngredientDraft = window.LakuHpp.editingIngredientDraft || null;
  const editingOverheadDraft = window.LakuHpp.editingOverheadDraft || null;
  return {
    version: HPP_SESSION_VERSION,
    currentStep: window.LakuHpp.currentStep,
    editingRecipeId,
    editingIngredientId,
    editingOverheadId,
    editingIngredientDraft,
    editingOverheadDraft,
    product,
    pendingIngredient,
    pendingOverhead,
    ingredients: window.LakuHpp.ingredients,
    overheadItems: window.LakuHpp.overheadItems,
    costs,
    margin,
  };
}
function restoreHppDraft(state) {
  if (!state) return;
  const el = (id) => document.getElementById(id);
  // Restore window.LakuHpp state
  window.LakuHpp.currentStep = state.currentStep || 1;
  window.LakuHpp.editingRecipeId = state.editingRecipeId || null;
  window.LakuHpp.editingIngredientId = state.editingIngredientId || null;
  window.LakuHpp.editingOverheadId = state.editingOverheadId || null;
  window.LakuHpp.editingIngredientDraft = state.editingIngredientDraft || null;
  window.LakuHpp.editingOverheadDraft = state.editingOverheadDraft || null;
  window.LakuHpp.ingredients = state.ingredients || [];
  const rawOverhead = state.overheadItems || [];
  window.LakuHpp.overheadItems = rawOverhead.map((item, idx) => {
    if (item.id) return item;
    return { ...item, id: "ovh_" + Date.now() + "_" + idx + "_" + Math.random().toString(36).substr(2, 9) };
  });
  if (state.product) {
    el("hppNamaProduk").value = state.product.namaProduk || "";
    el("hppJumlahProduksi").value = state.product.jumlahProduksi || "";
    el("hppSatuanProduksi").value = state.product.satuanProduksi || "porsi";
  }
  if (state.pendingIngredient) {
    if (el("hppInventorySelect")) el("hppInventorySelect").value = state.pendingIngredient.inventoryId || "";
    if (el("hppJumlahPakai")) el("hppJumlahPakai").value = state.pendingIngredient.jumlahPakai || "";
    if (el("hppJumlahPakaiUnit")) el("hppJumlahPakaiUnit").value = state.pendingIngredient.satuan || "";
  }
  if (state.pendingOverhead) {
    if (el("hppOverheadNama")) el("hppOverheadNama").value = state.pendingOverhead.nama || "";
    if (el("hppOverheadBiaya")) el("hppOverheadBiaya").value = state.pendingOverhead.biaya || "";
  }
  if (state.costs) {
    el("hppJamKerja").value = state.costs.jamKerja || "";
    el("hppUpahPerJam").value = state.costs.upahPerJam || "";
    if (el("hppUpahPerJam") && state.costs.upahPerJam) window.formatNumberInput(el("hppUpahPerJam"));
    el("hppBiayaKemasan").value = state.costs.biayaKemasan || "";
    if (el("hppBiayaKemasan") && state.costs.biayaKemasan) window.formatNumberInput(el("hppBiayaKemasan"));
  }
  if (state.margin !== undefined) {
    el("hppMarginSlider").value = state.margin;
    if (el("hppMarginDisplay")) el("hppMarginDisplay").textContent = `${state.margin}%`;
  }
}

function loadInventory() {
  const raw = localStorage.getItem("laku_inventory_data");
  return raw ? JSON.parse(raw) : [];
}

function loadRecipes() {
  const raw = localStorage.getItem("laku_recipe_data");
  return raw ? JSON.parse(raw) : [];
}

function saveRecipes(recipes) {
  localStorage.setItem("laku_recipe_data", JSON.stringify(recipes));
}

function goToStep(step) {
  for (let i = 1; i <= 4; i++) {
    const el = document.getElementById(`hppStep${i}`);
    if (el) el.classList.add("hidden");
  }
  const target = document.getElementById(`hppStep${step}`);
  if (target) target.classList.remove("hidden");

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

  window.LakuHpp.currentStep = step;
  if (step === 2) window.LakuHpp.refreshIngredientUI();
  if (step === 4) window.LakuHpp.calculateAll();
}

function toggleOnboardingVisibility() {
  const inv = loadInventory();
  const bahanInv = inv.filter(
    (item) =>
      item.kategori === "Bahan Baku Utama" ||
      item.kategori === "Kemasan / Packaging"
  );

  const onboarding = document.getElementById("hppOnboarding");
  const stepIndicator = document.getElementById("hppStepIndicator");
  const step1 = document.getElementById("hppStep1");
  const step2 = document.getElementById("hppStep2");
  const step3 = document.getElementById("hppStep3");
  const step4 = document.getElementById("hppStep4");

  const recipeListSection = document.getElementById("hppRecipeListSection");

  if (bahanInv.length === 0) {
    if (onboarding) onboarding.classList.remove("hidden");
    if (stepIndicator) stepIndicator.classList.add("hidden");
    if (step1) step1.classList.add("hidden");
    if (step2) step2.classList.add("hidden");
    if (step3) step3.classList.add("hidden");
    if (step4) step4.classList.add("hidden");
    if (recipeListSection) recipeListSection.classList.add("hidden");
  } else {
    if (onboarding) onboarding.classList.add("hidden");
    if (stepIndicator) stepIndicator.classList.remove("hidden");
    if (recipeListSection) recipeListSection.classList.remove("hidden");
  }
}

function initHppAppLogic() {
  const session = loadHppSession();
  if (session) {
    restoreHppDraft(session);
  } else {
    window.LakuHpp.currentStep = 1;
    window.LakuHpp.editingRecipeId = null;
    window.LakuHpp.editingIngredientId = null;
    window.LakuHpp.ingredients = [];
    window.LakuHpp.overheadItems = [];
  }
  window.LakuHpp.refreshIngredientUI();
  if (window.LakuHpp.editingIngredientId) {
    window.LakuHpp.startEditIngredient(window.LakuHpp.editingIngredientId, window.LakuHpp.editingIngredientDraft);
  }
  if (session && session.pendingIngredient) {
    const unitSel = document.getElementById("hppJumlahPakaiUnit");
    if (unitSel) unitSel.value = session.pendingIngredient.satuan || "";
  }
  window.LakuHpp.renderOverhead();
  if (window.LakuHpp.editingOverheadId) {
    window.LakuHpp.startEditOverhead(window.LakuHpp.editingOverheadId, window.LakuHpp.editingOverheadDraft);
  }
  window.LakuHpp.initPaginationController();
  window.LakuHpp.refreshRecipeList();

  toggleOnboardingVisibility();
  const inv = loadInventory();
  const bahanInv = inv.filter(
    (item) =>
      item.kategori === "Bahan Baku Utama" ||
      item.kategori === "Kemasan / Packaging"
  );
  if (bahanInv.length > 0) {
    goToStep(window.LakuHpp.currentStep);
  }

  const el = (id) => document.getElementById(id);

  function saveSession() {
    saveHppSession(captureHppDraft());
  }

  el("hppStep1Next")?.addEventListener("click", () => {
    const nama = el("hppNamaProduk")?.value.trim();
    const jumlah = parseInt(el("hppJumlahProduksi")?.value);
    if (!nama) {
      window.showAlert({ type: "warning", title: "Belum Lengkap", message: "Isi nama produk dulu ya!" });
      return;
    }
    if (!jumlah || jumlah <= 0) {
      window.showAlert({ type: "warning", title: "Belum Lengkap", message: "Isi jumlah produksi dulu ya!" });
      return;
    }
    goToStep(2);
    saveSession();
  });

  el("hppStep2Back")?.addEventListener("click", () => {
    goToStep(1);
    saveSession();
  });
  el("hppStep2Next")?.addEventListener("click", () => {
    const pendingSelect = el("hppInventorySelect");
    const pendingQty = el("hppJumlahPakai");
    const pendingUnit = el("hppJumlahPakaiUnit");
    if (pendingSelect && pendingSelect.value) {
      if (!pendingQty.value || parseFloat(pendingQty.value) <= 0) {
        window.showAlert({ type: "warning", title: "Belum Lengkap", message: "Isi jumlah pakai bahan terlebih dahulu." });
        return;
      }
      if (!pendingUnit.value) {
        window.showAlert({ type: "warning", title: "Belum Lengkap", message: "Pilih satuan bahan terlebih dahulu." });
        return;
      }
    }
    if (window.LakuHpp.ingredients.length === 0) {
      window.showAlert({ type: "warning", title: "Belum Lengkap", message: "Tambahkan minimal satu bahan ya!" });
      return;
    }
    goToStep(3);
    saveSession();
  });

  el("hppStep3Back")?.addEventListener("click", () => {
    goToStep(2);
    saveSession();
  });
  el("hppStep3Next")?.addEventListener("click", () => {
    goToStep(4);
    saveSession();
  });

  el("hppStep4Back")?.addEventListener("click", () => {
    goToStep(3);
    saveSession();
  });
  el("hppSimpanResep")?.addEventListener("click", () => window.LakuHpp.saveCurrentRecipe());

  el("hppStep1BuatBaru")?.addEventListener("click", () => {
    window.LakuHpp.resetForm();
  });
  el("hppStep2BuatBaru")?.addEventListener("click", () => {
    window.LakuHpp.resetForm();
  });
  el("hppStep3BuatBaru")?.addEventListener("click", () => {
    window.LakuHpp.resetForm();
  });
  el("hppStep4BuatBaru")?.addEventListener("click", () => {
    window.LakuHpp.resetForm();
  });

  el("hppAddIngredientBtn")?.addEventListener("click", () => {
    window.LakuHpp.addIngredientFromInventory();
  });

  el("hppJumlahPakai")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      window.LakuHpp.addIngredientFromInventory();
    }
  });

  el("hppAddOverheadBtn")?.addEventListener("click", () => {
    window.LakuHpp.addOverhead();
    saveSession();
  });

  el("hppOverheadBiaya")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      window.LakuHpp.addOverhead();
      saveSession();
    }
  });

  el("hppGoToInventory")?.addEventListener("click", () => {
    window.closeAppModal();
    setTimeout(() => window.openAppModal("inventory"), 300);
  });

  el("hppGoToInventoryOnboarding")?.addEventListener("click", () => {
    window.closeAppModal();
    setTimeout(() => window.openAppModal("inventory"), 300);
  });

  el("hppMarginSlider")?.addEventListener("input", () => {
    window.LakuHpp.calculateAll();
    saveSession();
  });

  ["hppJamKerja", "hppUpahPerJam", "hppBiayaKemasan"].forEach((id) => {
    el(id)?.addEventListener("input", () => {
      if (window.LakuHpp.currentStep >= 3) window.LakuHpp.calculateAll();
      saveSession();
    });
  });

  ["hppNamaProduk", "hppJumlahProduksi", "hppSatuanProduksi"].forEach((id) => {
    el(id)?.addEventListener("input", () => saveSession());
    el(id)?.addEventListener("change", () => saveSession());
  });

  if (el("hppInventorySelect")) {
    el("hppInventorySelect").addEventListener("change", () => saveSession());
  }
  if (el("hppJumlahPakai")) {
    el("hppJumlahPakai").addEventListener("input", () => saveSession());
  }
  if (el("hppJumlahPakaiUnit")) {
    el("hppJumlahPakaiUnit").addEventListener("change", () => saveSession());
  }

  if (el("hppOverheadNama")) {
    el("hppOverheadNama").addEventListener("input", () => saveSession());
  }
  if (el("hppOverheadBiaya")) {
    el("hppOverheadBiaya").addEventListener("input", () => saveSession());
  }

  if (inventoryUpdatedHandler) {
    window.removeEventListener("laku-inventory-updated", inventoryUpdatedHandler);
  }
  inventoryUpdatedHandler = () => {
    if (document.getElementById("hppInventorySelect")) {
      window.LakuHpp.refreshIngredientUI();
    }
  };
  window.addEventListener("laku-inventory-updated", inventoryUpdatedHandler);

  if (storageHandler) {
    window.removeEventListener("storage", storageHandler);
  }
  storageHandler = (e) => {
    if (e.key === "laku_inventory_data" && document.getElementById("hppInventorySelect")) {
      window.LakuHpp.refreshIngredientUI();
    }
  };
  window.addEventListener("storage", storageHandler);

}

function renderHppApp(container) {
  if (!container) return;
  container.innerHTML = getHppAppUI();
  initHppAppLogic();
}
