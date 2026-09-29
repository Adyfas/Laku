function getUtangAppUI() {
  var I = window.LakuIcons;
  return `
    <div class="max-w-3xl mx-auto space-y-8 animate-fade-in-up">
      <!-- Header Card -->
      <div class="bg-gradient-to-br from-[#274c43] to-[#1f3d36] text-white p-8 rounded-3xl shadow-xl">
        <div class="flex items-center gap-3 mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6 text-lime-300"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M15 2H9a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1Z"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></svg>
          <span class="text-xs font-bold tracking-widest uppercase text-lime-300">Utang Piutang</span>
        </div>
        <h2 class="text-2xl md:text-3xl font-bold mb-2">Catat Utang & Piutang</h2>
        <p class="text-white/80 text-sm leading-relaxed">
          Catat siapa yang utang ke kamu dan siapa kamu utang. Nanti ada pengingat kalau sudah jatuh tempo.
        </p>
      </div>

      <!-- Overview Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="bg-white shadow-xl p-5 rounded-2xl text-center">
          <span class="text-xs font-semibold text-emerald-700 uppercase tracking-wider block">Total uang yang belum dibayar ke kamu</span>
          <span id="utangTotalPiutang" class="text-xl font-extrabold text-emerald-800 mt-1 block">Rp 0</span>
        </div>
        <div class="bg-white shadow-xl p-5 rounded-2xl text-center">
          <span class="text-xs font-semibold text-rose-700 uppercase tracking-wider block">Total utang kamu yang belum dibayar</span>
          <span id="utangTotalUtang" class="text-xl font-extrabold text-rose-800 mt-1 block">Rp 0</span>
        </div>
        <div class="bg-white shadow-xl p-5 rounded-2xl text-center">
          <span class="text-xs font-semibold text-amber-700 uppercase tracking-wider block">Yang harus dibayar hari ini</span>
          <span id="utangTotalDueToday" class="text-xl font-extrabold text-amber-800 mt-1 block">0 Catatan</span>
        </div>
      </div>

      <!-- Notification Permission Banner -->
      <div id="utangNotifBanner" class="bg-stone-50 border border-stone-200/80 p-4 rounded-2xl flex items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 text-[#274c43]"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
          <span class="text-xs text-gray-700 font-medium">Nyalakan pengingat di HP biar dapat notif kalau utang sudah waktunya dibayar.</span>
        </div>
        <button id="enableNotifBtn" class="bg-[#274c43] hover:bg-[#1f3d36] text-white text-xs font-bold py-2 px-4 rounded-xl transition-all shadow-xs shrink-0 cursor-pointer">
          Aktifkan Notifikasi
        </button>
      </div>

      <!-- Add Record Form -->
      <div class="bg-white border border-gray-100 shadow-xl rounded-3xl p-6 md:p-8 space-y-6">
        <h3 class="text-lg font-bold text-gray-800">Tambah Catatan Utang / Piutang</h3>
        <form id="utangForm" class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1">Jenis catatan</label>
              <select id="utangType" class="w-full bg-[#f5f5f5] text-black-main font-medium py-3 px-4 rounded-xl outline-none border border-transparent focus:border-[#274c43] text-sm">
                <option value="piutang">Orang utang ke saya</option>
                <option value="utang">Saya utang ke orang</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1">Nama orangnya</label>
              <input type="text" id="utangNama" placeholder="Contoh: Pak Budi / Toko Sembako Jaya" class="w-full bg-[#f5f5f5] text-black-main font-medium py-3 px-4 rounded-xl outline-none border border-transparent focus:border-[#274c43] text-sm" required />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1">Nomor WhatsApp (Opsional)</label>
              <input type="tel" id="utangWa" placeholder="Contoh: 08123456789" class="w-full bg-[#f5f5f5] text-black-main font-medium py-3 px-4 rounded-xl outline-none border border-transparent focus:border-[#274c43] text-sm" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1">Jumlah uang (Rp)</label>
              <input type="text" inputmode="numeric" id="utangTotalAmount" placeholder="Contoh: 150.000" oninput="window.formatNumberInput(this)" class="w-full bg-[#f5f5f5] text-black-main font-medium py-3 px-4 rounded-xl outline-none border border-transparent focus:border-[#274c43] text-sm" required />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1">Tanggal harus dibayar</label>
              <input type="date" id="utangDueDate" class="w-full bg-[#f5f5f5] text-black-main font-medium py-3 px-4 rounded-xl outline-none border border-transparent focus:border-[#274c43] text-sm" required />
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-600 mb-1">Keterangan / Rincian Barang</label>
            <input type="text" id="utangNote" placeholder="Contoh: Kas bon 10 Porsi Nasi Goreng" class="w-full bg-[#f5f5f5] text-black-main font-medium py-3 px-4 rounded-xl outline-none border border-transparent focus:border-[#274c43] text-sm" required />
          </div>

          <button type="submit" class="w-full bg-[#274c43] hover:bg-[#1f3d36] text-white font-bold py-3.5 rounded-xl transition-all shadow-md text-sm cursor-pointer">
            + Simpan Catatan Utang
          </button>
        </form>
      </div>

      <!-- Records Container -->
      <div class="bg-white border border-gray-100 shadow-xl rounded-3xl p-6 md:p-8 space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-bold text-gray-800">Daftar utang & piutang</h3>
          <span class="text-xs text-gray-400">Tersimpan otomatis di HP kamu</span>
        </div>

<!-- Search & Filter Controls -->
         <div class="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between sm:gap-4">
           <div class="flex-1 min-w-0">
             <label class="block text-sm font-medium text-gray-700 mb-1">Cari</label>
             <input type="text" id="utangSearchInput" placeholder="Cari berdasarkan nama..." class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
           </div>
           <div class="flex-1 min-w-0">
             <label class="block text-sm font-medium text-gray-700 mb-1">Jenis Catatan</label>
             <select id="utangTypeFilter" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
               <option value="all">Semua</option>
               <option value="utang">Utang</option>
               <option value="piutang">Piutang</option>
             </select>
           </div>
           <div class="flex-1 min-w-0">
             <button id="utangClearFilters" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">Reset Filter</button>
           </div>
         </div>

        <!-- Desktop Table View (lg:block) -->
        <div class="overflow-x-auto hidden lg:block">
          <table class="w-[60rem] text-left text-sm text-gray-600">
            <thead class="bg-stone-50 text-xs font-bold text-gray-500 uppercase">
              <tr>
                <th class="py-3 px-4 rounded-l-xl">Tipe</th>
                <th class="py-3 px-4">Nama & Keterangan</th>
                <th class="py-3 px-4">Tanggal dibayar</th>
                <th class="py-3 px-4 text-right">Sisa belum dibayar</th>
                <th class="py-3 px-4 rounded-r-xl text-center">Bayar / Hapus</th>
              </tr>
            </thead>
            <tbody id="utangTableBody" class="divide-y divide-gray-100"></tbody>
          </table>
        </div>

        <!-- Mobile Card View (block lg:hidden) -->
        <div id="utangMobileList" class="block lg:hidden space-y-3.5"></div>

<!-- Pagination Controls -->
        <div id="utangPagination" class="mt-4 flex sm:flex-row items-center justify-between gap-4 hidden">
          <div class="flex-1 sm:auto">
            <label class="block text-sm font-medium text-gray-700 mb-1">Tampilkan</label>
            <select id="utangPageSizeSelect" class="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              <option value="3">3</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="30">30</option>
              <option value="40">40</option>
              <option value="50">50</option>
            </select>
          </div>
          <div class="mt-2 sm:mt-0 flex items-center justify-between flex-col">
            <div class="inline-flex items-center py-2 rounded-md shadow-sm space-x-1">
            <button id="utangPrevPage" class="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transform rotate-180">${I.svg("arrowRight")}</button>
            <div class="px-3 py-2 text-sm font-medium text-gray-500 flex items-center gap-2"><span id="utangCurrentPage"></span> dari <span id="utangTotalPages"></span></div>
            <button id="utangNextPage" class="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">${I.svg("arrowRight")}</button>
            </div>
            </div>
            </div>
            <span class="text-sm my-2 text-gray-500 gap-1">Menampilkan <span id="utangStartIndex"></span> sampai <span id="utangEndIndex"></span> dari <span id="utangTotalCount"></span> data</span>
      </div>
    </div>
  `;
}
