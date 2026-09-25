---
name: HPP Buat Baru Button
description: Menambahkan tombol "Buat Baru" di setiap langkah wizard HPP untuk membatalkan pengeditan resep dan memulai resep baru.
type: plan
status: ready
---

# Plan: Tambahkan Tombol "Buat Baru" di Wizard HPP

## Tujuan

Menambahkan tombol "Buat Baru" (Create New) di bawah tombol navigasi existing (Kembali dan Lanjut) di setiap langkah (step 1, 2, 3, 4) dari wizard HPP. Tombol ini akan memanggil fungsi `window.LakuHpp.resetForm()` untuk:
- Mengosongkan session HPP
- Mengosongkan daftar bahan dan biaya overhead
- Mengosongkan state pengeditan (editingRecipeId, editingIngredientId, dll.)
- Mereset formulir ke nilai default
- Mengembalikan ke langkah 1

Ini memungkinkan pengguna untuk membatalkan pengeditan resep saat ini dan memulai resep baru dari awal tanpa harus menutup modal atau mengunjungi daftar resep.

## Lokasi Perubahan

1. File: `/Volumes/Adyfas/Project/INOVATION COMPETION/FE/javascript/apps/hpp/hppApp.js` - untuk menambahkan tombol HTML di setiap langkah.
2. File: `/Volumes/Adyfas/Project/INOVATION COMPETION/FE/javascript/apps/hpp/hppClient.js` - untuk menambahkan event listener yang memanggil `window.LakuHpp.resetForm()`.

## Detail Perubahan

### Dalam hppApp.js

Untuk setiap langkah, tambahkan tombol "Buat Baru" di bawah kontainer tombol existing.

**Langkah 1 (hppStep1):**
Setelah tombol "Lanjut Pilih Bahan →", tambahkan:
```html
<button type="button" id="hppStep1BuatBaru" class="w-full mt-2 bg-stone-100 hover:bg-stone-200 text-gray-700 font-bold py-3 rounded-2xl transition-all text-base cursor-pointer">
  Buat Baru
</button>
```

**Langkah 2 (hppStep2):**
Setelah kontainer `<div class="flex gap-3 pt-2">` yang berisi tombol "← Kembali" dan "Lanjut Biaya Tambahan →", tambahkan:
```html
<button type="button" id="hppStep2BuatBaru" class="w-full mt-2 bg-stone-100 hover:bg-stone-200 text-gray-700 font-bold py-3 rounded-2xl transition-all text-base cursor-pointer">
  Buat Baru
</button>
```

**Langkah 3 (hppStep3):**
Serupa dengan langkah 2, setelah kontainer tombol existing, tambahkan tombol dengan id `hppStep3BuatBaru`.

**Langkah 4 (hppStep4):**
Setelah kontainer yang berisi tombol "← Kembali" dan "Simpan Resep", tambahkan tombol dengan id `hppStep4BuatBaru`.

### Dalam hppClient.js

Dalam fungsi `initHppAppLogic`, setelah mengikat event listener untuk tombol-tombol existing, tambahkan:

```javascript
// Buat Baru button handlers
el("hppStep1BuatBaru")?.addEventListener("click", () => {
  window.LakuHpp.resetForm();
});
el("hppStep2BuatBaru")?.addEventListener("click", () => {
  window.LakuHpp.resetForm();
});
el("hppStep3BuatBaru")?.addEventListener("click", () => {
  window.LakuHpp.resetForm();
});
el("hppStep4BuatBaru")?.addEventListener("click", () => {
  window.LakuHpp.resetForm();
});
```

## Validasi Checklist

- [ ] Tombol "Buat Baru" muncul di setiap langkah wizard HPP (step 1, 2, 3, 4) di bawah tombol navigasi existing.
- [ ] Tombol memiliki tampilan yang konsisten dengan tombol "Kembali" (bg-stone-100, hover:bg-stone-200, text-gray-700).
- [ ] Khi tombol "Buat Baru" diklik:
    - Formulir HPP dikosongkan (nama produk, jumlah produksi, dsb. kembali ke nilai default).
    - Daftar bahan dan biaya overhead dikosongkan.
    - State pengeditan direset (editingRecipeId, editingIngredientId, editingOverheadId menjadi null).
    - Wizard kembali ke langkah 1.
    - Tidak ada data yang disimpan ke localStorage (seperti resep yang sedang diedit).
- [ ] Fungsi lain dari wizard HPP tetap berfungsi normal (navigasi, menambah bahan, menambah overhead, menyimpan resep, dsb.).
- [ ] Tidak ada console error terkait tombol baru atau fungsi resetForm.
- [ ] Tombol "Buat Baru" berfungsi baik ketika wizard berada dalam mode pengeditan resep (yaitu ketika pengguna telah mengklik "Edit" pada resep dari daftar) maupun ketika tidak dalam mode pengeditan (pada awal membuka wizard).

## Risiko dan Mitigasi

- **Risiko:** Penambahan tombol baru mungkin mempengaruhi tata letak jika tidak terkoreksi dengan baik.
  **Mitigasi:** Kita menambahkan tombol dengan lebar penuh (w-full) dan margin atas (mt-2) sehingga ia akan muncul di bawah tombol existing tanpa mengubah tata letak tombol-tombol existing.
- **Risiko:** Tombol "Buat Baru" mungkin tersalah klik karena letaknya yang dekat dengan tombol navigasi.
  **Mitigasi:** Kita menggunakan warna yang berbeda dari tombol navigasi utama (Lanjut) dan lebih mirip dengan tombol sekunder (Kembali) untuk menekankan bahwa ia adalah tindakan sekunder.
- **Risiko:** Fungsi `resetForm` mungkin memicu efek samping yang tidak diinginkan jika dipanggil dalam keadaan tertentu.
  **Mitigasi:** Fungsi `resetForm` sudah digunakan ailleurs (misalnya, ketika pengguna mengklik tombol "Reset Profil" di dashboard? Seperti yang kita lihat dalam kode, tidak ada pemanggilan lain di dalam modul HPP kecuali yang kita tambahkan. Namun, kita telah memastikan bahwa fungsi ini aman dipanggil kapan saja karena ia hanya mereset state ke kondisi awal.

## Catatan

Pastikan bahwa ID tombol tersebut unik dan tidak bentrok dengan elemen lain dalam halaman.

(End of file)