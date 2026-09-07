/**
 * hppClient.js — Orchestrator for HPP Kalkulator
 * Manages shared state, init, step navigation, and event binding.
 * Delegates to hppIngredients.js, hppCalc.js, and hppRecipes.js via window.LakuHpp.
 *
 * Removed from monolithic version:
 * - switchMode() and currentMode (mode cepat deleted)
 * - addManualIngredient() (mode cepat deleted)
 * - Local formatRupiah / roundToNearest (now from appUtils.js)
 */

// === Shared State ===
window.LakuHpp = {
  ingredients: [],       // { id, inventoryId|null, nama, hargaBeli, jumlahPakai, satuan }
  overheadItems: [],     // { nama, biaya }
  editingRecipeId: null, // ID resep yang sedang diedit (null = resep baru)
  currentStep: 1,
  _uidCounter: 0,
};

/** Generate a unique ID for ingredients/overhead items */
function nextUid() {
  window.LakuHpp._uidCounter++;
  return window.LakuHpp._uidCounter + Date.now();
}

/** Load inventory data from localStorage */
function loadInventory() {
  const raw = localStorage.getItem("laku_inventory_data");
  return raw ? JSON.parse(raw) : [];
}

/** Load recipe data from localStorage */
function loadRecipes() {
  const raw = localStorage.getItem("laku_recipe_data");
  return raw ? JSON.parse(raw) : [];
}

/** Save recipe data to localStorage */
function saveRecipes(recipes) {
  localStorage.setItem("laku_recipe_data", JSON.stringify(recipes));
}

// === Step Navigation ===

/** Navigate to a specific step, update dots and trigger sub-module refresh */
function goToStep(step) {
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

  window.LakuHpp.currentStep = step;

  // If going to step 2, refresh ingredient UI
  if (step === 2) window.LakuHpp.refreshIngredientUI();
  // If going to step 4, recalculate
  if (step === 4) window.LakuHpp.calculateAll();
}

/** Show or hide the onboarding / wizard based on inventory state */
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

  if (bahanInv.length === 0) {
    // Inventory empty → show onboarding, hide wizard
    if (onboarding) onboarding.classList.remove("hidden");
    if (stepIndicator) stepIndicator.classList.add("hidden");
    if (step1) step1.classList.add("hidden");
    if (step2) step2.classList.add("hidden");
    if (step3) step3.classList.add("hidden");
    if (step4) step4.classList.add("hidden");
  } else {
    // Inventory has items → hide onboarding, show wizard normally
    if (onboarding) onboarding.classList.add("hidden");
    if (stepIndicator) stepIndicator.classList.remove("hidden");
    // Show current step
    goToStep(window.LakuHpp.currentStep);
  }
}

// === Init & Event Binding ===

/** Initialize all sub-modules and bind all event listeners */
function initHppAppLogic() {
  // Init sub-modules
  window.LakuHpp.refreshIngredientUI();
  window.LakuHpp.renderOverhead();
  window.LakuHpp.renderRecipeList();

  // Check onboarding visibility
  toggleOnboardingVisibility();

  // Start at step 1
  goToStep(1);

  // --- Event Binding ---
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
    if (window.LakuHpp.ingredients.length === 0) {
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
  el("hppSimpanResep")?.addEventListener("click", () => window.LakuHpp.saveCurrentRecipe());

  // Add ingredient from inventory
  el("hppAddIngredientBtn")?.addEventListener("click", () => window.LakuHpp.addIngredientFromInventory());

  // Enter key on jumlah pakai input → add ingredient from inventory
  el("hppJumlahPakai")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      window.LakuHpp.addIngredientFromInventory();
    }
  });

  // Add overhead
  el("hppAddOverheadBtn")?.addEventListener("click", () => window.LakuHpp.addOverhead());

  // Enter key on overhead biaya input → add overhead
  el("hppOverheadBiaya")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      window.LakuHpp.addOverhead();
    }
  });

  // Go to inventory (from empty state in step 2)
  el("hppGoToInventory")?.addEventListener("click", () => {
    window.closeAppModal();
    setTimeout(() => window.openAppModal("inventory"), 300);
  });

  // Go to inventory (from onboarding section)
  el("hppGoToInventoryOnboarding")?.addEventListener("click", () => {
    window.closeAppModal();
    setTimeout(() => window.openAppModal("inventory"), 300);
  });

  // Margin slider — recalc on change
  el("hppMarginSlider")?.addEventListener("input", () => {
    window.LakuHpp.calculateAll();
  });

  // Real-time update for step 3 inputs
  ["hppJamKerja", "hppUpahPerJam", "hppBiayaKemasan"].forEach((id) => {
    el(id)?.addEventListener("input", () => {
      if (window.LakuHpp.currentStep >= 3) window.LakuHpp.calculateAll();
    });
  });
}

/** Entry point — renders UI and initializes logic. Called by core/app.js */
function renderHppApp(container) {
  if (!container) return;
  container.innerHTML = getHppAppUI();
  initHppAppLogic();
}
