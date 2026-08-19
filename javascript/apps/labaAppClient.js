/**
 * labaAppClient.js - Logika Interaktif Simulasi Proyeksi Laba Rugi
 */
function initLabaAppLogic() {
  const form = document.getElementById("labaForm");
  if (!form) return;

  const formatRupiah = (num) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);
  };

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
      bepUnit = "N/A (Harga < HPP Variabel)";
    }

    document.getElementById("resTotalOmzet").textContent = formatRupiah(totalOmzet);
    document.getElementById("resTotalVariabel").textContent = formatRupiah(totalBiayaVariabel);
    document.getElementById("resTotalTetap").textContent = formatRupiah(totalBiayaTetap);
    document.getElementById("resLabaBersih").textContent = formatRupiah(labaBersih);
    document.getElementById("resBepUnit").textContent = typeof bepUnit === "number" ? `${bepUnit} Unit` : bepUnit;

    const statusBox = document.getElementById("labaStatusBox");
    const statusBadge = document.getElementById("resLabaStatus");
    const advice = document.getElementById("resLabaAdvice");

    if (labaBersih > 0) {
      statusBox.className = "p-6 rounded-2xl border border-emerald-200 bg-emerald-50 text-center";
      statusBadge.className = "text-2xl font-extrabold text-emerald-700 my-1";
      statusBadge.textContent = "USAHA PROSPEKTIF / UNTUNG";
      advice.textContent = `Bagus! Target ${totalQty} unit/bulan menghasilkan keuntungan bersih yang memadai.`;
    } else if (labaBersih === 0) {
      statusBox.className = "p-6 rounded-2xl border border-amber-200 bg-amber-50 text-center";
      statusBadge.className = "text-2xl font-extrabold text-amber-700 my-1";
      statusBadge.textContent = "BEP / BALIK MODAL";
      advice.textContent = `Usaha Anda berada di titik impas. Tingkatkan penjualan atau kurangi biaya tetap untuk mendapatkan profit.`;
    } else {
      statusBox.className = "p-6 rounded-2xl border border-rose-200 bg-rose-50 text-center";
      statusBadge.className = "text-2xl font-extrabold text-rose-700 my-1";
      statusBadge.textContent = "PROYEKSI RUGI";
      advice.textContent = `Perhatian! Hasil menunjukkan pengeluaran melampaui omzet. Evaluasi modal bahan atau harga jual Anda.`;
    }

    const resultBox = document.getElementById("labaResult");
    if (resultBox) resultBox.classList.remove("hidden");
  });
}

function renderLabaApp(container) {
  if (!container) return;
  container.innerHTML = getLabaAppUI();
  initLabaAppLogic();
}
