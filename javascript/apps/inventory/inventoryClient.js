/**
 * inventoryClient.js — Logika Inventory UMKM (CRUD stok, migrasi satuan, alert)
 */
function initInventoryAppLogic() {
  const INV_STORAGE_KEY = "laku_inventory_data";
  const INVENTORY_SCHEMA_VERSION = 2;

  const U = window.LakuUnits;

  /** Ambil data inventory dari localStorage, jalankan migrasi jika perlu */
  const loadInventoryData = () => {
    const raw = localStorage.getItem(INV_STORAGE_KEY);
    return raw ? migrateInventoryData(JSON.parse(raw)) : [];
  };

  /** Simpan data inventory ke localStorage */
  const saveInventoryData = (data) => {
    localStorage.setItem(INV_STORAGE_KEY, JSON.stringify(data));
  };

  // === LakuInventory namespace for inline edit (must be defined before renderTable) ===
  window.LakuInventory = {
    editingItemId: null,
    editingItemDraft: null,

    /** Start inline editing an inventory item */
    startEditItem(id, draft) {
      // Cancel any existing edit
      if (this.editingItemId && this.editingItemId !== id) {
        this.cancelInlineEditItem(this.editingItemId);
      }

      const currentData = loadInventoryData();
      const item = currentData.find((it) => it.id === id);
      if (!item) return;

      const normalizedItem = normalizeInventoryItem(item);

      this.editingItemId = id;
      this.editingItemDraft = draft || {
        nama: normalizedItem.nama,
        kategori: normalizedItem.kategori,
        harga: normalizedItem.harga,
        satuan: normalizedItem.satuan,
        stok: Number(normalizedItem.stok || 0),
        minStok: Number(normalizedItem.minStok || 0),
        nestedLevels: normalizedItem.nestedLevels || [],
      };
      pagination.refresh();
    },

    /** Update inline edit draft */
    updateEditDraft(id, updates) {
      if (this.editingItemId !== id) return;
      this.editingItemDraft = {
        ...this.editingItemDraft,
        ...updates,
      };
    },

    /** Save inline edited item with confirmation */
    async saveInlineEditItem(id) {
      if (this.editingItemId !== id || !this.editingItemDraft) return;

      const draft = this.editingItemDraft;

      // Validate required fields
      if (!draft.nama || draft.nama.trim() === "") {
        window.showAlert({ type: "warning", title: "Nama Kosong", message: "Nama barang tidak boleh kosong." });
        return;
      }
      if (draft.stok === undefined || draft.stok < 0) {
        window.showAlert({ type: "warning", title: "Stok Tidak Valid", message: "Jumlah stok harus 0 atau lebih." });
        return;
      }
      if (draft.harga === undefined || draft.harga < 0) {
        window.showAlert({ type: "warning", title: "Harga Tidak Valid", message: "Harga beli tidak boleh negatif." });
        return;
      }

      // Confirm before saving
      const ok = await window.showCustomConfirm({
        title: "Simpan Perubahan?",
        message: `Yakin ingin menyimpan perubahan untuk "${draft.nama}"?`,
        confirmText: "Ya, Simpan",
        cancelText: "Batal",
      });

      if (!ok) return;

      // Apply changes
      const currentData = loadInventoryData();
      const idx = currentData.findIndex((it) => it.id === id);
      if (idx === -1) return;

      const oldItem = currentData[idx];
      const displayUnit = draft.satuan || oldItem.satuan || "pcs";
      const baseUnit = U.getBaseUnit(displayUnit) || displayUnit;

      currentData[idx] = {
        ...oldItem,
        schemaVersion: INVENTORY_SCHEMA_VERSION,
        nama: draft.nama.trim(),
        kategori: draft.kategori || oldItem.kategori,
        satuan: displayUnit,
        displayUnit,
        baseUnit,
        storageUnit: displayUnit,
        harga: draft.harga,
        stok: Math.max(0, U.round2(draft.stok)),
        minStok: Math.max(0, U.round2(draft.minStok || 0)),
        // Update nestedLevels from draft (filter out invalid entries)
        nestedLevels: (draft.nestedLevels || [])
          .map((level) => ({
            unit: U.normalizeUnit(level?.unit),
            isi: Math.max(1, Number(level?.isi || 1)),
          }))
          .filter((level) => level.unit && Number.isFinite(level.isi)),
        looseQty: oldItem.looseQty || 0,
      };

      saveInventoryData(currentData);
      window.dispatchEvent(new CustomEvent("laku-inventory-updated"));

      // Reset edit state
      this.editingItemId = null;
      this.editingItemDraft = null;
      pagination.refresh();
    },

    /** Cancel inline editing */
    cancelInlineEditItem(id) {
      if (this.editingItemId !== id) return;
      this.editingItemId = null;
      this.editingItemDraft = null;
      pagination.refresh();
    },
  };

  /** Render nested levels for inline edit */
  const renderEditNestingLevels = (item, draft, view = "desktop") => {
    const nestedLevels = draft.nestedLevels || item.nestedLevels || [];
    const countUnits = window.LakuUnits.getCountUnits ? window.LakuUnits.getCountUnits() : ["pcs", "bungkus", "pack", "botol", "roll", "lembar", "dosin", "lusin", "dus"];

    const createLevelRow = (level, index) => {
      const unitOptions = countUnits.map(u => `<option value="${u}" ${level.unit === u ? "selected" : ""}>${window.LakuUnits.formatUnitLabel(u)}</option>`).join("");
      return `
        <div class="nesting-edit-row flex gap-2 items-center" data-nesting-index="${index}">
          <select class="nesting-edit-unit w-1/2 bg-white text-black-main font-medium py-2 px-3 rounded-xl outline-none border border-gray-200 focus:border-blue-500 text-sm" data-edit-nesting-unit="${item.id}" required>
            <option value="">— Pilih Satuan —</option>
            ${unitOptions}
          </select>
          <input type="number" class="nesting-edit-isi w-1/2 bg-white text-black-main font-medium py-2 px-3 rounded-xl outline-none border border-gray-200 focus:border-blue-500 text-sm" placeholder="Isi (angka)" min="1" value="${level.isi}" data-edit-nesting-isi="${item.id}" required />
          <button type="button" class="remove-nesting-edit text-rose-400 hover:text-rose-600 font-bold text-sm cursor-pointer" title="Hapus level">${window.LakuIcons.svg("closeCircle", "0.9em")}</button>
        </div>
      `;
    };

    const sectionId = `nestingSection-${item.id}-${view}`;
    const containerId = `nestingContainer-${item.id}-${view}`;

    let html = `
      <div class="border-t border-gray-200 pt-3 mt-3" data-nesting-section="${sectionId}" data-nesting-item="${item.id}" data-nesting-view="${view}">
        <label class="block text-xs font-semibold text-gray-600 mb-2">Isi per Kemasan (Anakan)</label>
        <p class="text-[11px] text-gray-400 mb-2">Contoh: 1 dus = 10 pack, 1 pack = 12 pcs. Kosongkan jika tidak ada kemasan bertingkat.</p>
        <div id="${containerId}" class="space-y-2" data-nesting-container>
    `;

    nestedLevels.forEach((level, index) => {
      html += createLevelRow(level, index);
    });

    html += `
        </div>
        <button type="button" class="add-nesting-edit text-xs text-[#274c43] font-bold cursor-pointer hover:text-[#1f3d36] transition-colors mt-2" data-add-nesting="${item.id}">
          + Tambah Level Anakan
        </button>
      </div>
    `;

    return html;
  };
  const formatQty = (num) => {
    const n = U.round2(num);
    return parseFloat(n.toFixed(2)).toString();
  };

  /** Normalisasi data inventory ke schema unit utama + sisa isi. */
  const normalizeInventoryItem = (item) => {
    const displayUnit = String(item?.displayUnit || item?.satuan || "pcs").trim().toLowerCase();
    const baseUnit = String(item?.baseUnit || U.getBaseUnit(displayUnit) || displayUnit).trim().toLowerCase();

    const normalizeQty = (value) => {
      const num = Number(value);
      return Number.isFinite(num) ? num : 0;
    };

    const rawStok = normalizeQty(item?.stok ?? 0);
    const rawMin = normalizeQty(item?.minStok ?? 0);

    const nestedLevels = Array.isArray(item?.nestedLevels)
      ? item.nestedLevels.map((level) => ({
          unit: U.normalizeUnit(level?.unit || level?.satuan),
          isi: Math.max(1, Number(level?.isi || 1)),
        })).filter((level) => level.unit && Number.isFinite(level.isi))
      : [];

    const normalizedItem = {
      ...item,
      schemaVersion: INVENTORY_SCHEMA_VERSION,
      nama: item?.nama || "Barang",
      kategori: item?.kategori || "Umum",
      satuan: displayUnit,
      displayUnit,
      baseUnit,
      storageUnit: displayUnit,
      stok: Math.max(0, rawStok),
      minStok: Math.max(0, rawMin),
      looseQty: Math.max(0, normalizeQty(item?.looseQty ?? 0)),
      nestedLevels,
    };

    // Versi sebelum schema v2 menyimpan stok dalam base/isi terdalam.
    // Karena kontraknya diketahui, migrasi dilakukan berdasarkan versi, bukan besar angka.
    if ((item?.schemaVersion || 1) < INVENTORY_SCHEMA_VERSION) {
      const legacyUnit = nestedLevels.length > 0
        ? U.getNestedUnit(normalizedItem)
        : U.normalizeUnit(item?.storageUnit || baseUnit);
      const legacyValue = rawStok + normalizeQty(item?.looseQty ?? 0);
      const displayValue = nestedLevels.length > 0
        ? U.convertNested(legacyValue, legacyUnit, displayUnit, normalizedItem)
        : U.convertUnitExact(legacyValue, legacyUnit, displayUnit);

      if (Number.isFinite(displayValue)) {
        normalizedItem.stok = Math.max(0, displayValue);
        normalizedItem.looseQty = 0;
      }
    }

    return normalizedItem;
  };

  const migrateInventoryData = (data) => {
    const migrated = Array.isArray(data) ? data.map(normalizeInventoryItem) : [];
    const changed = JSON.stringify(migrated) !== JSON.stringify(data || []);
    if (changed) saveInventoryData(migrated);
    return migrated;
  };

  // Filter function for Inventory (uses U and normalizeInventoryItem)
  const invFilterFn = (item, state) => {
    // Search filter
    if (state.searchTerm && item.nama.toLowerCase().indexOf(state.searchTerm.toLowerCase()) === -1) {
      return false;
    }

    // Status filter
    if (state.statusFilter !== "all") {
      const normalizedItem = normalizeInventoryItem(item);
      const workingStock = U.toWorkingQuantity(
        normalizedItem,
        normalizedItem.stok,
        normalizedItem.displayUnit
      ).value + normalizedItem.looseQty;
      const workingMinimum = U.toWorkingQuantity(
        normalizedItem,
        normalizedItem.minStok,
        normalizedItem.displayUnit
      ).value;
      const isKosong = workingStock <= 0;
      const isTipis = !isKosong && workingStock <= workingMinimum;

      if (state.statusFilter === "aman" && !(!isKosong && !isTipis)) {
        return false;
      }
      if (state.statusFilter === "tipis" && !isTipis) {
        return false;
      }
      if (state.statusFilter === "habis" && !isKosong) {
        return false;
      }
    }

    return true;
  };

  // Initialize shared pagination controller
  const pagination = window.LakuPagination.createPaginationController({
    storageKey: "laku_inventory_ui_state",
    getData: loadInventoryData,
    filterFn: invFilterFn,
    elements: {
      searchInput: "invSearchInput",
      statusFilter: "invStatusFilter",
      pageSizeSelect: "invPageSizeSelect",
      prevPage: "invPrevPage",
      nextPage: "invNextPage",
      currentPage: "invCurrentPage",
      totalPages: "invTotalPages",
      startIndex: "invStartIndex",
      endIndex: "invEndIndex",
      totalCount: "invTotalCount",
      paginationContainer: "invPagination",
      clearFilters: "invClearFilters",
    },
    onChange: (items, pagination) => renderTable(items, pagination),
    defaultPageSize: 10,
    debounceMs: 300,
  });

  /** Render nesting levels fields in the form */
  const renderNestingFields = (levels = []) => {
    const container = document.getElementById("invNestingLevels");
    const addBtn = document.getElementById("invAddNestingLevel");
    if (!container || !addBtn) return;

    const countUnits = window.LakuUnits.getCountUnits ? window.LakuUnits.getCountUnits() : ["pcs", "bungkus", "pack", "botol", "roll", "lembar", "dosin", "lusin", "dus"];

    const createLevelRow = (unit = "", isi = "") => {
      const row = document.createElement("div");
      row.className = "nesting-row flex gap-2 items-center";
      row.innerHTML = `
        <select class="nesting-unit w-1/2 bg-[#f5f5f5] text-black-main font-medium py-2 px-3 rounded-xl outline-none border border-transparent focus:border-[#274c43] text-sm" required>
          <option value="">— Pilih Satuan —</option>
          ${countUnits.map(u => `<option value="${u}" ${u === unit ? "selected" : ""}>${window.LakuUnits.formatUnitLabel(u)}</option>`).join("")}
        </select>
        <input type="number" class="nesting-isi w-1/2 bg-[#f5f5f5] text-black-main font-medium py-2 px-3 rounded-xl outline-none border border-transparent focus:border-[#274c43] text-sm" placeholder="Isi (angka)" min="1" value="${isi}" required />
        <button type="button" class="remove-nesting text-rose-400 hover:text-rose-600 font-bold text-sm cursor-pointer" title="Hapus level">${window.LakuIcons.svg("closeCircle", "0.9em")}</button>
      `;
      row.querySelector(".remove-nesting").addEventListener("click", () => {
        row.remove();
      });
      return row;
    };

    // Render existing levels
    levels.forEach(l => container.appendChild(createLevelRow(l.unit, l.isi)));

    // Add level button
    addBtn.addEventListener("click", () => {
      container.appendChild(createLevelRow());
    });
  };

  // Form Submit Handler — tambah barang baru ke inventaris
  const form = document.getElementById("inventoryForm");
  if (form) {
    // Initialize nesting fields (empty for new items)
    renderNestingFields([]);

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const nama = document.getElementById("invNama").value.trim();
      const kategori = document.getElementById("invKategori").value;
      const harga = window.getRawNumber(document.getElementById("invHarga"));
      const stok = parseFloat(document.getElementById("invStok").value) || 0;
      const minStok = parseFloat(document.getElementById("invMinStok").value) || 0;

      if (!nama || harga < 0 || stok < 0) return;

      const satuan = document.getElementById("invSatuan")?.value || "pcs";

      // Collect nesting levels
      const nestedLevels = [];
      document.querySelectorAll("#invNestingLevels .nesting-row").forEach(row => {
        const unit = row.querySelector(".nesting-unit").value;
        const isi = parseInt(row.querySelector(".nesting-isi").value);
        if (unit && isi && isi > 0) nestedLevels.push({ unit, isi });
      });

      // Calculate cumulative isi for stock conversion
      const newItem = {
        id: Date.now(),
        nama,
        kategori,
        satuan,
        displayUnit: satuan,
        baseUnit: U.getBaseUnit(satuan) || satuan,
        schemaVersion: INVENTORY_SCHEMA_VERSION,
        storageUnit: satuan,
        harga,
        stok: Math.max(0, Number(stok) || 0),
        minStok: Math.max(0, Number(minStok) || 0),
        looseQty: 0,
        ...(nestedLevels.length > 0 ? { nestedLevels } : {}),
      };

      const currentData = loadInventoryData();
      currentData.unshift(newItem);
      saveInventoryData(currentData);
      window.dispatchEvent(new CustomEvent("laku-inventory-updated"));

      form.reset();
      // Reset nesting fields
      const container = document.getElementById("invNestingLevels");
      if (container) container.innerHTML = "";
      pagination.refresh();
    });
  }

  /** Render seluruh tabel desktop & kartu mobile, serta update overview cards */
  const renderTable = (paginatedItems) => {
    const allData = loadInventoryData();
    const data = paginatedItems || allData;
    const tbody = document.getElementById("inventoryTableBody");
    const mobileList = document.getElementById("inventoryMobileList");

    // Overview cards dihitung dari SEMUA data (bukan hasil filter/pagination)
    let totalItemsCount = allData.length;
    let lowStockCount = 0;
    let emptyStockCount = 0;

    allData.forEach((item) => {
      const normalizedItem = normalizeInventoryItem(item);
      const workingStock = U.toWorkingQuantity(
        normalizedItem,
        normalizedItem.stok,
        normalizedItem.displayUnit
      ).value + normalizedItem.looseQty;
      const workingMinimum = U.toWorkingQuantity(
        normalizedItem,
        normalizedItem.minStok,
        normalizedItem.displayUnit
      ).value;
      const isKosong = workingStock <= 0;
      const isTipis = !isKosong && workingStock <= workingMinimum;
      if (isKosong) emptyStockCount++;
      else if (isTipis) lowStockCount++;
    });

    if (data.length === 0) {
      if (tbody) {
        tbody.innerHTML = `
          <tr>
            <td colspan="5" class="py-8 text-center text-gray-400 text-sm">
              Belum ada barang di inventaris. Tambahkan barang pertama Anda di atas!
            </td>
          </tr>
        `;
      }
      if (mobileList) {
        mobileList.innerHTML = `
          <div class="py-8 text-center text-gray-400 text-sm bg-stone-50 rounded-2xl">
            Belum ada barang di inventaris. Tambahkan barang pertama Anda di atas!
          </div>
        `;
      }
    } else {
      // Build Desktop Rows & Mobile Cards
      let desktopHtml = "";
      let mobileHtml = "";

      data.forEach((item) => {
        const normalizedItem = normalizeInventoryItem(item);
      const workingUnit = U.getNestedUnit(normalizedItem);
        const workingStock = U.toWorkingQuantity(
          normalizedItem,
          normalizedItem.stok,
          normalizedItem.displayUnit
        ).value + normalizedItem.looseQty;
        const workingMinimum = U.toWorkingQuantity(
          normalizedItem,
          normalizedItem.minStok,
          normalizedItem.displayUnit
        ).value;
        const isKosong = workingStock <= 0;
        const isTipis = !isKosong && workingStock <= workingMinimum;

        const displayUnit = normalizedItem.displayUnit || normalizedItem.satuan || "pcs";
        const stokDisplay = normalizedItem.nestedLevels.length > 0
          ? U.formatInventoryQuantity(normalizedItem, workingStock)
          : `${formatQty(Number(normalizedItem.stok || 0))} ${window.LakuUnits.formatUnitLabel(displayUnit)}`;
        const minDisplay = formatQty(Number(normalizedItem.minStok || 0));

        let statusBadge = "";
        if (isKosong) {
          statusBadge = `<span class="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">Habis</span>`;
        } else if (isTipis) {
          statusBadge = `<span class="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">Stok Tipis</span>`;
        } else {
          statusBadge = `<span class="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">Aman</span>`;
        }

        const nestingInfo = normalizedItem.nestedLevels && normalizedItem.nestedLevels.length > 0
          ? normalizedItem.nestedLevels.reduce((parts, level, index) => {
              const parentUnit = index === 0
                ? displayUnit
                : normalizedItem.nestedLevels[index - 1].unit;
              parts.push(`1 ${window.LakuUnits.formatUnitLabel(parentUnit)} = ${level.isi} ${window.LakuUnits.formatUnitLabel(level.unit)}`);
              return parts;
            }, []).join(" → ")
          : null;

        // Check if this item is being edited
        const isEditing = window.LakuInventory.editingItemId === normalizedItem.id;
        const draft = window.LakuInventory.editingItemDraft || {};

        const categories = ["Bahan Baku Utama", "Kemasan / Packaging", "Produk Jadi / Jualan", "Perlengkapan Usaha"];
        const categoryOptions = categories.map(c => `<option value="${c}" ${draft.kategori === c || (!draft.kategori && normalizedItem.kategori === c) ? "selected" : ""}>${c}</option>`).join("");

        const units = ["pcs", "kg", "gram", "liter", "ml", "butir", "bungkus", "pack", "botol", "dus", "lusin", "roll", "lembar", "dosin"];
        const unitOptions = units.map(u => `<option value="${u}" ${draft.satuan === u || (!draft.satuan && normalizedItem.satuan === u) ? "selected" : ""}>${window.LakuUnits.formatUnitLabel(u)}</option>`).join("");

        if (isEditing) {
          // Inline edit mode
          const editRow = `
            <tr class="bg-blue-50">
              <td colspan="5" class="py-4 px-4">
                <div class="space-y-3">
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label class="block text-xs font-semibold text-gray-600 mb-1">Nama Barang</label>
                      <input type="text" data-edit-nama="${normalizedItem.id}" value="${draft.nama ?? normalizedItem.nama}" class="w-full bg-white text-black-main font-medium py-2 px-3 rounded-xl outline-none border border-gray-200 focus:border-blue-500 text-sm" required />
                    </div>
                    <div>
                      <label class="block text-xs font-semibold text-gray-600 mb-1">Kategori</label>
                      <select data-edit-kategori="${normalizedItem.id}" class="w-full bg-white text-black-main font-medium py-2 px-3 rounded-xl outline-none border border-gray-200 focus:border-blue-500 text-sm">
                        ${categoryOptions}
                      </select>
                    </div>
                  </div>
                  <div class="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <label class="block text-xs font-semibold text-gray-600 mb-1">Harga Beli (Rp)</label>
                      <input type="text" inputmode="numeric" data-edit-harga="${normalizedItem.id}" value="${draft.harga !== undefined ? window.formatRupiah(draft.harga) : window.formatRupiah(normalizedItem.harga)}" class="w-full bg-white text-black-main font-medium py-2 px-3 rounded-xl outline-none border border-gray-200 focus:border-blue-500 text-sm" oninput="window.formatNumberInput(this)" />
                    </div>
                    <div>
                      <label class="block text-xs font-semibold text-gray-600 mb-1">Satuan</label>
                      <select data-edit-satuan="${normalizedItem.id}" class="w-full bg-white text-black-main font-medium py-2 px-3 rounded-xl outline-none border border-gray-200 focus:border-blue-500 text-sm">
                        ${unitOptions}
                      </select>
                    </div>
                    <div>
                      <label class="block text-xs font-semibold text-gray-600 mb-1">Jumlah Stok <span class="text-rose-500">*</span></label>
                      <input type="number" step="0.01" min="0" data-edit-stok="${normalizedItem.id}" value="${draft.stok !== undefined ? draft.stok : formatQty(Number(normalizedItem.stok || 0))}" class="w-full bg-white text-black-main font-bold py-2 px-3 rounded-xl outline-none border border-gray-200 focus:border-blue-500 text-sm" required />
                    </div>
                    <div>
                      <label class="block text-xs font-semibold text-gray-600 mb-1">Batas Stok Minimum</label>
                      <input type="number" step="0.01" min="0" data-edit-minstok="${normalizedItem.id}" value="${draft.minStok !== undefined ? draft.minStok : formatQty(Number(normalizedItem.minStok || 0))}" class="w-full bg-white text-black-main font-medium py-2 px-3 rounded-xl outline-none border border-gray-200 focus:border-blue-500 text-sm" />
                    </div>
                  </div>
                  ${renderEditNestingLevels(normalizedItem, draft, "desktop")}
                  <div class="flex justify-end gap-2 pt-2">
                    <button data-cancel-edit-inv="${normalizedItem.id}" class="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-xl transition-colors text-sm cursor-pointer">
                      ${window.LakuIcons.svg("closeCircle", "0.9em")} Batal
                    </button>
                    <button data-save-edit-inv="${normalizedItem.id}" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl transition-colors shadow-sm text-sm cursor-pointer">
                      ${window.LakuIcons.svg("save", "0.9em")} Simpan
                    </button>
                  </div>
                </div>
              </td>
            </tr>
          `;
          desktopHtml += `
            <tr class="hover:bg-stone-50/80 transition-colors">
              <td class="py-3.5 px-4">
                <div class="font-bold text-gray-800">${normalizedItem.nama}</div>
                <div class="text-[11px] text-gray-400">Stok aman di atas: ${minDisplay} ${displayUnit}</div>
                ${nestingInfo ? `<div class="text-[11px] text-indigo-600 font-medium mt-1">Isi: ${nestingInfo}</div>` : ""}
              </td>
              <td class="py-3.5 px-4 text-xs font-medium text-gray-600">${normalizedItem.kategori}</td>
              <td class="py-3.5 px-4 text-right font-semibold text-gray-800">${window.formatRupiah(normalizedItem.harga)}</td>
              <td class="py-3.5 px-4 text-center">
                <div class="font-black text-base text-gray-900">${stokDisplay}</div>
                <div class="mt-1">${statusBadge}</div>
              </td>
              <td class="py-3.5 px-4 text-center space-x-2">
                <button data-edit-inv="${normalizedItem.id}" class="editInvBtn bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold py-1 px-2.5 rounded-lg text-xs transition-all cursor-pointer">
                  ${window.LakuIcons.svg("pencil", "0.85em")} Edit
                </button>
                <button data-id="${normalizedItem.id}" class="deleteInvBtn text-xs text-stone-400 hover:text-rose-600 font-semibold cursor-pointer">
                  Hapus
                </button>
              </td>
            </tr>
            ${editRow}
          `;
        } else {
          // Normal mode
          desktopHtml += `
            <tr class="hover:bg-stone-50/80 transition-colors">
              <td class="py-3.5 px-4">
                <div class="font-bold text-gray-800">${normalizedItem.nama}</div>
                <div class="text-[11px] text-gray-400">Stok aman di atas: ${minDisplay} ${displayUnit}</div>
                ${nestingInfo ? `<div class="text-[11px] text-indigo-600 font-medium mt-1">Isi: ${nestingInfo}</div>` : ""}
              </td>
              <td class="py-3.5 px-4 text-xs font-medium text-gray-600">${normalizedItem.kategori}</td>
              <td class="py-3.5 px-4 text-right font-semibold text-gray-800">${window.formatRupiah(normalizedItem.harga)}</td>
              <td class="py-3.5 px-4 text-center">
                <div class="font-black text-base text-gray-900">${stokDisplay}</div>
                <div class="mt-1">${statusBadge}</div>
              </td>
              <td class="py-3.5 px-4 text-center space-x-2">
                <button data-edit-inv="${normalizedItem.id}" class="editInvBtn bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold py-1 px-2.5 rounded-lg text-xs transition-all cursor-pointer">
                  ${window.LakuIcons.svg("pencil", "0.85em")} Edit
                </button>
                <button data-id="${normalizedItem.id}" class="deleteInvBtn text-xs text-stone-400 hover:text-rose-600 font-semibold cursor-pointer">
                  Hapus
                </button>
              </td>
            </tr>
          `;
        }

        // Mobile Card List
        if (isEditing) {
          mobileHtml += `
            <div class="bg-white border border-stone-200/90 rounded-2xl p-4 shadow-xs space-y-3">
              <div class="flex items-center justify-between text-xs">
                <span class="text-gray-400 font-semibold tracking-wide uppercase text-[10px] bg-stone-100 px-2.5 py-1 rounded-md">${normalizedItem.kategori}</span>
                ${statusBadge}
              </div>

              <div>
                <h4 class="text-base font-bold text-gray-900">${normalizedItem.nama}</h4>
                <p class="text-[11px] text-gray-400">Stok aman di atas: ${minDisplay} ${displayUnit}</p>
                ${nestingInfo ? `<p class="text-[11px] text-indigo-600 font-medium mt-1">Isi: ${nestingInfo}</p>` : ""}
              </div>

              <div class="border-t border-gray-100 pt-2 space-y-3 text-xs">
                <div class="space-y-2">
                  <div>
                    <label class="block text-xs font-semibold text-gray-600 mb-1">Nama Barang</label>
                    <input type="text" data-edit-nama="${normalizedItem.id}" value="${draft.nama ?? normalizedItem.nama}" class="w-full bg-white text-black-main font-medium py-2 px-3 rounded-xl outline-none border border-gray-200 focus:border-blue-500 text-sm" required />
                  </div>
                  <div>
                    <label class="block text-xs font-semibold text-gray-600 mb-1">Kategori</label>
                    <select data-edit-kategori="${normalizedItem.id}" class="w-full bg-white text-black-main font-medium py-2 px-3 rounded-xl outline-none border border-gray-200 focus:border-blue-500 text-sm">
                      ${categoryOptions}
                    </select>
                  </div>
                  <div class="grid grid-cols-2 gap-2">
                    <div>
                      <label class="block text-xs font-semibold text-gray-600 mb-1">Harga Beli (Rp)</label>
                      <input type="text" inputmode="numeric" data-edit-harga="${normalizedItem.id}" value="${draft.harga !== undefined ? window.formatRupiah(draft.harga) : window.formatRupiah(normalizedItem.harga)}" class="w-full bg-white text-black-main font-medium py-2 px-3 rounded-xl outline-none border border-gray-200 focus:border-blue-500 text-sm" oninput="window.formatNumberInput(this)" />
                    </div>
                    <div>
                      <label class="block text-xs font-semibold text-gray-600 mb-1">Satuan</label>
                      <select data-edit-satuan="${normalizedItem.id}" class="w-full bg-white text-black-main font-medium py-2 px-3 rounded-xl outline-none border border-gray-200 focus:border-blue-500 text-sm">
                        ${unitOptions}
                      </select>
                    </div>
                  </div>
<div class="grid grid-cols-2 gap-2">
                      <div>
                        <label class="block text-xs font-semibold text-gray-600 mb-1">Jumlah Stok <span class="text-rose-500">*</span></label>
                        <input type="number" step="0.01" min="0" data-edit-stok="${normalizedItem.id}" value="${draft.stok !== undefined ? draft.stok : formatQty(Number(normalizedItem.stok || 0))}" class="w-full bg-white text-black-main font-bold py-2 px-3 rounded-xl outline-none border border-gray-200 focus:border-blue-500 text-sm" required />
                      </div>
                      <div>
                        <label class="block text-xs font-semibold text-gray-600 mb-1">Batas Stok Minimum</label>
                        <input type="number" step="0.01" min="0" data-edit-minstok="${normalizedItem.id}" value="${draft.minStok !== undefined ? draft.minStok : formatQty(Number(normalizedItem.minStok || 0))}" class="w-full bg-white text-black-main font-medium py-2 px-3 rounded-xl outline-none border border-gray-200 focus:border-blue-500 text-sm" />
                      </div>
                    </div>
                  </div>
                  ${renderEditNestingLevels(normalizedItem, draft, "mobile")}
                  <div class="flex justify-end gap-2 pt-2 border-t border-gray-100">
                  <button data-cancel-edit-inv="${normalizedItem.id}" class="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-xl transition-colors text-sm cursor-pointer">
                    ${window.LakuIcons.svg("closeCircle", "0.9em")} Batal
                  </button>
                  <button data-save-edit-inv="${normalizedItem.id}" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl transition-colors shadow-sm text-sm cursor-pointer">
                    ${window.LakuIcons.svg("save", "0.9em")} Simpan
                  </button>
                </div>
              </div>
            </div>
          `;
        } else {
          mobileHtml += `
            <div class="bg-white border border-stone-200/90 rounded-2xl p-4 shadow-xs space-y-3">
              <div class="flex items-center justify-between text-xs">
                <span class="text-gray-400 font-semibold tracking-wide uppercase text-[10px] bg-stone-100 px-2.5 py-1 rounded-md">${normalizedItem.kategori}</span>
                ${statusBadge}
              </div>

              <div>
                <h4 class="text-base font-bold text-gray-900">${normalizedItem.nama}</h4>
                <p class="text-[11px] text-gray-400">Stok aman di atas: ${minDisplay} ${displayUnit}</p>
                ${nestingInfo ? `<p class="text-[11px] text-indigo-600 font-medium mt-1">Isi: ${nestingInfo}</p>` : ""}
              </div>

              <div class="border-t border-gray-100 pt-2 space-y-2 text-xs">
                <div class="flex items-center justify-between">
                  <span class="text-gray-500 font-medium">Harga modal per satuan</span>
                  <span class="font-bold text-gray-800 text-sm">${window.formatRupiah(normalizedItem.harga)}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-gray-500 font-medium">Stok saat ini</span>
                  <span class="font-black text-sm text-gray-900">${stokDisplay}</span>
                </div>
              </div>

              <div class="pt-2 flex items-center justify-between gap-2 border-t border-gray-100">
                <button data-edit-inv="${normalizedItem.id}" class="editInvBtn bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold py-1.5 px-3 rounded-lg text-xs transition-all cursor-pointer w-full">
                  ${window.LakuIcons.svg("pencil", "0.85em")} Edit
                </button>
                <button data-id="${normalizedItem.id}" class="deleteInvBtn text-xs text-stone-400 hover:text-rose-600 font-semibold cursor-pointer">
                  Hapus
                </button>
              </div>
            </div>
          `;
        }
      });

      if (tbody) tbody.innerHTML = desktopHtml;
      if (mobileList) {
        mobileList.innerHTML = mobileHtml || "";
      }
    }

    document.getElementById("invTotalItems").textContent = `${totalItemsCount} Item`;
    document.getElementById("invLowStockItems").textContent = `${lowStockCount} Item`;
    document.getElementById("invEmptyStockItems").textContent = `${emptyStockCount} Item`;

    // Bind Edit buttons
    document.querySelectorAll("[data-edit-inv]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = parseInt(e.target.closest("[data-edit-inv]").getAttribute("data-edit-inv"));
        window.LakuInventory.startEditItem(id);
      });
    });

    // Bind Save Inline Edit
    document.querySelectorAll("[data-save-edit-inv]").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const id = parseInt(e.target.closest("[data-save-edit-inv]").getAttribute("data-save-edit-inv"));
        await window.LakuInventory.saveInlineEditItem(id);
      });
    });

    // Bind Cancel Inline Edit
    document.querySelectorAll("[data-cancel-edit-inv]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = parseInt(e.target.closest("[data-cancel-edit-inv]").getAttribute("data-cancel-edit-inv"));
        window.LakuInventory.cancelInlineEditItem(id);
      });
    });

    // Bind draft input changes
    document.querySelectorAll("[data-edit-nama]").forEach((input) => {
      input.addEventListener("input", (e) => {
        const id = parseInt(e.target.getAttribute("data-edit-nama"));
        window.LakuInventory.updateEditDraft(id, { nama: e.target.value.trim() });
      });
    });
    document.querySelectorAll("[data-edit-kategori]").forEach((select) => {
      select.addEventListener("change", (e) => {
        const id = parseInt(e.target.getAttribute("data-edit-kategori"));
        window.LakuInventory.updateEditDraft(id, { kategori: e.target.value });
      });
    });
    document.querySelectorAll("[data-edit-harga]").forEach((input) => {
      input.addEventListener("input", (e) => {
        const id = parseInt(e.target.getAttribute("data-edit-harga"));
        const value = window.getRawNumber(e.target);
        window.LakuInventory.updateEditDraft(id, { harga: value });
      });
    });
    document.querySelectorAll("[data-edit-satuan]").forEach((select) => {
      select.addEventListener("change", (e) => {
        const id = parseInt(e.target.getAttribute("data-edit-satuan"));
        window.LakuInventory.updateEditDraft(id, { satuan: e.target.value });
      });
    });
    document.querySelectorAll("[data-edit-stok]").forEach((input) => {
      input.addEventListener("input", (e) => {
        const id = parseInt(e.target.getAttribute("data-edit-stok"));
        const value = parseFloat(e.target.value) || 0;
        window.LakuInventory.updateEditDraft(id, { stok: value });
      });
    });
    document.querySelectorAll("[data-edit-minstok]").forEach((input) => {
      input.addEventListener("input", (e) => {
        const id = parseInt(e.target.getAttribute("data-edit-minstok"));
        const value = parseFloat(e.target.value) || 0;
        window.LakuInventory.updateEditDraft(id, { minStok: value });
      });
    });

    // Bind nested levels edit: add level
    document.querySelectorAll("[data-add-nesting]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = parseInt(e.target.closest("[data-add-nesting]").getAttribute("data-add-nesting"));
        const section = e.target.closest("[data-nesting-section]");
        const container = section?.querySelector("[data-nesting-container]");
        if (!container) return;

        const draft = window.LakuInventory.editingItemDraft || {};
        const nestedLevels = draft.nestedLevels || [];
        const newIndex = nestedLevels.length;

        const countUnits = window.LakuUnits.getCountUnits ? window.LakuUnits.getCountUnits() : ["pcs", "bungkus", "pack", "botol", "roll", "lembar", "dosin", "lusin", "dus"];
        const unitOptions = countUnits.map(u => `<option value="${u}">${window.LakuUnits.formatUnitLabel(u)}</option>`).join("");

        const row = document.createElement("div");
        row.className = "nesting-edit-row flex gap-2 items-center";
        row.dataset.nestingIndex = newIndex;
        row.innerHTML = `
          <select class="nesting-edit-unit w-1/2 bg-white text-black-main font-medium py-2 px-3 rounded-xl outline-none border border-gray-200 focus:border-blue-500 text-sm" data-edit-nesting-unit="${id}" required>
            <option value="">— Pilih Satuan —</option>
            ${unitOptions}
          </select>
          <input type="number" class="nesting-edit-isi w-1/2 bg-white text-black-main font-medium py-2 px-3 rounded-xl outline-none border border-gray-200 focus:border-blue-500 text-sm" placeholder="Isi (angka)" min="1" value="" data-edit-nesting-isi="${id}" required />
          <button type="button" class="remove-nesting-edit text-rose-400 hover:text-rose-600 font-bold text-sm cursor-pointer" title="Hapus level">${window.LakuIcons.svg("closeCircle", "0.9em")}</button>
        `;
        container.appendChild(row);

        // Update draft
        const updatedNested = [...nestedLevels, { unit: "", isi: 1 }];
        window.LakuInventory.updateEditDraft(id, { nestedLevels: updatedNested });

        // Re-render to sync both views
        pagination.refresh();
      });
    });

    // Bind nested levels edit: remove level (with confirmation)
    async function handleRemoveNestingLevel(e) {
      const btn = e.target.closest(".remove-nesting-edit");
      if (!btn) return;

      const row = btn.closest(".nesting-edit-row");
      if (!row) return;

      const section = btn.closest("[data-nesting-section]");
      if (!section) return;

      const itemId = parseInt(section.getAttribute("data-nesting-item"));
      if (!itemId) return;

      const index = parseInt(row.dataset.nestingIndex);
      if (!Number.isFinite(index)) return;

      const draft = window.LakuInventory.editingItemDraft || {};
      const nestedLevels = draft.nestedLevels || [];
      if (index < 0 || index >= nestedLevels.length) return;

      const editingId = window.LakuInventory.editingItemId;
      if (!editingId || editingId !== itemId) return;

      const ok = await window.showCustomConfirm({
        title: "Hapus Level Anakan?",
        message: "Level ini akan dihapus dari daftar kemasan. Tetap hapus?",
        confirmText: "Ya, Hapus",
        cancelText: "Batal",
        isDanger: true,
      });

      if (!ok) return;

      const updatedNested = [...nestedLevels];
      updatedNested.splice(index, 1);
      window.LakuInventory.updateEditDraft(editingId, { nestedLevels: updatedNested });

      // Re-render to sync both views
      pagination.refresh();
    }

    // Attach delegated remove handler to each nesting container
    document.querySelectorAll("[data-nesting-section]").forEach((section) => {
      const container = section.querySelector("[data-nesting-container]");
      if (container) {
        container.removeEventListener("click", container.__nestingRemoveHandler);
        container.__nestingRemoveHandler = handleRemoveNestingLevel;
        container.addEventListener("click", container.__nestingRemoveHandler);
      }
    });

    // Bind nested levels edit: input changes (delegated per container)
    function bindNestingEditEvents() {
      document.querySelectorAll("[data-nesting-container]").forEach((container) => {
        // Remove existing handlers to avoid duplicates
        container.removeEventListener("change", container.__nestingUnitHandler);
        container.removeEventListener("input", container.__nestingIsiHandler);

        container.__nestingUnitHandler = (e) => {
          const select = e.target.closest("[data-edit-nesting-unit]");
          if (!select) return;
          const itemId = parseInt(select.getAttribute("data-edit-nesting-unit"));
          const row = select.closest(".nesting-edit-row");
          const index = parseInt(row?.dataset.nestingIndex);
          if (!Number.isFinite(index)) return;
          const draft = window.LakuInventory.editingItemDraft || {};
          const nestedLevels = draft.nestedLevels || [];
          if (nestedLevels[index]) {
            nestedLevels[index].unit = select.value;
            window.LakuInventory.updateEditDraft(itemId, { nestedLevels });
          }
        };

        container.__nestingIsiHandler = (e) => {
          const input = e.target.closest("[data-edit-nesting-isi]");
          if (!input) return;
          const itemId = parseInt(input.getAttribute("data-edit-nesting-isi"));
          const row = input.closest(".nesting-edit-row");
          const index = parseInt(row?.dataset.nestingIndex);
          if (!Number.isFinite(index)) return;
          const value = parseInt(input.value) || 1;
          const draft = window.LakuInventory.editingItemDraft || {};
          const nestedLevels = draft.nestedLevels || [];
          if (nestedLevels[index]) {
            nestedLevels[index].isi = Math.max(1, value);
            window.LakuInventory.updateEditDraft(itemId, { nestedLevels });
          }
        };

        container.addEventListener("change", container.__nestingUnitHandler);
        container.addEventListener("input", container.__nestingIsiHandler);
      });
    }

    // Initial bind for existing nested levels
    bindNestingEditEvents();

// Bind Delete Item - use event delegation on container for both desktop & mobile
    const deleteTarget = tbody?.parentElement || mobileList?.parentElement;
    if (deleteTarget) {
      // Remove any existing listener first
      deleteTarget.removeEventListener("click", window.__invDeleteHandler);
      window.__invDeleteHandler = async (e) => {
        const btn = e.target.closest(".deleteInvBtn");
        if (!btn) return;
        
        const id = parseInt(btn.getAttribute("data-id"));
        if (!id) return;
        
        const ok = await window.showCustomConfirm({
          title: "Hapus Barang Inventaris",
          message: "Apakah Anda yakin ingin menghapus barang ini dari daftar stok inventaris?",
          confirmText: "Ya, Hapus",
          cancelText: "Batal",
          isDanger: true,
        });

        if (ok) {
          const currentData = loadInventoryData();
          const filtered = currentData.filter((it) => it.id !== id);
          saveInventoryData(filtered);
          window.dispatchEvent(new CustomEvent("laku-inventory-updated"));
          pagination.refresh();
        }
      };
      deleteTarget.addEventListener("click", window.__invDeleteHandler);
}
  }

  // Initial render
  pagination.refresh();
}

/** Entry point: pasang template UI lalu jalankan logika inventory */
function renderInventoryApp(container) {
  if (!container) return;
  container.innerHTML = getInventoryAppUI();
  initInventoryAppLogic();
}