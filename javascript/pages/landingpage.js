// Content Variabel
let aboutSectionRaw = [
  {
    title: "Wawasan",
    sub: "Ringkasan masalah dan informasi penting seputar pengelolaan usaha.",
    icon: "landingOpenBook",
  },
  {
    title: "Belajar",
    sub: "Materi ringkas tentang keuangan, branding, dan literasi digital.",
    icon: "pencil",
  },
  {
    title: "Kuis",
    sub: "Cek seberapa jauh kamu memahami materi yang sudah dibaca.",
    icon: "landingBrain",
  },
  {
    title: "Kalkulator",
    sub: "Hitung harga jual dari modal, biaya, dan target untung dengan mudah.",
    icon: "landingCalc",
  },
  {
    title: "Catatan",
    sub: "Catat pemasukan, pengeluaran, dan arus kas usaha secara sederhana.",
    icon: "landingNotes",
  },
  {
    title: "Cek Siap Digital",
    sub: "Ketahui seberapa siap UMKM kamu masuk ke dunia digital.",
    icon: "landingGlobe",
  },
];

let UMKMCardSection = [
  {
    icon: "warung",
    title: "Usaha Mikro",
    desc: "Bisnis kecil perorangan atau keluarga. Contohnya warung, PKL, dan usaha rumahan.",
  },
  {
    icon: "shoppingBag",
    title: "Usaha Kecil",
    desc: "Sudah memiliki tempat tetap dan karyawan. Contohnya kafe, butik, dan bengkel.",
  },
  {
    icon: "landingFactory",
    title: "Usaha Menengah",
    desc: "Operasional besar dengan jangkauan pasar luas. Contohnya pabrik, konveksi, dan distributor.",
  },
];

// Variabel Document
const aboutSection = document.getElementById("aboutSection");
const UMKMAboutSection = document.getElementById("UMKMAboutSection");

// Render
const aboutSectionMapping = aboutSectionRaw
  .map(
    (about) => `

  <div class="group bg-white rounded-3xl border border-gray-200 p-8 transition duration-300 hover:shadow-xl cursor-pointe w-full">

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
  (item) => `

  <div class="rounded-3xl p-6 bg-stone-50 shadow-sm border border-stone-100 h-55 w-full">
  <div class="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center mb-4">
    ${window.LakuIcons.svg(item.icon, "1.5rem")}
  </div>

  <h2 class="text-xl font-semibold text-gray-900 mb-2">${item.title}</h2>
  <p class="text-gray-600 leading-relaxed">${item.desc}</p>
</div>
    `,
).join("");

UMKMAboutSection.innerHTML = UMKMaboutSectionMapping;
