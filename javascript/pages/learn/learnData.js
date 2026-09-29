(function () {
    "use strict";
    var STORAGE_KEY = "laku_learn_state";
    var LEGACY_KEY = "laku_learn_progress";
    var INTRO_KEY = "laku_learn_intro_done";
    var RETURN_KEY = "laku_learn_return";
    var SESSION_KEY = "laku_learn_session";
    var XP_LEVEL_STEP = 120;
    var MAX_CHOICE_ATTEMPTS = 2;
    var SCENARIO_ORDER = ["s1", "s2", "s3", "s4", "s5", "s6"];
    var READINESS_ITEMS = [
        { id: "pisah-uang", text: "Sudah memisahkan uang pribadi dan uang usaha?", app: "Buku Kas" },
        { id: "modal-produk", text: "Sudah tahu modal sebenarnya per produk?", app: "Hitung Modal" },
        { id: "catat-stok", text: "Sudah punya catatan stok bahan?", app: "Inventaris" },
        { id: "catat-utang", text: "Sudah mencatat utang dan piutang?", app: "Utang Piutang" },
        { id: "promo-wa", text: "Sudah pernah membuat promo WhatsApp?", app: "Promo WA" },
        { id: "laba-rugi", text: "Sudah pernah menghitung laba rugi bulanan?", app: "Simulasi Laba" },
        { id: "daftar-pelanggan", text: "Sudah punya daftar pelanggan atau langganan?", app: "Utang Piutang" },
        { id: "nib", text: "Sudah tahu tentang NIB untuk usaha?", app: "Informasi usaha" }
    ];
var MOOD_LABELS = {
    neutral: "Tenang",
    worried: "Khawatir",
    thinking: "Berpikir",
    happy: "Senang",
    relieved: "Lega",
    proud: "Bangga",
    surprised: "Terkejut"
};

/* ── SVG Mouth path data per mood ──
 * Digunakan oleh learnDOM.js setMood() untuk mengganti 'd' attribute
 * pada #sitiMouthPath (overlay SVG) agar ekspresi wajah Bu Siti berubah.
 * Koordinat dalam sistem 1108×1585 (match BU-Siti.svg viewBox).
 */
var MOOD_MOUTH_PATHS = {
    neutral:   "M460 700 Q500 710 540 700",
    happy:     "M460 700 Q500 740 540 700",
    proud:     "M460 700 Q500 735 540 700",
    relieved:  "M460 700 Q500 725 540 700",
    worried:   "M460 710 Q500 695 540 710",
    thinking:  "M460 708 Q500 718 540 708",
    surprised: "M490 710 a8 6 0 1 0 18 0 a8 6 0 1 0 -18 0"
};
    var SCENARIOS = [
// SCENARIO S1
{
    id: "s1",
    title: "Bahan Baku Habis Mendadak",
    icon: "package",
    skill: "Manajemen stok",
    goal: "Belajar mencatat stok dan menentukan batas minimum.",
    appKey: "inventory",
    appLabel: "Inventaris",
    storageKey: "laku_inventory_data",
    badge: { icon: "calculator", name: "Ahli Stok" },
    warung: "Rak dan toples stok Bu Siti menjadi rapi.",
    steps: [
        {
            type: "dialogue",
            mood: "happy",
            lead: "Warung malam hari, lampu hangat, asap nasi goreng. Bu Siti sibuk melayani pelanggan.",
            lines: [
                { speaker: "Bu Siti", mood: "happy", text: "Halo! Aku Bu Siti. Ini warung nasi gorengku. Malam ini ramai seperti biasa. Aku sudah siapkan semua bahan dari siang!" },
                { speaker: "Bu Siti", mood: "happy", text: "Malam ini kayaknya lebih ramai dari biasa. Biasanya 40 porsi, tapi tadi siang aja sudah ada yang pesan 10 porsi buat kantor. Alhamdulillah, aku siap kok!" },
                { speaker: "Bu Siti", mood: "happy", text: "Aku hafal semua stokku lho! Minyak goreng masih banyak, kecap juga masih ada, bawang merah masih setengah kilo... Nggak perlu catat, aku yang jualan tiap hari pasti ingat!" },
                { speaker: "Bu Siti", mood: "neutral", text: "Wah, makin ramai aja nih. Pelanggan baru terus datang. Aku harus masak lebih cepat! Tinggal... eh, bentar, ini pesenan ke berapa ya? Ah yang penting masak dulu!" }
            ]
        },
        {
            type: "dialogue",
            mood: "worried",
            lead: "Warung penuh sesak, antre panjang, Bu Siti keringatan.",
            lines: [
                { speaker: "Bu Siti", mood: "worried", text: "Astaga, belum pernah seramai ini! Antri sampai luar warung! Pak RW bawa rombongan, tetangga juga pada datang. Aku masak tanpa henti!" },
                { speaker: "Narator", mood: "neutral", text: "Bu Siti meraih botol minyak goreng — KOSONG. Lalu buka toples tepung — NYARIS HABIS. Ia yakin kemarin masih ada, tapi tanpa catatan, tidak bisa memastikan sisa stok." },
                { speaker: "Bu Siti", mood: "worried", text: "Eh?! Minyak goreng... HABIS?! Tepung juga tinggal segini?! Kok bisa ya? Kemarin masih ada kok! Aku yakin kemarin masih setengah botol minyak... Tapi sekarang... KOSONG!" }
            ]
        },
        {
            type: "dialogue",
            mood: "worried",
            lead: "Warung penuh sesak, antre panjang, Bu Siti keringatan.",
            lines: [
                { speaker: "Bu Siti", mood: "worried", text: "Aku nggak nyangka bahan habis secepat ini. Aku cuma andal ingatan, nggak pernah catat berapa sisa stok." },
                { speaker: "Bu Siti", mood: "worried", text: "Sekarang pelanggan masih antre, tapi bahan sudah habis... Kalau kamu yang jadi aku, apa yang kamu lakukan?" }
            ]
        },
        {
            type: "choice",
            mood: "thinking",
            question: "Kalau kamu yang jadi Bu Siti, apa yang kamu lakukan?",
            options: [
                {
                    label: "Langsung belanja banyak tanpa catat",
                    correct: false,
                    consequence: "Bu Siti belanja sepuasnya — minyak 5 botol, tepung 3 kilo, kecap 4 botol, bawang 2 kilo. Uang kas berkurang besar, dan sebagian bahan mulai layu karena tidak terpakai.",
                    feedback: "Belanja banyak tanpa catat memang terasa aman, tapi uang tertahan di stok berlebih dan bahan bisa basi.",
                    xp: 0
                },
                {
                    label: "Tutup lebih awal, besok baru belanja",
                    correct: false,
                    consequence: "Bu Siti pasang tulisan 'WARUNG TUTUP'. Pelanggan kecewa dan pindah ke warung sebelah. Besoknya warung sepi — pelanggan sudah pindah.",
                    feedback: "Menutup warung karena stok habis itu rugi besar. Pelanggan kecewa dan bisa pindah permanen.",
                    xp: 0
                },
                {
                    label: "Cek sisa stok, beli secukupnya, catat batas minimum",
                    correct: true,
                    consequence: "Bu Siti cek satu-satu sisa bahan, beli secukupnya, dan catat batas minimum per bahan. Warung tetap ramai, stok terkontrol.",
                    feedback: "Tepat! Dengan catatan stok dan batas minimum, Bu Siti tahu kapan harus belanja tanpa menebak.",
                    xp: 10
                }
            ]
        },
        {
            type: "dialogue",
            mood: "worried",
            lead: "Apa yang terjadi setelah pilihanmu?",
            branchLines: {
                0: [
                    { speaker: "Bu Siti", mood: "happy", text: "Aku belanja banyak sekarang! Minyak 5 botol, tepung 3 kilo, kecap 4 botol, bawang 2 kilo... Biar aman, mending berlebihan daripada kekurangan! Pelanggan nggak boleh kecewa!" },
                    { speaker: "Bu Siti", mood: "worried", text: "Eh... uang kas kok tinggal segini ya? Aku belanja terlalu banyak." },
                    { speaker: "Bu Siti", mood: "worried", text: "Bawang merah 2 kilo padahal cuma pakai setengah kilo sehari, sebagian sudah mulai layu." },
                    { speaker: "Bu Siti", mood: "worried", text: "Kecap 4 botol, padahal cuma habis 1 botol seminggu. Belanja banyak tanpa catat ternyata bikin uangku TERTAHAN di stok yang nggak terpakai..." }
                ],
                1: [
                    { speaker: "Bu Siti", mood: "worried", text: "Maaf ya, bahan habis... Besok baru buka lagi. Iya, iya, aku tahu kamu antre lama. Maaf ya... Besok aku siapkan lagi." },
                    { speaker: "Bu Siti", mood: "worried", text: "Kemarin aku tutup lebih awal, dan... pelanggan hari ini kok sepi ya? Pak Didi bilang dia kemarin pindah ke warung sebelah." },
                    { speaker: "Bu Siti", mood: "worried", text: "Bu Eno juga bilang 'besok ke warung sebelah aja deh, soalnya kemarin kecewa'. Stok sekarang ada, tapi pelanggan sudah pindah... Rugi besar..." }
                ],
                2: [
                    { speaker: "Bu Siti", mood: "happy", text: "Aku cek dulu sisa stok... Minyak tinggal 0, berarti butuh 1 botol buat malam ini. Tepung tinggal 100 gram, butuh 1 kilo. Kecap masih ada setengah botol, itu cukup." },
                    { speaker: "Bu Siti", mood: "happy", text: "Aku beli yang butuh aja, nggak berlebihan. Nggak perlu belanja banyak — cukup untuk malam ini dan besok." },
                    { speaker: "Bu Siti", mood: "proud", text: "Malam itu warung tetap ramai, pelanggan senang! Dan karena aku tahu sisa stok, besoknya aku bisa beli lagi secukupnya." },
                    { speaker: "Bu Siti", mood: "proud", text: "Aku juga catat BATAS MINIMUM — misalnya minyak nggak boleh kurang dari 1 botol, bawang nggak boleh kurang dari 250 gram." },
                    { speaker: "Bu Siti", mood: "proud", text: "Kalau stok di bawah batas itu, aku langsung beli. Nggak perlu menebak lagi!" }
                ]
            }
        },
        {
            type: "insight",
            mood: "relieved",
            title: "Kenapa stok harus dicatat?",
            body: "Stok bukan hanya soal barang ada atau habis. Stok membantu Bu Siti memutuskan kapan belanja, berapa banyak yang dibeli, dan berapa uang yang sedang tertahan di bahan.",
            flavors: {
                0: { body: "Belanja banyak tanpa catat ternyata bikin uang tertahan di stok berlebih. Bahan yang nggak terpakai bisa basi dan terbuang percuma. Aku harus CATAT STOK dan atur BATAS MINIMUM biar tahu kapan belanja tanpa menebak. Dengan Inventaris di Laku, aku bisa catat semua bahan dan atur batas minimum — nanti aku ingetkan kalau stok mau habis!" },
                1: { body: "Menutup warung karena stok habis itu RUGI BESAR. Pelanggan kecewa dan pindah, uang hilang. Padahal masalahnya cuma satu: aku nggak catat stok. Aku harus CATAT STOK dan atur BATAS MINIMUM supaya ini nggak terulang. Dengan Inventaris di Laku, aku bisa catat semua bahan dan atur batas minimum — jadi nggak perlu lagi tutup warung karena stok habis!" },
                2: { body: "Aku sudah coba catat, dan ternyata GAMPANG! Dengan batas minimum, aku tahu kapan harus belanja SEBELUM bahan habis. Nggak perlu panik, nggak perlu menebak. Dengan Inventaris di Laku, aku bisa catat semua bahan dan atur batas minimum — nanti Laku yang ingetkan kalau stok mau habis!" }
            },
            points: [
                "Stok habis saat ramai berarti penjualan hilang.",
                "Ingatan bisa salah; catatan bisa dicek ulang.",
                "Batas minimum memberi peringatan sebelum bahan benar-benar habis."
            ]
        },
        {
            type: "action",
            mood: "happy",
            bubble: "Aku mau mulai catat stok sekarang! Bantu aku masukin bahan-bahan warungku di Inventaris ya!",
            buttonLabel: "Buka Inventaris",
            statusDone: "Kamu sudah mulai catat inventaris! Lanjutkan!",
            statusTodo: "Kamu belum catat inventaris. Yuk mulai sekarang!"
        },
        {
            type: "result",
            mood: "proud",
            bubble: "Terima kasih banyak! Sekarang semua bahan warungku tercatat. Aku bisa lihat sisa stok kapan aja, dan Laku bakal ingetin kalau ada bahan yang mau habis. Nggak perlu lagi panik atau menebak — aku tahu persis kapan harus belanja!",
            closing: "Bu Siti tidak lagi panik setiap malam. Rak dapurnya rapi, dan pelanggan tidak pergi karena bahan habis."
        }
    ]
},

// SCENARIO S2
{
    id: "s2",
    title: "Untung Tapi Uang Hilang",
    icon: "wallet",
    skill: "Pencatatan keuangan",
    goal: "Belajar memisahkan uang pribadi dan usaha serta mencatat transaksi.",
    appKey: "kas",
    appLabel: "Buku Kas",
    storageKey: "laku_cashbook_data",
    badge: { icon: "wallet", name: "Jago Catat" },
    warung: "Buku kas dan kaleng uang muncul di meja Bu Siti.",
    steps: [
        {
            type: "dialogue",
            mood: "happy",
            lead: "Warung ramai, uang masuk terus. Tapi ada yang aneh...",
            lines: [
                { speaker: "Bu Siti", mood: "happy", text: "Halo! Aku Bu Siti. Ini warung nasi gorengku. Sudah 5 tahun aku jualan di sini." },
                { speaker: "Bu Siti", mood: "happy", text: "Setiap malam ramai lho! Pelangganku pada setia. Pak RW juga langganan. Aku sampai nggak sempat ngaso dari maghrib sampai jam 10." },
                { speaker: "Bu Siti", mood: "happy", text: "Aku jual nasi goreng Rp 15.000 per porsi. Rata-rata sehari bisa laku 40-50 porsi. Alhamdulillah, omzetnya lumayan!" },
                { speaker: "Bu Siti", mood: "worried", text: "Tapi... ada yang aneh. Tiap akhir bulan, uangku kok habis ya? Padahal ramai, omzet besar... Tapi di dompet? Kosong. Aku bingung, kemana uangku?" }
            ]
        },
        {
            type: "dialogue",
            mood: "worried",
            lead: "Uang masuk terus, tapi di dompet kosong di akhir bulan.",
            lines: [
                { speaker: "Bu Siti", mood: "worried", text: "Coba aku ingat-ingat... Anakku minta uang sekolah, aku ambil dari toples. Belanja sayur di pasar, dari toples juga. Bayar listrik, dari toples. Ibu minta kirim uang, dari toples lagi..." },
                { speaker: "Narator", mood: "neutral", text: "Uang pribadi dan uang usaha tercampur jadi satu. Belanja bahan pake uang kas, bayar SPP anak juga dari kas." },
                { speaker: "Bu Siti", mood: "worried", text: "Aku nggak pernah pisahkan uang pribadi dan uang usaha. Akhirnya... aku nggak tahu mana untung, mana rugi, mana pengeluaran pribadi, mana modal usaha." },
                { speaker: "Bu Siti", mood: "worried", text: "Kamu sudah dengar ceritaku kan? Aku butuh bantuan. Menurutmu, apa yang harus aku lakukan?" }
            ]
        },
        {
            type: "choice",
            mood: "thinking",
            question: "Kalau kamu yang jadi aku, kamu akan apain?",
            options: [
                {
                    label: "Pisahkan uang pribadi dan usaha sekarang!",
                    correct: false,
                    consequence: "Bu Siti pisahkan uang, tapi tetap tidak tahu berapa yang masuk dan keluar. Besok lusa lupa lagi mana uang usaha mana uang pribadi.",
                    feedback: "Pisahkan uang itu langkah awal yang bagus, tapi tanpa catatan, pemisahan tidak bertahan lama.",
                    xp: 0
                },
                {
                    label: "Lanjutkan saja dulu, yang penting warung ramai",
                    correct: false,
                    consequence: "Satu bulan berlalu, uang makin habis. Uang terus bocor tanpa disadari karena tidak dicatat.",
                    feedback: "Mengabaikan masalah tidak membuatnya hilang. Uang yang tidak dicatat akan terus bocor.",
                    xp: 0
                },
                {
                    label: "Hitung dulu semua pengeluaranmu, baru tentukan langkah",
                    correct: true,
                    consequence: "Bu Siti coba hitung, tapi menyadari tidak bisa karena tidak ada catatan. Ia pun sadar harus mulai mencatat setiap transaksi.",
                    feedback: "Tepat! Sebelum bertindak, perlu tahu kondisi keuangan. Dan untuk tahu kondisi, perlu catatan.",
                    xp: 10
                }
            ]
        },
        {
            type: "dialogue",
            mood: "worried",
            lead: "Apa yang terjadi setelah pilihanmu?",
            branchLines: {
                0: [
                    { speaker: "Bu Siti", mood: "worried", text: "Oke! Aku pisahkan sekarang. Uang usaha di toples khusus, uang pribadi di dompet." },
                    { speaker: "Bu Siti", mood: "worried", text: "Tapi... masalahnya, aku tetap nggak tahu berapa yang masuk dan keluar. Besok lusa aku lupa lagi mana uang usaha mana uang pribadi." },
                    { speaker: "Bu Siti", mood: "relieved", text: "Pisahkan uang aja ternyata nggak cukup! Aku juga harus CATAT setiap transaksi. Kamu bantu aku catat ya?" }
                ],
                1: [
                    { speaker: "Bu Siti", mood: "neutral", text: "Ya sudahlah, aku lanjutkan aja. Yang penting warung ramai kan? Pasti nanti untung sendiri..." },
                    { speaker: "Bu Siti", mood: "worried", text: "Satu bulan sudah berlalu... dan uangku makin habis! Ternyata nggak dicatat, uang terus bocor tanpa aku sadari. Aku harus mulai CATAT keuangannya. Tidak bisa aku abaikan lagi. Kamu bantu aku ya?" }
                ],
                2: [
                    { speaker: "Bu Siti", mood: "worried", text: "Bagus idenya! Aku coba hitung... Belanja sayur 3 juta, gas 500 ribu, minyak 800 ribu, SPP anak 1 juta, listrik 400 ribu..." },
                    { speaker: "Bu Siti", mood: "worried", text: "Eh tapi, mana yang pengeluaran usaha dan mana yang pribadi ya? Aku nggak tahu." },
                    { speaker: "Bu Siti", mood: "relieved", text: "Aku nggak bisa hitung karena nggak ada catatannya! Semua uang campur aduk. Kalau dari awal aku CATAT, pasti aku bisa tahu berapa sebenarnya pengeluaran usahaku. Kamu bantu aku mulai catat ya?" }
                ]
            }
        },
        {
            type: "insight",
            mood: "relieved",
            title: "Uang usaha harus punya rumah sendiri",
            body: "Uang pribadi dan uang usaha sebaiknya dipisahkan. Setiap rupiah yang masuk dan keluar perlu dicatat, sekecil apa pun.",
            flavors: {
                0: { body: "Jadi selain pisahkan uang, aku HARUS catat setiap transaksi. Tanpa catatan, pisah uang aja nggak cukup. Dengan Buku Kas di Laku, aku bisa catat pemasukan dan pengeluaran secara terpisah. Gampang banget!" },
                1: { body: "Aku sudah coba abaikan, tapi masalahnya makin parah. Nggak catat keuangan = uang bocor tanpa sadar. Sekarang aku harus mulai dari nol. Dengan Buku Kas di Laku, aku bisa catat pemasukan dan pengeluaran. Lebih baik terlambat daripada nggak sama sekali!" },
                2: { body: "Aku nggak bisa hitung karena nggak ada catatan. Sekarang aku paham — catat keuangan itu BUKAN ribet, itu PENTING. Dengan Buku Kas di Laku, aku bisa catat pemasukan dan pengeluaran tiap hari. Tinggal masukin angka, selesai!" }
            },
            points: [
                "Pisahkan dompet atau rekening usaha.",
                "Catat pemasukan setiap hari.",
                "Catat pengeluaran sekecil apa pun."
            ]
        },
        {
            type: "action",
            mood: "happy",
            bubble: "Aku mau mulai catat keuangan sekarang! Bantu aku tulis pemasukan pertama di Buku Kas ya!",
            buttonLabel: "Buka Buku Kas",
            statusDone: "Kamu sudah mulai catat keuangan! Lanjutkan!",
            statusTodo: "Kamu belum catat keuangan. Yuk mulai sekarang!"
        },
        {
            type: "result",
            mood: "proud",
            bubble: "Terima kasih banyak! Sekarang aku tahu kemana uangku pergi. Dengan Buku Kas, aku bisa lihat pemasukan dan pengeluaran setiap hari. Aku nggak akan bingung lagi di akhir bulan!",
            closing: "Bu Siti akhirnya bisa membedakan uang belanja rumah dan uang warung. Keuangannya mulai terkontrol."
        }
    ]
}
,
{
    id: "s3",
    title: "Murah Tapi Ternyata Rugi",
    icon: "chart",
    skill: "Perhitungan modal",
    goal: "Belajar menghitung semua biaya sebelum menentukan harga jual.",
    appKey: "hpp",
    appLabel: "Hitung Modal",
    storageKey: "laku_recipe_data",
    badge: { icon: "chart", name: "Cerdas Modal" },
    warung: "Label harga yang benar mulai terpasang di setiap produk.",
    steps: [
        {
            type: "dialogue",
            mood: "happy",
            lead: "Warung malam hari, wajan nasi goreng besar, aroma bumbu terbang.",
            lines: [
                { speaker: "Bu Siti", mood: "happy", text: "Hai! Ketemu aku lagi, Bu Siti! Warungku ramai seperti biasa. Tapi hari ini aku mau cerita soal lain — soal HARGA JUAL." },
                { speaker: "Bu Siti", mood: "happy", text: "Nasi gorengku jual Rp 15.000 per porsi. Murah kan? Pelanggan suka banget! Kata mereka, warung paling murah di kampung ini." },
                { speaker: "Bu Siti", mood: "happy", text: "Modal bahanku cuma Rp 8.000 per porsi. Nasi, telur, sayur, bumbu — semuanya Rp 8.000. Jadi untungku Rp 7.000 per porsi kan? 15.000 dikurang 8.000 = 7.000. Mantap!" },
                { speaker: "Bu Siti", mood: "neutral", text: "Sudah TAHUNAN aku jual harga ini. Nggak pernah ganti. Modal bahan 8 ribu, jual 15 ribu, untung 7 ribu. Selesai. Simple kan?" }
            ]
        },
        {
            type: "dialogue",
            mood: "worried",
            lead: "Berita TV di warung: harga gas LPG naik, minyak goreng naik lagi.",
            lines: [
                { speaker: "Bu Siti", mood: "worried", text: "Eh... harga gas naik. Minyak goreng juga naik. Plastik kemasan juga ikut naik." },
                { speaker: "Bu Siti", mood: "worried", text: "Tapi aku nggak terlalu pikirkan — bahanku kan masih Rp 8.000 per porsi. Jadi aman kan?" },
                { speaker: "Bu Siti", mood: "worried", text: "Tapi... kok tabunganku makin tipis ya? Padahal pelanggan tetap ramai, omzet tetap. Kenapa uangnya kayak... hilang?" },
                { speaker: "Bu Siti", mood: "worried", text: "Coba aku hitung ulang... Bahan memang Rp 8.000. Tapi... gas untuk masak berapa? Listrik lampu warung berapa? Minyak goreng yang makin mahal? Plastik kemasan?" },
                { speaker: "Bu Siti", mood: "worried", text: "Dan... tenagaku sendiri nggak digaji? Aku MASAK dari maghrib sampai jam 10, tapi nggak pernah hitung kerjaku itu BERAPA!" },
                { speaker: "Bu Siti", mood: "surprised", text: "Oh tidak... Selama ini aku kira untung 7 ribu per porsi. Tapi kalau dihitung SEMUA biaya... untungku bukan 7 ribu." },
                { speaker: "Bu Siti", mood: "surprised", text: "BAHKAN MUNGKIN RUGI! Aku nggak pernah hitung biaya di luar bahan. Nggak pernah." }
            ]
        },
        {
            type: "choice",
            mood: "thinking",
            question: "Kalau kamu jualan, cara pasang harga gimana?",
            options: [
                {
                    label: "Modal dikali 2 saja, gampang!",
                    correct: false,
                    consequence: "Harga jadi Rp 16.000, tapi tetap rugi. Gas, listrik, tenaga belum dihitung. Pelanggan juga berkurang karena harga naik.",
                    feedback: "Dikali 2 dari bahan aja nggak cukup! Biaya lain seperti gas, listrik, dan tenaga juga harus dihitung.",
                    xp: 0
                },
                {
                    label: "Lihat harga tetangga, ikut saja",
                    correct: false,
                    consequence: "Ikut harga Rp 18.000, tapi biayanya beda dari Pak Dodi. Untung tetap tipis karena modal per porsi lebih mahal.",
                    feedback: "Ikut harga tetangga itu bahaya! Setiap warung punya bahan dan cara masak yang beda, jadi modalnya juga beda.",
                    xp: 0
                },
                {
                    label: "Hitung semua biaya + untung yang mau",
                    correct: true,
                    consequence: "Semua biaya dihitung: bahan, gas, listrik, kemasan, tenaga. Total Rp 13.500 per porsi. Untung asli cuma Rp 1.500, bukan Rp 7.000!",
                    feedback: "Benar! Semua biaya harus dihitung supaya tahu untung yang sebenarnya dan bisa pasang harga yang tepat.",
                    xp: 10
                }
            ]
        },
        {
            type: "dialogue",
            mood: "worried",
            lead: "Apa yang terjadi setelah pilihanmu?",
            branchLines: {
                0: [
                    { speaker: "Bu Siti", mood: "happy", text: "Oke! Modal bahan 8 ribu dikali 2 = 16 ribu. " },
                    { speaker: "Bu Siti", mood: "happy", text: "Gampang banget! Aku naikin harga jual jadi Rp 16.000. Sekarang untungku pasti lebih besar kan?" },
                    { speaker: "Bu Siti", mood: "worried", text: "Kok tetap rugi ya padahal sudah dinaikkan? Oh tunggu... aku tetap lupa hitung gas, listrik, kemasan, dan tenagaku! Dikali 2 dari bahan aja ternyata nggak cukup! Dan harga lebih mahal, pelanggan juga pada berkurang." },
                    { speaker: "Bu Siti", mood: "worried", text: "Aku makin sengsara..." }
                ],
                1: [
                    { speaker: "Bu Siti", mood: "happy", text: "Warung Pak Dodi jual nasi goreng 18 ribu! Wah, berarti aku bisa naikin juga dong." },
                    { speaker: "Bu Siti", mood: "happy", text: "Ikut 18 ribu aja ya. Kalau Pak Dodi bisa, aku juga bisa!" },
                    { speaker: "Bu Siti", mood: "worried", text: "Tunggu... resep dan bahanku BEDA sama Pak Dodi! Pak Dodi pakai telur ayam kampung, aku pakai telur biasa tapi bumbu lebih banyak. " },
                    { speaker: "Bu Siti", mood: "worried", text: "Pak Dodi pakai gas elpiji besar, aku pakai elpiji kecil yang lebih mahal per porsi." },
                    { speaker: "Bu Siti", mood: "worried", text: "Aku jual 18 ribu tapi modalku lebih mahal. Untungku tipis banget! Kok untungnya sama aja ya padahal harga sudah dinaikkin?" }
                ],
                2: [
                    { speaker: "Bu Siti", mood: "thinking", text: "Aku hitung SEMUA ya. Bahan Rp 8.000... Gas untuk masak 10 porsi = Rp 15.000, berarti per porsi Rp 1.500..." },
                    { speaker: "Bu Siti", mood: "thinking", text: "Listrik warung per malam Rp 5.000, dibagi 40 porsi = Rp 125... " },
                    { speaker: "Bu Siti", mood: "thinking", text: "Kemasan plastik Rp 500 per porsi... Dan tenagaku? 4 jam masak," },
                    { speaker: "Bu Siti", mood: "thinking", text: "kalau digaji minimal Rp 3.000 per porsi..." },
                    { speaker: "Bu Siti", mood: "surprised", text: "Total biaya per porsi = Rp 13.500! Harga jualku Rp 15.000... " },
                    { speaker: "Bu Siti", mood: "surprised", text: "Jadi untung asliku cuma Rp 1.500 per porsi?! Wah... " },
                    { speaker: "Bu Siti", mood: "surprised", text: "selama ini aku kira untung 7 ribu, ternyata cuma 1.500! Ini mah nyaris rugi!" },
                ]
            }
        },
        {
            type: "insight",
            mood: "relieved",
            title: "Harga Jual Harus Hitung Semua Biaya",
            body: "Selama ini Bu Siti cuma hitung bahan, padahal ada biaya lain yang nggak kalah penting. Dengan Hitung Modal di Laku, semua biaya bisa dihitung dengan benar.",
            flavors: {
                0: { body: "Modal dikali 2 ternyata TIDAK CUKUP! Gas, listrik, tenaga — semua itu biaya yang HARUS dihitung. Dikali 2 dari bahan aja itu cuma setengah jalan. Dengan Hitung Modal di Laku, aku bisa hitung SEMUA biaya per porsi — bahan, gas, listrik, kemasan, tenaga, semuanya!" },
                1: { body: "Ikut harga tetangga itu BAHAYA karena biayanya BEDA! Pak Dodi punya cara masak dan bahan yang berbeda, jadi modalnya juga beda. Aku harus hitung BIAYAKU SENDIRI. Dengan Hitung Modal di Laku, aku tahu berapa sebenarnya modal yang aku keluarkan per porsi." },
                2: { body: "Aku sudah hitung semua biaya dan kenyataannya MENGEJUTKAN. Untung yang kukira 7 ribu ternyata cuma 1.500! Selama ini aku jual murah tanpa sadar hampir rugi. Dengan Hitung Modal di Laku, aku bisa pasang harga yang benar-benar menguntungkan — bukan cuma tebak-tebakan." }
            },
            points: [
                "Modal bukan cuma bahan — gas, listrik, kemasan, dan tenaga juga biaya.",
                "Dikali 2 dari bahan atau ikut harga tetangga itu tebakan, bukan perhitungan.",
                "Dengan Hitung Modal, semua biaya terhitung dan harga jual bisa dipasang dengan benar."
            ]
        },
        {
            type: "action",
            mood: "happy",
            bubble: "Aku mau hitung modal yang sebenarnya sekarang! Bantu aku hitung semua biaya per porsi di Hitung Modal ya!",
            buttonLabel: "Buka Hitung Modal",
            statusDone: "Kamu sudah punya resep! Lanjutkan hitung modalnya!",
            statusTodo: "Kamu belum punya data resep. Yuk mulai hitung modal sekarang!"
        },
        {
            type: "result",
            mood: "proud",
            bubble: "Terima kasih banyak! Sekarang aku tahu berapa SEBENARNYA modal yang aku keluarkan per porsi. Bukan cuma bahan — gas, listrik, kemasan, tenaga, semua terhitung. Dengan Hitung Modal di Laku, aku bisa pasang harga yang bikin untung BENERAN, bukan cuma kira-kira!",
            closing: "Label harga yang benar mulai terpasang di setiap produk."
        }
    ]
},
{
    id: "s4",
    title: "Langganan Minta Utang Terus",
    icon: "creditCard",
    skill: "Pencatatan utang piutang",
    goal: "Belajar mencatat utang pelanggan dengan sopan dan aman.",
    appKey: "utang",
    appLabel: "Utang Piutang",
    storageKey: "laku_utang_data",
    badge: { icon: "handshake", name: "Pandai Utang" },
    warung: "Buku catatan utang pelanggan tersimpan rapi di meja.",
    steps: [
        {
            type: "dialogue",
            mood: "happy",
            lead: "Warung siang hari, pelanggan datang per satu, suasana akrab.",
            lines: [
                { speaker: "Bu Siti", mood: "happy", text: "Halo lagi! Warungku ramai seperti biasa. Tapi hari ini aku mau cerita masalah lain... yang sering banget terjadi di warung-warung kecil seperti punyaku." },
                { speaker: "Bu Siti", mood: "happy", text: "Ini Pak Darmawan, langganan dari tahun pertama aku buka warung. Setiap hari mampir. Dan ini Bu Yuli, tetangga sebelah rumah — hampir setiap malam belanja kecil-kecilan di sini." },
                { speaker: "Pak Darmawan", mood: "neutral", text: "Bu, utang dulu ya nasi gorengnya. Bayar minggu depan, mau gaji." },
                { speaker: "Bu Yuli", mood: "neutral", text: "Utang 30 ribu ya Bu, ganti pas gajian. Hehe, maklum akhir bulan..." },
                { speaker: "Bu Siti", mood: "happy", text: "Ya sudah, nggak apa-apa. Kan langganan..." },
                { speaker: "Bu Siti", mood: "neutral", text: "Mereka tetanggaku. Pelanggan setiaku. Kasih utang sekali-kali nggak apa-apa kan? Yang penting baik sama tetangga. Lagi mana mungkin aku bilang nggak... nanti dibilang pelit." }
            ]
        },
        {
            type: "dialogue",
            mood: "worried",
            lead: "Daftar utang di kertas sobekan, angka bertambah-tambah.",
            lines: [
                { speaker: "Bu Siti", mood: "worried", text: "Satu orang utang, dua orang utang... sekarang sudah 5 orang! Pak Darmawan utang Rp 50.000, Bu Yuli Rp 30.000, Mas Joko Rp 25.000, Ibu Ratna Rp 40.000, Mang Asep Rp 35.000... Totalnya sudah lebih dari Rp 180.000!" },
                { speaker: "Pak Darmawan", mood: "neutral", text: "Lho, aku kan sudah bayar minggu lalu Bu?" },
                { speaker: "Bu Yuli", mood: "neutral", text: "Belum ada uang nih Bu, tunggu bulan depan ya..." },
                { speaker: "Ibu Ratna", mood: "neutral", text: "Utangku berapa ya? Aku lupa... 20 ribu kan?" },
                { speaker: "Bu Siti", mood: "worried", text: "A... aku juga lupa... berapa ya kemarin?" },
                { speaker: "Bu Siti", mood: "worried", text: "Total utang orang ke aku sudah Rp 500.000 lebih! Itu modal warungku! Dan aku nggak bisa ingat siapa utang berapa... Semua catatanku kertas sobekan, banyak yang hilang." },
                { speaker: "Teman", mood: "neutral", text: "Pakai pinjol aja Bu! Download aplikasi, cair 1 juta dalam 5 menit. Bunganya kecil kok..." },
                { speaker: "Bu Siti", mood: "worried", text: "Hmm... bunganya kecil katanya... Tapi dengar-dengar banyak yang terlilit utang pinjol ya?" }
            ]
        },
        {
            type: "choice",
            mood: "thinking",
            question: "Kalau pelanggan minta utang, apa yang harus aku lakukan?",
            options: [
                {
                    label: "Kasih saja, nanti ingat sendiri",
                    correct: false,
                    consequence: "Utang makin banyak, catatan hilang, nggak bisa tagih karena nggak ada bukti. Hubungan tetangga jadi canggung.",
                    feedback: "Tanpa catatan, utang jadi lubang uang. Mengandalkan ingatan saja bikin uang menguap tanpa jejak.",
                    xp: 0
                },
                {
                    label: "Jangan kasih utang sama sekali!",
                    correct: false,
                    consequence: "Pelanggan pindah ke warung lain, warung jadi sepi. Tetangga bilang pelit.",
                    feedback: "Larang utang sama sekali itu terlalu keras. Yang benar: kasih utang asal dicatat dengan rapi.",
                    xp: 0
                },
                {
                    label: "Catat siapa utang berapa dan kapan harus bayar",
                    correct: true,
                    consequence: "Setiap utang dicatat nama, jumlah, dan tanggal bayar. Bisa tagih tepat waktu, pelanggan malah respek karena profesional.",
                    feedback: "Benar! Catat utang itu wajib supaya tahu siapa utang berapa dan kapan harus bayar.",
                    xp: 10
                }
            ]
        },
        {
            type: "dialogue",
            mood: "worried",
            lead: "Apa yang terjadi setelah pilihanmu?",
            branchLines: {
                0: [
                    { speaker: "Bu Siti", mood: "happy", text: "Ya sudah, aku kasih utang aja terus. Nanti juga ingat sendiri siapa yang utang berapa. Kan orang baik-baik, pasti bayar..." },
                    { speaker: "Bu Siti", mood: "worried", text: "Eh... Pak Darmawan utang berapa ya kemarin? 50 ribu atau sudah bayar? Terus Bu Yuli... utangnya 30 ribu atau 50 ribu? Aku nggak ingat! Kertas catatanku banyak yang hilang!" },
                    { speaker: "Pak Darmawan", mood: "neutral", text: "Aku nggak utang 50 ribu Bu! Cuma 20 ribu!" },
                    { speaker: "Bu Siti", mood: "worried", text: "Tapi kemarin... aku inget lebih dari itu..." },
                    { speaker: "Pak Darmawan", mood: "neutral", text: "Nggak ah, kamu lupa kali. Aku yang tahu utangku sendiri." },
                    { speaker: "Bu Siti", mood: "worried", text: "Aku nggak tahu siapa yang masih utang dan siapa yang sudah bayar... Total utang sudah Rp 700.000 lebih, tapi aku nggak bisa tagih karena nggak ada buktinya. Hubungan sama tetangga malah jadi canggung..." }
                ],
                1: [
                    { speaker: "Bu Siti", mood: "happy", text: "Cukup! Mulai sekarang nggak ada utang lagi! Semua bayar cash!" },
                    { speaker: "Pak Darmawan", mood: "neutral", text: "Bu, utang dulu ya..." },
                    { speaker: "Bu Siti", mood: "neutral", text: "Nggak bisa Pak, maaf. Bayar di tempat aja." },
                    { speaker: "Bu Yuli", mood: "neutral", text: "Bu Yuli mau utang 30 ribu..." },
                    { speaker: "Bu Siti", mood: "neutral", text: "Nggak Bu, sekarang nggak bisa utang." },
                    { speaker: "Bu Siti", mood: "worried", text: "Warungku sepi sekarang... Pak Darmawan mampir ke warung sebelah yang masih ngasih utang. Bu Yuli juga jarang datang. Tetangga pada bilang aku 'pelit'. Padahal uangku juga nggak banyak... Kalau ngasih utang uangku hilang, kalau nggak ngasih pelangganku yang pergi..." }
                ],
                2: [
                    { speaker: "Bu Siti", mood: "happy", text: "Bagus idenya! Aku mulai catat dari sekarang. Setiap orang yang utang, aku tulis nama, jumlah uang, dan tanggal janji bayar." },
                    { speaker: "Bu Siti", mood: "happy", text: "Pak Darmawan utang Rp 50.000, janji bayar tanggal 15. Bu Yuli utang Rp 30.000, janji bayar pas gajian tanggal 25. Semua tertulis rapi!" },
                    { speaker: "Bu Siti", mood: "happy", text: "Pak Darmawan, kemarin utang Rp 50.000 ya, hari ini jatuh temponya. Bisa dibayar?" },
                    { speaker: "Pak Darmawan", mood: "neutral", text: "Oh iya Bu, lupa aku! Ini Bu, bayar utangku. Makasih sudah ingetin!" },
                    { speaker: "Bu Yuli", mood: "neutral", text: "Wah Bu Siti sekarang rapi ya catat utangnya. Keren! Aku malah jadi nggak enak kalau telat bayar." },
                    { speaker: "Bu Siti", mood: "proud", text: "Ternyata catatan bikin aku bisa kasih utang TANPA takut lupa! Pelanggan malah RESPEK karena profesional." }
                ]
            }
        },
        {
            type: "insight",
            mood: "relieved",
            title: "Utang Piutang Wajib Dicatat",
            body: "Utang dan piutang yang nggak dicatat bisa bikin uang menguap. Dengan Utang & Piutang di Laku, semua tercatat rapi dan aman.",
            flavors: {
                0: { body: "Tanpa catatan, utang jadi lubang uang. Aku nggak bisa tagih karena nggak tahu siapa utang berapa. Sekarang aku paham — utang piutang itu WAJIB dicatat! Bedanya: **utang** itu uang yang AKU pinjam (kewajiban bayar), **piutang** itu uang yang orang pinjam ke aku (hak terima uang). Yang selama ini bikin masalah itu PIUTANG — uang orang ke aku yang nggak tercatat. Dengan Utang & Piutang di Laku, aku bisa kasih utang tanpa takut lupa. Dan jangan pernah sentuh pinjol! Bunganya makan modal." },
                1: { body: "Larang utang sama sekali itu terlalu keras. Pelangganku pergi, warungku sepi. Yang benar: kasih utang TAPI CATAT. Dan aku baru tahu ada istilah **utang** dan **piutang** — utang itu kewajibanku bayar ke orang, piutang itu hak aku terima uang dari orang. Selama ini aku cuma fokus ke 'jangan ngasih utang', padahal yang bener itu 'kelola utang dan piutang'. Dengan Utang & Piutang di Laku, aku bisa tetap baik sama pelanggan tanpa kehilangan uang. Dan pinjol? Jangan! Bunganya bikin makin terlilit." },
                2: { body: "Catatan utang bikin semuanya jelas! Aku tahu siapa yang utang, berapa, dan kapan harus bayar. Ternyata beda loh **utang** dan **piutang** — utang itu uang yang aku pinjam (kewajiban bayar ke orang), piutang itu uang yang orang pinjam ke aku (hak aku terima). Aku harus CATAT keduanya. Dengan Utang & Piutang di Laku, semuanya tertata rapi. Dan satu lagi: pinjol itu jebakan! Bunganya kecil di depan, tapi menggunung di belakang. Jangan pernah!" }
            },
            points: [
                "Utang dan piutang WAJIB dicatat — jangan mengandalkan ingatan.",
                "Utang = uang yang aku pinjam, piutang = uang yang orang pinjam ke aku.",
                "Jangan pernah sentuh pinjol! Bunganya memakan modal warungmu."
            ]
        },
        {
            type: "action",
            mood: "happy",
            bubble: "Aku mau mulai catat utang dan piutang sekarang! Bantu aku tulis piutang pertama di Laku ya!",
            buttonLabel: "Buka Utang Piutang",
            statusDone: "Kamu sudah mulai catat utang piutang! Lanjutkan kelola supaya nggak ada yang lupa bayar!",
            statusTodo: "Kamu belum catat utang piutang. Yuk mulai sekarang supaya uangmu nggak hilang!"
        },
        {
            type: "result",
            mood: "proud",
            bubble: "Terima kasih banyak! Sekarang aku tahu siapa yang utang ke aku, berapa jumlahnya, dan kapan harus dibayar. Nggak ada lagi uang yang 'hilang' karena lupa! Aku juga nggak perlu takut bilang nggak — karena dengan catatan, aku bisa kasih utang dengan TENANG. Dan pinjol? Nggak perlu! Modalku cukup kalau piutangku kelola dengan baik.",
            closing: "Buku catatan utang pelanggan tersimpan rapi di meja."
        }
    ]
},
{
    id: "s5",
    title: "Mau Promo Tapi Bingung",
    icon: "rocket",
    skill: "Promosi WhatsApp",
    goal: "Belajar membuat teks promo yang menarik dan lengkap.",
    appKey: "promo",
    appLabel: "Promo WA",
    storageKey: "laku_promo_data",
    badge: { icon: "rocket", name: "Jago Promo" },
    warung: "Banner dan spanduk promo terpasang di depan warung.",
    steps: [
        {
            type: "dialogue",
            mood: "happy",
            lead: "Siang hari, Bu Siti duduk di depan warung sambil scroll WhatsApp grup RT.",
            lines: [
                { speaker: "Bu Siti", mood: "happy", text: "Halo! Aku Bu Siti lagi. Tadi aku lihat grup RT... tetangga-tetanggaku pada promosi jualannya di WhatsApp lho. Bu Rini jualan kue, Pak Dodo jualan ayam goreng, semuanya pada kirim promo." },
                { speaker: "Bu Siti", mood: "worried", text: "Lho, Bu Dewi kemarin kirim promo roti bakarnya di grup RT... dan katanya dapat 15 pesanan dalam sehari! Padahal warung rotinya baru buka 3 bulan. Kok bisa ya?" },
                { speaker: "Bu Siti", mood: "happy", text: "Warungku sudah 5 tahun lho! Nasi gorengku enak, pelanggan setia... Pasti kalau aku promosi juga, hasilnya lebih bagus dari Bu Dewi! Aku mau coba kirim promo di WhatsApp!" },
                { speaker: "Bu Siti", mood: "happy", text: "Aku buka grup RT, ketik... hmm... gampang kan? Tulis aja nama makanan dan harga, kirim, selesai!" }
            ]
        },
        {
            type: "dialogue",
            mood: "worried",
            lead: "Promo pertama Bu Siti ternyata tidak mendapat respons.",
            lines: [
                { speaker: "Bu Siti", mood: "happy", text: "Nih, aku kirim! Nasi Goreng Bu Siti Rp15.000 DM ya. Singkat, jelas, kan? Sekarang tinggal tunggu pesanan masuk..." },
                { speaker: "Bu Siti", mood: "worried", text: "... Kok sepi ya? Sudah 2 jam, nggak ada yang DM. Ada yang dibaca, tapi nggak ada yang pesan. Mungkin lagi sibuk... aku tunggu aja lagi." },
                { speaker: "Bu Siti", mood: "worried", text: "Eh... coba deh bandingin punyaku dan punya Bu Dewi. Punyaku cuma... teks putih dan harga. Punya Bu Dewi ada emoji, ada deskripsi roti panggang resep keluarga, ada pilihan topping keju coklat susu kental, ada harga mulai Rp10.000, ada nomor WA untuk pesan, bisa antar area RT 05, dan ada kata 'Hari ini saja! Stok terbatas'... Kok beda banget ya? Menurutmu, kenapa promo aku sepi peminat?" }
            ]
        },
        {
            type: "choice",
            mood: "thinking",
            question: "Menurutmu, kenapa promo Bu Siti sepi peminat?",
            options: [
                {
                    label: "Produknya kurang menarik, mungkin orang nggak suka nasi goreng",
                    correct: false,
                    consequence: "Bu Siti menambah menu baru, tapi promonya tetap cuma teks dan harga. Hasilnya tetap sepi.",
                    feedback: "Menu enak tidak menolong kalau promosinya tetap biasa. Masalahnya bukan di menunya.",
                    xp: 0
                },
                {
                    label: "Harus bayar iklan/sponsor biar dilihat orang",
                    correct: false,
                    consequence: "Bu Siti mengeluarkan uang untuk iklan WhatsApp, tapi isi promonya tetap sama. Uang terbuang, pesanan tetap sepi.",
                    feedback: "Iklan mahal tidak berguna kalau konten promosi tidak menarik. Masalahnya di isi teksnya, bukan di jangkauannya.",
                    xp: 0
                },
                {
                    label: "Teks promosi kurang menarik dan kurang informasi",
                    correct: true,
                    consequence: "Bu Siti menulis ulang promonya dengan deskripsi, emoji, dan info lengkap. Langsung dapat 8 pesanan dalam sehari!",
                    feedback: "Tepat! Promo yang menarik dan lengkap membuat orang tertarik membeli. Isi promonya yang penting, bukan sekadar mengirimnya.",
                    xp: 10
                }
            ]
        },
        {
            type: "dialogue",
            mood: "worried",
            lead: "Apa yang terjadi setelah pilihanmu?",
            branchLines: {
                0: [
                    { speaker: "Bu Siti", mood: "happy", text: "Mungkin ya... orang udah bosen nasi goreng. Oke, aku tambah menu baru! Mie goreng spesial, es teh tarik, kerupuk kulit... Pasti kalau menu-nya banyak, orang pada tertarik!" },
                    { speaker: "Bu Siti", mood: "worried", text: "Kok menu baru juga sepi ya? Padahal enak lho mie gorengku... Aku sudah bikin menu baru, tapi tetap nggak ada yang pesan. Ternyata masalahnya BUKAN di menunya. Menu enak tapi kalau promonya tetap cuma teks dan harga, ya orang nggak tertarik!" }
                ],
                1: [
                    { speaker: "Bu Siti", mood: "worried", text: "Oh, mungkin promoku nggak kelihatan karena nggak ada iklan! Bu Dewi mungkin bayar iklan WhatsApp ya? Oke, aku keluarin uang buat broadcast dan iklan di WhatsApp. Biar promoku muncul di atas!" },
                    { speaker: "Bu Siti", mood: "worried", text: "Iklan sudah jalan, banyak yang lihat... tapi tetap nggak ada yang pesan! Mereka klik, baca 'Nasi Goreng Bu Siti Rp15.000 DM ya', lalu... tutup. Uang iklan keluar tapi pesanan nggak masuk... Ternyata iklan mahal aja nggak cukup kalau ISI promonya masih jelek!" }
                ],
                2: [
                    { speaker: "Bu Siti", mood: "surprised", text: "Iya ya... promoku cuma tulisan biasa dan harga. Nggak ada deskripsi, nggak ada emoji, nggak ada info cara pesan. Orang baca cuma 'Nasi Goreng Rp15.000 DM ya' — ya bosenin! Aku harus tulis ulang promoku supaya lebih menarik dan lengkap!" },
                    { speaker: "Bu Siti", mood: "proud", text: "Wah! Setelah aku tulis ulang... dapat 8 pesanan dalam sehari! Dari teks doang bisa seberapa bedanya! Ternyata orang butuh tahu KENAPA harus beli, BAGAIMANA cara pesan, dan APA kelebihanku. Bukan cuma nama dan harga!" }
                ]
            }
        },
        {
            type: "insight",
            mood: "relieved",
            title: "Promo yang bagus menjawab pertanyaan pembeli",
            body: "Promo yang menarik memberi tahu pembeli apa yang dijual, kenapa istimewa, berapa harganya, dan bagaimana cara memesan. Bukan cuma 'Dijual Rp.X'",
            flavors: {
                0: { body: "Produkku enak, tapi kalau promonya nggak menarik, orang nggak tahu! Menu baru aja nggak laku kalau teks promonya masih biasa aja. Promo yang baik itu punya: nama jelas, keunggulan, harga, cara pesan, dan emoji. Dengan Promo WA di Laku, aku bisa bikin teks promo yang lengkap dan menarik!" },
                1: { body: "Iklan mahal itu bukan solusi kalau kontennya masih jelek. Orang lihat iklanku, baca, lalu tinggal — karena isinya nggak menarik! Yang penting adalah ISI promonya: nama produk, keunggulan, harga, cara pesan, dan emoji. Dengan Promo WA di Laku, aku bisa bikin promo yang informatif tanpa harus bayar iklan!" },
                2: { body: "Isi promo itu yang paling penting! Dari teks doang, hasilnya bisa sangat beda. Cukup tambah deskripsi, emoji, info cara pesan, dan kata-kata yang bikin orang pengen beli — langsung dapat 8 pesanan! Dengan Promo WA di Laku, aku bisa bikin teks promo yang punya semua info penting dan menarik perhatian." }
            },
            points: [
                "Tulis nama produk dan keunggulan dengan jelas.",
                "Cantumkan harga, cara pesan, dan info penting lainnya.",
                "Gunakan emoji dan kata-kata yang membuat orang tertarik membeli."
            ]
        },
        {
            type: "action",
            mood: "happy",
            bubble: "Aku mau bikin promo yang menarik sekarang! Bantu aku buat teks promo pertamaku di Promo WA ya!",
            buttonLabel: "Buka Promo WA",
            statusDone: "Kamu sudah pernah bikin promo! Lanjutkan buat promo baru!",
            statusTodo: "Kamu belum bikin promo. Yuk mulai sekarang!"
        },
        {
            type: "result",
            mood: "proud",
            bubble: "Terima kasih banyak! Sekarang aku nggak perlu bingung lagi mau promosi apa. Dengan Promo WA di Laku, aku bisa bikin teks promo yang lengkap, menarik, dan tinggal kirim ke WhatsApp! Nggak perlu bayar iklan mahal, cukup teks yang benar!",
            closing: "Bu Siti belajar bahwa promosi bukan soal berteriak paling keras, tetapi memberi informasi paling jelas. Banner dan spanduk promo terpasang di depan warungnya."
        }
    ]
},
{
    id: "s6",
    title: "Ingin Usaha Makin Besar",
    icon: "trendingUp",
    skill: "Simulasi laba rugi",
    goal: "Belajar menghitung laba rugi sebelum mengambil keputusan besar.",
    appKey: "laba",
    appLabel: "Simulasi Laba",
    storageKey: "laku_laba_data",
    badge: { icon: "crown", name: "Ratu UMKM" },
    warung: "Warung penuh pelanggan, meja terisi, lampu terang.",
    steps: [
        {
            type: "dialogue",
            mood: "happy",
            lead: "Warung Bu Siti sudah tertata rapi — ada papan catatan keuangan di dinding dan stok tertata di rak.",
            lines: [
                { speaker: "Bu Siti", mood: "happy", text: "Halo lagi! Aku Bu Siti. Warungku sekarang sudah beda banget, lho. Stok bahan tertata rapi, keuangan tercatat setiap hari, harga jual sudah benar, utang-piutang terpantau, promo juga jalan terus." },
                { speaker: "Bu Siti", mood: "happy", text: "Tetanggaku, Pak Darmi, tiba-tiba datang. Katanya ada ruko kosong dekat pasar, mau disewakan. Harganya lumayan, lokasinya bagus. Dia bilang: 'Bu Siti, kan warungnya sukses, buka cabang aja di sini!'" },
                { speaker: "Bu Siti", mood: "happy", text: "Buka cabang nih! Rezeki nggak boleh ditolak. Aku bayangin dua warung jalan bareng, untungnya double. Nanti aku bisa panggil pegawai, beli peralatan baru... Aku jadi Ratu UMKM kali ya!" },
                { speaker: "Bu Siti", mood: "worried", text: "Tapi tunggu dulu... Buka cabang butuh deposit sewa, peralatan baru, pegawai tambahan... Itu semua butuh uang banyak. Dari mana ya? Apa warungku sekarang cukup kuat buat buka cabang?" }
            ]
        },
        {
            type: "dialogue",
            mood: "worried",
            lead: "Angka-angka yang selama ini tidak pernah Bu Siti hitung.",
            lines: [
                { speaker: "Bu Siti", mood: "worried", text: "Coba aku hitung... Omzet warung sebulan berapa ya? Pengeluaran bahan baku berapa? Gaji pegawai, listrik, gas... Terus ada cicilan utang juga. Eh, mana angkanya?" },
                { speaker: "Bu Siti", mood: "worried", text: "Selama ini aku pikir warung ramai = pasti untung besar. Tapi aku cuma lihat uang masuk setiap hari. Aku nggak pernah hitung TOTAL pengeluaran versus TOTAL pemasukan dalam sebulan. Berapa sih untungku beneran?" },
                { speaker: "Bu Siti", mood: "thinking", text: "Aku sudah belajar banyak — catat keuangan, atur stok, tentukan harga, kelola utang, buat promo. Tapi ada satu hal yang belum aku lakukan: HITUNG LABA RUGINYA. Sebelum ambil keputusan besar kayak buka cabang, aku harus tahu dulu angka sebenarnya. Bantu aku?" }
            ]
        },
        {
            type: "choice",
            mood: "thinking",
            question: "Sebelum memperbesar usaha, apa yang harus aku lakukan?",
            options: [
                {
                    label: "Langsung ambil aja, sayang kalau ketinggalan kesempatan",
                    correct: false,
                    consequence: "Bu Siti langsung ambil ruko. Uang tabungan habis buat deposit dan peralatan, tapi cabang sepi dan rugi terus.",
                    feedback: "Kesempatan memang sayang dilewatkan, tapi mengambil keputusan besar tanpa angka itu nekat.",
                    xp: 0
                },
                {
                    label: "Pinjam modal dulu ke bank atau teman",
                    correct: false,
                    consequence: "Bu Siti meminjam uang, tapi cicilan tiap bulan makan untung warung utama. Cabang belum untung, utang menumpuk.",
                    feedback: "Pinjam modal tanpa tahu kemampuan bayar itu sangat berisiko. Utang bisa makin besar.",
                    xp: 0
                },
                {
                    label: "Hitung dulu laba rugi beneran, baru ambil keputusan",
                    correct: true,
                    consequence: "Bu Siti menghitung laba rugi dan tahu untungnya cuma Rp 2 juta sebulan. Belum cukup untuk cabang — lebih baik tunda dan tabung dulu.",
                    feedback: "Bijak! Angka yang jelas membuat keputusan besar tidak lagi nekat.",
                    xp: 10
                }
            ]
        },
        {
            type: "dialogue",
            mood: "worried",
            lead: "Apa yang terjadi setelah pilihanmu?",
            branchLines: {
                0: [
                    { speaker: "Bu Siti", mood: "happy", text: "Kesempatan nggak datang dua kali! Aku ambil ruko itu. Deposit sewa 3 juta, beli peralatan 2 juta, pegawai baru gaji 1,5 juta sebulan... Uang dari tabungan warung pertama habis banyak. Tapi nggak apa-apa, nanti cabang pasti untung kan?" },
                    { speaker: "Bu Siti", mood: "worried", text: "Kok cabangnya rugi terus ya? Pelanggannya belum kenal warungku di sana. Omzet cabang cuma Rp 1,5 juta sebulan, tapi gaji pegawai plus sewa plus listrik aja udah Rp 3 juta. Untung warung pertama habis buat nutupin cabang... Aku harusnya hitung dulu sebelum ambil keputusan!" }
                ],
                1: [
                    { speaker: "Bu Siti", mood: "happy", text: "Aku pinjam 5 juta ke temanku, Bu Rina. Dengan uang segitu, aku bisa bayar deposit, beli peralatan, dan gaji pegawai buat beberapa bulan. Katanya bunga ringan kok. Aku yakin cabang pasti untung, nanti bisa balikin uangnya!" },
                    { speaker: "Bu Siti", mood: "worried", text: "Tiap bulan aku harus bayar cicilan ke Bu Rina. Tapi cabang belum untung! Uang pinjaman plus bunga makan untung warung utama. Aku punya utang, cabang rugi, warung pertama juga tertekan. Ini makin susah... Kenapa aku nggak hitung dulu untungku berapa sebelum pinjam?" }
                ],
                2: [
                    { speaker: "Bu Siti", mood: "thinking", text: "Aku pelajari dulu angkanya. Dari catatan Buku Kas dan pengeluaran, aku jumlahkan: omzet warung sebulan Rp 9 juta. Pengeluaran bahan baku Rp 4 juta, gaji pegawai Rp 1,5 juta, sewa Rp 500 ribu, listrik & gas Rp 500 ribu, cicilan utang Rp 500 ribu... Total pengeluaran Rp 7 juta." },
                    { speaker: "Bu Siti", mood: "relieved", text: "Jadi untung bersihku cuma Rp 2 juta sebulan? Itu cukup untuk hidup, tapi TIDAK cukup untuk buka cabang! Deposit sewa aja 3 juta, belum peralatan dan gaji pegawai baru. Kalau aku nekat buka cabang sekarang, pasti nggak kuat. Lebih baik TUNDA dulu, tabung dulu. Buka cabang kalau untung sudah cukup." }
                ]
            }
        },
        {
            type: "insight",
            mood: "relieved",
            title: "Ramai belum tentu untung",
            body: "Omzet ramai belum tentu untung besar. Laba adalah selisih pemasukan dan seluruh pengeluaran. Harus tahu angka laba rugi asli sebelum ambil keputusan besar.",
            flavors: {
                0: { body: "Ambil kesempatan tanpa hitung angka itu nekat! Untungku ternyata tidak sebesar yang aku kira. Warung ramai belum tentu untung besar. Dengan Simulasi Laba di Laku, aku bisa lihat angka sebenarnya sebelum ambil keputusan besar. Nggak perlu nekat-nekat!" },
                1: { body: "Pinjam modal tanpa tahu untung berapa itu bahaya! Aku tambah utang padahal untungku cuma 2 juta sebulan. Aku harus tahu LABA RUGI asli dulu baru berani pinjam. Dengan Simulasi Laba di Laku, aku bisa hitung dan mengambil keputusan tanpa stres utang." },
                2: { body: "Angkanya tidak pernah bohong. Untungku sebenarnya cuma 2 juta sebulan — belum cukup buat cabang. Tapi nggak apa-apa! Dengan Simulasi Laba di Laku, aku bisa merencanakan kapan waktunya tepat untuk berkembang. Nggak perlu terburu-buru!" }
            },
            points: [
                "Hitung total omzet bulanan.",
                "Hitung total pengeluaran — bahan, gaji, sewa, cicilan.",
                "Laba bersih = omzet dikurangi semua pengeluaran.",
                "Jangan ambil keputusan besar sebelum tahu angkanya."
            ]
        },
        {
            type: "action",
            mood: "happy",
            bubble: "Aku mau hitung laba ruginya sekarang! Dari omzet Rp 9 juta, pengeluaran Rp 7 juta, berapa ya untungku beneran? Bantu aku hitung di Simulasi Laba!",
            buttonLabel: "Buka Simulasi Laba",
            statusDone: "Kamu sudah mulai hitung laba rugi! Lanjutkan dan pantau terus!",
            statusTodo: "Kamu belum hitung laba rugi. Yuk mulai sekarang!"
        },
        {
            type: "result",
            mood: "proud",
            bubble: "Perjalanan kita sudah panjang! Dulu aku nggak tahu kemana uangku pergi. Sekarang aku bisa catat keuangan, atur stok, tentukan harga yang benar, kelola utang-piutang, buat promo yang efektif, dan HITUNG LABA RUGINYA. Aku nggak lagi gaptek — aku PENGUSAHA yang tahu angkanya!",
            closing: "Selamat! Bu Siti telah menyelesaikan semua pelajaran. Dari bahan baku yang habis mendadak sehingga ia belajar mencatat stok, uang yang hilang tanpa jejak hingga ia belajar memisahkan keuangan, harga yang ternyata merugikan hingga ia belajar menghitung modal, utang yang menumpuk tanpa catatan hingga ia belajar kelola piutang, promo yang sepi peminat hingga ia belajar membuat teks yang menarik, hingga keputusan besar tanpa angka yang membuatnya akhirnya belajar menghitung laba rugi — Bu Siti kini menjadi Ratu UMKM yang menguasai setiap aspek usahanya. Warungnya penuh pelanggan, meja terisi, lampu terang."
        }
    ]
}
    ];

    /* ── Data Lookup Functions ── */

    function getScenario(id) {
        for (var i = 0; i < SCENARIOS.length; i++) {
            if (SCENARIOS[i].id === id) return SCENARIOS[i];
        }
        return null;
    }

    function createEmptyScenarioRecord() {
        return { completed: false, bestScore: 0, attempts: 0, actionDone: false, actionBonus: false };
    }

    window.LakuLearnData = {
        STORAGE_KEY: STORAGE_KEY,
        LEGACY_KEY: LEGACY_KEY,
        INTRO_KEY: INTRO_KEY,
        RETURN_KEY: RETURN_KEY,
        SESSION_KEY: SESSION_KEY,
        XP_LEVEL_STEP: XP_LEVEL_STEP,
        MAX_CHOICE_ATTEMPTS: MAX_CHOICE_ATTEMPTS,
        SCENARIO_ORDER: SCENARIO_ORDER,
        READINESS_ITEMS: READINESS_ITEMS,
        MOOD_LABELS: MOOD_LABELS,
    SCENARIOS: SCENARIOS,
    MOOD_MOUTH_PATHS: MOOD_MOUTH_PATHS,
    getScenario: getScenario,
    createEmptyScenarioRecord: createEmptyScenarioRecord
    };
})();
