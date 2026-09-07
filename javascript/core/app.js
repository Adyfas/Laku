document.addEventListener("DOMContentLoaded", () => {
  const contentRegister = document.getElementById("contentRegister");
  const regisBanner = document.getElementById("regisBanner");
  const regisFormContainer = document.getElementById("regisFormContainer");
  const buttonSelengkapnya = document.getElementById("buttonSubmitResgiter");
  const backToBannerBtn = document.getElementById("backToBannerBtn");

  const inputNamaResgiter = document.getElementById("namaInput");
  const inputUsahaResgiter = document.getElementById("Usaha");
  const submitDataResgier = document.getElementById("submitDataegister");
  const alertRegister = document.getElementById("alertResgiter");

  const workspaceDashboard = document.getElementById("workspaceDashboard");
  const bottomFloatingNav = document.getElementById("bottomFloatingNav");
  const dashGreeting = document.getElementById("dashGreeting");
  const dashUsaha = document.getElementById("dashUsaha");
  const dashSaldoKas = document.getElementById("dashSaldoKas");
  const resetProfileBtn = document.getElementById("resetProfileBtn");

  const appModalOverlay = document.getElementById("appModalOverlay");
  const modalAppIcon = document.getElementById("modalAppIcon");
  const modalAppTitle = document.getElementById("modalAppTitle");
  const modalAppContent = document.getElementById("modalAppContent");

  // Floating navbar items configuration
  const floatingNavabarItems = [
    {
      id: "navHomeBtn",
      function: "window.closeAppModal()",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 sm:w-6 sm:h-6"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
      name: "Ruang Kerja Utama",
    },
    {
      id: "navHppBtn",
      function: "window.openAppModal('hpp')",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 sm:w-6 sm:h-6"><rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="16" x2="16" y1="14" y2="18"/><path d="M16 10h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M12 18h.01"/><path d="M8 18h.01"/></svg>`,
      name: "Kalkulator HPP",
    },
    {
      id: "navKasBtn",
      function: "window.openAppModal('kas')",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 sm:w-6 sm:h-6"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6 6h10"/><path d="M6 10h10"/></svg>`,
      name: "Buku Kas Digital",
    },
    {
      id: "navUtangBtn",
      function: "window.openAppModal('utang')",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 sm:w-6 sm:h-6"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M15 2H9a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1Z"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></svg>`,
      name: "Buku Utang & Piutang",
    },
    {
      id: "navInventoryBtn",
      function: "window.openAppModal('inventory')",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 sm:w-6 sm:h-6"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>`,
      name: "Stok Inventaris",
    },
    {
      id: "navLabaBtn",
      function: "window.openAppModal('laba')",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 sm:w-6 sm:h-6"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>`,
      name: "Simulasi Laba Rugi",
    },
    {
      id: "navPromoBtn",
      function: "window.openAppModal('promo')",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 sm:w-6 sm:h-6"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.71 1.1-1.38 1.4-2h0a18.2 18.2 0 0 0 7.85-7.85c.62-.3 1.29-.69 2-1.4 1.5-1.5 2-5 2-5s-3.5.5-5 2c-.71.71-1.1 1.38-1.4 2A18.2 18.2 0 0 0 6.5 15.1c-.3.62-.69 1.29-1.4 2Z"/><path d="M12 15l-3-3"/><path d="M15 12l-3-3"/></svg>`,
      name: "AI Promo & Digital",
    },
  ];



  // Utilities sudah dipindah ke core/appUtils.js
  // window.formatNumberInput, getRawNumber, NumberDecimal3Digit → appUtils.js


  // Render floating navbar items via .map().join('')
  if (bottomFloatingNav) {
    bottomFloatingNav.innerHTML = floatingNavabarItems.map(
      (item) => `
        <button onclick="${item.function}" id="${item.id}" title="${item.name}" class="flex flex-col items-center gap-1 p-2 rounded-2xl text-gray-400 hover:text-[#274c43] hover:scale-110 transition-transform cursor-pointer">
          ${item.icon}
        </button>
      `
    ).join("");
  }

  // 1. Mobile Navigation Toggle (Selengkapnya -> Show Form)
  if (buttonSelengkapnya && regisBanner && regisFormContainer) {
    buttonSelengkapnya.addEventListener("click", () => {
      if (window.innerWidth < 1024) {
        regisBanner.classList.add("hidden");
        regisBanner.classList.remove("flex");

        regisFormContainer.classList.remove("hidden");
        regisFormContainer.classList.add("flex");
      }
    });
  }

  // 2. Mobile Navigation Back Toggle (Kembali -> Show Banner)
  if (backToBannerBtn && regisBanner && regisFormContainer) {
    backToBannerBtn.addEventListener("click", () => {
      if (window.innerWidth < 1024) {
        regisFormContainer.classList.add("hidden");
        regisFormContainer.classList.remove("flex");

        regisBanner.classList.remove("hidden");
        regisBanner.classList.add("flex");
      }
    });
  }

  // 3. Reset Desktop/Mobile Display on Window Resize
  window.addEventListener("resize", () => {
    if (window.innerWidth >= 1024) {
      if (regisBanner) {
        regisBanner.classList.remove("hidden");
        regisBanner.classList.add("flex");
      }
      if (regisFormContainer) {
        regisFormContainer.classList.remove("hidden");
        regisFormContainer.classList.add("flex");
      }
    }
  });

  // 4. Update Workspace Dashboard Info
  const updateDashboardState = () => {
    const rawStatus = localStorage.getItem("status");
    if (rawStatus) {
      try {
        const userObj = JSON.parse(rawStatus);
        if (contentRegister) contentRegister.style.display = "none";
        if (workspaceDashboard) workspaceDashboard.classList.remove("hidden");
        if (bottomFloatingNav) bottomFloatingNav.classList.remove("hidden");

        if (dashGreeting)
          dashGreeting.textContent = `Selamat Datang, ${userObj.nama || "Pelaku UMKM"}!`;
        if (dashUsaha)
          dashUsaha.textContent = `Usaha: ${userObj.usaha || userObj.Usaha || "UMKM Indonesia"}`;

        // 1. Calculate Saldo Kas
        const kasRaw = localStorage.getItem("laku_cashbook_data");
        const dashSaldoKas = document.getElementById("dashSaldoKas");
        if (dashSaldoKas) {
          if (kasRaw) {
            const kasData = JSON.parse(kasRaw);
            let totalMasuk = 0;
            let totalKeluar = 0;
            kasData.forEach((item) => {
              if (item.type === "pemasukan") totalMasuk += item.amount;
              else totalKeluar += item.amount;
            });
            const saldo = totalMasuk - totalKeluar;
            dashSaldoKas.textContent = new Intl.NumberFormat("id-ID", {
              style: "currency",
              currency: "IDR",
              maximumFractionDigits: 0,
            }).format(saldo);
          } else {
            dashSaldoKas.textContent = "Rp 0";
          }
        }

        // 2. Calculate Total Piutang (Tagihan)
        const utangRaw = localStorage.getItem("laku_utang_data");
        const dashTotalPiutang = document.getElementById("dashTotalPiutang");
        if (dashTotalPiutang) {
          if (utangRaw) {
            const utangData = JSON.parse(utangRaw);
            let totalPiutang = 0;
            utangData.forEach((item) => {
              const remaining = item.totalAmount - item.paidAmount;
              if (item.type === "piutang" && remaining > 0) {
                totalPiutang += remaining;
              }
            });
            dashTotalPiutang.textContent = new Intl.NumberFormat("id-ID", {
              style: "currency",
              currency: "IDR",
              maximumFractionDigits: 0,
            }).format(totalPiutang);
          } else {
            dashTotalPiutang.textContent = "Rp 0";
          }
        }

        // 3. Calculate Total Stok Inventaris
        const invRaw = localStorage.getItem("laku_inventory_data");
        const dashTotalStok = document.getElementById("dashTotalStok");
        if (dashTotalStok) {
          if (invRaw) {
            const invData = JSON.parse(invRaw);
            let lowCount = 0;
            invData.forEach((it) => {
              if (it.stok <= it.minStok) lowCount++;
            });
            dashTotalStok.textContent = lowCount > 0
              ? `${invData.length} Item (${lowCount} Tipis)`
              : `${invData.length} Item (Aman)`;
          } else {
            dashTotalStok.textContent = "0 Item";
          }
        }

        // 4. Update AI Promo Card Status
        const dashPromoStatus = document.getElementById("dashPromoStatus");
        if (dashPromoStatus) {
          dashPromoStatus.textContent = "Siap Buat Caption";
        }
      } catch (e) {
        console.error("Error parsing user status:", e);
      }
    } else {
      if (contentRegister) contentRegister.style.display = "flex";
      if (workspaceDashboard) workspaceDashboard.classList.add("hidden");
      if (bottomFloatingNav) bottomFloatingNav.classList.add("hidden");
    }
  };

  // 5. Submit Registration Handler
  if (submitDataResgier) {
    submitDataResgier.addEventListener("click", (e) => {
      e.preventDefault();
      if (
        inputNamaResgiter &&
        inputUsahaResgiter &&
        inputNamaResgiter.value.trim() !== "" &&
        inputUsahaResgiter.value.trim() !== ""
      ) {
        let valueregister = {
          nama: inputNamaResgiter.value.trim(),
          usaha: inputUsahaResgiter.value.trim(),
          status: true,
        };
        localStorage.setItem("status", JSON.stringify(valueregister));
        updateDashboardState();
      } else {
        if (alertRegister)
          alertRegister.textContent = "Tolong isi input secara lengkap!";
      }
    });
  }

  // 6. Reset Profile Action
  if (resetProfileBtn) {
    resetProfileBtn.addEventListener("click", async () => {
      const ok = await window.showCustomConfirm({
        title: "Reset Profil Usaha",
        message: "Apakah Anda yakin ingin mereset profil usaha di peramban ini?",
        confirmText: "Ya, Reset Profil",
        cancelText: "Batal",
        isDanger: true,
      });

      if (ok) {
        localStorage.removeItem("status");
        location.reload();
      }
    });
  }

  // 7. Active Nav Button Highlighting Helper
  const updateActiveNavState = (activeKey = "home") => {
    const navMap = {
      home: document.getElementById("navHomeBtn"),
      hpp: document.getElementById("navHppBtn"),
      kas: document.getElementById("navKasBtn"),
      utang: document.getElementById("navUtangBtn"),
      inventory: document.getElementById("navInventoryBtn"),
      laba: document.getElementById("navLabaBtn"),
      promo: document.getElementById("navPromoBtn"),
    };

    Object.keys(navMap).forEach((key) => {
      const btn = navMap[key];
      if (!btn) return;
      if (key === activeKey) {
        btn.className =
          "flex flex-col items-center gap-1 p-2 rounded-2xl text-[#274c43] bg-emerald-50 scale-110 transition-transform cursor-pointer";
      } else {
        btn.className =
          "flex flex-col items-center gap-1 p-2 rounded-2xl text-gray-400 hover:text-[#274c43] hover:scale-110 transition-transform cursor-pointer";
      }
    });
  };

  // 8. Global Modal App Launcher & Dismiss Functions
  window.openAppModal = (appKey) => {
    if (!appModalOverlay || !modalAppContent) return;

    updateActiveNavState(appKey);

    appModalOverlay.classList.remove("hidden");
    document.body.style.overflow = "hidden";

    setTimeout(() => {
      appModalOverlay.classList.remove("opacity-0", "translate-y-full");
      appModalOverlay.classList.add("opacity-100", "translate-y-0");
    }, 10);

    if (appKey === "hpp") {
      if (modalAppIcon)
        modalAppIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6"><rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="16" x2="16" y1="14" y2="18"/><path d="M16 10h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M12 18h.01"/><path d="M8 18h.01"/></svg>`;
      if (modalAppTitle)
        modalAppTitle.textContent = "Hitung Modal & Harga Jual";
      if (typeof renderHppApp === "function") renderHppApp(modalAppContent);
    } else if (appKey === "kas") {
      if (modalAppIcon)
        modalAppIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6 6h10"/><path d="M6 10h10"/></svg>`;
      if (modalAppTitle) modalAppTitle.textContent = "Catat Keuangan Harian";
      if (typeof renderKasApp === "function") renderKasApp(modalAppContent);
    } else if (appKey === "utang") {
      if (modalAppIcon)
        modalAppIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M15 2H9a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1Z"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></svg>`;
      if (modalAppTitle) modalAppTitle.textContent = "Catat Utang & Piutang";
      if (typeof renderUtangApp === "function") renderUtangApp(modalAppContent);
    } else if (appKey === "inventory") {
      if (modalAppIcon)
        modalAppIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>`;
      if (modalAppTitle) modalAppTitle.textContent = "Stok Barang & Bahan";
      if (typeof renderInventoryApp === "function") renderInventoryApp(modalAppContent);
    } else if (appKey === "laba") {
      if (modalAppIcon)
        modalAppIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>`;
      if (modalAppTitle)
        modalAppTitle.textContent = "Cek Untung Rugi Bulanan";
      if (typeof renderLabaApp === "function") renderLabaApp(modalAppContent);
    } else if (appKey === "promo") {
      if (modalAppIcon)
        modalAppIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.71 1.1-1.38 1.4-2h0a18.2 18.2 0 0 0 7.85-7.85c.62-.3 1.29-.69 2-1.4 1.5-1.5 2-5 2-5s-3.5.5-5 2c-.71.71-1.1 1.38-1.4 2A18.2 18.2 0 0 0 6.5 15.1c-.3.62-.69 1.29-1.4 2Z"/><path d="M12 15l-3-3"/><path d="M15 12l-3-3"/></svg>`;
      if (modalAppTitle)
        modalAppTitle.textContent = "Buat Teks Promo WA";
      if (typeof renderPromoApp === "function") renderPromoApp(modalAppContent);
    }
  };

  window.closeAppModal = () => {
    if (!appModalOverlay) return;

    updateActiveNavState("home");

    appModalOverlay.classList.remove("opacity-100", "translate-y-0");
    appModalOverlay.classList.add("opacity-0", "translate-y-full");

    setTimeout(() => {
      appModalOverlay.classList.add("hidden");
      document.body.style.overflow = "auto";
      updateDashboardState();
    }, 300);
  };

  // Close Modal on ESC key
  document.addEventListener("keydown", (e) => {
    if (
      e.key === "Escape" &&
      appModalOverlay &&
      !appModalOverlay.classList.contains("hidden")
    ) {
      window.closeAppModal();
    }
  });

  // Initial State Check
  updateDashboardState();

  // Highlight default active tab
  updateActiveNavState("home");
});
