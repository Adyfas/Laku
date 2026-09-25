---
name: HPP Wizard Inline Item Editing
description: Edit dan delete inline untuk list bahan serta biaya tambahan dalam draft HPP
type: plan
status: ready
---

# Plan: Edit/Delete Inline List Item HPP

## Tujuan

Menambahkan kontrol Edit dan Delete langsung di setiap box pada:

- Step 2: list bahan.
- Step 3: list Biaya Lain-lain.

Delete hanya menghapus item dari draft/session HPP yang sedang dihitung. Delete tidak menghapus data Inventaris dan tidak menghapus resep yang sudah tersimpan.

## Keputusan yang sudah dikonfirmasi

- Edit dilakukan inline di dalam box item, bukan melalui form tambah default di bawah list.
- Bahan yang sedang diedit hanya boleh mengubah jumlah dan satuan. Jenis/nama bahan dan `inventoryId` tetap.
- Biaya Lain-lain yang sedang diedit boleh mengubah nama dan nominal biaya.
- Satu list hanya boleh memiliki satu item dalam mode Edit.
- Mode Edit menyediakan tombol Simpan dan Batal.
- Delete wajib memakai konfirmasi sebelum item dihapus.
- Perubahan item, draft input, dan mode Edit harus tetap tersedia setelah modal ditutup/dibuka kembali atau halaman di-reload, sampai Simpan Resep berhasil.
- Delete dan Simpan harus langsung memperbarui subtotal/total HPP dan `laku_hpp_session`.
- HPP tetap vanilla JS tanpa build step.

## Temuan teknis saat ini

1. `hppIngredients.js:246-265` sudah menampilkan tombol Delete, tetapi handler memanggil `showCustomConfirm()` dengan `onConfirm`. Fungsi tersebut mengembalikan `Promise<boolean>` dan tidak menerima callback, sehingga item tidak terhapus.
2. `hppIngredients.js:277-420` mengedit bahan melalui form tambah default dan memperbolehkan pergantian jenis bahan. Ini tidak sesuai keputusan terbaru; edit harus inline dan hanya mengubah jumlah/satuan.
3. `hppCalc.js:42-70` memiliki masalah Delete yang sama: callback `onConfirm` tidak pernah dipanggil.
4. `hppCalc.js:100-174` mengedit Biaya Lain-lain melalui form tambah default, bukan inline di box item.
5. `hppClient.js:27-45` hanya menerima session versi 2. Schema baru perlu menaikkan versi agar draft lama tidak dianggap valid secara keliru.
6. `hppClient.js:107-155` menyimpan ID mode edit, tetapi belum menyimpan nilai draft inline yang belum disimpan.
7. `hppClient.js:158-201` belum memulihkan mode edit inline dari session.
8. `hppClient.js:307-322` masih memanggil fungsi edit lama yang menggunakan form default.
9. `popup.js:67-120` mendefinisikan `showCustomConfirm` sebagai Promise. Semua delete handler harus memakai `await`.
10. Load order di `app.html:591-624` sudah benar: HPP dimuat sebelum `popup.js`, tetapi semua aksi delete terjadi setelah halaman selesai dimuat sehingga Promise API tetap tersedia.

## Schema session yang direncanakan

Naikkan `HPP_SESSION_VERSION` menjadi `3` dan tambahkan draft edit inline:

```js
{
  version: 3,
  currentStep: 1,
  editingRecipeId: null,
  editingIngredientId: null,
  editingIngredientDraft: null,
  editingOverheadId: null,
  editingOverheadDraft: null,
  product: {},
  pendingIngredient: {},
  pendingOverhead: { nama: "", biaya: "" },
  ingredients: [],
  overheadItems: [],
  costs: {},
  margin: 30
}
```

Aturan:

1. `editingIngredientDraft` menyimpan `{ id, jumlahPakai, satuan }` sementara mode edit aktif.
2. `editingOverheadDraft` menyimpan `{ id, nama, biaya }` sementara mode edit aktif.
3. Draft lama tanpa field baru dinormalisasi tanpa menghapus item yang masih valid.
4. Session dibersihkan hanya setelah Simpan Resep berhasil.
5. Jika Simpan Resep gagal, seluruh draft dan mode edit tetap dipertahankan.

## Desain UI

### A. Box bahan — tampilan normal

Setiap box menampilkan:

- nama bahan;
- jumlah dan satuan yang dipilih;
- subtotal biaya bahan;
- tombol Edit;
- tombol Delete.

Jika item Inventaris sudah dihapus, tampilkan warning dan izinkan Delete. Inline Edit untuk jumlah/satuan dinonaktifkan sampai data Inventaris tersedia kembali.

### B. Box bahan — mode Edit

Tampilan normal jumlah/satuan diganti dengan:

- input number untuk jumlah;
- select satuan yang hanya berisi satuan kompatibel dari item Inventaris terkait;
- tombol Simpan;
- tombol Batal.

Nama/jenis bahan tetap ditampilkan dan tidak dapat diganti.

Simpan harus:

1. memvalidasi jumlah > 0;
2. memvalidasi satuan dipilih dan kompatibel;
3. mengecek stok cukup;
4. memperbarui seluruh field kalkulasi bahan (`jumlahPakai`, `_inputQty`, `_inputUnit`, `_inputUnitPrice`, `_qtyWorking`, dan field terkait);
5. memperbarui subtotal;
6. menyimpan session;
7. keluar dari mode Edit.

Batal harus mengembalikan nilai sebelum Edit, menghapus draft edit, dan menyimpan session.

### C. Box Biaya Lain-lain — tampilan normal

Setiap box menampilkan:

- nama biaya;
- nominal biaya;
- tombol Edit;
- tombol Delete.

### D. Box Biaya Lain-lain — mode Edit

Tampilan normal diganti dengan:

- input nama biaya;
- input nominal biaya;
- tombol Simpan;
- tombol Batal.

Simpan memvalidasi nama tidak kosong dan nominal > 0, lalu memperbarui item, total overhead, dan session.

## Task pengerjaan

### Task 1 — Audit dan perlindungan working tree

File/area:

- `git diff`
- `app.html:591-624`
- `javascript/core/popup.js:67-120`

Acceptance:

- Baca diff sebelum mengubah kode.
- Jangan revert perubahan milik user/agent lain.
- Konfirmasi `showCustomConfirm` harus diperlakukan sebagai Promise.
- Konfirmasi urutan load HPP dan popup tidak membutuhkan perubahan.

### Task 2 — Inline Edit/Delete Bahan

File utama:

- `javascript/apps/hpp/hppIngredients.js`
- `javascript/apps/hpp/hppClient.js`

Implementasi:

1. Ubah `renderIngredients()` agar setiap item memiliki state normal atau inline edit.
2. Buat helper untuk mengambil pilihan satuan kompatibel dari item Inventaris terkait.
3. Gunakan event delegation atau bind ulang setelah `innerHTML` tanpa listener ganda.
4. Ganti handler Delete menjadi `async` dan tunggu hasil `showCustomConfirm()`.
5. Hapus hanya item dengan ID yang dipilih dari `window.LakuHpp.ingredients`.
6. Jangan mengubah `inventoryId`, nama, atau jenis bahan saat Edit.
7. Gunakan helper konversi/stok yang sudah ada untuk validasi Edit.
8. Simpan draft inline ke session saat nilai berubah.
9. Pulihkan mode Edit dan nilai draft setelah init/reload.

Acceptance:

- Edit hanya mengubah jumlah dan satuan.
- Simpan memperbarui box, subtotal, dan session.
- Batal mengembalikan nilai awal.
- Delete menampilkan konfirmasi dan benar-benar menghapus item.
- Delete tidak mengubah Inventaris.
- Tidak ada duplicate listener atau console error.

### Task 3 — Inline Edit/Delete Biaya Lain-lain

File utama:

- `javascript/apps/hpp/hppCalc.js`
- `javascript/apps/hpp/hppClient.js`

Implementasi:

1. Ubah `renderOverhead()` agar mendukung tampilan normal dan inline edit.
2. Tampilkan input nama dan nominal di dalam box saat Edit.
3. Tambahkan Simpan dan Batal.
4. Gunakan ID stabil untuk setiap item; normalisasi item lama tanpa ID.
5. Ganti Delete menjadi async Promise confirmation.
6. Update `overheadItems`, total overhead, dan session setelah Simpan/Delete.
7. Simpan dan restore `editingOverheadId` serta `editingOverheadDraft`.

Acceptance:

- Edit nama dan nominal dilakukan langsung di box item.
- Simpan tidak membuat item duplikat.
- Batal mengembalikan nilai awal.
- Delete menampilkan konfirmasi dan benar-benar menghapus item.
- Total Biaya Lain-lain dan hasil HPP langsung benar.

### Task 4 — Session lifecycle dan reset

File utama:

- `javascript/apps/hpp/hppClient.js`
- `javascript/apps/hpp/hppRecipes.js`

Implementasi:

1. Naikkan session version ke 3.
2. Tambahkan capture/restore untuk draft edit inline.
3. Pastikan hanya satu mode Edit per list.
4. Pastikan `resetForm()` membersihkan `editingIngredientId`, `editingOverheadId`, dan draft edit.
5. Pastikan `saveCurrentRecipe()` hanya membersihkan session setelah save berhasil.
6. Pertahankan cleanup listener inventory/storage yang sudah ada.

Acceptance:

- Close/open dan reload mempertahankan item serta mode Edit.
- Draft edit inline tidak hilang saat berpindah step.
- Simpan Resep berhasil mereset wizard.
- Simpan Resep gagal mempertahankan seluruh draft.
- Resep tersimpan dan Inventaris tidak terpengaruh oleh delete item wizard.

### Task 5 — QA, cache, dan report

1. Uji skenario pada checklist di bawah.
2. Periksa console browser untuk error.
3. Jika file HPP berubah, bump `CACHE_NAME` di `sw.js` dan verifikasi service worker mengambil versi terbaru.
4. Update report di:
   `/Users/adyfas/Documents/Obsidian Vault/Inovation/memory/agent-tasks/kilo-hpp-session-ingredient-sync.md`

## Validation checklist

### Bahan

- [ ] Tambah bahan baru tetap berhasil.
- [ ] Klik Edit pada box bahan menampilkan input jumlah dan select satuan di box yang sama.
- [ ] Nama/jenis bahan tidak berubah saat Edit.
- [ ] Simpan mengubah jumlah/satuan, subtotal, dan session.
- [ ] Batal mengembalikan nilai sebelum Edit.
- [ ] Klik Delete memunculkan konfirmasi.
- [ ] Konfirmasi Delete menghapus item dari draft HPP.
- [ ] Cancel confirmation mempertahankan item.
- [ ] Delete tidak menghapus item dari Inventaris.
- [ ] Edit/Delete tetap bekerja setelah close/open dan reload.
- [ ] Hanya satu bahan yang bisa masuk mode Edit.
- [ ] Item dengan Inventaris terhapus menampilkan warning dan tetap bisa di-delete.

### Biaya Lain-lain

- [ ] Tambah biaya baru tetap berhasil.
- [ ] Klik Edit menampilkan input nama dan nominal di box yang sama.
- [ ] Simpan mengubah nama/nominal tanpa duplikasi.
- [ ] Batal mengembalikan nilai sebelum Edit.
- [ ] Delete memakai konfirmasi dan menghapus item.
- [ ] Cancel confirmation mempertahankan item.
- [ ] Total overhead dan hasil HPP langsung diperbarui.
- [ ] Edit/Delete tetap bekerja setelah close/open dan reload.
- [ ] Hanya satu biaya yang bisa masuk mode Edit.

### Regression

- [ ] Step 2 tidak bisa dilewati tanpa minimal satu bahan.
- [ ] Step 2 tetap memvalidasi jumlah/satuan bahan pending.
- [ ] Simpan Resep berhasil menghapus session dan reset form.
- [ ] Simpan Resep gagal mempertahankan session.
- [ ] Resep tersimpan tidak berubah saat delete item wizard.
- [ ] Inventaris tidak berubah saat delete item wizard.
- [ ] Margin, harga jual, dan rumus HPP tidak berubah.
- [ ] Tidak ada duplicate event listener.
- [ ] Tidak ada console error.
- [ ] Service worker mengambil versi JS terbaru.

## Risiko dan mitigasi

- **Delete tidak jalan:** `showCustomConfirm` adalah Promise; gunakan `await` dan hanya mutasi setelah hasil `true`.
- **Edit memakai form default:** pisahkan state render normal/edit di dalam box dan jangan mengisi form tambah saat Edit.
- **Nilai edit hilang saat reload:** simpan draft inline beserta ID edit di session.
- **Listener ganda:** gunakan event delegation atau hapus handler sebelum bind ulang.
- **Konversi satuan salah:** reuse helper `LakuUnits` dan validasi stok yang sudah ada.
- **Cache lama:** bump cache dan verifikasi setelah deploy.
