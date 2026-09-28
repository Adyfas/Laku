// Content Variabel
let aboutSectionRaw = [
  {
    title: "Pisahkan Uang",
    sub: "Buat batas yang jelas antara uang pribadi dan uang dagang agar modal usaha tetap terjaga.",
    icon: "landingOpenBook",
  },
  {
    title: "Catatan Harian",
    sub: "Catat pemasukan dan pengeluaran usaha dengan cepat, kapan pun transaksi terjadi.",
    icon: "pencil",
  },
  {
    title: "Ringkasan Usaha",
    sub: "Lihat kondisi keuangan usaha dalam tampilan sederhana yang mudah dipahami.",
    icon: "landingBrain",
  },
  {
    title: "Cek Keuntungan",
    sub: "Pahami apakah usaha Anda benar-benar menghasilkan keuntungan, bukan hanya ramai penjualan.",
    icon: "landingCalc",
  },
  {
    title: "Belajar Finansial",
    sub: "Dapatkan pembelajaran keuangan dasar yang relevan dengan kebutuhan usaha sehari-hari.",
    icon: "landingNotes",
  },
  {
    title: "Wawasan Usaha",
    sub: "Temukan kebiasaan dan langkah kecil yang membantu usaha Anda tumbuh lebih sehat.",
    icon: "landingGlobe",
  },
];

let UMKMCardSection = [
  {
    title: "Catatan masih di kepala.",
    desc: "Pencatatan tidak tertulis membuat arus kas sulit dipantau dan rentan lupa.",
    icon: "landingOpenBook",
  },
  {
    title: "Stok habis saat pelanggan mencari.",
    desc: "Persediaan barang tidak terpantau sehingga terlambat stok ulang dan kehilangan pembeli.",
    icon: "box",
  },
  {
    title: "Harga jual dibuat kira-kira",
    desc: "Penetapan harga tanpa hitungan modal yang tepat berisiko memicu kerugian.",
    icon: "walletv2",
  },
];

let LakuCards = [
  {
    details: "Pisahkan uang usaha dan uang pribadi",
    icon: "walletv2"
  },
  {
    details: "Catat pemasukan serta pengeluaran harian",
    icon: "book"
  },
  {
    details: "Pantau ringkasan kondisi usaha",
    icon: "chart"
  },
  {
    details: "Pelajari dasar keuangan dengan bahasa sederhana",
    icon: "calculator"
  },
]

// Variabel Document
const aboutSection = document.getElementById("aboutSection");
const UMKMAboutSection = document.getElementById("UMKMAboutSection");
const LakuCardSection = document.getElementById('LakuCard');

// Render
const aboutSectionMapping = aboutSectionRaw
  .map(
    (about, index) => `

  <div class="group bg-white rounded-3xl border border-gray-200 p-8 transition duration-300 hover:shadow-xl cursor-pointe w-full fade-in" data-once="true" data-delay="0.2" data-duration="${1*index+1}">

    <div class="flex justify-between items-start">
 
        <div
        class= w-16 h-16 rounded-2xl bg-lime-100 flex items-center justify-center
        ">

            ${window.LakuIcons.svg(about.icon, "2rem")}

        </div>

        <div
        class="w-10 h-10 rounded-full flex items-center justify-center transition
        ">
        ${window.LakuIcons.svg("arrowBold", "2em", "transform rotate-45")}
        </div>
    </div>

    <h3 class="text-2xl font-bold mt-8">
    ${about.title}
    </h3>

    <p
    class="text-gray-500 mt-4 leading-7">
    ${about.sub}
    </p>

</div>

`,
  )
  .join("");

aboutSection.innerHTML = aboutSectionMapping;

const UMKMaboutSectionMapping = UMKMCardSection.map(
  (item, index) => `

  <div class="rounded-3xl p-4 bg-stone-50 shadow-sm border border-stone-100 h-65 w-full fade-in" data-once="true" data-delay="0.2" data-duration="${1*index+1}">
  <div class="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center mb-4">
    ${window.LakuIcons.svg(item.icon, "1.5rem")}
  </div>

  <h2 class="text-xl font-semibold text-gray-900 mb-2">${item.title}</h2>
  <p class="text-gray-600 leading-relaxed">${item.desc}</p>
</div>
    `,
).join("");

UMKMAboutSection.innerHTML = UMKMaboutSectionMapping;



const UMKMCardLakuMapping = LakuCards.map((laku, index) => `
                <li class="flex items-center gap-2 my-3 fade-in" data-once="true" data-delay="0.2" data-duration="${1*index+1}">
                  <div class="text-base sm:text-lg text-green-main leading-relaxed p-2 rounded-full text-center bg-lime-main">
                      ${window.LakuIcons.svg(laku.icon, "1.5rem")}
                  </div>
                  <p class="text-base sm:text-lg text-gray-600 leading-relaxed">${laku.details}</p>
                </li>
  `).join("")


LakuCardSection.innerHTML = UMKMCardLakuMapping;