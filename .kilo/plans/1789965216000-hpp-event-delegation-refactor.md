---
name: HPP Event Delegation Refactoring
description: Ekstraksi pola penyiapan event delegation yang duplikat ke fungsi helper reusable untuk mengurangi duplikasi kode tanpa mengubah logika atau UI.
type: plan
status: ready
---

# Plan: Ekstraksi Event Delegation ke Fungsi Helper Reusable

## Tujuan
Mengurangi duplikasi kode dalam modul HPP dengan mengekstraksi pola penyiapan event delegation yang seragam yang terdapat dalam fungsi-fungsi render (renderIngredients, renderOverhead, renderRecipeList) ke dalam fungsi helper reusable. Refaktorisasi ini hanya memindahkan kode, tidak mengubah logika atau UI apa pun.

## Lokasi Perubahan
File: `/Volumes/Adyfas/Project/INOVATION COMPETION/FE/javascript/apps/hpp/hppClient.js`
- Untuk menambahkan fungsi helper baru

File: `/Volumes/Adyfas/Project/INOVATION COMPETION/FE/javascript/apps/hpp/hppIngredients.js`
- Untuk mengganti pola event delegation duplikat dengan pemanggilan helper

File: `/Volumes/Adyfas/Project/INOVATION COMPETION/FE/javascript/apps/hpp/hppCalc.js`
- Untuk mengganti pola event delegation duplikat dengan pemanggilan helper

File: `/Volumes/Adyfas/Project/INOVATION COMPETION/FE/javascript/apps/hpp/hppRecipes.js`
- Untuk mengganti pola event delegation duplikat dengan pemanggilan helper

## Detail Perubahan

### 1. Tambahkan fungsi helper ke hppClient.js
Tambahkan fungsi berikut ke dalam namespace window.LakuHpp (setelah fungsi-fungsi lain seperti captureDraft, saveSession, dsb.):

```javascript
/**
 * Setup delegated event listeners with automatic cleanup of previous handlers
 * @param {Element} element - DOM element to attach listeners to
 * @param {Function} clickHandler - Function to handle click events
 * @param {Function} inputHandler - Function to handle input/change events
 */
window.LakuHpp.setupDelegatedListeners = function (element, clickHandler, inputHandler) {
  // Remove existing click handler if any
  if (element._hppClickHandler) {
    element.removeEventListener("click", element._hppClickHandler);
  }
  // Remove existing input handler if any
  if (element._hppInputHandler) {
    element.removeEventListener("input", element._hppInputHandler);
    element.removeEventListener("change", element._hppInputHandler);
  }
  
  // Store new handlers for future cleanup
  element._hppClickHandler = clickHandler;
  element._hppInputHandler = inputHandler;
  
  // Add new listeners
  if (clickHandler) element.addEventListener("click", clickHandler);
  if (inputHandler) {
    element.addEventListener("input", inputHandler);
    element.addEventListener("change", inputHandler);
  }
};
```

### 2. Update hppIngredients.js renderIngredients() function
Ganti bagian penyiapan event delegation (sekitar baris 308-359) dengan:

```javascript
// Set up delegated event handlers using helper
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

// Use helper to setup listeners
window.LakuHpp.setupDelegatedListeners(list, list._ingredientClickHandler, list._ingredientInputHandler);
```

### 3. Update hppCalc.js renderOverhead() function
Ganti bagian penyiapan event delegation (sekitar baris 77-122) dengan:

```javascript
// Set up delegated event handlers using helper
list._overheadClickHandler = (e) => {
  const target = e.target.closest("button");
  if (!target) return;

  const overheadEl = target.closest("[data-overhead-id]");
  const overheadId = overheadEl?.getAttribute("data-overhead-id");
  if (!overheadId) return;

  if (target.hasAttribute("data-remove-ovh")) {
    handleRemoveOverhead(overheadId);
  } else if (target.hasAttribute("data-edit-ovh")) {
    window.LakuHpp.startEditOverhead(overheadId);
  } else if (target.hasAttribute("data-save-edit-ovh")) {
    window.LakuHpp.saveInlineEditOverhead(overheadId);
  } else if (target.hasAttribute("data-cancel-edit-ovh")) {
    window.LakuHpp.cancelInlineEditOverhead(overheadId);
  }
};

list._overheadInputHandler = (e) => {
  const target = e.target;
  const overheadEl = target.closest("[data-overhead-id]");
  const overheadId = overheadEl?.getAttribute("data-overhead-id");
  if (!overheadId || window.LakuHpp.editingOverheadId !== overheadId) return;

  if (target.hasAttribute("data-edit-ovh-nama")) {
    window.LakuHpp.updateOverheadEditDraft(overheadId, { nama: target.value.trim() });
  } else if (target.hasAttribute("data-edit-ovh-biaya")) {
    const value = window.getRawNumber(target);
    window.LakuHpp.updateOverheadEditDraft(overheadId, { biaya: value });
  }
};

// Use helper to setup listeners
window.LakuHpp.setupDelegatedListeners(list, list._overheadClickHandler, list._overheadInputHandler);
```

### 4. Update hppRecipes.js renderRecipeList() function
Ganti bagian penyiapan event delegation (sekitar baris 243-274) dengan:

```javascript
// Set up delegated click handlers using helper
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

// Use helper to setup listeners for both desktop and mobile lists
window.LakuHpp.setupDelegatedListeners(tbody, (e) => handleRecipeAction(e, tbody), null);
window.LakuHpp.setupDelegatedListeners(mobileList, (e) => handleRecipeAction(e, mobileList), null);
```

## Validasi Checklist

- [ ] Fungsi helper `setupDelegatedListeners` ditambahkan ke window.LakuHpp di hppClient.js tanpa kesalahan sintaksis
- [ ] Semua tiga file render (hppIngredients.js, hppCalc.js, hppRecipes.js) menggunakan helper untuk menyiapkan event delegation
- [ ] Logika event handler tetap sama persis - hanya cara penyiapan listener yang berubah
- [ ] Tidak ada perubahan pada UI apa pun - tampilan dan fungsi tetap identik
- [ ] Tidak ada console error terkait event delegation setelah perubahan
- [ ] Semua fungsi yang dépendent pada event delegation tetap bekerja:
    - Menghapus bahan/overhead/resep
    - Memulai dan menyimpan edit inline
    - Membatalkan edit inline
    - Mengganti bahan yang hilang
    - Menambahkan overhead baru
    - Mengedit, menduplikasi, dan menghapus resep
- [ ] Tidak ada duplikasi listener atau memory leak yang diperkenalkan
- [ ] Fungsi helper bekerja dengan baik ketika dipanggil berkali-kali (cleanup handler lama sebelum menambahkan yang baru)

## Risiko dan Mitigasi

- **Risiko:** Kelupaan membriayakan variabel handler yang diperlukan untuk cleanup.
  **Mitigasi:** Fungsi helper menyimpan handler ke properti khusus (`_hppClickHandler`, `_hppInputHandler`) sehingga cleanup dapat dilakukan dengan benar sebelum handler baru ditambahkan.

- **Risiko:** Ketidaksesuaian tipe event (misalnya menggunakan "change" ketika hanya "input" yang diperlukan).
  **Mitigasi:** Helper saat ini menambahkan baik "input" maupun "change" untuk inputHandler, yang cocok dengan pola yang ada dalam kode kode HPP. Jika suatu masa mendatang diperlukan pilihan yang lebih spesifik, fungsi bisa diperluas dengan parameter tambahan.

- **Risiko:** Konflik nama variabel jika kode lain juga menggunakan properti `_hppClickHandler`.
  **Mitigasi:** Nama properti menggunakan namespace `_hpp` untuk minimizing risiko konflik. Alternatifnya adalah menggunakan WeakMap atau simbol, tetapi untuk kesederhanaan dan kompatibilitas, properti biasa dengan prefix unik cukup untuk kode basis ini.

## Catatan
Refaktorisasi ini hanya berfokus pada pola event delegation yang paling jelas dan berulang. Pola pola lain yang mungkin diekstrak (seperti validasi form atau utilitas DOM) dapat dipertimbangkan dalam refaktorisasi terpisah jika diperlukan, tetapi perubahan ini sendiri memberikan manfaat yang signifikan dalam mengurangi duplikasi kode sambil menjaga sempurna kompatibilitas dengan logika dan UI yang ada.