---
name: App Page Top Navigation Migration
description: Revisi navigasi app: highlight route halaman publik, navbar tersembunyi saat registrasi, dan menu app desktop tanpa clipping
type: plan
status: ready
---

# Plan: Migrasi Navigasi App ke Navbar Atas

## Keputusan Desain

- Hapus `#bottomFloatingNav` dari `app.html` dan seluruh logic rendering/visibility-nya.
- Di `app.html`, navbar atas menggunakan pola yang sama seperti halaman publik: logo LAKU, hamburger, daftar menu, dan kartu kanan `Mulai Belajar` tetap ditampilkan.
- Saat berada di `app.html`, daftar menu navbar adalah tepat 7 item:
  1. Beranda
  2. Kalkulator HPP
  3. Produksi
  4. Buku Kas Digital
  5. Buku Utang & Piutang
  6. Stok Inventaris
  7. Simulasi Laba Rugi
- Promo tidak masuk navbar karena sebelumnya memang disembunyikan dari dashboard dan navigasi app.
- Kartu publik `Aplikasi` tidak boleh ikut dirender di app page; kartu kanan tetap `Mulai Belajar`.
- Klik modul app tetap memanggil `window.openAppModal(appKey)` seperti sekarang.
- `Beranda` adalah link wajib ke `./index.html` (atau root `/` jika diputuskan sebagai canonical route) dan menutup menu.
- App page tidak menampilkan highlight/state modul aktif; semua item app memakai style navigasi biasa.
- Highlight posisi halaman tetap aktif di semua halaman publik/non-app, dengan visual dan class yang sama seperti implementasi navbar publik sebelumnya: link aktif `text-black-main/50` dan ikon `rotate-45`; halaman app dikecualikan.
- Navbar hanya terlihat setelah profil usaha tersedia. Saat `app.html` masih berada di halaman registrasi tanpa data `status`, navbar harus tersembunyi; setelah registrasi berhasil navbar muncul bersama dashboard.
- Navbar hanya terlihat saat modal app tertutup. Saat modul dibuka, navbar langsung tersembunyi; setelah modal ditutup, navbar kembali tampil hanya jika profil sudah tersedia.
- Perilaku scroll-hide navbar di dashboard tetap dipertahankan saat modal tertutup.

## Temuan Implementasi Saat Ini

- `javascript/core/app.js` sudah menghapus konfigurasi/render bottom nav dan `updateActiveNavState()`, tetapi belum mengatur visibility navbar berdasarkan status profil.
- `app.html` sudah tidak memiliki elemen `#bottomFloatingNav`; form registrasi, dashboard, modal app, dan kartu `Mulai Belajar` tetap ada.
- `javascript/core/navbar.js` sudah memisahkan menu publik/app dan menggunakan event delegation, tetapi:
  - path publik dibandingkan langsung dengan `window.location.pathname`, sehingga route `.html` tidak mendapat highlight;
  - kartu publik `Aplikasi` masih dirender juga di app page;
  - app page belum mendapat perlakuan sizing khusus.
- `javascript/core/guidedTour.js` sudah diarahkan ke `#nav-menu-btn`, sehingga tidak lagi bergantung pada bottom nav.
- `css/global.css` sudah menambahkan `overflow-y:auto` pada `#nav-content` dan menaikkan tinggi mobile menjadi 560px, tetapi tinggi desktop terbuka masih 350px dan belum cukup untuk 7 item + kartu.
- Revisi yang masih diperlukan:
  - `navbar.js` harus memulihkan highlight route publik dengan visual yang sama seperti kode sebelumnya dan mengecualikan app page.
  - `app.js` harus menyembunyikan navbar saat registrasi belum selesai, lalu menampilkannya setelah profil tersedia.
  - `css/global.css` harus memberi ruang cukup pada menu app desktop dan fallback scroll yang aman pada viewport pendek.

## Task Implementasi

1. Perbarui `javascript/core/navbar.js`.
   - Tambahkan deteksi halaman app berdasarkan `window.location.pathname`/hostname yang sesuai, misalnya path berakhir `app.html` atau `/app`.
   - Buat konfigurasi menu publik dan menu app secara terpisah.
   - Untuk app page, render tepat `Beranda` sebagai anchor dan keenam modul sebagai button/link dengan `data-app-key`; jangan render kartu publik `Aplikasi` di app page.
   - Gunakan event delegation pada `#items-nav` untuk:
     - menutup menu setelah klik link/button;
     - memanggil `window.openAppModal(key)` untuk modul app.
   - Jangan gunakan path-based active styling untuk menu app; semua item memakai style navigasi biasa.
   - Untuk halaman publik, pertahankan menu Beranda/Tentang/Belajar/Kontak dan kartu `Aplikasi` seperti sekarang.
   - Pertahankan visual highlight publik persis seperti kode sebelumnya: item aktif mendapat `text-black-main/50`, ikon aktif mendapat `rotate-45`, dan item tidak aktif tetap mendapat `hover:text-black-main/50`/`hover:rotate-45`.
   - Normalisasi pencocokan route agar highlight bekerja pada root `/`, pathname extensionless (`/about`, `/learn`, `/kontak`), dan pathname `.html` (`/about.html`, `/learn.html`, `/kontak.html`); app page tetap dikecualikan.
   - Pastikan kartu `Mulai Belajar` di `#nav-card` tetap tersedia di app page.
2. Perbarui `javascript/core/app.js`.
   - Hapus konfigurasi `floatingNavabarItems`, render bottom nav, dan helper `updateActiveNavState()`.
   - Hapus semua pemanggilan highlight active tab.
   - Hapus semua manipulasi class pada `bottomFloatingNav`.
   - Tambahkan referensi `navbar` dan helper terkoordinasi untuk menyembunyikan/menampilkan navbar.
   - Pada `updateDashboardState()`, sembunyikan navbar saat `status` tidak ada dan tampilkan navbar setelah profil tersedia; jangan hanya mengatur form/dashboard.
   - Pada `window.openAppModal()`, tutup menu navbar dan sembunyikan navbar sebelum/bersamaan modal dibuka.
   - Pada `window.closeAppModal()`, kembalikan navbar setelah animasi modal selesai hanya jika profil sudah tersedia; pastikan menu tetap tertutup dan body scroll pulih.
   - Koordinasikan state visibility agar hide/show dari scroll, registrasi, dan modal tidak saling menimpa; jangan menggunakan `navbar.style.display = ""` secara buta pada close modal.
   - Pastikan deep link `?open=...` tetap membuka modal dan menyembunyikan navbar.
3. Perbarui/verifikasi `app.html`.
   - Pastikan elemen `<nav id="bottomFloatingNav">` tidak ada.
   - Jangan mengubah form profil, dashboard, modal app, atau kartu `Mulai Belajar` di luar kebutuhan navigasi.
4. Perbarui `css/global.css`.
   - Pastikan navbar app yang terbuka dapat menampung 7 item + kartu tanpa clipping.
   - Untuk desktop, gunakan tinggi terbuka yang cukup (sekitar 520–560px) dengan `max-height` berdasarkan viewport dan `overflow-y:auto` pada `#nav-content` sebagai fallback; pertahankan margin/padding agar tidak ada item terpotong.
   - Untuk mobile, gunakan tinggi responsif dan fallback scroll yang sama.
   - Terapkan sizing app-only melalui selector app page agar ukuran dan highlight halaman publik tidak berubah.
   - Pastikan z-index modal app berada di atas navbar selama transisi, meskipun navbar sudah disembunyikan.
5. Perbarui `javascript/core/guidedTour.js`.
   - Ganti step dashboard yang menunjuk `#bottomFloatingNav` menjadi selector navbar/hamburger yang tetap ada, atau hapus step tersebut jika tidak relevan.
   - Perbarui judul/deskripsi menjadi bahasa yang menjelaskan menu navbar sebagai tempat berpindah aplikasi.
6. Validasi konsistensi route dan state.
   - Pastikan tidak ada referensi tersisa ke `bottomFloatingNav`, `navHomeBtn`, `navHppBtn`, `navProduksiBtn`, `navKasBtn`, `navUtangBtn`, `navInventoryBtn`, atau `navLabaBtn`.
   - Pastikan tidak ada logic yang mengandalkan highlight modul aktif.


## Acceptance Criteria

- Pada `app.html`, tidak ada bottom navigation.
- Navbar atas tampil saat dashboard app terbuka dan menampilkan tepat Beranda + 6 modul; kartu publik `Aplikasi` tidak muncul di app page.
- Kartu `Mulai Belajar` tetap terlihat di sisi navbar.
- Hamburger membuka dan menutup menu dengan benar di desktop dan mobile.
- Klik Beranda menutup menu dan membawa user ke `index.html`/root.
- Klik salah satu modul membuka modal app seperti sebelumnya.
- Saat modal app terbuka, navbar tidak terlihat dan tidak dapat diklik.
- Menutup modal melalui tombol X atau ESC mengembalikan dashboard dan navbar hanya setelah profil tersedia.
- Tidak ada highlight visual modul aktif di navbar app.
- Pada semua halaman publik/non-app, item menu yang sesuai route mendapat highlight dengan class dan ikon yang sama seperti kode publik sebelumnya; route `/`, `/about.html`, `/learn.html`, `/kontak.html`, dan bentuk extensionless-nya terdeteksi dengan benar.
- Saat `app.html` berada di halaman registrasi tanpa `status`, navbar tidak muncul; setelah registrasi berhasil navbar muncul.
- Menu app desktop menampilkan seluruh 7 item dan kartu dengan margin; tidak ada konten terpotong. Jika viewport terlalu pendek, `#nav-content` dapat discroll tanpa mengubah ukuran item.
- Menu app tidak terpotong pada viewport mobile; user dapat mengakses seluruh item.
- Navigasi halaman publik (Beranda/Tentang/Belajar/Kontak/Aplikasi) tidak berubah.
- Deep link `app.html?open=inventory` dan modul lain tetap berfungsi.
- Guided tour dashboard tidak gagal karena selector bottom nav yang sudah dihapus.
- Tidak ada console error terkait navbar, modal, atau tour.

## Validasi

- Uji manual di `app.html` pada viewport desktop dan mobile:
  - tanpa `status`, pastikan navbar tidak muncul;
  - isi profil dan pastikan navbar muncul bersama dashboard;
  - buka/tutup hamburger;
  - klik Beranda;
  - buka dan tutup setiap modul;
  - tutup modal dengan X dan ESC;
  - uji deep link `?open=...`;
  - pastikan seluruh 7 item dan kartu terlihat tanpa clipping, serta fallback scroll hanya muncul jika viewport terlalu pendek.
- Uji halaman publik `index.html`, `about.html`, `learn.html`, `kontak.html`, dan `404.html` untuk memastikan navbar publik tidak berubah dan highlight route aktif tetap sama.
- Jalankan syntax check:
  - `node --check javascript/core/navbar.js`
  - `node --check javascript/core/app.js`
  - `node --check javascript/core/guidedTour.js`
- Pastikan tidak ada perubahan pada file lain di working tree yang tidak terkait revisi navbar.
- Tidak ada lint/typecheck karena project tidak memiliki package.json atau test runner.
