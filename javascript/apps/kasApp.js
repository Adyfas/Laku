/**
 * kasApp.js - Template UI Buku Kas Digital UMKM
 */
function getKasAppUI() {
  return `
    <div class="max-w-3xl mx-auto space-y-8 animate-fade-in-up">
      <div class="bg-gradient-to-br from-[#274c43] to-[#1f3d36] text-white p-8 rounded-3xl shadow-xl">
        <div class="flex items-center gap-3 mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6 text-lime-300"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
          <span class="text-xs font-bold tracking-widest uppercase text-lime-300">Pencatatan Keuangan</span>
        </div>
        <h2 class="text-2xl md:text-3xl font-bold mb-2">Buku Kas Digital UMKM</h2>
        <p class="text-white/80 text-sm leading-relaxed">
          Catat arus keluar masuk uang usaha secara sederhana, praktis, dan langsung tersimpan aman di browser Anda.
        </p>
      </div>

      <!-- Overview Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="bg-white shadow-xl p-5 rounded-2xl text-center">
          <span class="text-xs font-semibold text-emerald-700 uppercase tracking-wider block">Total Pemasukan</span>
          <span id="kasTotalMasuk" class="text-xl font-extrabold text-emerald-800 mt-1 block">Rp 0</span>
        </div>
        <div class="bg-white shadow-xl p-5 rounded-2xl text-center">
          <span class="text-xs font-semibold text-rose-700 uppercase tracking-wider block">Total Pengeluaran</span>
          <span id="kasTotalKeluar" class="text-xl font-extrabold text-rose-800 mt-1 block">Rp 0</span>
        </div>
        <div class="bg-white shadow-xl p-5 rounded-2xl text-center">
          <span class="text-xs font-semibold text-[#274c43] uppercase tracking-wider block">Saldo Kas Saat Ini</span>
          <span id="kasSaldoAkhir" class="text-xl font-extrabold text-[#274c43] mt-1 block">Rp 0</span>
        </div>
      </div>

      <!-- Add Transaction Form -->
      <div class="bg-white border border-gray-100 shadow-xl rounded-3xl p-6 md:p-8 space-y-6">
        <h3 class="text-lg font-bold text-gray-800">Tambah Transaksi Baru</h3>
        <form id="kasForm" class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1">Jenis Transaksi</label>
              <select id="kasType" class="w-full bg-[#f5f5f5] text-black-main font-medium py-3 px-4 rounded-xl outline-none border border-transparent focus:border-[#274c43] text-sm">
                <option value="pemasukan">Pemasukan (Uang Masuk)</option>
                <option value="pengeluaran">Pengeluaran (Uang Keluar)</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1">Nominal (Rp)</label>
              <input type="text" inputmode="numeric" id="kasAmount" placeholder="Contoh: 50.000" oninput="window.formatNumberInput(this)" class="w-full bg-[#f5f5f5] text-black-main font-medium py-3 px-4 rounded-xl outline-none border border-transparent focus:border-[#274c43] text-sm" required />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1">Keterangan / Catatan</label>
              <input type="text" id="kasNote" placeholder="Contoh: Jual 5 Porsi / Beli Gas" class="w-full bg-[#f5f5f5] text-black-main font-medium py-3 px-4 rounded-xl outline-none border border-transparent focus:border-[#274c43] text-sm" required />
            </div>
          </div>
          <button type="submit" class="w-full bg-[#274c43] hover:bg-[#1f3d36] text-white font-bold py-3.5 rounded-xl transition-all shadow-md text-sm cursor-pointer">
            + Simpan Transaksi Kas
          </button>
        </form>
      </div>

      <!-- Transaction History Table -->
      <div class="bg-white border border-gray-100 shadow-xl rounded-3xl p-6 md:p-8 space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-bold text-gray-800">Riwayat Catatan Kas</h3>
          <button id="clearKasBtn" class="text-xs text-rose-600 font-semibold hover:underline cursor-pointer">Hapus Semua Data</button>
        </div>

        <!-- Desktop Table View (lg:block) -->
        <div class="overflow-x-auto hidden lg:block">
          <table class="w-[60rem] text-left text-sm text-gray-600">
            <thead class="bg-stone-50 text-xs font-bold text-gray-500 uppercase">
              <tr>
                <th class="py-3 px-4 rounded-l-xl">Tanggal</th>
                <th class="py-3 px-4">Keterangan</th>
                <th class="py-3 px-4">Tipe</th>
                <th class="py-3 px-4 text-right">Nominal</th>
                <th class="py-3 px-4 rounded-r-xl text-center">Aksi</th>
              </tr>
            </thead>
            <tbody id="kasTableBody" class="divide-y divide-gray-100">
              <!-- Rendered dynamically -->
            </tbody>
          </table>
        </div>

        <!-- Mobile Card View (block lg:hidden) -->
        <div id="kasMobileList" class="block lg:hidden space-y-3.5">
          <!-- Rendered dynamically -->
        </div>
      </div>
    </div>
  `;
}
