/**
 * kasClient.js — Logika Interaktif Buku Kas Digital UMKM
 * Pencatatan pemasukan & pengeluaran harian.
 */
function initKasAppLogic() {
  const KAS_STORAGE_KEY = "laku_cashbook_data";

  /** Muat data kas dari localStorage */
  const loadKasData = () => {
    const raw = localStorage.getItem(KAS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  };

  /** Simpan data kas ke localStorage */
  const saveKasData = (data) => {
    localStorage.setItem(KAS_STORAGE_KEY, JSON.stringify(data));
  };

  // Filter function for Kas
  const kasFilterFn = (item, state) => {
    // Search filter
    if (state.searchTerm && item.note.toLowerCase().indexOf(state.searchTerm.toLowerCase()) === -1) {
      return false;
    }

    // Type filter
    if (state.typeFilter !== "all" && item.type !== state.typeFilter) {
      return false;
    }

    // Date range filter
    if (state.dateStart && item.date < state.dateStart) {
      return false;
    }
    if (state.dateEnd && item.date > state.dateEnd) {
      return false;
    }

    return true;
  };

  // Initialize shared pagination controller
  const pagination = window.LakuPagination.createPaginationController({
    storageKey: "laku_kas_ui_state",
    getData: loadKasData,
    filterFn: kasFilterFn,
    elements: {
      searchInput: "kasSearchInput",
      typeFilter: "kasTypeFilter",
      dateStart: "kasDateStart",
      dateEnd: "kasDateEnd",
      pageSizeSelect: "kasPageSizeSelect",
      prevPage: "kasPrevPage",
      nextPage: "kasNextPage",
      currentPage: "kasCurrentPage",
      totalPages: "kasTotalPages",
      startIndex: "kasStartIndex",
      endIndex: "kasEndIndex",
      totalCount: "kasTotalCount",
      paginationContainer: "kasPagination",
      clearFilters: "kasClearFilters",
    },
    onChange: (items, pagination) => renderTable(items, pagination),
    defaultPageSize: 3,
    debounceMs: 300,
  });

  /** Render tabel desktop + kartu mobile */
  const renderTable = (data, paginationData) => {
    const tbody = document.getElementById("kasTableBody");
    const mobileList = document.getElementById("kasMobileList");

    let totalMasuk = 0;
    let totalKeluar = 0;

    if (data.length === 0) {
      if (tbody) {
        tbody.innerHTML = `
          <tr>
            <td colspan="5" class="py-8 text-center text-gray-400 text-sm">
              Belum ada transaksi kas. Tambahkan catatan pertama Anda di atas!
            </td>
          </tr>
        `;
      }
      if (mobileList) {
        mobileList.innerHTML = `
          <div class="py-8 text-center text-gray-400 text-sm bg-stone-50 rounded-2xl">
            Belum ada transaksi kas. Tambahkan catatan pertama Anda di atas!
          </div>
        `;
      }
    } else {
      let desktopHtml = "";
      let mobileHtml = "";

      data.forEach((item) => {
        const isMasuk = item.type === "pemasukan";
        if (isMasuk) totalMasuk += item.amount;
        else totalKeluar += item.amount;

        const badge = isMasuk
          ? `<span class="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">Pemasukan</span>`
          : `<span class="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">Pengeluaran</span>`;

        const amountColor = isMasuk ? "text-emerald-700" : "text-rose-700";
        const sign = isMasuk ? "+" : "-";

        // Desktop Table Row
        desktopHtml += `
          <tr class="hover:bg-stone-50/80 transition-colors">
            <td class="py-3.5 px-4 text-xs text-gray-500 font-mono">${item.date}</td>
            <td class="py-3.5 px-4 font-semibold text-gray-800">${item.note}</td>
            <td class="py-3.5 px-4">${badge}</td>
            <td class="py-3.5 px-4 text-right font-bold ${amountColor}">
              ${sign} ${window.formatRupiah(item.amount)}
            </td>
            <td class="py-3.5 px-4 text-center">
              <button data-id="${item.id}" class="deleteKasBtn text-xs text-stone-400 hover:text-rose-600 font-semibold cursor-pointer">
                Hapus
              </button>
            </td>
          </tr>
        `;

        // Mobile Card
        mobileHtml += `
          <div class="bg-white border border-stone-200/90 rounded-2xl p-4 shadow-xs space-y-3">
            <div class="flex items-center justify-between text-xs">
              <span class="text-gray-400 font-medium font-mono text-[11px]">${item.date}</span>
              ${badge}
            </div>
            <div>
              <h4 class="text-base font-bold text-gray-900">${item.note}</h4>
            </div>
            <div class="border-t border-gray-100 pt-2 flex items-center justify-between text-xs">
              <span class="text-gray-500 font-medium">Nominal Transaksi</span>
              <span class="font-extrabold text-sm ${amountColor}">${sign} ${window.formatRupiah(item.amount)}</span>
            </div>
            <div class="pt-2 flex items-center justify-end border-t border-gray-100">
              <button data-id="${item.id}" class="deleteKasBtn text-xs text-stone-400 hover:text-rose-600 font-semibold cursor-pointer">
                Hapus
              </button>
            </div>
          </div>
        `;
      });

      if (tbody) tbody.innerHTML = desktopHtml;
      if (mobileList) mobileHtml ? (mobileList.innerHTML = mobileHtml) : null;
    }

    const saldoAkhir = totalMasuk - totalKeluar;
    document.getElementById("kasTotalMasuk").textContent = window.formatRupiah(totalMasuk);
    document.getElementById("kasTotalKeluar").textContent = window.formatRupiah(totalKeluar);
    document.getElementById("kasSaldoAkhir").textContent = window.formatRupiah(saldoAkhir);

    // Bind Delete Event (Desktop & Mobile)
    document.querySelectorAll(".deleteKasBtn").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const id = parseInt(e.target.getAttribute("data-id"));
        const ok = await window.showCustomConfirm({
          title: "Hapus Transaksi Kas",
          message: "Apakah Anda yakin ingin menghapus catatan transaksi ini?",
          confirmText: "Ya, Hapus",
          cancelText: "Batal",
          isDanger: true,
        });

        if (ok) {
          const currentData = loadKasData();
          const filtered = currentData.filter((it) => it.id !== id);
          saveKasData(filtered);
          pagination.refresh();
        }
      });
    });
  };

  // Form Submit Handler
  const form = document.getElementById("kasForm");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const type = document.getElementById("kasType").value;
      const amount = window.getRawNumber(document.getElementById("kasAmount"));
      const note = document.getElementById("kasNote").value.trim();

      if (amount <= 0 || !note) return;

      const newItem = {
        id: Date.now(),
        date: new Date().toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        type,
        amount,
        note,
      };

      const currentData = loadKasData();
      currentData.unshift(newItem);
      saveKasData(currentData);

      form.reset();
      pagination.refresh();
    });
  }

  const clearBtn = document.getElementById("clearKasBtn");
  if (clearBtn) {
    clearBtn.addEventListener("click", async () => {
      const ok = await window.showCustomConfirm({
        title: "Kosongkan Riwayat Kas",
        message: "Apakah Anda yakin ingin menghapus seluruh riwayat transaksi kas secara permanen?",
        confirmText: "Ya, Hapus Semua",
        cancelText: "Batal",
        isDanger: true,
      });

      if (ok) {
        saveKasData([]);
        pagination.refresh();
      }
    });
  }

  // Initial render
  pagination.refresh();
}

/** Entry point: render template + init logic */
function renderKasApp(container) {
  if (!container) return;
  container.innerHTML = getKasAppUI();
  initKasAppLogic();
}
