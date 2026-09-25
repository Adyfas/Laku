/**
 * unitConversion.js — Utilitas satuan standar dan nested packaging.
 * Nilai inventory tetap memakai unit utama user; konversi dipakai sebagai
 * nilai kerja saat HPP, validasi stok, dan produksi.
 */

const UNIT_DEFINITIONS = {
  weight: {
    base: "gram",
    units: {
      kg: 1000,
      gram: 1,
      mg: 0.001,
    },
  },
  volume: {
    base: "ml",
    units: {
      liter: 1000,
      ml: 1,
    },
  },
  count: {
    base: "pcs",
    units: {
      pcs: 1,
      butir: 1,
      bungkus: 1,
      pack: 1,
      botol: 1,
      roll: 1,
      lembar: 1,
      dosin: 12,
      lusin: 144,
      dus: 1,
    },
  },
};

const UNIT_LABELS = {
  kg: "Kg",
  gram: "Gram",
  mg: "Mg",
  liter: "Liter",
  ml: "Ml",
  pcs: "Pcs",
  butir: "Butir",
  bungkus: "Bungkus",
  pack: "Pack",
  botol: "Botol",
  dus: "Dus",
  roll: "Roll",
  lembar: "Lembar",
  dosin: "Dosin",
  lusin: "Lusin",
};

const DISCRETE_UNITS = new Set([
  "pcs",
  "butir",
  "bungkus",
  "pack",
  "botol",
  "dus",
  "roll",
  "lembar",
  "dosin",
  "lusin",
]);

const PACKAGING_UNITS = new Set([
  "bungkus",
  "pack",
  "botol",
  "dus",
  "roll",
  "lembar",
]);

/**
 * Round ke 2 desimal — mencegah floating point error (0.1 + 0.2 = 0.30000...4)
 */
function round2(value) {
  const num = Number(value);
  if (!isFinite(num)) return 0;
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

/** Normalisasi nama unit agar semua modul memakai nilai yang sama. */
function normalizeUnit(unit) {
  return String(unit || "").trim().toLowerCase();
}

/**
 * Dapatkan grup satuan ("weight" | "volume" | "count") atau null jika tidak dikenal
 */
function getUnitGroup(unit) {
  const u = normalizeUnit(unit);
  if (!u) return null;
  for (const [group, data] of Object.entries(UNIT_DEFINITIONS)) {
    if (data.units[u] !== undefined) return group;
  }
  return null;
}

/** Alias yang lebih jelas untuk aturan bisnis dan modul baru. */
function getUnitFamily(unit) {
  return getUnitGroup(unit);
}

/**
 * Dapatkan satuan dasar dari sebuah satuan (mis. "kg" → "gram")
 * Return null jika satuan tidak dikenal
 */
function getBaseUnit(unit) {
  const group = getUnitGroup(unit);
  if (!group) return null;
  return UNIT_DEFINITIONS[group].base;
}

/**
 * Dapatkan faktor konversi satuan ke satuan dasar grupnya
 */
function getUnitFactor(unit) {
  const u = normalizeUnit(unit);
  if (!u) return null;
  const group = getUnitGroup(u);
  if (!group) return null;
  return UNIT_DEFINITIONS[group].units[u];
}

/**
 * Konversi nilai antar satuan dalam grup yang SAMA.
 * Rumus: base = nilai × faktorFrom → hasil = base / faktorTo
 * Return null jika satuan tidak kompatibel / tidak dikenal.
 */
function convertUnitExact(value, fromUnit, toUnit) {
  const num = Number(value);
  if (!isFinite(num)) return null;

  const from = normalizeUnit(fromUnit);
  const to = normalizeUnit(toUnit);
  if (from !== to && (PACKAGING_UNITS.has(from) || PACKAGING_UNITS.has(to))) {
    return null;
  }

  const fromGroup = getUnitGroup(from);
  const toGroup = getUnitGroup(to);
  if (!fromGroup || !toGroup || fromGroup !== toGroup) return null;

  const fromFactor = getUnitFactor(fromUnit);
  const toFactor = getUnitFactor(toUnit);
  if (!fromFactor || !toFactor) return null;

  return (num * fromFactor) / toFactor;
}

function convertUnit(value, fromUnit, toUnit) {
  const converted = convertUnitExact(value, fromUnit, toUnit);
  return converted === null ? null : round2(converted);
}

/**
 * Cek apakah dua satuan bisa dikonversi (satu grup)
 */
function isUnitCompatible(fromUnit, toUnit) {
  const a = getUnitGroup(fromUnit);
  const b = getUnitGroup(toUnit);
  return a !== null && b !== null && a === b;
}

/**
 * Daftar semua satuan yang kompatibel dengan satuan tertentu
 * Return: array string satuan, diurutkan (satuan asli paling depan)
 */
function getCompatibleUnits(unit) {
  const group = getUnitGroup(unit);
  if (!group) return unit ? [unit] : [];
  const units = Object.keys(UNIT_DEFINITIONS[group].units);
  const u = normalizeUnit(unit);
  if (group === "count" && PACKAGING_UNITS.has(u)) return [u];
  if (group === "count") {
    return [u, ...units.filter((candidate) =>
      !PACKAGING_UNITS.has(candidate) && candidate !== u
    )];
  }
  return [u, ...units.filter((x) => x !== u)];
}

/**
 * Label tampilan satuan yang rapi
 */
function formatUnitLabel(unit) {
  if (!unit) return "Unit";
  const u = normalizeUnit(unit);
  return UNIT_LABELS[u] || unit;
}

/** Dapatkan semua satuan hitungan (count) */
function getCountUnits() {
  return Object.keys(UNIT_DEFINITIONS.count.units);
}

/** Cek apakah unit secara default tidak boleh memakai pecahan. */
function isDiscreteUnit(unit) {
  return DISCRETE_UNITS.has(normalizeUnit(unit));
}

/** Cek angka quantity sesuai karakter unit atau izin item. */
function validateQuantity(value, unit, allowPartial = false) {
  const quantity = Number(value);
  if (!Number.isFinite(quantity) || quantity < 0) {
    return { valid: false, reason: "invalid" };
  }
  if (!allowPartial && isDiscreteUnit(unit) && !Number.isInteger(quantity)) {
    return { valid: false, reason: "fraction_not_allowed" };
  }
  return { valid: true, value: quantity };
}

/**
 * Buat peta rasio nested dari unit utama ke unit terdalam.
 * Contoh: dus -> bungkus (10), bungkus -> pcs (5) menghasilkan:
 * { dus: 1, bungkus: 10, pcs: 50 }.
 */
function getNestedUnitMap(item) {
  const outerUnit = normalizeUnit(item?.displayUnit || item?.satuan);
  const levels = Array.isArray(item?.nestedLevels) ? item.nestedLevels : [];
  const map = {};
  if (!outerUnit) return map;

  map[outerUnit] = 1;
  let ratio = 1;
  for (const level of levels) {
    const unit = normalizeUnit(level?.unit);
    const isi = Number(level?.isi);
    if (!unit || !Number.isFinite(isi) || isi <= 0 || map[unit] !== undefined) {
      return {};
    }
    ratio *= isi;
    map[unit] = ratio;
  }
  return map;
}

function getNestedUnit(item) {
  const map = getNestedUnitMap(item);
  const units = Object.keys(map);
  return units.length ? units[units.length - 1] : normalizeUnit(item?.displayUnit || item?.satuan);
}

function getNestedRatio(item) {
  const map = getNestedUnitMap(item);
  const innermost = getNestedUnit(item);
  return map[innermost] || 1;
}

/** Konversi quantity memakai rasio nested item bila tersedia. */
function convertNested(value, fromUnit, toUnit, item) {
  const from = normalizeUnit(fromUnit);
  const to = normalizeUnit(toUnit);
  const quantity = Number(value);
  if (!Number.isFinite(quantity) || !from || !to) return null;
  if (from === to) return quantity;

  const nestedMap = getNestedUnitMap(item);
  if (nestedMap[from] !== undefined && nestedMap[to] !== undefined) {
    return (quantity * nestedMap[to]) / nestedMap[from];
  }
  return convertUnitExact(quantity, from, to);
}

/** Konversi dari unit input ke unit kerja item. */
function toWorkingQuantity(item, value, inputUnit) {
  const workingUnit = getNestedUnit(item);
  return {
    value: convertNested(value, inputUnit, workingUnit, item),
    unit: workingUnit,
  };
}

/** Format quantity unit terdalam sebagai kemasan utuh + sisa isi. */
function formatInventoryQuantity(item, workingValue) {
  const value = Number(workingValue);
  if (!Number.isFinite(value)) return "-";

  const outerUnit = normalizeUnit(item?.displayUnit || item?.satuan);
  const nestedUnit = getNestedUnit(item);
  const ratio = getNestedRatio(item);
  if (!Array.isArray(item?.nestedLevels) || item.nestedLevels.length === 0) {
    return `${round2(value)} ${formatUnitLabel(outerUnit)}`;
  }

  const outerValue = Math.floor(value / ratio);
  const looseValue = round2(value - outerValue * ratio);
  const parts = [];
  if (outerValue > 0) parts.push(`${outerValue} ${formatUnitLabel(outerUnit)}`);
  if (looseValue > 0 || parts.length === 0) {
    parts.push(`${looseValue} ${formatUnitLabel(nestedUnit)}`);
  }
  return parts.join(" + ");
}

// Expose ke window agar bisa dipakai semua app script
window.LakuUnits = {
  UNIT_DEFINITIONS,
  UNIT_LABELS,
  round2,
  normalizeUnit,
  getUnitGroup,
  getUnitFamily,
  getBaseUnit,
  getUnitFactor,
  convertUnitExact,
  convertUnit,
  isUnitCompatible,
  getCompatibleUnits,
  formatUnitLabel,
  getCountUnits,
  isDiscreteUnit,
  validateQuantity,
  getNestedUnitMap,
  getNestedUnit,
  getNestedRatio,
  convertNested,
  toWorkingQuantity,
  formatInventoryQuantity,
};
