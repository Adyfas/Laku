/**
 * hppCalc.js — Calculation engine & overhead management for HPP Kalkulator
 * Handles the main HPP calculation (bahan + tenaga + overhead + kemasan + margin → HPP per unit → harga jual),
 * plus rendering and adding overhead items.
 *
 * All functions attach to window.LakuHpp namespace.
 * Uses window.formatRupiah() and window.roundToNearest() from appUtils.js (no local versions).
 */

/** Render overhead list with remove handlers */
window.LakuHpp.renderOverhead = function () {
  const list = document.getElementById("hppOverheadList");
  if (!list) return;

  if (window.LakuHpp.overheadItems.length === 0) {
    list.innerHTML = `
      <div class="text-center py-3 text-amber-700/60 text-xs">Kosong — isi kalau ada biaya lain.</div>
    `;
  } else {
    list.innerHTML = window.LakuHpp.overheadItems
      .map(
        (item, i) => `
          <div class="flex items-center justify-between bg-white p-3 rounded-xl border border-amber-200/50">
            <div class="flex items-center gap-2">
              <span class="text-sm font-medium text-gray-700">${item.nama}</span>
              <span class="text-sm font-bold text-amber-800">${window.formatRupiah(item.biaya)}</span>
            </div>
            <button data-remove-ovh="${i}" class="text-rose-400 hover:text-rose-600 font-bold text-xs cursor-pointer transition-colors" title="Hapus">${window.LakuIcons.svg("closeCircle", "0.85em")}</button>
          </div>
        `
      )
      .join("");
  }

  // Bind remove buttons
  list.querySelectorAll("[data-remove-ovh]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.getAttribute("data-remove-ovh"));
      window.LakuHpp.overheadItems.splice(idx, 1);
      window.LakuHpp.renderOverhead();
    });
  });
};

/** Add an overhead item from the input fields */
window.LakuHpp.addOverhead = function () {
  const namaInput = document.getElementById("hppOverheadNama");
  const biayaInput = document.getElementById("hppOverheadBiaya");
  if (!namaInput || !biayaInput) return;

  const nama = namaInput.value.trim();
  const biaya = window.getRawNumber(biayaInput);

  if (!nama || biaya <= 0) return;

  window.LakuHpp.overheadItems.push({ nama, biaya });
  namaInput.value = "";
  biayaInput.value = "";
  window.LakuHpp.renderOverhead();
};

/** Main calculation: total bahan + tenaga + overhead + kemasan + margin → HPP per unit → harga jual */
window.LakuHpp.calculateAll = function () {
  // Total bahan
  const totalBahan = window.LakuHpp.ingredients.reduce(
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
    if (tenagaValue) tenagaValue.textContent = window.formatRupiah(totalTenaga);
  } else {
    if (tenagaDisplay) tenagaDisplay.classList.add("hidden");
  }

  // Overhead
  const totalOverhead = window.LakuHpp.overheadItems.reduce(
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
  const hargaBulat = window.roundToNearest(hargaJual, 100);

  // Update summary displays
  const el = (id) => document.getElementById(id);
  if (el("hppRingkasanBahan"))
    el("hppRingkasanBahan").textContent = window.formatRupiah(totalBahan);
  if (el("hppRingkasanTenaga"))
    el("hppRingkasanTenaga").textContent = window.formatRupiah(totalTenaga);
  if (el("hppRingkasanOverhead"))
    el("hppRingkasanOverhead").textContent = window.formatRupiah(totalOverhead);
  if (el("hppRingkasanKemasan"))
    el("hppRingkasanKemasan").textContent = window.formatRupiah(biayaKemasan);
  if (el("hppRingkasanTotal"))
    el("hppRingkasanTotal").textContent = window.formatRupiah(totalBiaya);
  if (el("hppRingkasanHpp"))
    el("hppRingkasanHpp").textContent = window.formatRupiah(hppPerUnit);
  if (el("hppRingkasanSatuan"))
    el("hppRingkasanSatuan").textContent = satuan;
  if (el("hppHargaJual"))
    el("hppHargaJual").textContent = window.formatRupiah(hargaJual);
  if (el("hppHargaBulat"))
    el("hppHargaBulat").textContent = `Dibulatkan: ${window.formatRupiah(hargaBulat)}`;
  if (el("hppMarginDisplay"))
    el("hppMarginDisplay").textContent = `${margin}%`;
};
