/**
 * labaClient.js — Logika Interaktif Cek Untung Rugi Bulanan UMKM
 * Menggunakan window.formatRupiah() dari core/appUtils.js
 */
function initLabaAppLogic() {
  const form = document.getElementById("labaForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const totalQty = window.getRawNumber(document.getElementById("labaQty"));
    const hargaJual = window.getRawNumber(document.getElementById("labaHarga"));
    const biayaVariabelPerUnit = window.getRawNumber(document.getElementById("labaVariabel"));
    const totalBiayaTetap = window.getRawNumber(document.getElementById("labaTetap"));

    const totalOmzet = totalQty * hargaJual;
    const totalBiayaVariabel = totalQty * biayaVariabelPerUnit;
    const totalBiayaKeseluruhan = totalBiayaVariabel + totalBiayaTetap;
    const labaBersih = totalOmzet - totalBiayaKeseluruhan;

    const marginPerUnit = hargaJual - biayaVariabelPerUnit;
    let bepUnit = 0;
    if (marginPerUnit > 0) {
      bepUnit = Math.ceil(totalBiayaTetap / marginPerUnit);
    } else {
      bepUnit = "N/A (harga jual lebih murah dari modal bahan)";
    }

    document.getElementById("resTotalOmzet").textContent = window.formatRupiah(totalOmzet);
    document.getElementById("resTotalVariabel").textContent = window.formatRupiah(totalBiayaVariabel);
    document.getElementById("resTotalTetap").textContent = window.formatRupiah(totalBiayaTetap);
    document.getElementById("resLabaBersih").textContent = window.formatRupiah(labaBersih);
    document.getElementById("resBepUnit").textContent = typeof bepUnit === "number" ? `${bepUnit} Unit` : bepUnit;

    const statusBox = document.getElementById("labaStatusBox");
    const statusBadge = document.getElementById("resLabaStatus");
    const advice = document.getElementById("resLabaAdvice");

    if (labaBersih > 0) {
      statusBox.className = "p-6 rounded-2xl border border-emerald-200 bg-emerald-50 text-center";
      statusBadge.className = "text-2xl font-extrabold text-emerald-700 my-1";
      statusBadge.textContent = "USAHA UNTUNG";
      advice.textContent = `Bagus! Jualan ${totalQty} sebulan bisa dapat untung yang lumayan.`;
    } else if (labaBersih === 0) {
      statusBox.className = "p-6 rounded-2xl border border-amber-200 bg-amber-50 text-center";
      statusBadge.className = "text-2xl font-extrabold text-amber-700 my-1";
      statusBadge.textContent = "BALIK MODAL SAJA";
      advice.textContent = `Jualan pas balik modal. Mesti jual lebih banyak atau kurangi biaya biar untung.`;
    } else {
      statusBox.className = "p-6 rounded-2xl border border-rose-200 bg-rose-50 text-center";
      statusBadge.className = "text-2xl font-extrabold text-rose-700 my-1";
      statusBadge.textContent = "RUGI";
      advice.textContent = `Waduh, pengeluaran lebih besar dari uang masuk. Coba turunkan modal bahan atau naikkan harga jual.`;
    }

    const resultBox = document.getElementById("labaResult");
    if (resultBox) resultBox.classList.remove("hidden");

    try {
      const historyRaw = localStorage.getItem("laku_laba_data");
      const history = historyRaw ? JSON.parse(historyRaw) : [];
      const cleanHistory = Array.isArray(history) ? history : [];
      cleanHistory.unshift({
        totalQty,
        hargaJual,
        biayaVariabelPerUnit,
        totalBiayaTetap,
        totalOmzet,
        totalBiayaKeseluruhan,
        labaBersih,
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem("laku_laba_data", JSON.stringify(cleanHistory.slice(0, 50)));
    } catch (saveErr) {}
  });
}

/** Entry point: render template + init logic */
function renderLabaApp(container) {
  if (!container) return;
  container.innerHTML = getLabaAppUI();
  initLabaAppLogic();
}
