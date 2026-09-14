/** @file utangClient.js — Logika Utang Piutang UMKM (CRUD, notifikasi, WA deep-link) */

/** Menginisialisasi seluruh logika interaktif halaman utang/piutang */
function initUtangAppLogic() {
  const UTANG_STORAGE_KEY = "laku_utang_data";

  /** Mengambil data utang/piutang dari localStorage */
  const loadUtangData = () => {
    const raw = localStorage.getItem(UTANG_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  };

  /** Menyimpan data utang/piutang ke localStorage */
  const saveUtangData = (data) => {
    localStorage.setItem(UTANG_STORAGE_KEY, JSON.stringify(data));
  };

  /** Mengirim notifikasi browser untuk catatan yang jatuh tempo hari ini */
  const checkDueNotifications = () => {
    if (!("Notification" in window) || Notification.permission !== "granted") return;
    const data = loadUtangData();
    const todayStr = new Date().toISOString().split("T")[0];
    const dueTodayItems = data.filter(
      (item) => item.totalAmount > item.paidAmount && item.dueDate === todayStr
    );

    if (dueTodayItems.length > 0) {
      dueTodayItems.forEach((item) => {
        const notifTitle = `Pengingat: ${item.nama}`;
        const notifBody = `Sisa belum dibayar ${window.formatRupiah(item.totalAmount - item.paidAmount)} untuk "${item.note}" harus dibayar hari ini!`;
        new Notification(notifTitle, {
          body: notifBody,
          icon: "/favicon.ico",
        });
      });
    }
  };

  /** Me-render ulang tabel desktop, kartu mobile, dan ringkasan overview */
  const renderTable = () => {
    const data = loadUtangData();
    const tbody = document.getElementById("utangTableBody");
    const mobileList = document.getElementById("utangMobileList");

    let totalPiutang = 0;
    let totalUtang = 0;
    let dueTodayCount = 0;
    const todayStr = new Date().toISOString().split("T")[0];

    if (data.length === 0) {
      if (tbody) {
        tbody.innerHTML = `
          <tr>
            <td colspan="5" class="py-8 text-center text-gray-400 text-sm">
              Belum ada catatan utang/piutang. Tambahkan catatan pertamamu di atas!
            </td>
          </tr>
        `;
      }
      if (mobileList) {
        mobileList.innerHTML = `
          <div class="py-8 text-center text-gray-400 text-sm bg-stone-50 rounded-2xl">
            Belum ada catatan utang/piutang. Tambahkan catatan pertamamu di atas!
          </div>
        `;
      }
    } else {
      let desktopHtml = "";
      let mobileHtml = "";

      data.forEach((item) => {
        const remaining = item.totalAmount - item.paidAmount;
        const isLunas = remaining <= 0;
        const isPiutang = item.type === "piutang";
        const isOverdue = !isLunas && item.dueDate < todayStr;
        const isDueToday = !isLunas && item.dueDate === todayStr;

        if (isPiutang && !isLunas) totalPiutang += remaining;
        if (!isPiutang && !isLunas) totalUtang += remaining;
        if (isDueToday) dueTodayCount++;

        let statusBadge = "";
        if (isLunas) {
          statusBadge = `<span class="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">Lunas</span>`;
        } else if (isOverdue) {
          statusBadge = `<span class="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">Terlambat</span>`;
        } else if (isDueToday) {
          statusBadge = `<span class="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">Hari Ini</span>`;
        } else {
          statusBadge = `<span class="px-2.5 py-1 rounded-full text-xs font-bold bg-stone-100 text-stone-700">Belum Lunas</span>`;
        }

        const typeBadge = isPiutang
          ? `<span class="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg text-xs">PIUTANG</span>`
          : `<span class="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-lg text-xs">UTANG</span>`;

        // Membuat tombol deep-link WhatsApp untuk pengingat tagihan
        let waBtn = "";
        if (item.wa && !isLunas) {
          const cleanWa = item.wa.replace(/[^0-9]/g, "").replace(/^0/, "62");
          const msg = encodeURIComponent(
            `Halo Kak ${item.nama}, sekadar mengingatkan untuk sisa tagihan ${item.note} sebesar ${window.formatRupiah(remaining)} (Jatuh tempo: ${item.dueDate}). Terima kasih!`
          );
          waBtn = `
            <a href="https://wa.me/${cleanWa}?text=${msg}" target="_blank" class="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-1.5 px-3 rounded-xl transition-all shadow-xs">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              WA
            </a>
          `;
        }

        // Desktop Table Row
        desktopHtml += `
          <tr class="hover:bg-stone-50/80 transition-colors">
            <td class="py-3.5 px-4">${typeBadge}</td>
            <td class="py-3.5 px-4">
              <div class="font-bold text-gray-800">${item.nama}</div>
              <div class="text-xs text-gray-500">${item.note}</div>
            </td>
            <td class="py-3.5 px-4 text-xs font-mono">
              <div>${item.dueDate}</div>
              <div class="mt-1">${statusBadge}</div>
            </td>
            <td class="py-3.5 px-4 text-right">
              <div class="font-bold text-[#274c43]">${window.formatRupiah(remaining)}</div>
              <div class="text-[11px] text-gray-400">Total: ${window.formatRupiah(item.totalAmount)}</div>
            </td>
            <td class="py-3.5 px-4 text-center space-x-2">
              ${
                !isLunas
                  ? `<button data-id="${item.id}" class="payUtangBtn bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold py-1 px-2.5 rounded-lg text-xs transition-all cursor-pointer">+ Cicil</button>`
                  : ""
              }
              ${waBtn}
              <button data-id="${item.id}" class="deleteUtangBtn text-xs text-stone-400 hover:text-rose-600 font-semibold cursor-pointer">Hapus</button>
            </td>
          </tr>
        `;

        // Mobile Card List (Matches requested reference screenshot layout)
        mobileHtml += `
          <div class="bg-white border border-stone-200/90 rounded-2xl p-4 shadow-xs space-y-3">
            <div class="flex items-center justify-between text-xs">
              <div class="flex items-center gap-2">
                ${typeBadge}
                <span class="text-gray-400 font-medium font-mono text-[11px]">Harus dibayar: ${item.dueDate}</span>
              </div>
              ${statusBadge}
            </div>

            <div>
              <h4 class="text-base font-bold text-gray-900">${item.nama}</h4>
              <p class="text-xs text-gray-500 mt-0.5">${item.note}</p>
            </div>

            <div class="border-t border-gray-100 pt-2 space-y-1.5 text-xs">
              <div class="flex items-center justify-between">
                <span class="text-gray-500 font-medium">Total uang</span>
                <span class="font-semibold text-gray-700">${window.formatRupiah(item.totalAmount)}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-gray-500 font-medium">Sisa belum dibayar</span>
                <span class="font-extrabold text-sm text-[#274c43]">${window.formatRupiah(remaining)}</span>
              </div>
            </div>

            <div class="pt-2 flex items-center justify-between gap-2 border-t border-gray-100">
              <div class="flex items-center gap-2">
                ${
                  !isLunas
                    ? `<button data-id="${item.id}" class="payUtangBtn bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold py-1.5 px-3 rounded-lg text-xs transition-all cursor-pointer">+ Cicil / Bayar</button>`
                    : ""
                }
                ${waBtn}
              </div>
              <button data-id="${item.id}" class="deleteUtangBtn text-xs text-stone-400 hover:text-rose-600 font-semibold cursor-pointer">
                Hapus
              </button>
            </div>
          </div>
        `;
      });

      if (tbody) tbody.innerHTML = desktopHtml;
      if (mobileList) mobileHtml ? (mobileList.innerHTML = mobileHtml) : null;
    }

    // Memperbarui kartu ringkasan (overview) di atas halaman
    document.getElementById("utangTotalPiutang").textContent = window.formatRupiah(totalPiutang);
    document.getElementById("utangTotalUtang").textContent = window.formatRupiah(totalUtang);
    document.getElementById("utangTotalDueToday").textContent = `${dueTodayCount} Catatan`;

    // Mengikat event handler tombol "Cicil / Bayar" (desktop & mobile)
    document.querySelectorAll(".payUtangBtn").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const id = parseInt(e.target.getAttribute("data-id"));
        const currentData = loadUtangData();
        const item = currentData.find((it) => it.id === id);
        if (!item) return;

        const remaining = item.totalAmount - item.paidAmount;
        const bayarStr = await window.showCustomPrompt({
          title: `Bayar Utang (${item.nama})`,
          message: `Sisa belum dibayar: ${window.formatRupiah(remaining)}. Masukkan jumlah yang mau dibayar:`,
          placeholder: "Jumlah pembayaran (Rp)",
          defaultValue: remaining.toString(),
          inputType: "number",
          confirmText: "Simpan Pembayaran",
        });

        if (bayarStr !== null) {
          const bayarNum = parseFloat(bayarStr) || 0;
          if (bayarNum > 0) {
            item.paidAmount = Math.min(item.totalAmount, item.paidAmount + bayarNum);
            saveUtangData(currentData);
            renderTable();
          }
        }
      });
    });

    // Mengikat event handler tombol "Hapus" (desktop & mobile)
    document.querySelectorAll(".deleteUtangBtn").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const id = parseInt(e.target.getAttribute("data-id"));
        const ok = await window.showCustomConfirm({
          title: "Hapus Catatan Tagihan",
          message: "Apakah Anda yakin ingin menghapus catatan utang/piutang ini secara permanen?",
          confirmText: "Ya, Hapus",
          cancelText: "Batal",
          isDanger: true,
        });

        if (ok) {
          const currentData = loadUtangData();
          const filtered = currentData.filter((it) => it.id !== id);
          saveUtangData(filtered);
          renderTable();
        }
      });
    });
  };

  // Menangani permintaan izin notifikasi browser
  const enableNotifBtn = document.getElementById("enableNotifBtn");
  if (enableNotifBtn) {
    if ("Notification" in window && Notification.permission === "granted") {
      const notifBanner = document.getElementById("utangNotifBanner");
      if (notifBanner) notifBanner.classList.add("hidden");
    } else {
      enableNotifBtn.addEventListener("click", () => {
        if ("Notification" in window) {
          Notification.requestPermission().then((permission) => {
            if (permission === "granted") {
              const notifBanner = document.getElementById("utangNotifBanner");
              if (notifBanner) notifBanner.classList.add("hidden");
              checkDueNotifications();
            }
          });
        }
      });
    }
  }

  // Menangani submit form tambah catatan utang/piutang baru
  const form = document.getElementById("utangForm");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const type = document.getElementById("utangType").value;
      const nama = document.getElementById("utangNama").value.trim();
      const wa = document.getElementById("utangWa").value.trim();
      const totalAmount = window.getRawNumber(document.getElementById("utangTotalAmount"));
      const dueDate = document.getElementById("utangDueDate").value;
      const note = document.getElementById("utangNote").value.trim();

      if (!nama || totalAmount <= 0 || !dueDate) return;

      const newItem = {
        id: Date.now(),
        type,
        nama,
        wa,
        totalAmount,
        paidAmount: 0,
        dueDate,
        note,
      };

      const currentData = loadUtangData();
      currentData.unshift(newItem);
      saveUtangData(currentData);

      form.reset();
      renderTable();
      checkDueNotifications();
    });
  }

  renderTable();
  checkDueNotifications();
}

/** Entry point: memasang template UI dan logika ke container yang diberikan */
function renderUtangApp(container) {
  if (!container) return;
  container.innerHTML = getUtangAppUI();
  initUtangAppLogic();
}
