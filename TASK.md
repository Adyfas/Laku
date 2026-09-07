# TASK: Guided Flow + Reorganisasi File + Simplifikasi Bahasa

## 📁 Reorganisasi File
- [x] Buat `core/appUtils.js` — extract utilities dari app.js
- [x] Pindah + pecah HPP ke folder `apps/hpp/` (5 file: hppApp, hppClient, hppIngredients, hppCalc, hppRecipes)
- [x] Pindah kas ke folder `apps/kas/` (kasApp, kasClient)
- [x] Pindah utang ke folder `apps/utang/` (utangApp, utangClient)
- [x] Pindah inventory ke folder `apps/inventory/` (inventoryApp, inventoryClient)
- [x] Pindah laba ke folder `apps/laba/` (labaApp, labaClient)
- [x] Pindah promo ke folder `apps/promo/` (promoApp, promoClient)
- [x] Hapus `formatRupiah` duplikat dari semua modul → pakai `window.formatRupiah()`
- [x] Update script tags di `app.html`
- [x] Hapus 12 file lama di `apps/` root
- [x] Hapus `mobile-nav.js` dead code

## 🧭 Guided Flow
- [x] Hapus mode Hitung Cepat dari HPP (toggle, manual inputs, switchMode)
- [x] Buat onboarding screen saat inventory kosong
- [x] Sembunyikan wizard saat onboarding aktif

## 🗣️ Simplifikasi Bahasa UMKM
- [x] Update teks dashboard cards di `app.html` (6 kartu)
- [x] Update badge kategori (Hitung Uang, Catat Uang, Cek Bisnis, dll.)
- [x] Update modal titles di `app.js`
- [x] Update header teks di semua modul app (badge, h2, deskripsi)

## ✅ Verifikasi
- [x] Tidak ada `const formatRupiah` lokal — semua pakai `window.formatRupiah()`
- [x] Tidak ada dead reference (switchMode, mobile-nav, dll.)
- [x] Semua utility function ada di `core/appUtils.js`
- [x] Script tags mengarah ke file baru
- [ ] Test flow: HPP tanpa inventory → onboarding → inventory → kembali → wizard normal
- [ ] Test semua modul masih berfungsi setelah pindah folder
