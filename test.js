(function generateLakuDummyData() {
  const todayStr = new Date().toISOString().split("T")[0];

  const profile = {
    nama: "Bu Wati",
    usaha: "Dapur Sambal & Warung Makan Bu Wati",
    status: true
  };


  const inventory = [
    {
      id: 101,
      nama: "Beras Pandan Wangi 5kg",
      kategori: "Bahan Baku Utama",
      satuan: "kg",
      displayUnit: "kg",
      baseUnit: "kg",
      schemaVersion: 2,
      harga: 13000,
      stok: 15,
      minStok: 5,
      looseQty: 0
    },
    {
      id: 102,
      nama: "Minyak Goreng Bimoli 2L",
      kategori: "Bahan Baku Utama",
      satuan: "liter",
      displayUnit: "liter",
      baseUnit: "liter",
      schemaVersion: 2,
      harga: 17000,
      stok: 8,
      minStok: 3,
      looseQty: 0
    },
    {
      id: 103,
      nama: "Telur Ayam Negeri",
      kategori: "Bahan Baku Utama",
      satuan: "butir",
      displayUnit: "butir",
      baseUnit: "butir",
      schemaVersion: 2,
      harga: 2000,
      stok: 4, 
      minStok: 10,
      looseQty: 0
    },
    {
      id: 104,
      nama: "Daging Ayam Fillet",
      kategori: "Bahan Baku Utama",
      satuan: "kg",
      displayUnit: "kg",
      baseUnit: "kg",
      schemaVersion: 2,
      harga: 38000,
      stok: 0, 
      minStok: 2,
      looseQty: 0
    },
    {
      id: 105,
      nama: "Paper Box M (Kemasan Nasi)",
      kategori: "Kemasan / Packaging",
      satuan: "pcs",
      displayUnit: "pcs",
      baseUnit: "pcs",
      schemaVersion: 2,
      harga: 650,
      stok: 120,
      minStok: 20,
      looseQty: 0
    }
  ];

  const kas = [
    {
      id: 201,
      type: "pemasukan",
      amount: 450000,
      category: "Penjualan Harian",
      date: todayStr,
      note: "Penjualan 30 Porsi Nasi Goreng Ayam"
    },
    {
      id: 202,
      type: "pengeluaran",
      amount: 120000,
      category: "Belanja Bahan Baku",
      date: todayStr,
      note: "Beli Beras & Minyak Goreng"
    },
    {
      id: 203,
      type: "pemasukan",
      amount: 850000,
      category: "Catering / Pesanan",
      date: todayStr,
      note: "DP Katering Nasi Box Arisan Bu RT"
    },
    {
      id: 204,
      type: "pengeluaran",
      amount: 75000,
      category: "Operasional Usaha",
      date: todayStr,
      note: "Beli Gas Elpiji 3kg (2 Tabung)"
    }
  ];

  const utang = [
    {
      id: 301,
      nama: "Pak Budi (Warung Kopi)",
      phone: "081234567890",
      type: "piutang",
      totalAmount: 250000,
      paidAmount: 100000,
      dueDate: todayStr,
      note: "Kasbon Nasi Box Paket Jumat Berkah"
    },
    {
      id: 302,
      nama: "Bu Siska (Kantor Kelurahan)",
      phone: "089876543210",
      type: "piutang",
      totalAmount: 400000,
      paidAmount: 0,
      dueDate: todayStr,
      note: "Tagihan Katering Rapat Mingguan"
    },
    {
      id: 303,
      nama: "Toko Sembako Jaya (Supplier)",
      phone: "085678901234",
      type: "utang", 
      totalAmount: 300000,
      paidAmount: 150000,
      dueDate: todayStr,
      note: "Bon Belanja Bahan Baku Sembako"
    }
  ];

  // localStorage.setItem("status", JSON.stringify(profile));
  localStorage.setItem("laku_inventory_data", JSON.stringify(inventory));
  localStorage.setItem("laku_cashbook_data", JSON.stringify(kas));
  localStorage.setItem("laku_utang_data", JSON.stringify(utang));

  console.log("✅ Data dummy UMKM berhasil dimasukkan!");
  location.reload();
})();