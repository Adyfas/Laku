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
window.getRawNumber = function (valOrElement) {
  if (!valOrElement) return 0;
  const str =
    typeof valOrElement === "string" || typeof valOrElement === "number"
      ? valOrElement.toString()
      : valOrElement.value || "";
  const clean = str.replace(/\./g, "").replace(/\D/g, "");
  return parseFloat(clean) || 0;
};

window.NumberDecimal3Digit = function (input) {
  return window.formatNumberInput(input);
};

window.formatRupiah = function (num) {
  if (!num || num < 0 || isNaN(num) || !isFinite(num)) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(num);
};

window.roundToNearest = function (num, nearest = 100) {
  if (!num || num <= 0) return 0;
  return Math.ceil(num / nearest) * nearest;
};

window.debounce = function (func, wait) {
  let timeout;
  return function (...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
};
