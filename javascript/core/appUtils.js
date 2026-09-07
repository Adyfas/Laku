/**
 * appUtils.js — Utilitas bersama yang dipakai di semua modul Laku
 * Format angka, rupiah, dan pembulatan.
 * Dimuat SEBELUM semua file apps/ di app.html.
 */

/** Format angka dengan titik sebagai pemisah ribuan (contoh: 50000 → "50.000") */
window.formatNumberInput = function (input) {
  if (!input) return;
  let oldVal = input.value;
  let raw = oldVal.replace(/\D/g, "");
  if (!raw) {
    input.value = "";
    return;
  }
  let formatted = raw.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  input.value = formatted;
};

/** Ambil angka mentah dari input yang sudah diformat (contoh: "50.000" → 50000) */
window.getRawNumber = function (valOrElement) {
  if (!valOrElement) return 0;
  const str =
    typeof valOrElement === "string" || typeof valOrElement === "number"
      ? valOrElement.toString()
      : valOrElement.value || "";
  const clean = str.replace(/\./g, "").replace(/\D/g, "");
  return parseFloat(clean) || 0;
};

/** Alias: formatNumberInput juga bisa dipanggil sebagai NumberDecimal3Digit */
window.NumberDecimal3Digit = function (input) {
  return window.formatNumberInput(input);
};

/** Format angka ke string Rupiah (contoh: 50000 → "Rp 50.000") */
window.formatRupiah = function (num) {
  if (!num || num < 0 || isNaN(num) || !isFinite(num)) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(num);
};

/** Pembulatan ke kelipatan terdekat (contoh: 3791 → 3800 jika nearest=100) */
window.roundToNearest = function (num, nearest = 100) {
  if (!num || num <= 0) return 0;
  return Math.ceil(num / nearest) * nearest;
};
