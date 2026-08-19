/**
 * hppAppClient.js - Logika Interaktif Kalkulator HPP
 */
function initHppAppLogic() {
  const form = document.getElementById("hppForm");
  if (!form) return;

  const formatRupiah = (number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(number);
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const bahan = window.getRawNumber(document.getElementById("hppBahan"));
    const ops = window.getRawNumber(document.getElementById("hppOps"));
    const margin = window.getRawNumber(document.getElementById("hppMargin"));

    const totalHpp = bahan + ops;
    const profitTarget = totalHpp * (margin / 100);
    const hargaJual = totalHpp + profitTarget;

    document.getElementById("resTotalHpp").textContent = formatRupiah(totalHpp);
    document.getElementById("resHargaJual").textContent = formatRupiah(hargaJual);
    document.getElementById("resProfitBersih").textContent = formatRupiah(profitTarget);

    const resultBox = document.getElementById("hppResult");
    if (resultBox) resultBox.classList.remove("hidden");
  });
}

function renderHppApp(container) {
  if (!container) return;
  container.innerHTML = getHppAppUI();
  initHppAppLogic();
}
