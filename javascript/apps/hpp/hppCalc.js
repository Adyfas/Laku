const MAX_MARGIN = 99;
window.LakuHpp.renderOverhead = function () {
  const list = document.getElementById("hppOverheadList");
  if (!list) return;

  if (window.LakuHpp.overheadItems.length === 0) {
    list.innerHTML = `
      <div class="text-center py-3 text-amber-700/60 text-xs">Kosong — isi kalau ada biaya lain.</div>
    `;
    if (list._overheadClickHandler) {
      list.removeEventListener("click", list._overheadClickHandler);
      list._overheadClickHandler = null;
    }
    if (list._overheadInputHandler) {
      list.removeEventListener("input", list._overheadInputHandler);
      list._overheadInputHandler = null;
    }
    return;
  }

  list.innerHTML = window.LakuHpp.overheadItems
    .map((item) => {
      const isEditing = window.LakuHpp.editingOverheadId && window.LakuHpp.idsEqual(window.LakuHpp.editingOverheadId, item.id);
      const draft = window.LakuHpp.editingOverheadDraft || {};

      if (isEditing) {
        return `
          <div class="flex flex-col gap-2 bg-white p-3 rounded-xl border border-amber-200/50" data-overhead-id="${item.id}">
            <div class="flex flex-col gap-2">
              <input type="text" data-edit-ovh-nama="${item.id}" value="${window.LakuHpp.escapeHtml(draft.nama ?? item.nama)}" class="bg-white text-black-main font-medium py-2 px-3 rounded-xl outline-none border border-gray-200 focus:border-amber-500 text-sm" placeholder="Nama biaya" />
              <input type="text" inputmode="numeric" data-edit-ovh-biaya="${item.id}" value="${draft.biaya !== undefined ? window.formatRupiah(draft.biaya) : window.formatRupiah(item.biaya)}" class="bg-white text-black-main font-medium py-2 px-3 rounded-xl outline-none border border-gray-200 focus:border-amber-500 text-sm" placeholder="Rp" oninput="window.formatNumberInput(this)" />
            </div>
            <div class="flex items-center justify-end gap-2 pt-1">
              <button data-cancel-edit-ovh="${item.id}" class="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2 px-3 rounded-xl transition-colors text-xs cursor-pointer">
                ${window.LakuIcons.svg("close", "0.85em")} Batal
              </button>
              <button data-save-edit-ovh="${item.id}" class="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-3 rounded-xl transition-colors shadow-sm text-xs cursor-pointer">
                ${window.LakuIcons.svg("save", "0.85em")} Simpan
              </button>
            </div>
          </div>
        `;
      }

      return `
        <div class="flex items-center justify-between bg-white p-3 rounded-xl border border-amber-200/50" data-overhead-id="${item.id}">
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium text-gray-700">${window.LakuHpp.escapeHtml(item.nama)}</span>
            <span class="text-sm font-bold text-amber-800">${window.formatRupiah(item.biaya)}</span>
          </div>
          <div class="flex items-center gap-1">
            <button data-edit-ovh="${item.id}" class="text-blue-500 hover:text-blue-700 font-bold text-xs cursor-pointer transition-colors" title="Edit biaya">
              ${window.LakuIcons.svg("pencil", "0.85em")}
            </button>
            <button data-remove-ovh="${item.id}" class="text-rose-400 hover:text-rose-600 font-bold text-xs cursor-pointer transition-colors" title="Hapus biaya">
              ${window.LakuIcons.svg("closeCircle", "0.85em")}
            </button>
          </div>
        </div>
      `;
    })
    .join("");
  if (list._overheadClickHandler) {
    list.removeEventListener("click", list._overheadClickHandler);
  }
  if (list._overheadInputHandler) {
    list.removeEventListener("input", list._overheadInputHandler);
  }
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
  list.addEventListener("click", list._overheadClickHandler);
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
  list.addEventListener("input", list._overheadInputHandler);
};
async function handleRemoveOverhead(id) {
  const item = window.LakuHpp.overheadItems.find((i) => window.LakuHpp.idsEqual(i.id, id));
  if (!item) return;
  const ok = await window.showCustomConfirm({
    title: "Hapus Biaya?",
    message: `Yakin ingin menghapus "${item.nama}" dari daftar?`,
  });
  if (ok) {
    window.LakuHpp.overheadItems = window.LakuHpp.overheadItems.filter((i) => !window.LakuHpp.idsEqual(i.id, id));
    window.LakuHpp.renderOverhead();
    window.LakuHpp.saveSession();
  }
}
window.LakuHpp.startEditOverhead = function (id, draft) {
  if (window.LakuHpp.editingOverheadId && !window.LakuHpp.idsEqual(window.LakuHpp.editingOverheadId, id)) {
    const currentDraft = window.LakuHpp.editingOverheadDraft;
    if (currentDraft && (currentDraft.nama || currentDraft.biaya !== undefined)) {
      const saved = window.LakuHpp.saveInlineEditOverhead(window.LakuHpp.editingOverheadId);
      if (!saved) {
        window.showAlert({
          type: "warning",
          title: "Simpan Dulu",
          message: "Perbaiki data biaya yang sedang diedit sebelum berpindah.",
        });
        return;
      }
    } else {
      window.LakuHpp.cancelInlineEditOverhead(window.LakuHpp.editingOverheadId);
    }
  }

  const item = window.LakuHpp.overheadItems.find((i) => window.LakuHpp.idsEqual(i.id, id));
  if (!item) return;
  const initialDraft = draft || {
    nama: item.nama,
    biaya: item.biaya,
  };

  window.LakuHpp.editingOverheadId = id;
  window.LakuHpp.editingOverheadDraft = initialDraft;
  window.LakuHpp.saveSession();
  window.LakuHpp.renderOverhead();
};
window.LakuHpp.updateOverheadEditDraft = function (id, updates) {
  if (!window.LakuHpp.idsEqual(window.LakuHpp.editingOverheadId, id)) return;
  window.LakuHpp.editingOverheadDraft = {
    ...window.LakuHpp.editingOverheadDraft,
    ...updates,
  };
  window.LakuHpp.saveSession();
};
window.LakuHpp.saveInlineEditOverhead = function (id) {
  const item = window.LakuHpp.overheadItems.find((i) => window.LakuHpp.idsEqual(i.id, id));
  if (!item) return false;

  const draft = window.LakuHpp.editingOverheadDraft;
  if (!draft) return false;

  const nama = draft.nama;
  const biaya = draft.biaya;
  if (!nama || biaya === undefined) {
    window.showAlert({
      type: "error",
      title: "Data Tidak Lengkap",
      message: "Isi nama dan nominal biaya terlebih dahulu.",
    });
    return false;
  }

  const biayaValidation = window.LakuHpp.validatePositiveFinite(biaya, "Biaya");
  if (!biayaValidation.valid) {
    window.showAlert({
      type: "error",
      title: "Biaya Tidak Valid",
      message: biayaValidation.message,
    });
    return false;
  }
  const idx = window.LakuHpp.overheadItems.findIndex((i) => window.LakuHpp.idsEqual(i.id, id));
  if (idx === -1) return false;

  window.LakuHpp.overheadItems[idx] = { id, nama, biaya: biayaValidation.value };
  window.LakuHpp.editingOverheadId = null;
  window.LakuHpp.editingOverheadDraft = null;
  window.LakuHpp.renderOverhead();
  window.LakuHpp.saveSession();
  return true;
};
window.LakuHpp.cancelInlineEditOverhead = function (id) {
  if (!window.LakuHpp.idsEqual(window.LakuHpp.editingOverheadId, id)) return;
  window.LakuHpp.editingOverheadId = null;
  window.LakuHpp.editingOverheadDraft = null;
  window.LakuHpp.saveSession();
  window.LakuHpp.renderOverhead();
};
window.LakuHpp.cancelEditOverhead = function () {
  if (window.LakuHpp.editingOverheadId) {
    window.LakuHpp.cancelInlineEditOverhead(window.LakuHpp.editingOverheadId);
  } else {
    window.LakuHpp.editingOverheadId = null;
    window.LakuHpp.editingOverheadDraft = null;
  }
  const namaInput = document.getElementById("hppOverheadNama");
  const biayaInput = document.getElementById("hppOverheadBiaya");
  if (namaInput) namaInput.value = "";
  if (biayaInput) biayaInput.value = "";
};
window.LakuHpp.addOverhead = function () {
  if (window.LakuHpp._addingOverhead) return;
  window.LakuHpp._addingOverhead = true;

  try {
    if (window.LakuHpp.editingOverheadId) {
      const saved = window.LakuHpp.saveInlineEditOverhead(window.LakuHpp.editingOverheadId);
      if (saved === false) return;
    }

    const namaInput = document.getElementById("hppOverheadNama");
    const biayaInput = document.getElementById("hppOverheadBiaya");
    if (!namaInput || !biayaInput) return;

    const nama = namaInput.value.trim();
    const biaya = window.getRawNumber(biayaInput);

    const biayaValidation = window.LakuHpp.validatePositiveFinite(biaya, "Biaya");
    if (!nama || !biayaValidation.valid) return;
    const id = window.LakuHpp.generateHppId("ovh");
    window.LakuHpp.overheadItems.push({ id, nama, biaya: biayaValidation.value });
    namaInput.value = "";
    biayaInput.value = "";
    window.LakuHpp.renderOverhead();
    window.LakuHpp.saveSession();
  } finally {
    window.LakuHpp._addingOverhead = false;
  }
};
window.LakuHpp.calculateValues = function ({
  ingredients = window.LakuHpp.ingredients,
  jam = 0,
  upah = 0,
  overheadItems = window.LakuHpp.overheadItems,
  biayaKemasan = 0,
  jumlahProduksi = 1,
  margin = 30,
} = {}) {
  const validatedJam = Number.isFinite(jam) && jam >= 0 ? jam : 0;
  const validatedUpah = Number.isFinite(upah) && upah >= 0 ? upah : 0;
  const validatedBiayaKemasan = Number.isFinite(biayaKemasan) && biayaKemasan >= 0 ? biayaKemasan : 0;
  const validatedJumlahProduksi = Number.isFinite(jumlahProduksi) && jumlahProduksi > 0 ? jumlahProduksi : 1;
  const validatedMargin = Number.isFinite(margin) ? Math.max(0, Math.min(MAX_MARGIN, margin)) : 30;

  const totalBahan = ingredients.reduce(
    (sum, ingredient) => {
      const qty = Number.isFinite(ingredient.jumlahPakai) ? ingredient.jumlahPakai : 0;
      const harga = Number.isFinite(ingredient.hargaBeli) ? ingredient.hargaBeli : 0;
      return sum + qty * harga;
    },
    0
  );
  const totalTenaga = validatedJam * validatedUpah;
  const totalOverhead = overheadItems.reduce(
    (sum, item) => {
      const biaya = Number.isFinite(item.biaya) ? item.biaya : 0;
      return sum + biaya;
    },
    0
  );
  const totalBiaya = totalBahan + totalTenaga + totalOverhead + validatedBiayaKemasan;
  const output = validatedJumlahProduksi;
  const hppPerUnit = output > 0 ? totalBiaya / output : 0;
  const safeMargin = validatedMargin;
  const hargaJual = hppPerUnit / (1 - safeMargin / 100);

  return {
    totalBahan,
    totalTenaga,
    totalOverhead,
    biayaKemasan: validatedBiayaKemasan,
    totalBiaya,
    jumlahProduksi: output,
    hppPerUnit,
    margin: safeMargin,
    hargaJual,
    hargaJualBulat: window.roundToNearest(hargaJual, 100),
  };
};

window.LakuHpp.calculateAll = function () {
  const jam =
    parseFloat(document.getElementById("hppJamKerja")?.value) || 0;
  const upah = window.getRawNumber(
    document.getElementById("hppUpahPerJam")
  );
  const biayaKemasan = window.getRawNumber(
    document.getElementById("hppBiayaKemasan")
  );

  const jumlahProduksi =
    parseFloat(document.getElementById("hppJumlahProduksi")?.value) || 1;
  const margin =
    parseFloat(document.getElementById("hppMarginSlider")?.value) || 30;
  const values = window.LakuHpp.calculateValues({
    jam,
    upah,
    biayaKemasan,
    jumlahProduksi,
    margin,
  });
  const tenagaDisplay = document.getElementById("hppTotalTenaga");
  const tenagaValue = document.getElementById("hppTotalTenagaValue");
  if (jam > 0 && upah > 0) {
    if (tenagaDisplay) tenagaDisplay.classList.remove("hidden");
    if (tenagaValue) tenagaValue.textContent = window.formatRupiah(values.totalTenaga);
  } else {
    if (tenagaDisplay) tenagaDisplay.classList.add("hidden");
  }

  const satuan =
    document.getElementById("hppSatuanProduksi")?.value || "unit";

  const el = (id) => document.getElementById(id);
  if (el("hppRingkasanBahan"))
    el("hppRingkasanBahan").textContent = window.formatRupiah(values.totalBahan);
  if (el("hppRingkasanTenaga"))
    el("hppRingkasanTenaga").textContent = window.formatRupiah(values.totalTenaga);
  if (el("hppRingkasanOverhead"))
    el("hppRingkasanOverhead").textContent = window.formatRupiah(values.totalOverhead);
  if (el("hppRingkasanKemasan"))
    el("hppRingkasanKemasan").textContent = window.formatRupiah(values.biayaKemasan);
  if (el("hppRingkasanTotal"))
    el("hppRingkasanTotal").textContent = window.formatRupiah(values.totalBiaya);
  if (el("hppRingkasanHpp"))
    el("hppRingkasanHpp").textContent = window.formatRupiah(values.hppPerUnit);
  if (el("hppRingkasanSatuan"))
    el("hppRingkasanSatuan").textContent = satuan;
  if (el("hppHargaJual"))
    el("hppHargaJual").textContent = window.formatRupiah(values.hargaJual);
  if (el("hppHargaBulat"))
    el("hppHargaBulat").textContent = `Dibulatkan: ${window.formatRupiah(values.hargaJualBulat)}`;
  if (el("hppMarginDisplay"))
    el("hppMarginDisplay").textContent = `${values.margin}%`;
};
