/**
 * inventoryAppClient.js - Logika Interaktif Sistem Inventory (Stok Barang) UMKM
 */
function initInventoryAppLogic() {
  const INV_STORAGE_KEY = "laku_inventory_data";

  const formatRupiah = (num) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  const loadInventoryData = () => {
    const raw = localStorage.getItem(INV_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  };

  const saveInventoryData = (data) => {
    localStorage.setItem(INV_STORAGE_KEY, JSON.stringify(data));
  };

  const renderTable = () => {
    const data = loadInventoryData();
    const tbody = document.getElementById("inventoryTableBody");
    const mobileList = document.getElementById("inventoryMobileList");

    let totalItems = data.length;
    let lowStockCount = 0;
    let emptyStockCount = 0;

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
        const isKosong = item.stok <= 0;
        const isTipis = !isKosong && item.stok <= item.minStok;

        if (isKosong) emptyStockCount++;
        else if (isTipis) lowStockCount++;

        let statusBadge = "";
        if (isKosong) {
          statusBadge = `<span class="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">Habis</span>`;
        } else if (isTipis) {
          statusBadge = `<span class="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">Stok Tipis</span>`;
        } else {
          statusBadge = `<span class="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">Aman</span>`;
        }

        // Desktop Table Row
        desktopHtml += `
          <tr class="hover:bg-stone-50/80 transition-colors">
            <td class="py-3.5 px-4">
              <div class="font-bold text-gray-800">${item.nama}</div>
              <div class="text-[11px] text-gray-400">Min. Alert: ${item.minStok} Unit</div>
            </td>
            <td class="py-3.5 px-4 text-xs font-medium text-gray-600">${item.kategori}</td>
            <td class="py-3.5 px-4 text-right font-semibold text-gray-800">${formatRupiah(item.harga)}</td>
            <td class="py-3.5 px-4 text-center">
              <div class="font-black text-base text-gray-900">${item.stok}</div>
              <div class="mt-1">${statusBadge}</div>
            </td>
            <td class="py-3.5 px-4 text-center space-x-2">
              <button data-id="${item.id}" data-change="1" class="adjustStokBtn bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold py-1 px-2.5 rounded-lg text-xs transition-all cursor-pointer">
                +1 Stok
              </button>
              <button data-id="${item.id}" data-change="-1" class="adjustStokBtn bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold py-1 px-2.5 rounded-lg text-xs transition-all cursor-pointer">
                -1 Stok
              </button>
              <button data-id="${item.id}" class="deleteInvBtn text-xs text-stone-400 hover:text-rose-600 font-semibold cursor-pointer">
                Hapus
              </button>
            </td>
          </tr>
        `;

        // Mobile Card List (Matches requested UI reference layout)
        mobileHtml += `
          <div class="bg-white border border-stone-200/90 rounded-2xl p-4 shadow-xs space-y-3">
            <div class="flex items-center justify-between text-xs">
              <span class="text-gray-400 font-semibold tracking-wide uppercase text-[10px] bg-stone-100 px-2.5 py-1 rounded-md">${item.kategori}</span>
              ${statusBadge}
            </div>

            <div>
              <h4 class="text-base font-bold text-gray-900">${item.nama}</h4>
              <p class="text-[11px] text-gray-400">Min. Alert Stok: ${item.minStok} Unit</p>
            </div>

            <div class="border-t border-gray-100 pt-2 space-y-2 text-xs">
              <div class="flex items-center justify-between">
                <span class="text-gray-500 font-medium">Harga Modal / Unit</span>
                <span class="font-bold text-gray-800 text-sm">${formatRupiah(item.harga)}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-gray-500 font-medium">Stok saat ini</span>
                <span class="font-black text-sm text-gray-900">${item.stok} Unit</span>
              </div>
            </div>

            <div class="pt-2 flex items-center justify-between gap-2 border-t border-gray-100">
              <div class="flex items-center gap-2">
                <button data-id="${item.id}" data-change="1" class="adjustStokBtn bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold py-1.5 px-3 rounded-lg text-xs transition-all cursor-pointer">
                  +1 Stok
                </button>
                <button data-id="${item.id}" data-change="-1" class="adjustStokBtn bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold py-1.5 px-3 rounded-lg text-xs transition-all cursor-pointer">
                  -1 Stok
                </button>
              </div>
              <button data-id="${item.id}" class="deleteInvBtn text-xs text-stone-400 hover:text-rose-600 font-semibold cursor-pointer">
                Hapus
              </button>
            </div>
          </div>
        `;
      });

      if (tbody) tbody.innerHTML = desktopHtml;
      if (mobileList) mobileHtml ? (mobileList.innerHTML = mobileHtml) : null;
    }

    document.getElementById("invTotalItems").textContent = `${totalItems} Item`;
    document.getElementById("invLowStockItems").textContent = `${lowStockCount} Item`;
    document.getElementById("invEmptyStockItems").textContent = `${emptyStockCount} Item`;

    // Bind Stock Adjustment (+1 / -1) for both desktop and mobile buttons
    document.querySelectorAll(".adjustStokBtn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = parseInt(e.target.getAttribute("data-id"));
        const change = parseInt(e.target.getAttribute("data-change"));
        const currentData = loadInventoryData();
        const item = currentData.find((it) => it.id === id);
        if (!item) return;

        item.stok = Math.max(0, item.stok + change);
        saveInventoryData(currentData);
        renderTable();
      });
    });

    // Bind Delete Item for both desktop and mobile buttons
    document.querySelectorAll(".deleteInvBtn").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const id = parseInt(e.target.getAttribute("data-id"));
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
          renderTable();
        }
      });
    });
  };

  // Form Submit Handler
  const form = document.getElementById("inventoryForm");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const nama = document.getElementById("invNama").value.trim();
      const kategori = document.getElementById("invKategori").value;
      const harga = window.getRawNumber(document.getElementById("invHarga"));
      const stok = parseInt(document.getElementById("invStok").value) || 0;
      const minStok = parseInt(document.getElementById("invMinStok").value) || 0;

      if (!nama || harga < 0 || stok < 0) return;

      const newItem = {
        id: Date.now(),
        nama,
        kategori,
        harga,
        stok,
        minStok,
      };

      const currentData = loadInventoryData();
      currentData.unshift(newItem);
      saveInventoryData(currentData);

      form.reset();
      renderTable();
    });
  }

  renderTable();
}

function renderInventoryApp(container) {
  if (!container) return;
  container.innerHTML = getInventoryAppUI();
  initInventoryAppLogic();
}
