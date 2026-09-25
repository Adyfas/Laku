---
name: Inventory Nested Level Mobile Add and Delete Fix
description: Perbaiki row tambah level anakan di edit mobile, penghapusan level kosong, dan konfirmasi penghapusan level
type: plan
status: ready
---

# Plan: Perbaikan Tambah/Hapus Level Anakan Inventory Mobile

## Tujuan

Memastikan tombol `+ Tambah Level Anakan` pada edit inventory versi mobile menambahkan row ke container yang terlihat, serta memastikan tombol X dapat menghapus level kosong maupun berisi dengan konfirmasi.

## Temuan Teknis

- File target: `javascript/apps/inventory/inventoryClient.js`.
- Render mobile dan desktop membuat dua container dengan ID yang sama, `editNestingLevels-${item.id}` (`inventoryClient.js:152`, `461`, dan `575`). Pada viewport mobile, container desktop tetap ada di DOM tetapi tersembunyi oleh class `hidden lg:block`.
- Handler tambah level mengambil container dengan `document.getElementById(...)` (`inventoryClient.js:703-705`). Karena ID duplikat, browser dapat mengembalikan container desktop yang tersembunyi, sehingga row baru ditambahkan tetapi tidak terlihat di kartu mobile.
- Row baru juga perlu mendapat handler hapus; handler yang aman harus menggunakan event delegation pada container yang benar, bukan mengandalkan binding tombol lama.
- Guard berdasarkan `data-nesting-index` sudah tepat dan harus dipertahankan; validasi juga harus menangani row yang tidak ditemukan.
- Konfirmasi dapat memakai `window.showCustomConfirm()` yang sudah tersedia di `javascript/core/popup.js:67-121`.
- Konfirmasi hapus barang inventaris yang sudah ada tetap dipertahankan dan tidak diubah.

## Keputusan UX

- Konfirmasi muncul untuk semua penghapusan level anakan, baik row kosong maupun sudah berisi.
- Jika user memilih Batal, row dan draft tidak berubah.
- Jika user memilih Ya, Hapus, row dihapus dari DOM, draft diperbarui, dan indeks row tersisa dinomori ulang.
- Gunakan bahasa yang gaptek-friendly: judul `Hapus Level Anakan?`, pesan `Level ini akan dihapus dari daftar kemasan. Tetap hapus?`, tombol `Ya, Hapus` dan `Batal`.

## Task Implementasi

1. Perbaiki target container untuk tombol tambah level di `javascript/apps/inventory/inventoryClient.js`.
   - Ubah `renderEditNestingLevels(item, draft, view)` agar setiap tampilan mempunyai wrapper dan container sendiri, misalnya `data-nesting-section`, `data-nesting-container`, dan `data-nesting-item="${item.id}"`.
   - Panggil renderer dengan `view = "desktop"` pada tabel dan `view = "mobile"` pada kartu mobile; jangan memakai ID global yang sama untuk kedua tampilan.
   - Pada handler `[data-add-nesting]`, ambil container dari `e.currentTarget.closest("[data-nesting-section]")?.querySelector("[data-nesting-container]")`, bukan `document.getElementById(...)`.
   - Tambahkan row kosong ke container yang benar, perbarui `nestedLevels` pada draft, lalu panggil render ulang terkontrol agar desktop dan mobile tetap sinkron saat viewport berubah.
2. Buat handler hapus level yang aman dan dapat dipakai untuk row existing maupun row dinamis.
   - Pasang satu delegated handler per `[data-nesting-container]`; jangan mencari container pertama berdasarkan ID duplikat.
   - Ambil item ID dari container dan row melalui `closest(".nesting-edit-row")`; validasi keduanya tidak null.
   - Ambil indeks dari `data-nesting-index`; lanjutkan hanya jika indeks berupa integer valid dan berada dalam rentang draft.
   - Gunakan salinan array `nestedLevels` sebelum `splice`.
   - Tunggu `window.showCustomConfirm()` sebelum mengubah draft atau DOM.
   - Setelah dikonfirmasi, perbarui draft dan render ulang tampilan agar row terhapus di desktop/mobile secara konsisten.
3. Perbarui binding input level agar bekerja per container.
   - Gunakan delegated `change` untuk `[data-edit-nesting-unit]` dan delegated `input` untuk `[data-edit-nesting-isi]` di dalam container.
   - Hapus ketergantungan selector `#editNestingLevels-${id}` yang mengambil semua container dengan ID duplikat.
   - Pastikan row baru langsung dapat mengisi satuan/isi dan menghapus tanpa listener ganda.
4. Pertahankan alur simpan yang memfilter level tidak lengkap di `saveInlineEditItem()`, sehingga row kosong yang terlewat tidak tersimpan ke `localStorage`.

## Acceptance Criteria

- Pada viewport mobile, edit barang -> klik `+ Tambah Level Anakan` -> row satuan dan isi baru langsung muncul di kartu mobile yang terlihat.
- Menambah beberapa level di mobile tetap menambah row baru, bukan menulis ke container desktop yang tersembunyi.
- Setelah menambah level di mobile, viewport dapat diubah ke desktop dan level tetap tersedia karena draft menjadi sumber tampilan yang sinkron.
- Edit barang -> klik X pada row kosong -> modal konfirmasi muncul.
- Pilih Batal -> row tetap ada dan tidak ada data yang terhapus.
- Pilih Ya, Hapus -> row hilang, array draft berkurang satu, dan indeks row lain tetap urut.
- Level yang sudah diisi satuan/isi dan level existing dari data tersimpan dapat dihapus dengan konfirmasi yang sama.
- Menyimpan edit tanpa level valid tidak menyimpan row kosong.
- Hapus barang inventaris tetap memakai konfirmasi dan tetap berfungsi di desktop maupun mobile.
- Tidak ada console error saat menambah, mengisi, membatalkan, dan menghapus beberapa level berturut-turut.

## Validasi

- Uji manual di `app.html` pada viewport mobile untuk menambah satu dan beberapa level, mengisi field, menghapus dengan Batal, dan menghapus dengan Ya, Hapus.
- Uji viewport desktop dan perpindahan mobile ↔ desktop setelah menambah level.
- Inspeksi DOM memastikan row baru masuk ke container mobile, bukan container desktop tersembunyi.
- Jalankan syntax check: `node --check javascript/apps/inventory/inventoryClient.js`.
- Tidak ada lint/typecheck karena project ini tidak memiliki package.json atau test runner.
