/**
 * hppApp.js - Template UI Kalkulator HPP & Harga Jual
 */
function getHppAppUI() {
  return `
    <div class="max-w-2xl mx-auto space-y-8 animate-fade-in-up">
      <div class="bg-gradient-to-br from-[#274c43] to-[#1f3d36] text-white p-8 rounded-3xl shadow-xl">
        <div class="flex items-center gap-3 mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6 text-lime-300"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
          <span class="text-xs font-bold tracking-widest uppercase text-lime-300">Keuangan UMKM</span>
        </div>
        <h2 class="text-2xl md:text-3xl font-bold mb-2">Kalkulator HPP & Harga Jual</h2>
        <p class="text-white/80 text-sm leading-relaxed">
        Hitung modal bahan baku, biaya operasional, dan tentukan harga jual aman untuk mencegah kerugian usaha Anda.
        </p>
      </div>

      <div class="bg-white border border-gray-100 shadow-xl rounded-3xl p-6 md:p-8 space-y-6">
        <form id="hppForm" class="space-y-5">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Modal Bahan Baku per Unit (Rp)</label>
            <input
              type="text"
              inputmode="numeric"
              id="hppBahan"
              placeholder="Contoh: 8.000"
              oninput="window.formatNumberInput(this)"
              class="w-full bg-[#f5f5f5] text-black-main font-medium py-3.5 px-5 rounded-2xl outline-none border border-transparent focus:border-[#274c43] transition-all text-base"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Biaya Operasional & Kemasan per Unit (Rp)</label>
            <input
              type="text"
              inputmode="numeric"
              id="hppOps"
              placeholder="Contoh: 2.000"
              oninput="window.formatNumberInput(this)"
              class="w-full bg-[#f5f5f5] text-black-main font-medium py-3.5 px-5 rounded-2xl outline-none border border-transparent focus:border-[#274c43] transition-all text-base"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Target Margin Keuntungan (%)</label>
            <input
              type="number"
              id="hppMargin"
              placeholder="Contoh: 25"
              min="1"
              max="99"
              class="w-full bg-[#f5f5f5] text-black-main font-medium py-3.5 px-5 rounded-2xl outline-none border border-transparent focus:border-[#274c43] transition-all text-base"
              required
            />
          </div>

          <button
            type="submit"
            class="w-full bg-[#274c43] hover:bg-[#1f3d36] text-white font-bold py-4 rounded-2xl transition-all shadow-md text-base cursor-pointer"
          >
            Hitung Harga Jual Pas →
          </button>
        </form>

        <div id="hppResult" class="hidden mt-8 pt-6 border-t border-gray-100 space-y-4">
          <div class="bg-[#f8faf9] p-6 rounded-2xl border border-gray-200/80 text-center">
            <span class="text-xs font-bold text-gray-500 uppercase tracking-widest">Rekomendasi Harga Jual Pas</span>
            <div id="resHargaJual" class="text-3xl md:text-4xl font-extrabold text-[#274c43] my-2">Rp 0</div>
            <p class="text-xs text-gray-500">Harga jual rekomendasi agar keuntungan Anda utuh sesuai target margin.</p>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="bg-stone-50 p-4 rounded-2xl border border-stone-200/80 text-center">
              <span class="text-xs text-gray-500 block">Total HPP Modal</span>
              <span id="resTotalHpp" class="text-lg font-bold text-gray-800">Rp 0</span>
            </div>
            <div class="bg-lime-50 p-4 rounded-2xl border border-lime-200/80 text-center">
              <span class="text-xs text-lime-700 block">Profit Bersih per Unit</span>
              <span id="resProfitBersih" class="text-lg font-bold text-lime-700">Rp 0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}
