function getProduksiAppUI() {
  return `
    <div class="max-w-4xl mx-auto space-y-6 animate-fade-in-up">
      <div class="bg-gradient-to-br from-[#274c43] to-[#1f3d36] text-white p-8 rounded-3xl shadow-xl">
        <div class="flex items-center gap-3 mb-2">
          <span class="text-xs font-bold tracking-widest uppercase text-lime-300">Catat Produksi</span>
        </div>
        <h2 class="text-2xl md:text-3xl font-bold mb-2">Produksi Barang</h2>
        <p class="text-white/80 text-sm leading-relaxed">Pilih resep saat kamu benar-benar membuat produk. Stok bahan akan berkurang setelah kamu konfirmasi.</p>
      </div>

      <div class="flex gap-2 border-b border-gray-200" role="tablist" aria-label="Produksi">
        <button type="button" id="produksiTabResep" class="px-4 py-3 text-sm font-bold text-[#274c43] border-b-2 border-[#274c43] cursor-pointer" role="tab">Resep</button>
        <button type="button" id="produksiTabRiwayat" class="px-4 py-3 text-sm font-bold text-gray-400 border-b-2 border-transparent cursor-pointer" role="tab">Produksi</button>
      </div>

      <section id="produksiPanelResep" class="space-y-3" role="tabpanel">
<!-- Search Controls -->
         <div class="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between sm:gap-4">
           <div class="flex-1 min-w-0">
             <label class="block text-sm font-medium text-gray-700 mb-1">Cari</label>
             <input type="text" id="produksiSearchInput" placeholder="Cari berdasarkan nama produk..." class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
           </div>
           <div class="flex-1 min-w-0">
             <button id="produksiClearFilters" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">Reset Filter</button>
           </div>
         </div>

        <div id="produksiRecipeList"></div>

        <!-- Pagination Controls -->
        <div id="produksiPagination" class="mt-4 flex sm:flex-row items-center justify-between gap-4 hidden">
          <div class="flex-1 sm:auto">
            <label class="block text-sm font-medium text-gray-700 mb-1">Tampilkan</label>
            <select id="produksiPageSizeSelect" class="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="30">30</option>
              <option value="40">40</option>
              <option value="50">50</option>
            </select>
          </div>
          <div class="mt-2 sm:mt-0 flex items-center justify-between flex-col">
            <div class="inline-flex items-center py-2 rounded-md shadow-sm space-x-1">
            <button id="produksiPrevPage" class="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transform rotate-180">${I.svg("arrowRight")}</button>
            <div class="px-3 py-2 text-sm font-medium text-gray-500 flex items-center gap-2"><span id="produksiCurrentPage"></span> dari <span id="produksiTotalPages"></span></div>
            <button id="produksiNextPage" class="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">${I.svg("arrowRight")}</button>
            </div>
            </div>
            </div>
            <span class="text-sm my-2 text-gray-500 gap-1">Menampilkan <span id="produksiStartIndex"></span> sampai <span id="produksiEndIndex"></span> dari <span id="produksiTotalCount"></span> data</span>
      </div>
    </div>
      </section>

      <section id="produksiPanelRiwayat" class="hidden space-y-5" role="tabpanel">
        <div id="produksiSummary" class="grid grid-cols-1 sm:grid-cols-3 gap-3"></div>
        <div id="produksiHistoryList"></div>
      </section>
    </div>
  `;
}