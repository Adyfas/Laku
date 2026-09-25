---
name: HPP Missing escapeHtml Fix
description: Menambahkan fungsi escapeHtml ke window.LakuHpp untuk mencegah TypeError saat merender dropdown bahan.
type: plan
status: ready
---

# Plan: Tambahkan escapeHtml ke window.LakuHpp

## Tujuan
Memperbaiki bug `Uncaught TypeError: window.LakuHpp.escapeHtml is not a function` yang terjadi ketika memuat modul HPP (Harga Pokok Produksi) karena fungsi escapeHtml tidak ditambahkan ke namespace window.LakuHpp, padahal dipanggil dari beberapa tempat seperti hppIngredients.js, hppRecipes.js, dan hppCalc.js.

## Lokasi Perubahan
File: `/Volumes/Adyfas/Project/INOVATION COMPETION/FE/javascript/apps/hpp/hppClient.js`

## Detail Perubahan
Tambahkan fungsi escapeHtml sederhana ke window.LakuHpp setelah inisialisasi namespace dan penambahan fungsi lain (captureDraft, saveSession, clearSession, resetForm).

Fungsi escapeHtml harus:
- Menerima nilai (string, number, null, undefined)
- Mengonversi ke string (null/undefined menjadi string kosong)
- Mengescape karakter HTML: `&` → `&`, `<` → `<`, `>` → `>`, `"` → `"`
- (Opsional) Mengescape `'` → `&#039;` jika diperlukan untuk konteks atribut, tetapi dalam penggunaan saat ini hanya diperlukan untuk teks dalam elemen, sehingga tidak wajib.

Contoh implementasi (sama seperti yang ada di learnDOM.js):
```javascript
window.LakuHpp.escapeHtml = function (value) {
  return String(value === null || value === undefined ? "" : value)
    .replace(/&/g, "&")
    .replace(/</g, "<")
    .replace(/>/g, ">")
    .replace(/"/g, """);
};
```

## Langkah-langkah Pengerjaan
1. Buka file `hppClient.js`.
2. Temukan baris donde window.LakuHpp fungsi-fungsi seperti captureDraft, saveSession, clearSession, dan resetForm ditambahkan (sekitar baris 78-90).
3. Tambahkan deklarasi `window.LakuHpp.escapeHtml = function (value) { ... };` setelahThose assignments.
4. Simpan file.
5. Pastikan tidak ada kesalahan sintaksis.

## Validasi
- Buka aplikasi Laku (misalnya melalui app.html atau buka modal HPP).
- Verifikasi bahwa tidak ada lagi pesan error `window.LakuHpp.escapeHtml is not a function` di konsol.
- Pastikan dropdown bahan di langkah 2 HPP menampilkan nama bahan dengan benar (terutama jika nama mengandung karakter seperti &, <, >, ").
- Periksa juga tampilan resep di hppRecipes.js dan biaya overhead di hppCalc.js yang juga menggunakan escapeHtml.
- Pastikan fungsi lain dari window.LakuHpp tetap bekerja (simpan, reset, dsb).
- Tidak ada console error lain yang terkait.

## Risiko dan Mitigasi
- Risiko: Penambahan fungsi yang tidak terduga jika ternyata escapeHtml sudah didefinisikan di tempat lain dengan perilaku berbeda.
  Mitigasi: Sebelum menambahkan, kita bisa cek apakah window.LakuHpp.escapeHtml sudah ada; jika ada dan merupakan fungsi, kita bisa skip atau menimpa jika kita yakin ini adalah implementasi yang benar.
- Risiko: Karena escapeHtml sangat sederhana, kemungkinan konflik kecil.
- Pastikan tidak mengubah fungsi-fungsi lain yang bergantung pada window.LakuHpp.

## Catatan
Fungsi ini bergantung hanya pada String dan replace, tidak memiliki dependensi lain, sehingga aman untuk ditambahkan di mana saja dalam namespace window.LakuHpp.

(End of file)