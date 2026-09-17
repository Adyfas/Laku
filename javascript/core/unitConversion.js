/**
 * unitConversion.js — Utilitas Konversi Satuan Takaran (Berat, Volume, Hitungan)
 * Semua stok internal disimpan dalam SATUAN DASAR (gram / ml / pcs).
 * Konversi hanya dilakukan saat input & display. Presisi: 2 desimal.
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
    },
  },
};

/**
 * Round ke 2 desimal — mencegah floating point error (0.1 + 0.2 = 0.30000...4)
 */
function round2(value) {
  const num = Number(value);
  if (!isFinite(num)) return 0;
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

/**
 * Dapatkan grup satuan ("weight" | "volume" | "count") atau null jika tidak dikenal
 */
function getUnitGroup(unit) {
  if (!unit) return null;
  const u = String(unit).trim().toLowerCase();
  for (const [group, data] of Object.entries(UNIT_DEFINITIONS)) {
    if (data.units[u] !== undefined) return group;
  }
  return null;
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
  if (!unit) return null;
  const u = String(unit).trim().toLowerCase();
  const group = getUnitGroup(u);
  if (!group) return null;
  return UNIT_DEFINITIONS[group].units[u];
}

/**
 * Konversi nilai antar satuan dalam grup yang SAMA.
 * Rumus: base = nilai × faktorFrom → hasil = base / faktorTo
 * Return null jika satuan tidak kompatibel / tidak dikenal.
 */
function convertUnit(value, fromUnit, toUnit) {
  const num = Number(value);
  if (!isFinite(num)) return null;

  const fromGroup = getUnitGroup(fromUnit);
  const toGroup = getUnitGroup(toUnit);
  if (!fromGroup || !toGroup || fromGroup !== toGroup) return null;

  const fromFactor = getUnitFactor(fromUnit);
  const toFactor = getUnitFactor(toUnit);
  if (!fromFactor || !toFactor) return null;

  return round2((num * fromFactor) / toFactor);
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
  const u = String(unit).trim().toLowerCase();
  return [u, ...units.filter((x) => x !== u)];
}

/**
 * Label tampilan satuan yang rapi
 */
function formatUnitLabel(unit) {
  const map = {
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
    roll: "Roll",
    lembar: "Lembar",
    dosin: "Dosin",
    lusin: "Lusin",
  };
  if (!unit) return "Unit";
  const u = String(unit).trim().toLowerCase();
  return map[u] || unit;
}

/** Dapatkan semua satuan hitungan (count) */
function getCountUnits() {
  return Object.keys(UNIT_DEFINITIONS.count.units);
}

// Expose ke window agar bisa dipakai semua app script
window.LakuUnits = {
  UNIT_DEFINITIONS,
  round2,
  getUnitGroup,
  getBaseUnit,
  getUnitFactor,
  convertUnit,
  isUnitCompatible,
  getCompatibleUnits,
  formatUnitLabel,
  getCountUnits,
};
