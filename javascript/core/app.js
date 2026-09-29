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
  const dashGreeting = document.getElementById("dashGreeting");
  const dashUsaha = document.getElementById("dashUsaha");
  const dashSaldoKas = document.getElementById("dashSaldoKas");
  const resetProfileBtn = document.getElementById("resetProfileBtn");

  const appModalOverlay = document.getElementById("appModalOverlay");
  const modalAppIcon = document.getElementById("modalAppIcon");
  const modalAppTitle = document.getElementById("modalAppTitle");
  const modalAppContent = document.getElementById("modalAppContent");

  const navbar = document.getElementById("navbar");

  let navbarVisibilityState = "hidden";

  function setNavbarVisibility(visible) {
    if (!navbar) return;
    if (visible) {
      navbar.style.display = "";
      navbarVisibilityState = "visible";
    } else {
      navbar.style.display = "none";
      navbarVisibilityState = "hidden";
    }
  }

  function showNavbarIfProfileExists() {
    const rawStatus = localStorage.getItem("status");
    if (rawStatus) {
      setNavbarVisibility(true);
    } else {
      setNavbarVisibility(false);
    }
  }

  function hideNavbarForModal() {
    if (!navbar) return;
    navbar.classList.remove("open");
    setNavbarVisibility(false);
  }

  function restoreNavbarAfterModal() {
    showNavbarIfProfileExists();
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
  var _dashboardTourPending = false;
  const updateDashboardState = () => {
    const rawStatus = localStorage.getItem("status");
    if (rawStatus) {
      try {
        const userObj = JSON.parse(rawStatus);
        if (contentRegister) contentRegister.style.display = "none";
        if (workspaceDashboard) workspaceDashboard.classList.remove("hidden");

        showNavbarIfProfileExists();

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

        // 4. Trigger dashboard tour on first visit
        if (!_dashboardTourPending && window.LakuTour && !window.LakuTour.isCompleted("dashboard")) {
          _dashboardTourPending = true;
          setTimeout(function () {
            window.LakuTour.start("dashboard");
            _dashboardTourPending = false;
          }, 800);
        }
      } catch (e) {
        console.error("Error parsing user status:", e);
      }
    } else {
      if (contentRegister) contentRegister.style.display = "flex";
      if (workspaceDashboard) workspaceDashboard.classList.add("hidden");
      setNavbarVisibility(false);
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

  const learnReturn = (() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return { page: params.get("return"), scenario: params.get("scenario") };
    } catch (err) {
      return { page: null, scenario: null };
    }
  })();

  const renderLearnReturnBar = (appKey) => {
    const oldBar = document.getElementById("learnReturnBar");
    if (oldBar) oldBar.remove();
    if (!modalAppContent || learnReturn.page !== "learn") return;
    const scenarios = { s1: true, s2: true, s3: true, s4: true, s5: true, s6: true };
    const validScenario = scenarios[learnReturn.scenario] ? learnReturn.scenario : "";
    const bar = document.createElement("div");
    bar.id = "learnReturnBar";
    bar.className = "max-w-3xl mx-auto mb-6 flex flex-col sm:flex-row sm:items-center gap-2 justify-between rounded-2xl border border-emerald-200 bg-emerald-50 p-3";
    bar.innerHTML = `
      <p class="text-xs sm:text-sm font-semibold text-emerald-800">Kamu datang dari Learn. Setelah mencoba ${appKey}, kembali untuk lanjut cerita.</p>
      <button type="button" id="learnReturnBtn" class="bg-[#274c43] hover:bg-[#1f3d36] text-white text-xs sm:text-sm font-bold py-2.5 px-4 rounded-xl transition-colors cursor-pointer">← Kembali ke Belajar</button>
    `;
    modalAppContent.prepend(bar);
    const backBtn = document.getElementById("learnReturnBtn");
    if (backBtn) {
      backBtn.addEventListener("click", () => {
        window.location.href = validScenario ? `learn.html?scenario=${validScenario}` : "learn.html";
      });
    }
  };

  // 7. Global Modal App Launcher & Dismiss Functions
  window.openAppModal = (appKey) => {
    if (!appModalOverlay || !modalAppContent) return;

    hideNavbarForModal();

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
    } else if (appKey === "produksi") {
      if (modalAppIcon)
        modalAppIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6"><path d="M3 7h18"/><path d="M5 3h14v18H5z"/><path d="M8 11h8"/><path d="M8 15h5"/></svg>`;
      if (modalAppTitle) modalAppTitle.textContent = "Produksi Barang";
      if (typeof renderProduksiApp === "function") renderProduksiApp(modalAppContent);
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

    renderLearnReturnBar(appKey);

    // Trigger per-module tour on first visit
    if (window.LakuTour && !window.LakuTour.isCompleted(appKey)) {
      setTimeout(function () {
        window.LakuTour.start(appKey);
      }, 600);
    }
  };

  window.closeAppModal = () => {
    if (!appModalOverlay) return;

    appModalOverlay.classList.remove("opacity-100", "translate-y-0");
    appModalOverlay.classList.add("opacity-0", "translate-y-full");

    setTimeout(() => {
      appModalOverlay.classList.add("hidden");
      document.body.style.overflow = "auto";
      restoreNavbarAfterModal();
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
  showNavbarIfProfileExists();

  // Deep link handler: ?open=moduleKey → auto-open modal
  var urlParams = new URLSearchParams(window.location.search);
  var openKey = urlParams.get("open");
  if (openKey) {
    var validKeys = ["hpp", "produksi", "kas", "utang", "inventory", "laba", "promo"];
    if (validKeys.indexOf(openKey) !== -1) {
      setTimeout(function () {
        window.openAppModal(openKey);
      }, 500);
    }
  }
});