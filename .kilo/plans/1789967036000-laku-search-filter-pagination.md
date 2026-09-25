---
name: Laku Search Filter Pagination Implementation
description: Mengimplementasikan fitur search, filter, dan pagination ke modul-modul utama Laku untuk meningkatkan usability saat menangani data banyak
type: plan
status: ready
---

# Plan: Implementasi Search, Filter, dan Pagination di Modul Laku

## Tujuan

Mengimplementasikan fitur search, filter, dan pagination ke lima modul utama Laku (yang sebagian besar belum memiliki fitur ini atau memiliki versi yang sangat dasar):
1. Hitung Modal & Harga Jual (HPP) - search by nama produk + pagination (belum ada)
2. Catat Keuangan Harian (Kas) - filter by pemasukan/pengeluaran + date range + pagination (perlu ditingkatkan)
3. Catat Utang & Piutang (Utang) - search by nama + filter by utang/piutang + pagination (perlu ditingkatkan)
4. Stok Barang & Bahan (Inventory) - pagination + filter by status stok + search by nama (perlu ditingkatkan)
5. Produksi Barang (Produksi) - search by nama + pagination (belum ada)

Fitur ini akan mempermudah pengguna dalam mencari, menyaring, dan menavigasi data yang banyak, sambil menjaga desain minimalis dan user-friendly yang konsisten dengan identitas visual Laku.

## Lokasi Perubahan

Setiap modul akan diperbaharui pada file-file berikut:
- `javascript/apps/[module]/[module]App.js` - untuk menambahkan UI controls
- `javascript/apps/[module]/[module]Client.js` - untuk logika filtering/pagination dan state management
- `javascript/apps/[module]/[module]Recipes.js` (jika ada) - untuk integrasi dengan data list

## Desain dan Alur Kerja

### Prinsip Umum
1. **State Management**: Search term, filter selections, current page, dan page size akan disimpan di state objek modul (misal: `window.LakuKas.state`)
2. **Processing Pipeline**: 
   Raw Data → Apply Search → Apply Filters → Apply Pagination → Rendered Data
3. **UI Controls**: 
   - Search input: di atas tabel/kartu
   - Filter controls: di bawah search input atau dalam panel terpisah
   - Pagination controls: di bawah tabel/kartu dengan page size selector
4. **Persistensi**: Preferensi search/filter/pagination akan disimpan ke sessionStorage agar tetap ada saat berpindah halaman atau merefresh

### Komponen UI yang Ditambahkan
Untuk setiap modul, akan ditambahkan:
```html
<!-- Search Container -->
<div class="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between sm:gap-4">
  <div class="flex-1 min-w-0">
    <label class="block text-sm font-medium text-gray-700 mb-1">Cari</label>
    <input type="text" id="[module]SearchInput" placeholder="Cari berdasarkan nama..." class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
  </div>
  <!-- Filter controls akan ditambahkan di sini sesuai kebutuhan modul -->
</div>

<!-- Pagination Container -->
<div class="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between sm:gap-4">
  <div class="flex-1 sm:auto">
    <label class="block text-sm font-medium text-gray-700 mb-1">Tampilkan</label>
    <select id="[module]PageSizeSelect" class="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
      <option value="10">10</option>
      <option value="20">20</option>
      <option value="30">30</option>
      <option value="40">40</option>
      <option value="50">50</option>
    </select>
    <label class="ml-2 text-sm text-gray-500">baris per halaman</label>
  </div>
  <div class="mt-2 sm:mt-0 flex items-center justify-between">
    <span class="text-sm text-gray-500">Menampilkan <span id="[module]StartIndex"></span> sampai <span id="[module]EndIndex"></span> dari <span id="[module]TotalCount"></span> data</span>
    <div class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm space-x-1">
      <button id="[module]PrevPage" class="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">Sebelumnya</button>
      <div class="px-3 py-2 text-sm font-medium text-gray-500"><span id="[module]CurrentPage"></span> dari <span id="[module]TotalPages"></span></div>
      <button id="[module]NextPage" class="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">Selanjutnya</button>
    </div>
  </div>
</div>
```

### Detail Implementasi per Modul

#### 1. Hitung Modal & Harga Jual (HPP)
- **Search**: By nama produk di daftar resep (belum ada sebelumnya)
- **Pagination**: Dropdown page size (10-50) (belum ada sebelumnya)
- **File yang Diubah**:
  - `hppApp.js`: Tambahkan search input dan pagination controls di sekitar daftar resep
  - `hppClient.js`: 
    - Tambah properti state: `searchTerm`, `currentPage`, `pageSize`
    - Modifikan `renderRecipeList()` untuk menerapkan search dan pagination
    - Tambah event listener untuk search input dan pagination controls
    - Tambah fungsi helper untuk filter dan slice data

#### 2. Catat Keuangan Harian (Kas)
- **Filter**: By tipe (pemasukan/pengeluaran)
- **Date Range**: Start dan end date picker
- **Search**: Optional by keterangan (jika ada)
- **Pagination**: Dropdown page size (10-50)
- **File yang Diubah**:
  - `kasApp.js`: Tambahkan search input, filter controls, date pickers, dan pagination controls
  - `kasClient.js`:
    - Tambah properti state: `searchTerm`, `transactionTypeFilter` (all/pemasukan/pengeluaran), `dateRangeStart`, `dateRangeEnd`, `currentPage`, `pageSize`
    - Modifikan fungsi yang menyimpan/mengambil data kas untuk menerapkan semua filter
    - Tambah event listener untuk semua controls
    - Tambah fungsi helper untuk filter dan slice data

#### 3. Catat Utang & Piutang (Utang)
- **Search**: By nama debtor/creditor
- **Filter**: By tipe (utang/piutang/all)
- **Pagination**: Dropdown page size (10-50)
- **File yang Diubah**:
  - `utangApp.js`: Tambahkan search input, filter dropdown, dan pagination controls
  - `utangClient.js`:
    - Tambah properti state: `searchTerm`, `debtTypeFilter` (all/utang/piutang), `currentPage`, `pageSize`
    - Modifikan `renderUtangList()` untuk menerapkan search, filter, dan pagination
    - Tambah event listener untuk search input dan filter dropdown
    - Tambah fungsi helper untuk filter dan slice data

#### 4. Stok Barang & Bahan (Inventory)
- **Search**: By nama barang
- **Filter**: By status stok (aman/tipis/habis/all)
- **Pagination**: Dropdown page size (10-50)
- **File yang Diubah**:
  - `inventoryApp.js`: Tambahkan search input, filter dropdown, dan pagination controls
  - `inventoryClient.js`:
    - Tambah properti state: `searchTerm`, `stockStatusFilter` (all/aman/tipis/habis), `currentPage`, `pageSize`
    - Modifikan `renderInventoryList()` untuk menerapkan search, filter, dan pagination
    - Tambah event listener untuk search input dan filter dropdown
    - Tambah fungsi helper untuk filter dan slice data

#### 5. Produksi Barang (Produksi)
- **Search**: By nama produk
- **Pagination**: Dropdown page size (10-50)
- **File yang Diubah**:
  - `produksiApp.js`: Tambahkan search input dan pagination controls
  - `produksiClient.js`:
    - Tambah properti state: `searchTerm`, `currentPage`, `pageSize`
    - Modifikan `renderProduksiList()` untuk menerapkan search dan pagination
    - Tambah event listener untuk search input dan pagination controls
    - Tambah fungsi helper untuk filter dan slice data

## Risiko dan Mitigasi

### Risiko 1: Performance dengan Dataset Besar
- **Mitigasi**: Implementasikan debouncing pada search input (300ms delay) untuk mengurangi frekuensi filtering. Pastikan filtering dilakukan pada array yang sudah ada di memory, bukan setiap kali mengakses localStorage.

### Risiko 2: Inconsistency dalam State Management
- **Mitigasi**: Gunakan pola konsisten untuk menyimpan state filter/pagination di semua modul. Buat fungsi helper umum jika diperlukan untuk inisialisasi dan pembaruan state.

### Risiko 3: Konflik dengan Fitur Existing
- **Mitigasi**: Lakukan review terhadap kode existing sebelum menambahkan event listener atau modificati state. Pastikan tidak mengganti fungsi atau variabel yang sudah ada kecuali dengan tujuan yang jelas.

### Risiko 4: Penggunaan yang Tidak Intuitif
- **Mitikasi**: Ikuti desain yang sudah ada di modul Learn dan modul-modul lain yang mungkin sudah memiliki elemen serupa. Gunakan label, placeholder, dan grup visual yang jelas untuk setiap kontrol.

## Validasi Checklist

### Umum untuk Semua Modul
- [ ] Search input muncul di atas daftar data dengan placeholder yang jelas
- [ ] Filter controls muncul sesuai spesifikasi modul
- [ ] Pagination controls muncul di bawah daftar data
- [ ] Page size selector memiliki opsi 10, 20, 30, 40, 50
- [ ] State search/filter/pagination disimpan dan diambil dengan benar saat halaman dimuat atau berpindah
- [ ] Debounce berfungsi pada search input untuk mengurangi pemrosesan berlebihan
- [ ] Tidak ada console error terkait search, filter, atau pagination
- [ ] Fitur existing (menambah, edit, hapus data) tetap berfungsi dengan benar

### Spesifik per Modul

#### HPP
- [ ] Search by nama produk dalam daftar resep berfungsi (fitur baru)
- [ ] Pagination menampilkan jumlah data yang sesuai dengan page size (fitur baru)
- [ ] Navigasi halaman (next/prev) berfungsi dengan benar
- [ ] Informasi "Menampilkan X sampai Y dari Z data" berfungsi

#### Kas
- [ ] Filter by pemasukan/pengeluaran berfungsi (perlu ditingkatkan jika sudah ada dasar)
- [ ] Date range filter berfungsi (memfilter transaksi dalam rentang tanggal)
- [ ] Search by keterangan (jika diimplementasikan) berfungsi
- [ ] Kombinasi semua filter berfungsi secara bersamaan

#### Utang
- [ ] Search by nama berfungsi (perlu ditingkatkan jika sudah ada dasar)
- [ ] Filter by utang/piutang/all berfungsi (perlu ditingkatkan jika sudah ada dasar)
- [ ] Tampilan utang dan piutang tetap terpisah sesuai tipe

#### Inventory
- [ ] Filter by stock status (aman/tipis/habis) berfungsi (perlu ditingkatkan jika sudah ada dasar)
- [ ] Stok ditandai dengan warna atau label sesuai status (sesuai existing design)
- [ ] Search by nama barang berfungsi (perlu ditingkatkan jika sudah ada dasar)

#### Produksi
- [ ] Search by nama produk berfungsi (fitur baru)
- [ ] Pagination berfungsi dengan benar (fitur baru)

### Integrasi dan Konsistensi
- [ ] Desain UI kontrol konsisten dengan tema Laku (minimalis, user-friendly)
- [ ] Semua kontrol menggunakan kelas-kelas Tailwind yang sudah ada di codebase
- [ ] Tidak ada perubahan pada warna, tipografi, atau spacing yang tidak diinginkan
- [ ] Responsiveness preserved (kontrol tetap bekerja dengan baik di mobile dan desktop)