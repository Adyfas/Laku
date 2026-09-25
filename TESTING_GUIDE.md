# 🧪 Panduan & Skenario Pengujian Fitur (QA Test Suite Document) — Aplikasi LAKU

Dokumen ini berisi panduan skenario pengujian komprehensif (*Test Cases*) untuk menguji seluruh fitur yang ada pada aplikasi **LAKU (Solusi Praktis Kelola Usaha UMKM)**.

---

## 🛠️ Persiapan Pengujian (Setup Dummy Data)

Sebelum memulai pengujian, disarankan untuk mengisi data awal (*Dummy Data*) ke browser agar semua indikator ringkasan di Dashboard langsung terisi.

### Langkah Pengisian Dummy Data:
1. Buka peramban *(browser)* dan masuk ke `http://localhost:3000/app` (atau buka file `FE/app.html`).
2. Buka **Developer Tools** (`F12` atau klik kanan -> *Inspect* -> tab **Console**).
3. Jalankan skrip generator data dummy berikut:

```javascript
(function generateLakuDummyData() {
  const todayStr = new Date().toISOString().split("T")[0];
  const profile = { nama: "Bu Wati", usaha: "Dapur Sambal & Warung Makan Bu Wati", status: true };
  const inventory = [
    { id: 101, nama: "Beras Pandan Wangi 5kg", kategori: "Bahan Baku Utama", satuan: "kg", displayUnit: "kg", baseUnit: "kg", schemaVersion: 2, harga: 13000, stok: 15, minStok: 5, looseQty: 0 },
    { id: 102, nama: "Minyak Goreng Bimoli 2L", kategori: "Bahan Baku Utama", satuan: "liter", displayUnit: "liter", baseUnit: "liter", schemaVersion: 2, harga: 17000, stok: 8, minStok: 3, looseQty: 0 },
    { id: 103, nama: "Telur Ayam Negeri", kategori: "Bahan Baku Utama", satuan: "butir", displayUnit: "butir", baseUnit: "butir", schemaVersion: 2, harga: 2000, stok: 4, minStok: 10, looseQty: 0 },
    { id: 104, nama: "Daging Ayam Fillet", kategori: "Bahan Baku Utama", satuan: "kg", displayUnit: "kg", baseUnit: "kg", schemaVersion: 2, harga: 38000, stok: 0, minStok: 2, looseQty: 0 },
    { id: 105, nama: "Paper Box M (Kemasan Nasi)", kategori: "Kemasan / Packaging", satuan: "pcs", displayUnit: "pcs", baseUnit: "pcs", schemaVersion: 2, harga: 650, stok: 120, minStok: 20, looseQty: 0 }
  ];
  const kas = [
    { id: 201, type: "pemasukan", amount: 450000, category: "Penjualan Harian", date: todayStr, note: "Penjualan 30 Porsi Nasi Goreng Ayam" },
    { id: 202, type: "pengeluaran", amount: 120000, category: "Belanja Bahan Baku", date: todayStr, note: "Beli Beras & Minyak Goreng" },
    { id: 203, type: "pemasukan", amount: 850000, category: "Catering / Pesanan", date: todayStr, note: "DP Katering Nasi Box Arisan Bu RT" },
    { id: 204, type: "pengeluaran", amount: 75000, category: "Operasional Usaha", date: todayStr, note: "Beli Gas Elpiji 3kg (2 Tabung)" }
  ];
  const utang = [
    { id: 301, nama: "Pak Budi (Warung Kopi)", phone: "081234567890", type: "piutang", totalAmount: 250000, paidAmount: 100000, dueDate: todayStr, note: "Kasbon Nasi Box Paket Jumat Berkah" },
    { id: 302, nama: "Bu Siska (Kantor Kelurahan)", phone: "089876543210", type: "piutang", totalAmount: 400000, paidAmount: 0, dueDate: todayStr, note: "Tagihan Katering Rapat Mingguan" },
    { id: 303, nama: "Toko Sembako Jaya (Supplier)", phone: "085678901234", type: "utang", totalAmount: 300000, paidAmount: 150000, dueDate: todayStr, note: "Bon Belanja Bahan Baku Sembako" }
  ];
  localStorage.setItem("status", JSON.stringify(profile));
  localStorage.setItem("laku_inventory_data", JSON.stringify(inventory));
  localStorage.setItem("laku_cashbook_data", JSON.stringify(kas));
  localStorage.setItem("laku_utang_data", JSON.stringify(utang));
  location.reload();
})();
```

---

## 📋 Matriks Skenario Pengujian Fitur

### 1. Modul Profil Usaha & Registrasi
| ID | Fitur / Komponen | Langkah Pengujian | Hasil yang Diharapkan | Status |
|---|---|---|---|---|
| TC-01 | Buat Profil Baru | 1. Hapus profile dengan klik "Reset Profil".<br>2. Isi Nama: `Budi`, Usaha: `Warung Kopi`.<br>3. Klik "Buat Profile". | Sistem menyimpan ke localStorage `status` dan membuka Dashboard. | [ ] |
| TC-02 | Validasi Input Kosong | Kosongkan kolom nama/usaha lalu klik "Buat Profile". | Tampil pesan peringatan "Tolong isi input secara lengkap!". | [ ] |
| TC-03 | Reset Profil | Klik tombol "Reset Profil" di pojok kanan atas Dashboard. | Tampil modal konfirmasi. Jika disetujui, profile terhapus dan kembali ke form pendaftaran. | [ ] |

---

### 2. Dashboard Workspace UMKM
| ID | Fitur / Komponen | Langkah Pengujian | Hasil yang Diharapkan | Status |
|---|---|---|---|---|
| TC-04 | Saldo Kas Aktif | Amati kartu "Rangkuman Kas". | Menampilkan sisa bersih kas (Total Masuk - Total Keluar) dalam format Rupiah (contoh: `Rp 1.105.000`). | [ ] |
| TC-05 | Tagihan Piutang | Amati kartu "Tagihan Piutang". | Menampilkan total sisa sisa piutang pelanggan yang belum lunas (contoh: `Rp 550.000`). | [ ] |
| TC-06 | Stok Inventaris | Amati kartu "Stok Barang". | Menampilkan jumlah item & indikator peringatan stok tipis (contoh: `5 Item (1 Tipis)`). | [ ] |
| TC-07 | Quick Launch Modul | Klik salah satu kartu alat kerja (HPP, Kas, Inventaris, dsb). | Modal aplikasi yang bersangkutan terbuka dengan animasi mulus dari bawah. | [ ] |

---

### 3. Modul HPP & Harga Jual (`hpp`)
| ID | Fitur / Komponen | Langkah Pengujian | Hasil yang Diharapkan | Status |
|---|---|---|---|---|
| TC-08 | Alur 4 Langkah HPP | Buka aplikasi HPP, isi Nama Produk, pilih Bahan Baku dari Stok, isi Biaya Operasional, dan tentukan Margin. | Sistem menghitung Modal per Unit/Porsi & Rekomendasi Harga Jual secara akurat. | [ ] |
| TC-09 | Simpan Resep HPP | Klik "Simpan Resep". | Resep masuk ke daftar resep tersimpan dan dapat dimuat ulang kapan saja. | [ ] |

---

### 4. Buku Kas Harian (`kas`)
| ID | Fitur / Komponen | Langkah Pengujian | Hasil yang Diharapkan | Status |
|---|---|---|---|---|
| TC-10 | Tambah Pemasukan | Pilih jenis "Pemasukan", isi nominal `100.000`, beri keterangan "Jual Nasi", klik Simpan. | Transaksi bertambah dengan lencana hijau `Pemasukan` dan saldo kas bertambah `Rp 100.000`. | [ ] |
| TC-11 | Tambah Pengeluaran | Pilih jenis "Pengeluaran", isi nominal `50.000`, beri keterangan "Beli Es Batu", klik Simpan. | Transaksi bertambah dengan lencana merah `Pengeluaran` dan saldo kas berkurang `Rp 50.000`. | [ ] |
| TC-12 | Hapus Catatan Kas | Klik tombol "Hapus" pada salah satu baris transaksi. | Data terhapus dari tabel & sisa saldo kas ter-update secara otomatis. | [ ] |

---

### 5. Stok Barang & Bahan (`inventory`)
| ID | Fitur / Komponen | Langkah Pengujian | Hasil yang Diharapkan | Status |
|---|---|---|---|---|
| TC-13 | Tambah Barang Baru | Isi Nama `Gula Pasir`, Satuan `kg`, Harga `15.000`, Stok `10`, Min Stok `2`. | Barang tersimpan ke tabel dengan lencana status `Aman` (Hijau). | [ ] |
| TC-14 | Indikator Stok Tipis | Tambah barang dengan Stok `3` dan Min Stok `5`. | Lencana status berubah menjadi `Stok Tipis` (Kuning/Amber) dan jumlah stok tipis di overview bertambah. | [ ] |
| TC-15 | Indikator Stok Habis | Tambah barang dengan Stok `0`. | Lencana status berubah menjadi `Habis` (Merah/Rose). | [ ] |
| TC-16 | Edit Inline Item | Klik tombol "Edit" di baris barang, ubah harga/stok, lalu klik "Simpan". | Data barang ter-update tanpa perlu berpindah halaman. | [ ] |

---

### 6. Catatan Utang & Piutang (`utang`)
| ID | Fitur / Komponen | Langkah Pengujian | Hasil yang Diharapkan | Status |
|---|---|---|---|---|
| TC-17 | Tambah Catatan Piutang | Pilih Jenis `Piutang (Tagihan Saya)`, isi Nama, Nominal `100.000`, No. WA `0812...`, klik Simpan. | Catatan tersimpan dengan status sisa tagihan `Rp 100.000`. | [ ] |
| TC-18 | Cicilan / Pembayaran | Klik "Bayar / Cicil" pada baris utang, masukkan nominal `50.000`. | Sisa utang berkurang menjadi `Rp 50.000`. Jika lunas, lencana berubah jadi `Lunas`. | [ ] |
| TC-19 | Pengingat WhatsApp | Klik tombol "Kirim WA" di baris piutang. | Mengarahkan ke WhatsApp Web/App (`wa.me`) dengan pesan otomatis ramah yang berisi rincian tagihan. | [ ] |

---

### 7. Simulasi Laba Rugi (`laba`)
| ID | Fitur / Komponen | Langkah Pengujian | Hasil yang Diharapkan | Status |
|---|---|---|---|---|
| TC-20 | Hitung BEP & Keuntungan | Isi Target Penjualan (misal `500 porsi`), Harga Jual (`15.000`), Biaya Bahan (`8.000`), Beban Tetap (`1.500.000`). | Sistem menghitung Omzet, Total Beban, Estimasi Laba Bersih, dan Titik Balik Modal (BEP Porsi & Rupiah). | [ ] |

---

### 8. AI Copywriter Promo WA (`promo`)
| ID | Fitur / Komponen | Langkah Pengujian | Hasil yang Diharapkan | Status |
|---|---|---|---|---|
| TC-21 | Generate Teks Promo | Isi Nama Produk `Ayam Geprek Spesial`, Pilih Gaya Bahasa `Heboh Diskon`, klik "Buat Caption". | Menghasilkan teks promosi menarik dengan format emoticon & hashtag yang siap disalin ke WA/Sosmed. | [ ] |

---

### 9. Guided Tour Interaktif (`LakuTour`)
| ID | Fitur / Komponen | Langkah Pengujian | Hasil yang Diharapkan | Status |
|---|---|---|---|---|
| TC-22 | Panduan Dashboard | Klik tombol "Bantuan" di Dashboard. | Tur interaktif muncul, menargetkan elemen dengan sorotan (spotlight) SVG presisi. | [ ] |
| TC-23 | Navigasi Keyboard Tour | Tekan `Enter` atau `Panah Kanan` saat tur aktif. | Tur berpindah ke langkah berikutnya. Tekan `Esc` untuk menutup tur kapan saja. | [ ] |
| TC-24 | Pelacakan Responsif 60fps | Ubah ukuran layar peramban atau *scroll* saat tur aktif. | Sorotan lampu (spotlight) dan *popover* bergerak menyesuaikan posisi elemen secara real-time tanpa delay. | [ ] |

---
*Dokumen ini dibuat secara otomatis untuk membantu pengujian sistem LAKU.*

