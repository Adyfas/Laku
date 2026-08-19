/**
 * promoApp.js - Template UI AI Generator Promo WA & Sosmed LAKU
 */
function getPromoAppUI() {
  return `
    <div class="max-w-2xl mx-auto space-y-8 animate-fade-in-up">
      <!-- Header Card -->
      <div class="bg-[#274c43] text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6 text-lime-300"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.71 1.1-1.38 1.4-2h0a18.2 18.2 0 0 0 7.85-7.85c.62-.3 1.29-.69 2-1.4 1.5-1.5 2-5 2-5s-3.5.5-5 2c-.71.71-1.1 1.38-1.4 2A18.2 18.2 0 0 0 6.5 15.1c-.3.62-.69 1.29-1.4 2Z"/><path d="M12 15l-3-3"/><path d="M15 12l-3-3"/></svg>
            <span class="text-xs font-bold tracking-widest uppercase text-lime-300">AI Copywriter UMKM</span>
          </div>
          <!-- <span class="bg-lime-400 text-[#274c43] text-[10px] font-black uppercase px-2.5 py-1 rounded-full shadow-xs">AI Powered</span> -->
        </div>
        <h2 class="text-2xl md:text-3xl font-bold mb-2">AI Generator Promo WA</h2>
        <p class="text-white/80 text-sm leading-relaxed">
          Buat draf pesan promosi jualan otomatis berteknologi AI yang persuasif, menarik, dan siap copas untuk WhatsApp & Media Sosial usahamu.
        </p>
      </div>

      <!-- Main Form Card -->
      <div class="bg-white border border-gray-100 shadow-xl rounded-3xl p-6 md:p-8 space-y-6">
        <form id="promoForm" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">Nama Produk / Usaha</label>
            <input type="text" id="promoNama" placeholder="Contoh: Nasi Uduk Spesial Mami" class="w-full bg-[#f5f5f5] text-black-main font-medium py-3 px-4 rounded-xl outline-none border border-transparent focus:border-[#274c43] text-sm" required />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">Kategori Produk</label>
              <select id="promoKategori" class="w-full bg-[#f5f5f5] text-black-main font-medium py-3 px-4 rounded-xl outline-none border border-transparent focus:border-[#274c43] text-sm">
                <option value="Kuliner / Makanan">Kuliner / Makanan</option>
                <option value="Fashion / Pakaian">Fashion / Pakaian</option>
                <option value="Kerajinan / Craft">Kerajinan / Craft</option>
                <option value="Jasa / Layanan">Jasa / Layanan</option>
                <option value="Toko Sembako">Toko Sembako</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">Gaya Bahasa AI (Tone of Voice)</label>
              <select id="promoTone" class="w-full bg-[#f5f5f5] text-black-main font-medium py-3 px-4 rounded-xl outline-none border border-transparent focus:border-[#274c43] text-sm">
                <option value="ramah">Ramah & Akrab (Pelanggan Setia)</option>
                <option value="heboh">Heboh & Promo Diskon (Cuci Gudang)</option>
                <option value="profesional">Profesional & Resmi (Produk Premium)</option>
                <option value="lucu">Humoris & Kekinian (Anak Muda / Sosmed)</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">Promo / Keunggulan Produk</label>
            <input type="text" id="promoDetail" placeholder="Contoh: Diskon 20% / Beli 2 Gratis Es Teh" class="w-full bg-[#f5f5f5] text-black-main font-medium py-3 px-4 rounded-xl outline-none border border-transparent focus:border-[#274c43] text-sm" required />
          </div>

          <button type="submit" id="submitPromoAiBtn" class="w-full bg-[#274c43] hover:bg-[#1f3d36] text-white font-bold py-3.5 rounded-xl transition-all shadow-md text-sm cursor-pointer flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4.5 h-4.5"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
            Generate Caption Promosi AI
          </button>
        </form>

        <div id="promoResult" class="hidden mt-6 pt-6 border-t border-gray-100 space-y-4">
          <div class="flex items-center justify-between">
            <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider">Hasil Teks Promosi AI</label>
            <span id="aiBadgeStatus" class="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">Diproses Cerdas</span>
          </div>
          <div id="promoTextOutput" class="bg-[#f8faf9] p-5 rounded-2xl border border-gray-200 text-sm text-gray-800 leading-relaxed whitespace-pre-line font-mono"></div>
          <button id="copyPromoBtn" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-all text-sm cursor-pointer flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4.5 h-4.5"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
            Salin Teks Promosi
          </button>
        </div>
      </div>
    </div>
  `;
}
