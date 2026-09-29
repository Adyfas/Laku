function getLabaAppUI() {
  return `
 <div class="max-w-3xl mx-auto space-y-8 animate-fade-in-up">
  <div class="bg-gradient-to-br from-[#274c43] to-[#1f3d36] text-white p-8 rounded-3xl shadow-xl">
        <div class="flex items-center gap-3 mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6 text-lime-300"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
          <span class="text-xs font-bold tracking-widest uppercase text-lime-300">Cek Bisnis</span>
        </div>
        <h2 class="text-2xl md:text-3xl font-bold mb-2">Cek Untung Rugi Bulanan</h2>
        <p class="text-white/80 text-sm leading-relaxed">
        Lihat kira-kira kamu untung atau rugi tiap bulan, dan kapan balik modal.
        </p>
      </div>
      <div class="bg-white border border-gray-100 shadow-xl rounded-3xl p-6 md:p-8 space-y-6">
        <form id="labaForm" class="space-y-5">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">Berapa banyak jualan per bulan?</label>
              <input type="text" inputmode="numeric" id="labaQty" placeholder="Contoh: 500 porsi" oninput="window.formatNumberInput(this)" class="w-full bg-[#f5f5f5] text-black-main font-medium py-3 px-4 rounded-xl outline-none border border-transparent focus:border-[#274c43] text-sm" required />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">Harga jual satuannya (Rp)</label>
              <input type="text" inputmode="numeric" id="labaHarga" placeholder="Contoh: Rp 15.000 per porsi" oninput="window.formatNumberInput(this)" class="w-full bg-[#f5f5f5] text-black-main font-medium py-3 px-4 rounded-xl outline-none border border-transparent focus:border-[#274c43] text-sm" required />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">Modal bahan per satuannya (Rp)</label>
              <input type="text" inputmode="numeric" id="labaVariabel" placeholder="Contoh: Rp 8.000 (belanja bahan per porsi)" oninput="window.formatNumberInput(this)" class="w-full bg-[#f5f5f5] text-black-main font-medium py-3 px-4 rounded-xl outline-none border border-transparent focus:border-[#274c43] text-sm" required />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">Biaya rutin tiap bulan (sewa, listrik, gaji) (Rp)</label>
              <input type="text" inputmode="numeric" id="labaTetap" placeholder="Contoh: Rp 1.500.000 (sewa + listrik + gaji)" oninput="window.formatNumberInput(this)" class="w-full bg-[#f5f5f5] text-black-main font-medium py-3 px-4 rounded-xl outline-none border border-transparent focus:border-[#274c43] text-sm" required />
            </div>
          </div>

          <button type="submit" class="w-full bg-[#274c43] hover:bg-[#1f3d36] text-white font-bold py-3.5 rounded-xl transition-all shadow-md text-sm cursor-pointer">
            Hitung Sekarang →
          </button>
        </form>

        <div id="labaResult" class="hidden mt-8 pt-6 border-t border-gray-100 space-y-6">
          <div id="labaStatusBox" class="p-6 rounded-2xl border text-center transition-colors">
            <span class="text-xs font-bold text-gray-500 uppercase tracking-widest block">Kira-kira untung atau rugi?</span>
            <div id="resLabaStatus" class="text-2xl font-extrabold my-1"></div>
            <p id="resLabaAdvice" class="text-xs leading-relaxed max-w-md mx-auto mt-2"></p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div class="bg-stone-50 p-4 rounded-2xl text-center border border-stone-200/80">
              <span class="text-xs text-gray-500 block">Total uang masuk</span>
              <span id="resTotalOmzet" class="text-base font-bold text-gray-800">Rp 0</span>
            </div>
            <div class="bg-stone-50 p-4 rounded-2xl text-center border border-stone-200/80">
              <span class="text-xs text-gray-500 block">Total modal bahan</span>
              <span id="resTotalVariabel" class="text-base font-bold text-gray-800">Rp 0</span>
            </div>
            <div class="bg-stone-50 p-4 rounded-2xl text-center border border-stone-200/80">
              <span class="text-xs text-gray-500 block">Biaya rutin</span>
              <span id="resTotalTetap" class="text-base font-bold text-gray-800">Rp 0</span>
            </div>
            <div class="bg-emerald-50 p-4 rounded-2xl text-center border border-emerald-200/80">
              <span class="text-xs text-emerald-700 block">Uang sisa (untung/rugi)</span>
              <span id="resLabaBersih" class="text-base font-bold text-emerald-700">Rp 0</span>
            </div>
          </div>

          <div class="bg-sky-50 border border-sky-100 p-5 rounded-2xl flex items-center justify-between">
            <div>
              <span class="text-xs font-bold text-sky-800 uppercase tracking-wider block">Minimal jual biar gak rugi</span>
              <p class="text-xs text-sky-600">Jumlah minimum yang wajib terjual per bulan agar pengeluaran gak lebih dari uang masuk.</p>
            </div>
            <span id="resBepUnit" class="text-2xl font-black text-sky-800">0 Unit</span>
          </div>
        </div>
      </div>
    </div>
  `;
}
