window.LakuTour = (function () {
  var STORAGE_KEY = "laku_tour_completed";
  var OVERLAY_Z = 99990;
  var FRAME_Z = 99991;
  var POPOVER_Z = 99995;

  var currentSteps = [];
  var currentKey = "";
  var currentIndex = 0;
  var isRunning = false;
  var scrollRafId = null;
  var startTimeoutId = null;

  // DOM Elements
  var rootContainer = null;
  var svgMask = null;
  var cutoutRect = null;
  var spotlightFrame = null;
  var popover = null;
  var popoverArrow = null;
  var currentTargetEl = null;
  var hiddenEls = [];

  // ─── Tour Step Definitions ─────────────────────────────────

  var tourDefinitions = {
    dashboard: [
      {
        selector: "#dashGreeting",
        title: "Selamat Datang di LAKU! " + window.LakuIcons.svg("happy", "1em"),
        description:
          "Ini pusat kendali usaha kamu. Dari sini kamu bisa memantau kondisi keuangan dan membuka semua alat kerja UMKM.",
      },
      {
        selector: "#dashSummaryGrid",
        title: "Rangkuman Keuangan Cepat " + window.LakuIcons.svg("wallet", "1em"),
        description:
          "Lihat saldo kas aktif, tagihan piutang pelanggan, stok barang, dan akses cepat ke Produksi dalam 4 kartu ringkasan.",
      },
      {
        selector: "#dashQuickHpp",
        title: "Kalkulator HPP & Harga Jual " + window.LakuIcons.svg("calculator", "1em"),
        description:
          "Hitung modal per porsi atau per produk secara akurat dan tentukan harga jual yang pas agar bisnismu tidak rugi.",
      },
      {
        selector: "#dashQuickKas",
        title: "Buku Kas Harian " + window.LakuIcons.svg("book", "1em"),
        description:
          "Catat uang masuk dan uang keluar tiap hari agar pembukuan kas rapi dan keuangan bisnis terpisah dari uang pribadi.",
      },
      {
        selector: "#dashQuickUtang",
        title: "Utang & Piutang " + window.LakuIcons.svg("creditCard", "1em"),
        description:
          "Catat utang ke supplier dan piutang dari pelanggan. Pantau jatuh tempo, status lunas, dan kirim pengingat WA otomatis.",
      },
      {
        selector: "#dashQuickLaba",
        title: "Cek Untung Rugi Bulanan " + window.LakuIcons.svg("chart", "1em"),
        description:
          "Simulasi laba rugi bulanan. Masukkan target penjualan, biaya bahan, dan beban tetap untuk lihat estimasi laba & titik balik modal (BEP).",
      },
      {
      selector: "#dashQuickInventory",
        title: "Stok Barang & Bahan " + window.LakuIcons.svg("package", "1em"),
        description:
          "Kelola seluruh bahan baku dan produk jualan. Sistem otomatis memberi peringatan saat stok mulai menipis.",
      },
      {
        selector: "#dashQuickProduksi",
        title: "Catat Produksi " + window.LakuIcons.svg("save", "1em"),
        description:
          "Pilih resep saat benar-benar membuat produk. Setelah dikonfirmasi, stok bahan berkurang dan hasil produksi tercatat.",
      },
      {
        selector: "#nav-menu-btn",
        title: "Navigasi Aplikasi " + window.LakuIcons.svg("menu", "1em"),
        description:
          "Klik tombol menu di pojok kanan atas untuk membuka navigasi aplikasi. Di sana kamu bisa beralih ke Beranda atau membuka Kalkulator HPP, Produksi, Buku Kas, Utang & Piutang, Inventaris, dan Simulasi Laba Rugi.",
      },
      {
        selector: "#resetProfileBtn",
        title: "Pengaturan Profil " + window.LakuIcons.svg("closeCircle", "1em"),
        description:
          "Klik tombol ini jika kamu ingin mengganti nama pemilik atau nama usaha yang tersimpan di peramban ini.",
      },
    ],

    hpp: [
      {
        selector: "#hppStepIndicator",
        title: "Alur 4 Langkah Praktis " + window.LakuIcons.svg("document", "1em"),
        description:
          "Perhitungan modal dilakukan bertahap: Info Produk → Pilih Bahan dari Stok → Biaya Operasional → Tentukan Margin & Harga Jual.",
      },
      {
        selector: "#hppStep1",
        title: "Langkah 1: Info Produk " + window.LakuIcons.svg("memo", "1em"),
        description:
          "Tulis nama produk yang ingin kamu hitung serta berapa banyak jumlah porsi/unit yang dihasilkan dalam sekali produksi.",
      },
      {
        selector: "#hppRecipeListSection",
        title: "Resep Tersimpan " + window.LakuIcons.svg("document", "1em"),
        description:
          "Kumpulan resep dan hitungan modal yang sudah kamu simpan. Bisa dilihat, diedit, atau diduplikat kapan saja tanpa hitung ulang.",
      },
    ],

    kas: [
      {
        selector: "#kasTotalMasuk",
        title: "Rangkuman Kas " + window.LakuIcons.svg("wallet", "1em"),
        description:
          "Pantau total uang masuk (pemasukan), uang keluar (pengeluaran), serta sisa saldo bersih kas usaha saat ini.",
        highlightParent: true,
      },
      {
        selector: "#kasForm",
        title: "Tambah Transaksi Kas +",
        description:
          "Pilih jenis transaksi (uang masuk atau keluar), masukkan nominal rupiah, dan beri catatan ringkas keterangannya.",
      },
      {
        selector: "#kasForm button[type=submit]",
        title: "Simpan Transaksi " + window.LakuIcons.svg("save", "1em"),
        description:
          "Klik tombol ini untuk menyimpan catatan kas. Data akan langsung terupdate otomatis di ringkasan dan riwayat.",
      },
      {
        selector: "#kasTableBody",
        fallbackSelector: "#kasMobileList",
        title: "Riwayat Transaksi " + window.LakuIcons.svg("document", "1em"),
        description:
          "Semua mutasi uang masuk dan keluar tercatat rapi di sini dan dapat dihapus jika terjadi kesalahan input.",
      },
      {
        selector: "#clearKasBtn",
        title: "Reset Catatan " + window.LakuIcons.svg("closeCircle", "1em"),
        description:
          "Opsi untuk menghapus seluruh catatan kas jika kamu ingin memulai pembukuan baru dari nol. Gunakan dengan bijak.",
      },
    ],

    inventory: [
      {
        selector: "#invTotalItems",
        title: "Status Stok Persediaan " + window.LakuIcons.svg("chart", "1em"),
        description:
          "Pantau total jenis barang, jumlah barang yang stoknya menipis, dan barang yang sudah habis.",
        highlightParent: true,
      },
      {
        selector: "#inventoryForm",
        title: "Tambah Barang & Bahan +",
        description:
          "Daftarkan bahan baku atau produk jualan dengan mengisi nama, kategori, harga beli/modal, dan jumlah stok awal.",
      },
      {
        selector: "#invSatuan",
        title: "Pilihan Satuan Lengkap " + window.LakuIcons.svg("tag", "1em"),
        description:
          "Tersedia kg, gram, liter, ml, pcs, botol, dll. Satuan ini otomatis dikonversi saat dipakai di kalkulator HPP.",
        highlightParent: true,
      },
      {
        selector: "#invMinStok",
        title: "Batas Stok Minimum " + window.LakuIcons.svg("flag", "1em"),
        description:
          "Tentukan batas aman stok. Aplikasi akan otomatis memberi peringatan jika persediaan sudah harus dibeli lagi.",
        highlightParent: true,
      },
      {
        selector: "#inventoryTableBody",
        fallbackSelector: "#inventoryMobileList",
        title: "Daftar Inventaris " + window.LakuIcons.svg("document", "1em"),
        description:
          "Semua persediaan barang tersimpan di sini. Kamu bisa langsung menambah, mengurangi stok, atau menghapus item.",
      },
    ],

    utang: [
      {
        selector: "#utangTotalPiutang",
        title: "Rangkuman Utang & Piutang " + window.LakuIcons.svg("creditCard", "1em"),
        description:
          "Pantau total tagihan piutang (uang kamu di orang lain) vs tanggungan utang ke supplier serta yang jatuh tempo hari ini.",
        highlightParent: true,
      },
      {
        selector: "#utangForm",
        title: "Tambah Catatan Tagihan +",
        description:
          "Catat nama pelanggan/supplier, nominal utang, keterangan barang, serta tanggal jatuh tempo pembayaran.",
      },
      {
        selector: "#utangWa",
        title: "Nomor WhatsApp Pengingat " + window.LakuIcons.svg("alarm", "1em"),
        description:
          "Isi nomor WA pelanggan agar kamu bisa langsung mengirim pesan tagihan ramah lewat WhatsApp dengan satu klik.",
        highlightParent: true,
      },
      {
        selector: "#utangNotifBanner",
        title: "Notifikasi Browser " + window.LakuIcons.svg("alarm", "1em"),
        description:
          "Aktifkan pengingat browser agar sistem otomatis memberi notifikasi saat ada catatan utang yang jatuh tempo.",
      },
      {
        selector: "#utangTableBody",
        fallbackSelector: "#utangMobileList",
        title: "Daftar Tagihan & Kas Bon " + window.LakuIcons.svg("document", "1em"),
        description:
          "Kelola seluruh catatan utang-piutang, pantau status lunas, dan catat pembayaran cicilan secara bertahap.",
      },
    ],

    laba: [
      {
        selector: "#labaForm",
        title: "Simulasi Laba Rugi " + window.LakuIcons.svg("chart", "1em"),
        description:
          "Alat simulasi untuk menghitung proyeksi keuntungan bulanan dan mengetahui titik balik modal (BEP) bisnis kamu.",
      },
      {
        selector: "#labaQty",
        title: "Target Penjualan & Harga " + window.LakuIcons.svg("tag", "1em"),
        description:
          "Masukkan perkiraan jumlah produk yang ingin dijual per bulan beserta harga jual per unitnya.",
        highlightParent: true,
      },
      {
        selector: "#labaVariabel",
        title: "Biaya Bahan & Beban Tetap " + window.LakuIcons.svg("lightbulb", "1em"),
        description:
          "Masukkan biaya bahan per unit serta beban tetap bulanan seperti sewa tempat, listrik, dan gaji karyawan.",
        highlightParent: true,
      },
      {
        selector: "#labaForm button[type=submit]",
        title: "Jalankan Simulasi " + window.LakuIcons.svg("play", "1em"),
        description:
          "Klik untuk melihat hasil analisis: status usaha, total omzet, estimasi laba bersih, dan titik impas balik modal (BEP).",
      },
    ],

    produksi: [
      {
        selector: "#produksiTabResep",
        title: "Daftar Resep " + window.LakuIcons.svg("document", "1em"),
        description:
          "Workflow produksi dimulai dari tab ini. Contoh dummy: pilih resep Nasi Goreng yang menghasilkan 10 porsi. Menyimpan resep belum mengurangi stok.",
      },
      {
        selector: "#produksiRecipeList",
        title: "Pilih Jumlah Produksi " + window.LakuIcons.svg("calculator", "1em"),
        description:
          "Pilih barang dari daftar resep. Contoh dummy: Nasi Goreng memakai Beras 0,5 kg dan Telur 2 butir per 10 porsi. Sistem membaca bahan dari resep tersebut.",
      },
      {
        selector: "[data-produksi-qty]",
        fallbackSelector: "#produksiRecipeList",
        title: "Masukkan Jumlah Produksi " + window.LakuIcons.svg("calculator", "1em"),
        description:
          "Isi jumlah yang benar-benar dibuat. Contoh dummy: masukkan 3 untuk membuat 3 batch resep. Jumlah ini dikalikan dengan kebutuhan setiap bahan.",
      },
      {
        selector: "[data-produksi-id]",
        fallbackSelector: "#produksiRecipeList",
        title: "Jalankan Produksi " + window.LakuIcons.svg("play", "1em"),
        description:
          "Klik tombol Produksi pada resep yang dipilih. Pada popup berikutnya, periksa nama produk dan jumlahnya, lalu pilih Ya untuk mengecek stok atau Batal untuk kembali.",
      },
      {
        selector: "#produksiTabRiwayat",
        title: "Riwayat Produksi " + window.LakuIcons.svg("chart", "1em"),
        description:
          "Setelah stok semua bahan cukup dan kamu memilih Ya, buka tab ini. Contoh hasil dummy: 3 batch Nasi Goreng, total biaya, omzet, dan profit tercatat otomatis. Catatan produksi bersifat tetap.",
      },
      {
        selector: "#produksiSummary",
        fallbackSelector: "#produksiHistoryList",
        title: "Lihat Ringkasan Profit " + window.LakuIcons.svg("wallet", "1em"),
        description:
          "Gunakan ringkasan untuk melihat Total Profit, Total Produksi, dan Rata-rata Profit. Jika stok kurang, transaksi dibatalkan dan tidak ada bahan yang berkurang.",
        highlightParent: true,
      },
    ],

    promo: [
      {
        selector: "#promoNama",
        title: "Nama Produk / Usaha " + window.LakuIcons.svg("pencil", "1em"),
        description:
          "Tulis nama produk atau nama usaha yang ingin kamu promosikan ke calon pelanggan.",
        highlightParent: true,
      },
      {
        selector: "#promoKategori",
        title: "Kategori & Gaya Bahasa AI " + window.LakuIcons.svg("sparkle", "1em"),
        description:
          "Pilih bidang usaha serta gaya bahasa promosi: ramah & akrab, heboh diskon, profesional, atau lucu kekinian.",
        highlightParent: true,
      },
      {
        selector: "#promoDetail",
        title: "Keunggulan & Penawaran " + window.LakuIcons.svg("tag", "1em"),
        description:
          "Tulis penawaran menarik seperti diskon, bonus gratis, atau rasa/kualitas unggulan produk kamu.",
        highlightParent: true,
      },
      {
        selector: "#submitPromoAiBtn",
        title: "Buat Caption Otomatis " + window.LakuIcons.svg("sparkle", "1em"),
        description:
          "Klik tombol ini dan AI akan langsung membuatkan teks promosi siap kirim ke WhatsApp dan media sosial.",
      },
    ],
  };

  // ─── localStorage Helpers ──────────────────────────────────

  function _loadStatus() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function _saveStatus(obj) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
    } catch (e) {}
  }

  // ─── DOM Creation ──────────────────────────────────────────

  function _createDOM() {
    if (rootContainer) return;

    // Root container
    rootContainer = document.createElement("div");
    rootContainer.id = "lakuTourContainer";
    rootContainer.className = "laku-tour-root";
    rootContainer.style.cssText =
      "position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:" +
      OVERLAY_Z +
      ";";

    // SVG Overlay Mask
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "laku-tour-svg-mask");
    svg.setAttribute(
      "style",
      "position:fixed;inset:0;width:100%;height:100%;pointer-events:auto;"
    );

    var defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    var mask = document.createElementNS("http://www.w3.org/2000/svg", "mask");
    mask.setAttribute("id", "lakuTourMaskId");

    // White base (masks everything in darkness)
    var whiteRect = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "rect"
    );
    whiteRect.setAttribute("width", "100%");
    whiteRect.setAttribute("height", "100%");
    whiteRect.setAttribute("fill", "white");

    // Cutout hole (transparent window to view the target)
    cutoutRect = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "rect"
    );
    cutoutRect.setAttribute("id", "lakuTourCutout");
    cutoutRect.setAttribute("x", "0");
    cutoutRect.setAttribute("y", "0");
    cutoutRect.setAttribute("width", "0");
    cutoutRect.setAttribute("height", "0");
    cutoutRect.setAttribute("rx", "16");
    cutoutRect.setAttribute("ry", "16");
    cutoutRect.setAttribute("fill", "black");
    cutoutRect.style.transition =
      "x 0.3s cubic-bezier(0.16, 1, 0.3, 1), y 0.3s cubic-bezier(0.16, 1, 0.3, 1), width 0.3s cubic-bezier(0.16, 1, 0.3, 1), height 0.3s cubic-bezier(0.16, 1, 0.3, 1), rx 0.3s ease";

    mask.appendChild(whiteRect);
    mask.appendChild(cutoutRect);
    defs.appendChild(mask);
    svg.appendChild(defs);

    // Dark backdrop rect using mask
    var darkRect = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "rect"
    );
    darkRect.setAttribute("width", "100%");
    darkRect.setAttribute("height", "100%");
    darkRect.setAttribute("fill", "rgba(15, 23, 42, 0.72)");
    darkRect.setAttribute("mask", "url(#lakuTourMaskId)");
    svg.appendChild(darkRect);

    // Clicking dark overlay stops propagation
    svg.addEventListener("click", function (e) {
      e.stopPropagation();
    });

    rootContainer.appendChild(svg);
    svgMask = svg;

    // Floating Spotlight Outline Frame
    spotlightFrame = document.createElement("div");
    spotlightFrame.id = "lakuTourFrame";
    spotlightFrame.className = "laku-tour-spotlight-frame";
    spotlightFrame.style.cssText =
      "position:fixed;pointer-events:none;z-index:" +
      FRAME_Z +
      ";border-radius:18px;border:2.5px solid #274c43;box-shadow:0 0 0 4px rgba(39, 76, 67, 0.35), 0 0 25px rgba(39, 76, 67, 0.25);transition:all 0.3s cubic-bezier(0.16, 1, 0.3, 1);opacity:0;";
    
    // Pulse ring glow
    var pulseRing = document.createElement("div");
    pulseRing.className = "laku-tour-pulse-glow";
    spotlightFrame.appendChild(pulseRing);

    rootContainer.appendChild(spotlightFrame);

    // Popover Card
    popover = document.createElement("div");
    popover.id = "lakuTourPopover";
    popover.className = "laku-tour-popover";
    popover.style.cssText =
      "position:fixed;z-index:" +
      POPOVER_Z +
      ";pointer-events:auto;max-width:380px;width:calc(100vw - 28px);";

    // Dynamic Arrow Pointer
    popoverArrow = document.createElement("div");
    popoverArrow.id = "lakuTourArrow";
    popoverArrow.className = "laku-tour-arrow";
    popover.appendChild(popoverArrow);

    rootContainer.appendChild(popover);
    document.body.appendChild(rootContainer);
  }

  function _removeDOM() {
    console.log("[LakuTour] _removeDOM called, rootContainer:", !!rootContainer);
    if (rootContainer) {
      rootContainer.style.display = "none";
      try { rootContainer.innerHTML = ""; } catch (e) {}
      rootContainer.remove();
      rootContainer = null;
      svgMask = null;
      cutoutRect = null;
      spotlightFrame = null;
      popover = null;
      popoverArrow = null;
      currentTargetEl = null;
      console.log("[LakuTour] DOM removed successfully");
    }
  }


  function _calculateTargetBounds(el) {
    if (!el) return null;

    var rect = el.getBoundingClientRect();
    var top = rect.top;
    var left = rect.left;
    var width = rect.width;
    var height = rect.height;

    if (width === 0 && height === 0) {
      var parent = el.parentElement;
      while (parent && parent !== document.body) {
        var pRect = parent.getBoundingClientRect();
        if (pRect.width > 0 && pRect.height > 0) {
          top = pRect.top;
          left = pRect.left;
          width = pRect.width;
          height = pRect.height;
          break;
        }
        parent = parent.parentElement;
      }
    }

    var pad = 8;
    
    var finalTop = top - pad;
    var finalLeft = left - pad;
    var finalWidth = width + pad * 2;
    var finalHeight = height + pad * 2;

    var radius = Math.min(18, Math.round(finalWidth / 8));
    if (radius < 10) radius = 10;

    return {
      top: finalTop,
      left: finalLeft,
      width: Math.max(finalWidth, 24),
      height: Math.max(finalHeight, 24),
      right: finalLeft + finalWidth,
      bottom: finalTop + finalHeight,
      centerX: finalLeft + finalWidth / 2,
      centerY: finalTop + finalHeight / 2,
      radius: radius
    };
  }

  function _updateSpotlight(bounds) {
    if (!bounds || !cutoutRect || !spotlightFrame) return;

    cutoutRect.setAttribute("x", bounds.left);
    cutoutRect.setAttribute("y", bounds.top);
    cutoutRect.setAttribute("width", bounds.width);
    cutoutRect.setAttribute("height", bounds.height);
    cutoutRect.setAttribute("rx", bounds.radius);
    cutoutRect.setAttribute("ry", bounds.radius);

    spotlightFrame.style.top = bounds.top + "px";
    spotlightFrame.style.left = bounds.left + "px";
    spotlightFrame.style.width = bounds.width + "px";
    spotlightFrame.style.height = bounds.height + "px";
    spotlightFrame.style.borderRadius = bounds.radius + "px";
    spotlightFrame.style.opacity = "1";
  }

  function _positionPopover(bounds) {
    if (!popover || !bounds) return;

    var popW = popover.offsetWidth || 340;
    var popH = popover.offsetHeight || 220;
    var gap = 16;
    var vw = window.innerWidth;
    var vh = window.innerHeight;
    var edgePad = 8;

    var placement = "bottom";
    var top = 0;
    var left = 0;

    var spaceBottom = vh - bounds.bottom;
    var spaceTop = bounds.top;
    var spaceRight = vw - bounds.right;
    var spaceLeft = bounds.left;

    var isMobile = vw < 640;
    var minSpace = 120;

    // Smart directional placement: priority bottom > top > right > left
    if (spaceBottom >= Math.max(minSpace, popH + gap + edgePad)) {
      placement = "bottom";
      top = bounds.bottom + gap;
    } else if (spaceTop >= Math.max(minSpace, popH + gap + edgePad)) {
      placement = "top";
      top = bounds.top - popH - gap;
    } else if (spaceRight >= Math.max(minSpace, popW + gap + edgePad) && !isMobile) {
      placement = "right";
      top = bounds.centerY - popH / 2;
      left = bounds.right + gap;
    } else if (spaceLeft >= Math.max(minSpace, popW + gap + edgePad) && !isMobile) {
      placement = "left";
      top = bounds.centerY - popH / 2;
      left = bounds.left - popW - gap;
    } else {
      // No direction has enough space — center popover on screen
      placement = "bottom";
      top = Math.max(edgePad, (vh - popH) / 2);
      left = Math.max(edgePad, (vw - popW) / 2);
    }

    // Horizontal centering for top/bottom placement
    if (placement === "bottom" || placement === "top") {
      left = bounds.centerX - popW / 2;
    }

    // Clamp horizontally: keep popover within viewport edges
    if (left < edgePad) left = edgePad;
    if (left + popW > vw - edgePad) left = Math.max(edgePad, vw - popW - edgePad);

    // Clamp vertically
    if (top < edgePad) top = edgePad;
    if (top + popH > vh - edgePad) top = Math.max(edgePad, vh - popH - edgePad);

    popover.setAttribute("data-placement", placement);
    popover.style.top = Math.round(top) + "px";
    popover.style.left = Math.round(left) + "px";
    popover.style.opacity = "1";

    if (popoverArrow) {
      _positionArrow(placement, bounds, top, left, popW, popH);
    }
  }

  function _positionArrow(placement, bounds, popTop, popLeft, popW, popH) {
    popoverArrow.className = "laku-tour-arrow laku-tour-arrow-" + placement;
    if (placement === "bottom" || placement === "top") {
      var arrowLeft = bounds.centerX - popLeft;
      arrowLeft = Math.max(24, Math.min(popW - 24, arrowLeft));
      popoverArrow.style.left = Math.round(arrowLeft) + "px";
      popoverArrow.style.top = "";
    } else if (placement === "left" || placement === "right") {
      var arrowTop = bounds.centerY - popTop;
      arrowTop = Math.max(24, Math.min(popH - 24, arrowTop));
      popoverArrow.style.top = Math.round(arrowTop) + "px";
      popoverArrow.style.left = "";
    }
  }

  var lastBoundsStr = "";
  var engineRafId = null;

  function _engineLoop() {
    if (!isRunning || !rootContainer) return;
    
    if (currentTargetEl) {
      var bounds = _calculateTargetBounds(currentTargetEl);
      if (bounds && popover) {
        var popW = popover.offsetWidth;
        var popH = popover.offsetHeight;
        var vw = window.innerWidth;
        var vh = window.innerHeight;
        
        var boundsStr = Math.round(bounds.top) + "," + Math.round(bounds.left) + "," + Math.round(bounds.width) + "," + Math.round(bounds.height) + "," + vw + "," + vh + "," + popW + "," + popH;
        
        if (boundsStr !== lastBoundsStr) {
          lastBoundsStr = boundsStr;
          _updateSpotlight(bounds);
          _positionPopover(bounds);
        }
      }
    }
    
    engineRafId = requestAnimationFrame(_engineLoop);
  }


  function _scrollTargetIntoView(el) {
    if (!el) return;
    try {
      var rect = el.getBoundingClientRect();
      var vh = window.innerHeight;

      var modalOverlay = document.getElementById("appModalOverlay");
      if (modalOverlay && modalOverlay.contains(el)) {
        var modalRect = modalOverlay.getBoundingClientRect();
        var elTopInModal = rect.top - modalRect.top + modalOverlay.scrollTop;
        var targetScroll = elTopInModal - (modalRect.height / 2) + (rect.height / 2);
        modalOverlay.scrollTo({
          top: targetScroll,
          behavior: "smooth",
        });
      } else {
        if (rect.top >= 0 && rect.bottom <= vh) return;

        el.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "nearest",
        });
      }
    } catch (e) {
      try {
        el.scrollIntoView(true);
      } catch (e2) {}
    }
  }


  function _renderPopover() {
    if (!popover) return;
    var step = currentSteps[currentIndex];
    var total = currentSteps.length;
    var isFirst = currentIndex === 0;
    var isLast = currentIndex === total - 1;

    var innerContent = popover.querySelector(".laku-tour-popover-content");
    if (!innerContent) {
      innerContent = document.createElement("div");
      innerContent.className = "laku-tour-popover-content";
      popover.appendChild(innerContent);
    }

    innerContent.innerHTML =
      '<div class="laku-tour-card-header">' +
      '<div class="laku-tour-badge-step">' +
      '<span class="laku-tour-badge-dot"></span>' +
      "Langkah " + (currentIndex + 1) + " dari " + total +
      "</div>" +
      '<button class="laku-tour-btn-close" data-action="skip" title="Tutup Panduan" aria-label="Tutup Panduan">\u2715</button>' +
      "</div>" +
      '<h3 class="laku-tour-title">' + step.title + "</h3>" +
      '<p class="laku-tour-desc">' + step.description + "</p>" +
      '<div class="laku-tour-footer">' +
      '<button class="laku-tour-btn-skip" data-action="skip">Lewati</button>' +
      '<div class="laku-tour-footer-nav">' +
      (isFirst ? "" : '<button class="laku-tour-btn-prev" data-action="prev">\u2190 Kembali</button>') +
      (isLast ? '<button class="laku-tour-btn-done" data-action="done">Selesai \u2713</button>' : '<button class="laku-tour-btn-next" data-action="next">Lanjut \u2192</button>') +
      "</div>" +
      "</div>" +
      '<div class="laku-tour-keyboard-hint">Tekan <kbd>Enter \u21B5</kbd> untuk lanjut, <kbd>Esc</kbd> untuk tutup</div>';

    var btns = innerContent.querySelectorAll("[data-action]");
    for (var i = 0; i < btns.length; i++) {
      btns[i].addEventListener("click", _handleAction);
    }
  }

  function _handleAction(e) {
    e.stopPropagation();
    e.preventDefault();
    var action = e.currentTarget.getAttribute("data-action");
    console.log("[LakuTour] _handleAction called, action:", action);
    if (action === "next") _goToStep(currentIndex + 1);
    else if (action === "prev") _goToStep(currentIndex - 1);
    else if (action === "skip" || action === "done") {
      _restoreHiddenElements();
      _finishTour();
    }
  }

  // ─── Hidden Element Restoration ────────────────────────────

  function _restoreHiddenElements() {
    for (var i = 0; i < hiddenEls.length; i++) {
      var el = hiddenEls[i];
      if (el && el.parentNode) {
        el.classList.add("hidden");
        el.removeAttribute("data-tour-was-hidden");
      }
    }
    hiddenEls = [];
  }

  function _goToStep(index) {
    if (!isRunning) return;
    if (index < 0 || index >= currentSteps.length) {
      _restoreHiddenElements();
      _finishTour();
      return;
    }

    // Restore any elements we temporarily unhidden in the previous step
    _restoreHiddenElements();

    currentIndex = index;
    var step = currentSteps[currentIndex];

    var el = document.querySelector(step.selector);
    if (!el && step.fallbackSelector) el = document.querySelector(step.fallbackSelector);

    if (!el) {
      if (index < currentSteps.length - 1) _goToStep(index + 1);
      else {
        _restoreHiddenElements();
        _finishTour();
      }
      return;
    }

    // Handle hidden elements — temporarily unhide for spotlight
    var wasHidden = false;
    if (el.classList.contains("hidden")) {
      el.classList.remove("hidden");
      el.setAttribute("data-tour-was-hidden", "true");
      hiddenEls.push(el);
      wasHidden = true;
    }

    currentTargetEl = el;

    if (step.highlightParent && el.parentElement) {
      var parent = el.parentElement;
      while (parent && parent !== document.body) {
        var pRect = parent.getBoundingClientRect();
        if (pRect.width > 80 && pRect.height > 40) {
          // Also unhide the parent if it was hidden
          if (parent.classList.contains("hidden")) {
            parent.classList.remove("hidden");
            parent.setAttribute("data-tour-was-hidden", "true");
            hiddenEls.push(parent);
            wasHidden = true;
          }
          currentTargetEl = parent;
          break;
        }
        parent = parent.parentElement;
      }
    }

    _renderPopover();

    // If we unhidden something, delay scroll to let layout settle
    if (wasHidden) {
      setTimeout(function () {
        _scrollTargetIntoView(currentTargetEl);
      }, 100);
    } else {
      _scrollTargetIntoView(currentTargetEl);
    }
  }

  function _finishTour() {
    console.log("[LakuTour] _finishTour called, isRunning:", isRunning, "currentKey:", currentKey);

    // 1) Prevent any re-entry IMMEDIATELY
    isRunning = false;

    var finishedKey = currentKey;
    document.dispatchEvent(new CustomEvent("laku-tour-finish", {
      detail: { moduleKey: finishedKey },
    }));

    // 2) Cancel the RAF loop (guard against late callbacks)
    if (engineRafId) {
      cancelAnimationFrame(engineRafId);
      engineRafId = null;
    }

    // 3) Cancel any pending start setTimeout so it cannot re-trigger
    if (startTimeoutId) {
      clearTimeout(startTimeoutId);
      startTimeoutId = null;
    }

    document.removeEventListener("keydown", _onKeyDown);

    if (currentKey) markCompleted(currentKey);

    currentKey = "";
    currentSteps = [];
    currentIndex = 0;
    currentTargetEl = null;
    lastBoundsStr = "";

    // Remove ALL tour DOM elements
    _removeDOM();

    // Fallback: remove any remaining tour elements by ID
    var ids = ["lakuTourContainer", "lakuTourFrame", "lakuTourPopover"];
    for (var i = 0; i < ids.length; i++) {
      var orphan = document.getElementById(ids[i]);
      if (orphan) {
        console.log("[LakuTour] Fallback: found orphan element", ids[i]);
        orphan.remove();
      }
    }

    // Fallback: nuke any lingering .laku-tour-root containers
    var remainingList = document.querySelectorAll(".laku-tour-root");
    for (var j = 0; j < remainingList.length; j++) {
      console.log("[LakuTour] Fallback: force removing .laku-tour-root", j);
      remainingList[j].remove();
    }

    // Fallback: remove any orphan SVG mask elements
    var orphanSvg = document.querySelectorAll("svg.laku-tour-svg-mask");
    for (var k = 0; k < orphanSvg.length; k++) {
      console.log("[LakuTour] Fallback: force removing orphan SVG mask", k);
      orphanSvg[k].remove();
    }

    console.log("[LakuTour] Tour finished. Elements in DOM:", document.querySelectorAll("[id*=lakuTour]").length);
  }

  function _onKeyDown(e) {
    if (!isRunning) return;
    if (e.key === "Escape") {
      e.preventDefault();
      _restoreHiddenElements();
      _finishTour();
    } else if (e.key === "ArrowRight" || e.key === "Enter") {
      e.preventDefault();
      if (currentIndex < currentSteps.length - 1) _goToStep(currentIndex + 1);
      else {
        _restoreHiddenElements();
        _finishTour();
      }
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      if (currentIndex > 0) _goToStep(currentIndex - 1);
    }
  }

  function start(moduleKey) {
    if (isRunning) stop();

    // Clear any lingering setTimeout from a previous start call
    if (startTimeoutId) {
      clearTimeout(startTimeoutId);
      startTimeoutId = null;
    }

    var steps = tourDefinitions[moduleKey];
    if (!steps || steps.length === 0) return;

    _createDOM();

    currentKey = moduleKey;
    currentSteps = steps;
    currentIndex = 0;
    isRunning = true;
    lastBoundsStr = "";

    document.dispatchEvent(new CustomEvent("laku-tour-start", {
      detail: { moduleKey: moduleKey },
    }));

    document.addEventListener("keydown", _onKeyDown);

    startTimeoutId = setTimeout(function () {
      startTimeoutId = null;
      if (!isRunning || !rootContainer) return; // guard: tour may have been stopped during timeout
      _goToStep(0);
      _engineLoop();
    }, 150);
  }

  function stop() {
    if (!isRunning) return;
    _restoreHiddenElements();
    _finishTour();
  }

  function next() {
    if (!isRunning) return;
    _goToStep(currentIndex + 1);
  }

  function prev() {
    if (!isRunning) return;
    _goToStep(currentIndex - 1);
  }

  function isCompleted(moduleKey) {
    var status = _loadStatus();
    return !!status[moduleKey];
  }

  function markCompleted(moduleKey) {
    var status = _loadStatus();
    status[moduleKey] = true;
    _saveStatus(status);
  }

  function resetAll() {
    _saveStatus({});
  }

  return {
    start: start,
    stop: stop,
    next: next,
    prev: prev,
    isCompleted: isCompleted,
    markCompleted: markCompleted,
    resetAll: resetAll,
  };
})();
