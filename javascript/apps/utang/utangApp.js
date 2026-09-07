/** @file utangApp.js — Template UI Catat Utang & Piutang UMKM */

function getUtangAppUI() {
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
          <span class="text-xs font-semibold text-emerald-700 uppercase tracking-wider block">Total Piutang (Tagihan Ke Orang)</span>
          <span id="utangTotalPiutang" class="text-xl font-extrabold text-emerald-800 mt-1 block">Rp 0</span>
        </div>
        <div class="bg-white shadow-xl p-5 rounded-2xl text-center">
          <span class="text-xs font-semibold text-rose-700 uppercase tracking-wider block">Total Utang (Tanggungan Saya)</span>
          <span id="utangTotalUtang" class="text-xl font-extrabold text-rose-800 mt-1 block">Rp 0</span>
        </div>
        <div class="bg-white shadow-xl p-5 rounded-2xl text-center">
          <span class="text-xs font-semibold text-amber-700 uppercase tracking-wider block">Jatuh Tempo Hari Ini</span>
          <span id="utangTotalDueToday" class="text-xl font-extrabold text-amber-800 mt-1 block">0 Catatan</span>
        </div>
      </div>

      <!-- Notification Permission Banner -->
      <div id="utangNotifBanner" class="bg-stone-50 border border-stone-200/80 p-4 rounded-2xl flex items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 text-[#274c43]"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
          <span class="text-xs text-gray-700 font-medium">Aktifkan pengingat browser agar sistem otomatis memberi pengingat saat utang jatuh tempo.</span>
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
              <label class="block text-xs font-semibold text-gray-600 mb-1">Kategori Catatan</label>
              <select id="utangType" class="w-full bg-[#f5f5f5] text-black-main font-medium py-3 px-4 rounded-xl outline-none border border-transparent focus:border-[#274c43] text-sm">
                <option value="piutang">Piutang (Pelanggan Utang Ke Saya)</option>
                <option value="utang">Utang (Saya Utang Ke Supplier)</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1">Nama Pihak (Pelanggan / Supplier)</label>
              <input type="text" id="utangNama" placeholder="Contoh: Pak Budi / Toko Sembako Jaya" class="w-full bg-[#f5f5f5] text-black-main font-medium py-3 px-4 rounded-xl outline-none border border-transparent focus:border-[#274c43] text-sm" required />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1">Nomor WhatsApp (Opsional)</label>
              <input type="tel" id="utangWa" placeholder="Contoh: 08123456789" class="w-full bg-[#f5f5f5] text-black-main font-medium py-3 px-4 rounded-xl outline-none border border-transparent focus:border-[#274c43] text-sm" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1">Total Nominal (Rp)</label>
              <input type="text" inputmode="numeric" id="utangTotalAmount" placeholder="Contoh: 150.000" oninput="window.formatNumberInput(this)" class="w-full bg-[#f5f5f5] text-black-main font-medium py-3 px-4 rounded-xl outline-none border border-transparent focus:border-[#274c43] text-sm" required />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1">Tanggal Jatuh Tempo</label>
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
          <h3 class="text-lg font-bold text-gray-800">Daftar Tagihan & Kas Bon</h3>
          <span class="text-xs text-gray-400">Tersimpan otomatis di browser</span>
        </div>

        <!-- Desktop Table View (lg:block) -->
        <div class="overflow-x-auto hidden lg:block">
          <table class="w-[60rem] text-left text-sm text-gray-600">
            <thead class="bg-stone-50 text-xs font-bold text-gray-500 uppercase">
              <tr>
                <th class="py-3 px-4 rounded-l-xl">Tipe</th>
                <th class="py-3 px-4">Nama & Keterangan</th>
                <th class="py-3 px-4">Jatuh Tempo</th>
                <th class="py-3 px-4 text-right">Sisa Tagihan</th>
                <th class="py-3 px-4 rounded-r-xl text-center">Aksi & Bayar</th>
              </tr>
            </thead>
            <tbody id="utangTableBody" class="divide-y divide-gray-100">
              <!-- Rendered dynamically -->
            </tbody>
          </table>
        </div>

        <!-- Mobile Card View (block lg:hidden) -->
        <div id="utangMobileList" class="block lg:hidden space-y-3.5">
          <!-- Rendered dynamically -->
        </div>
      </div>
    </div>
  `;
}
