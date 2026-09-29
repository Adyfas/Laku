function getHppAppUI() {
  var I = window.LakuIcons;
  return `
    <div class="max-w-2xl mx-auto space-y-8 animate-fade-in-up">
      <!-- Header -->
      <div class="bg-gradient-to-br from-[#274c43] to-[#1f3d36] text-white p-8 rounded-3xl shadow-xl">
        <div class="flex items-center gap-3 mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6 text-lime-300"><rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="16" x2="16" y1="14" y2="18"/><path d="M16 10h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M12 18h.01"/><path d="M8 18h.01"/></svg>
          <span class="text-xs font-bold tracking-widest uppercase text-lime-300">Hitung Uang</span>
        </div>
        <h2 class="text-2xl md:text-3xl font-bold mb-2">Hitung Modal &amp; Harga Jual</h2>
        <p class="text-white/80 text-sm leading-relaxed">
          Hitung modal kamu per produk dengan cara masak: catat bahan, tenaga, dan biaya lain. Biar tahu harga jual yang aman dan nggak rugi.
        </p>
      </div>

      <!-- Onboarding (shown when inventory is empty) -->
      <div id="hppOnboarding" class="hidden text-center py-12 bg-white border border-gray-100 shadow-xl rounded-3xl p-6 md:p-8 space-y-5">
        <span class="text-5xl">${I.svg("target", "2.5em")}</span>
        <h3 class="text-xl font-bold text-gray-800 mt-2">Langkah 1: Catat Bahan Dulu</h3>
        <p class="text-gray-500 text-sm leading-relaxed max-w-md mx-auto">
          Sebelum hitung modal, kamu perlu catat bahan-bahan yang biasa kamu pakai untuk jualan.
        </p>
        <p class="text-gray-400 text-xs">
          Misalnya: beras, minyak, telur, gula, kemasan, dll.<br>
          Nanti bahan-bahan itu otomatis muncul di sini saat kamu mau hitung modal.
        </p>
        <button type="button" id="hppGoToInventoryOnboarding" class="inline-flex items-center gap-2 bg-[#274c43] hover:bg-[#1f3d36] text-white font-bold py-4 px-8 rounded-2xl transition-all shadow-md text-base cursor-pointer">
          → Buka Stok Inventaris
        </button>
      </div>

      <!-- Step Indicator -->
      <div id="hppStepIndicator" class="flex items-center justify-center gap-2 sm:gap-4">
        <div class="flex items-center gap-2">
          <div id="stepDot1" class="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold bg-[#274c43] text-white transition-all">1</div>
          <span class="text-xs text-gray-500 hidden sm:inline">Info</span>
        </div>
        <div class="w-8 h-0.5 bg-gray-200 rounded-full"></div>
        <div class="flex items-center gap-2">
          <div id="stepDot2" class="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold bg-gray-200 text-gray-400 transition-all">2</div>
          <span class="text-xs text-gray-500 hidden sm:inline">Bahan</span>
        </div>
        <div class="w-8 h-0.5 bg-gray-200 rounded-full"></div>
        <div class="flex items-center gap-2">
          <div id="stepDot3" class="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold bg-gray-200 text-gray-400 transition-all">3</div>
          <span class="text-xs text-gray-500 hidden sm:inline">Biaya</span>
        </div>
        <div class="w-8 h-0.5 bg-gray-200 rounded-full"></div>
        <div class="flex items-center gap-2">
          <div id="stepDot4" class="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold bg-gray-200 text-gray-400 transition-all">4</div>
          <span class="text-xs text-gray-500 hidden sm:inline">Harga</span>
        </div>
      </div>

      <!-- STEP 1: Info Produk -->
      <div id="hppStep1" class="bg-white border border-gray-100 shadow-xl rounded-3xl p-6 md:p-8 space-y-5">
        <div class="text-center mb-2">
          <span class="text-3xl">${I.svg("memo", "1.75em")}</span>
          <h3 class="text-lg font-bold text-gray-800 mt-2">Kamu lagi jualan apa hari ini?</h3>
          <p class="text-gray-500 text-sm">Isi dulu nama produk dan berapa banyak yang kamu buat.</p>
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">Nama Produk</label>
          <input type="text" id="hppNamaProduk" placeholder="Contoh: Nasi Goreng, Kue Lumpur, Sambal Bawang..." class="w-full bg-[#f5f5f5] text-black-main font-medium py-3.5 px-5 rounded-2xl outline-none border border-transparent focus:border-[#274c43] transition-all text-base" />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Jumlah yang dibuat</label>
            <input type="number" id="hppJumlahProduksi" placeholder="Contoh: 50" min="1" class="w-full bg-[#f5f5f5] text-black-main font-medium py-3.5 px-5 rounded-2xl outline-none border border-transparent focus:border-[#274c43] transition-all text-base" />
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Satuan</label>
            <select id="hppSatuanProduksi" class="w-full bg-[#f5f5f5] text-black-main font-medium py-3.5 px-5 rounded-2xl outline-none border border-transparent focus:border-[#274c43] transition-all text-base">
              <option value="porsi">Porsi</option>
              <option value="bungkus">Bungkus</option>
              <option value="kotak">Kotak</option>
              <option value="botol">Botol</option>
              <option value="biji">Biji / Buah</option>
              <option value="kg">Kg</option>
              <option value="liter">Liter</option>
              <option value="pack">Pack</option>
            </select>
          </div>
        </div>
        <button type="button" id="hppStep1Next" class="w-full bg-[#274c43] hover:bg-[#1f3d36] text-white font-bold py-4 rounded-2xl transition-all shadow-md text-base cursor-pointer">
          Lanjut Pilih Bahan →
        </button>
        <button type="button" id="hppStep1BuatBaru" class="w-full mt-2 bg-stone-100 hover:bg-stone-200 text-gray-700 font-bold py-3 rounded-2xl transition-all text-base cursor-pointer hidden">
          Buat Baru
        </button>
      </div>

      <!-- STEP 2: Bahan dari Stok -->
      <div id="hppStep2" class="hidden bg-white border border-gray-100 shadow-xl rounded-3xl p-6 md:p-8 space-y-5">
        <div class="text-center mb-2">
          <span class="text-3xl">${I.svg("shoppingBag", "1.75em")}</span>
          <h3 class="text-lg font-bold text-gray-800 mt-2">Bahan apa aja yang kamu pakai?</h3>
          <p class="text-gray-500 text-sm" id="hppStep2Desc">Pilih bahan dari stok yang sudah kamu catat.</p>
        </div>

        <!-- Empty State (no inventory items) -->
        <div id="hppInventoryEmpty" class="hidden text-center py-8 bg-stone-50 rounded-2xl space-y-3">
          <span class="text-4xl">${I.svg("package", "2em")}</span>
          <p class="text-gray-600 font-medium">Kamu belum punya bahan di stok.</p>
          <p class="text-gray-400 text-sm">Yuk tambahkan dulu bahan-bahan yang biasa kamu pakai untuk jualan.</p>
          <button type="button" id="hppGoToInventory" class="inline-flex items-center gap-2 bg-[#274c43] hover:bg-[#1f3d36] text-white font-bold py-3 px-6 rounded-2xl transition-all shadow-md text-sm cursor-pointer">
            → Tambah Bahan ke Stok
          </button>
        </div>

        <!-- Ingredient List -->
        <div id="hppIngredientList" class="space-y-3"></div>

        <!-- Add Ingredient (from Stock) -->
        <div id="hppAddIngredientArea" class="hidden space-y-3">
          <select id="hppInventorySelect" class="w-full bg-[#f5f5f5] text-black-main font-medium py-3 px-4 rounded-2xl outline-none border border-transparent focus:border-[#274c43] text-sm">
            <option value="">— Pilih bahan dari stok —</option>
          </select>
          <div class="flex gap-2 items-center">
            <input type="number" id="hppJumlahPakai" placeholder="Jumlah pakai" step="0.01" min="0.01" class="flex-1 bg-[#f5f5f5] text-black-main font-medium py-3 px-4 rounded-2xl outline-none border border-transparent focus:border-[#274c43] text-sm" />
            <select id="hppJumlahPakaiUnit" class="w-28 bg-[#f5f5f5] text-black-main font-medium py-3 px-2 rounded-2xl outline-none border border-transparent focus:border-[#274c43] text-sm cursor-pointer"></select>
            <button type="button" id="hppAddIngredientBtn" class="bg-[#274c43] hover:bg-[#1f3d36] text-white font-bold py-3 px-5 rounded-2xl transition-all shadow-sm text-sm cursor-pointer whitespace-nowrap">
              + Tambah
            </button>
          </div>
          <p id="hppUnitHelper" class="text-[11px] text-gray-400 mt-1"></p>
          <p class="text-[11px] text-gray-400">${I.svg("lightbulb", "0.9em")} Pilih satuan bebas — otomatis dikonversi ke satuan stok (mis. 500 gram = 0.5 kg).</p>
        </div>

        <!-- Subtotal Bahan -->
        <div id="hppSubtotalBahan" class="hidden pt-4 border-t border-gray-100 flex items-center justify-between">
          <span class="text-sm font-bold text-gray-600">Total belanja bahan:</span>
          <span id="hppSubtotalBahanValue" class="text-lg font-extrabold text-[#274c43]">Rp 0</span>
        </div>

        <div class="flex gap-3 pt-2">
          <button type="button" id="hppStep2Back" class="flex-1 bg-stone-100 hover:bg-stone-200 text-gray-700 font-bold py-4 rounded-2xl transition-all text-base cursor-pointer">
            ← Kembali
          </button>
          <button type="button" id="hppStep2Next" class="flex-1 bg-[#274c43] hover:bg-[#1f3d36] text-white font-bold py-4 rounded-2xl transition-all shadow-md text-base cursor-pointer">
            Lanjut Biaya Tambahan →
          </button>
        </div>
        <button type="button" id="hppStep2BuatBaru" class="w-full mt-2 bg-stone-100 hover:bg-stone-200 text-gray-700 font-bold py-3 rounded-2xl transition-all text-base cursor-pointer hidden">
          Buat Baru
        </button>
      </div>

      <!-- STEP 3: Biaya Tambahan -->
      <div id="hppStep3" class="hidden bg-white border border-gray-100 shadow-xl rounded-3xl p-6 md:p-8 space-y-5">
        <div class="text-center mb-2">
          <span class="text-3xl">${I.svg("worker", "1.75em")}</span>
          <h3 class="text-lg font-bold text-gray-800 mt-2">Ada biaya lain selain bahan?</h3>
          <p class="text-gray-500 text-sm">Kayak ongkos kerja kamu, gas, listrik, atau kemasan. Isi aja yang kamu ingat.</p>
        </div>

        <!-- Tenaga Kerja -->
        <div class="bg-emerald-50 p-5 rounded-2xl space-y-3">
          <div class="flex items-center gap-2">
            <span class="text-lg">${I.svg("worker", "1.1em")}</span>
            <span class="text-sm font-bold text-emerald-800">Ongkos Kerja Kamu</span>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs text-emerald-700 mb-1">Berapa jam kerja?</label>
              <input type="number" id="hppJamKerja" placeholder="Contoh: 2" min="0" step="0.5" class="w-full bg-white text-black-main font-medium py-3 px-4 rounded-xl outline-none border border-transparent focus:border-emerald-500 text-sm" />
            </div>
            <div>
              <label class="block text-xs text-emerald-700 mb-1">Upah per jam (Rp)</label>
              <input type="text" inputmode="numeric" id="hppUpahPerJam" placeholder="Contoh: 15.000" oninput="window.formatNumberInput(this)" class="w-full bg-white text-black-main font-medium py-3 px-4 rounded-xl outline-none border border-transparent focus:border-emerald-500 text-sm" />
            </div>
          </div>
          <div id="hppTotalTenaga" class="hidden text-sm font-bold text-emerald-700">
            Total ongkos: <span id="hppTotalTenagaValue">Rp 0</span>
          </div>
        </div>

        <!-- Overhead -->
        <div class="bg-amber-50 p-5 rounded-2xl space-y-3">
          <div class="flex items-center gap-2">
            <span class="text-lg">${I.svg("lightning", "1.1em")}</span>
            <span class="text-sm font-bold text-amber-800">Biaya Lain-lain (Gas, Listrik, dll)</span>
          </div>
          <div id="hppOverheadList" class="space-y-2">
            <div class="text-center py-3 text-amber-700/60 text-xs">Kosong — isi kalau ada biaya lain.</div>
          </div>
          <div class="flex gap-2">
            <input type="text" id="hppOverheadNama" placeholder="Nama biaya (contoh: Gas)" class="flex-1 bg-white text-black-main font-medium py-3 px-4 rounded-xl outline-none border border-transparent focus:border-amber-500 text-sm" />
            <input type="text" inputmode="numeric" id="hppOverheadBiaya" placeholder="Rp" oninput="window.formatNumberInput(this)" class="w-36 bg-white text-black-main font-medium py-3 px-4 rounded-xl outline-none border border-transparent focus:border-amber-500 text-sm" />
            <button type="button" id="hppAddOverheadBtn" class="bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-sm text-sm cursor-pointer whitespace-nowrap">
              + Tambah
            </button>
          </div>
        </div>

        <!-- Kemasan -->
        <div class="bg-blue-50 p-5 rounded-2xl space-y-3">
          <div class="flex items-center gap-2">
            <span class="text-lg">${I.svg("package", "1.1em")}</span>
            <span class="text-sm font-bold text-blue-800">Biaya Kemasan &amp; Label</span>
          </div>
          <input type="text" inputmode="numeric" id="hppBiayaKemasan" placeholder="Contoh: 50.000 (total semua kemasan)" oninput="window.formatNumberInput(this)" class="w-full bg-white text-black-main font-medium py-3 px-4 rounded-xl outline-none border border-transparent focus:border-blue-500 text-sm" />
          <p class="text-xs text-blue-600">${I.svg("lightbulb", "0.9em")} Total biaya semua kemasan, stiker, atau plastik untuk sekali produksi.</p>
        </div>

        <div class="flex gap-3 pt-2">
          <button type="button" id="hppStep3Back" class="flex-1 bg-stone-100 hover:bg-stone-200 text-gray-700 font-bold py-4 rounded-2xl transition-all text-base cursor-pointer">
            ← Kembali
          </button>
          <button type="button" id="hppStep3Next" class="flex-1 bg-[#274c43] hover:bg-[#1f3d36] text-white font-bold py-4 rounded-2xl transition-all shadow-md text-base cursor-pointer">
            Lihat Hasilnya →
          </button>
        </div>
        <button type="button" id="hppStep3BuatBaru" class="w-full mt-2 bg-stone-100 hover:bg-stone-200 text-gray-700 font-bold py-3 rounded-2xl transition-all text-base cursor-pointer hidden">
          Buat Baru
        </button>
      </div>

      <!-- STEP 4: Margin & Hasil -->
      <div id="hppStep4" class="hidden bg-white border border-gray-100 shadow-xl rounded-3xl p-6 md:p-8 space-y-5">
        <div class="text-center mb-2">
          <span class="text-3xl">${I.svg("tag", "1.75em")}</span>
          <h3 class="text-lg font-bold text-gray-800 mt-2">Mau untung berapa?</h3>
          <p class="text-gray-500 text-sm">Geser untuk tentukan keuntungan yang kamu mau.</p>
        </div>

        <!-- Margin Slider -->
        <div class="bg-stone-50 p-6 rounded-2xl space-y-4">
          <div class="flex items-center justify-between">
            <span class="text-sm font-bold text-gray-600">Keuntungan di atas modal (Margin)</span>
            <span id="hppMarginDisplay" class="text-2xl font-extrabold text-[#274c43]">30%</span>
          </div>
          <input type="range" id="hppMarginSlider" min="5" max="99" value="30" step="1" class="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-[#274c43]" />
          <div class="flex justify-between text-xs text-gray-400 font-medium">
            <span>5% (Sedikit)</span>
            <span>30% (Wajar)</span>
            <span>99% (Maksimal)</span>
          </div>
          <p class="text-xs text-gray-400">${I.svg("lightbulb", "0.9em")} Ini margin bersih: keuntungan di atas harga jual. Jadi jika diskon 20%, harga jual masih aman. Maksimum 99% untuk menghindari pembagian nol.</p>
        </div>

        <!-- Ringkasan -->
        <div id="hppRingkasan" class="bg-[#f8faf9] p-6 rounded-2xl border border-gray-200/80 space-y-3">
          <h4 class="text-sm font-bold text-gray-500 uppercase tracking-wider text-center">Ringkasan Modal Kamu</h4>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-500">${I.svg("shoppingBag", "1em")} Total belanja bahan</span>
              <span id="hppRingkasanBahan" class="font-bold text-gray-800">Rp 0</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">${I.svg("worker", "1em")} Ongkos kerja</span>
              <span id="hppRingkasanTenaga" class="font-bold text-gray-800">Rp 0</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">${I.svg("lightning", "1em")} Biaya lain-lain</span>
              <span id="hppRingkasanOverhead" class="font-bold text-gray-800">Rp 0</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">${I.svg("package", "1em")} Kemasan</span>
              <span id="hppRingkasanKemasan" class="font-bold text-gray-800">Rp 0</span>
            </div>
            <div class="pt-2 border-t border-gray-200 flex justify-between">
              <span class="font-bold text-gray-700">${I.svg("wallet", "1em")} Total modal</span>
              <span id="hppRingkasanTotal" class="text-lg font-extrabold text-[#274c43]">Rp 0</span>
            </div>
            <div class="flex justify-between">
              <span class="font-bold text-gray-700">${I.svg("package", "1em")} Modal per <span id="hppRingkasanSatuan">unit</span></span>
              <span id="hppRingkasanHpp" class="text-lg font-extrabold text-amber-700">Rp 0</span>
            </div>
          </div>
        </div>

        <!-- Harga Jual -->
        <div class="bg-[#274c43] p-6 rounded-2xl text-center text-white space-y-2">
          <span class="text-xs font-bold text-lime-300 uppercase tracking-widest">Harga Jual yang Aman</span>
          <div id="hppHargaJual" class="text-3xl md:text-4xl font-extrabold">Rp 0</div>
          <div id="hppHargaBulat" class="text-sm text-white/70">Dibulatkan: Rp 0</div>
          <p class="text-xs text-white/60">Harga ini sudah termasuk modal + untung kamu.</p>
        </div>

        <div class="flex gap-3 pt-2">
          <button type="button" id="hppStep4Back" class="flex-1 bg-stone-100 hover:bg-stone-200 text-gray-700 font-bold py-4 rounded-2xl transition-all text-base cursor-pointer">
            ← Kembali
          </button>
          <button type="button" id="hppSimpanResep" class="flex-1 bg-[#274c43] hover:bg-[#1f3d36] text-white font-bold py-4 rounded-2xl transition-all shadow-md text-base cursor-pointer">
            ${I.svg("save", "1em")} Simpan Resep
          </button>
        </div>
        <button type="button" id="hppStep4BuatBaru" class="w-full mt-2 bg-stone-100 hover:bg-stone-200 text-gray-700 font-bold py-3 rounded-2xl transition-all text-base cursor-pointer hidden">
          Buat Baru
        </button>
      </div>

      <!-- DAFTAR RESEP TERSIMPAN -->
      <div id="hppRecipeListSection" class="bg-white border border-gray-100 shadow-xl rounded-3xl p-6 md:p-8 space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-bold text-gray-800">${I.svg("document", "1.1em")} Resep Tersimpan</h3>
          <span class="text-xs text-gray-400">Bisa diubah atau disalin</span>
        </div>

        <!-- Search & Pagination Controls -->
        <div class="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div class="flex items-center justify-between w-full gap-5 ">
            <label class="block text-md font-bold text-gray-700 mb-1">Cari</label>
            <input type="text" id="hppSearchInput" placeholder="Cari berdasarkan nama produk..." class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
          </div>
        </div>

        <!-- Desktop Table View -->
        <div class="overflow-x-auto hidden lg:block">
          <table class="w-full text-left text-sm text-gray-600">
            <thead class="bg-stone-50 text-xs font-bold text-gray-500 uppercase">
              <tr>
                <th class="py-3 px-4 rounded-l-xl">Produk</th>
                <th class="py-3 px-4 text-center">Produksi</th>
                <th class="py-3 px-4 text-right">Modal/satuan</th>
                <th class="py-3 px-4 text-right">Harga Jual</th>
                <th class="py-3 px-4 text-center">Untung</th>
                <th class="py-3 px-4 rounded-r-xl text-center">Aksi</th>
              </tr>
            </thead>
            <tbody id="recipeTableBody" class="divide-y divide-gray-100"></tbody>
          </table>
        </div>

        <!-- Mobile Card View -->
        <div id="recipeMobileList" class="block lg:hidden space-y-3.5"></div>

        <!-- Pagination Controls -->
        <div id="hppPagination" class="mt-4 flex sm:flex-row items-center justify-between gap-4 hidden">
          <div class="flex-1 sm:auto">
            <label class="block text-sm font-medium text-gray-700 mb-1">Tampilkan</label>
            <select id="hppPageSizeSelect" class="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="30">30</option>
              <option value="40">40</option>
              <option value="50">50</option>
            </select>
          </div>
          <div class="mt-2 sm:mt-0 flex items-center justify-between flex-col">
            <div class="inline-flex items-center py-2 rounded-md shadow-sm space-x-1">
            <button id="hppPrevPage" class="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transform rotate-180">${I.svg("arrowRight")}</button>
            <div class="px-3 py-2 text-sm font-medium text-gray-500 flex items-center gap-2"><span id="hppCurrentPage"></span> dari <span id="hppTotalPages"></span></div>
            <button id="hppNextPage" class="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">${I.svg("arrowRight")}</button>
            </div>
            </div>
            </div>
            <span class="text-sm my-2 text-gray-500 gap-1">Menampilkan <span id="hppStartIndex"></span> sampai <span id="hppEndIndex"></span> dari <span id="hppTotalCount"></span> data</span>
      </div>
    </div>
  `;
}
