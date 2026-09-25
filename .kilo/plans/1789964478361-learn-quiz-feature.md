---
name: Learn Quiz Feature
description: Menambahkan fitur kuis interaktif setelah setiap skenario belajar untuk memperdalam pemahaman dan memberikan XP tambahan.
type: plan
status: ready
---

# Plan: Fitur Kuis Interaktif pada Modul Belajar

## Tujuan

Menambahkan step kuis setelah setiap skenario belajar (setelah step result) yang berisi 3-5 pertanyaan pilihan ganda untuk menguji pemahaman pengguna mengenai materi skenario. Pengguna mendapatkan XP berdasarkan jumlah jawaban benar dan bonus XP jika semua jawaban benar. Hasil kuis disimpan di localStorage sehingga dapat ditingkatkan pada percobaan berikutnya.

## Keputusan yang sudah dikonfirmasi

- Kuis akan ditambahkan sebagai step baru dengan tipe "quiz" ditempatkan setelah step "result" dalam setiap skenario.
- Setiap pertanyaan kuis memiliki 4 opsi, satu jawaban benar.
- Pengguna dapat memilih satu opsi per pertanyaan; setelah semua terjawab, tombol "Submit" muncul.
- Setelah submit, ditampilkan skor (jumlah benar) dan feedback per pertanyaan (jawaban benar/salah).
- Jika semua jawaban benar, pengguna mendapatkan bonus XP sebesar 5 XP.
- XP per jawaban benar: 2 XP (dapat disesuaikan per skenario).
- Percobaan kuis tidak dibatasi; pengguna dapat mengulang kuis sebanyak yang diinginkan untuk meningkatkan skor.
- Rekam skor tertinggi (best score) dan jumlah percobaan per skenario.
- Tombol "Ulangi Kuis" memungkinkan pengguna mengreset pilihan dan mencoba lagi.
- Tombol "Lanjut ke Skenario Berada" tetap muncul setelah kuis (atau pengguna dapat langsung lanjut jika sudah selesai).

## Temuan teknis saat ini

1. learnData.js mendefinisikan skenario sebagai array objek dengan properti `steps` yang berisi objek step dengan tipe: dialogue, choice, insight, action, result.
2. learnState.js menyimpan record per skenario dengan fields: completed, bestScore, attempts, actionDone, actionBonus.
3. learnScenario.js mengelola navigasi antar step dan logika pilihan (choice/practice).
4. learnRender.js memiliki fungsi rendering untuk setiap tipe step dan dispatcher `renderStep`.
5. learnDOM.js menyediakan primitif DOM seperti menampilkan bubble, mengatur mood, dan menyembunyikan/get elemen.
6. learnActions.js menyediakan handler untuk aksi seperti refreshAction, completeAction, toggleChecklist, resetProgress.
7. learn.js menginisialisasi state dan menyambungkan semua modul.

## Perubahan yang diperlukan

### 1. learnData.js
- Tambahkan fields ke `createEmptyScenarioRecord()`: `quizScore: 0, quizAttempts: 0, quizBestScore: 0`.
- Tambahkan step kuis ke setiap skenario setelah step result (atau definisikan sebagai step terpisah yang dapat diinsert secara dinamis). Untuk kepraktisan, kita akan menambahkan step kuis secara statis ke array steps setiap skenario setelah step result.
- Setiap step kuis akan memiliki struktur:
  ```js
  {
    type: "quiz",
    title: "Kuis Pemahaman", // atau bisa diambil dari scenario.title
    questions: [
      { prompt: "...", options: [{label: "...", correct: true}, ...], feedback: "..." },
      // ... more questions
    ],
    xpPerCorrect: 2,
    bonusXpIfAllCorrect: 5
  }
  ```

### 2. learnState.js
- Di fungsi `normalizeState()`, ketika menyalin record scenario, tambahkan pemanggilan fields quizScore, quizAttempts, quizBestScore.
- Di fungsi `createEmptyScenarioRecord()` di learnData.js (sudah di atas).
- Pastikan saat migrasi dari record lama (tanpa fields quiz) tetap berfungsi dengan nilai default 0.

### 3. learnScenario.js
- Tambahkan logika untuk menangani step tipe "quiz":
  - Tambahkan variabel runtime: `I.quizSelections = {}` (map question index -> selected option index), `I.quizSubmitted = false`.
  - Fungsi `chooseQuizOption(questionIndex, optionIndex)` untuk menyimpan pilihan.
  - Fungsi `submitQuiz()` untuk menghitung skor, menambah XP, mencatat quizAttempts, memperbarui quizScore dan quizBestScore jika skor lebih tinggi, dan menyimpan state.
  - Fungsi `retryQuiz()` untuk mereset pilihan dan status submit.
  - Integrasi ke dalam fungsi `startScenario`, `goStep`, `nextStep`, `goBack` untuk mengreset state quiz ketika masuk/keluari dari step quiz.
  - Tambah handler ke public API: `chooseQuizOption`, `submitQuiz`, `retryQuiz`.

### 4. learnRender.js
- Tambah fungsi `renderQuizContent(scenario, step)` yang menghasilkan HTML untuk kuis:
  - Menampilkan pertanyaan satu per satu dalam bentuk kartu dengan opsi radio atau tombol pilihan.
  - Tombol "Submit" yang disabled hingga semua pertanyaan terpilih.
  - Setelah submit, tampilkan skor per pertanyaan dengan indikator benar/salah, tombol "Ulangi Kuis", dan tombol "Lanjut" (ke step berikutnya atau tutup modal jika ini adalah step terakhir).
  - Tampilkan XP yang diperoleh dan bonus jika適用.
- Tambah fungsi `optionButtonClass` (mungkin sudah ada) untuk menhighlight pilihan yang dipilih setelah submit.
- Update dispatcher `renderStep` untuk menangani kasus `step.type === "quiz"` dengan memanggil `renderQuizContent`.

### 5. learnDOM.js
- Tidak diperlukan perubahan signifikan karena kita hanya menggunakan elemen yang sudah ada (button, div, dsb). Namun, kita perlu memastikan ada fungsi untuk menyembunyikan/menampilkan elemen jika diperlukan (sudah ada).
- Jika diperlukan, tambah caching untuk elemen quiz khusus (misalnya, container untuk skor).

### 6. learnActions.js
- Tidak diperlukan perubahan langsung karena logika kuis dijalankan melalui learnScenario.js. Namun, jika ingin menambahkan aksi luar seperti "refreshQuiz", bisa ditambahkan.

### 7. learn.js
- Tidak perlu perubahan karena API dari learnScenario.js akan otomatis tersedia melalui window.LakuLearnScenario.

## Task pengerjaan

### Task 1 — Update learnData.js
1. Tambahkan fields quizScore, quizAttempts, quizBestScore ke `createEmptyScenarioRecord()`.
2. Untuk setiap skenario di array `SCENARIOS`, insert step kuis setelah step result (posisi terakhir sebelum akhir array, atau setelah result jika ada). Buat pertanyaan kuis yang relevan dengan materi skenario (3-5 pertanyaan).
3. Set `xpPerCorrect: 2` dan `bonusXpIfAllCorrect: 5` (biasa bisa disesuaikan nanti).
4. Pastikan tidak ada sintaks error.

### Task 2 — Update learnState.js
1. Di fungsi `normalizeState()`, saat menyalin `raw.scenarios[keys[i]]` ke `normalized.scenarios[keys[i]]`, tambahkan penyalinan fields quizScore, quizAttempts, quizBestScore dengan fallback 0 jika tidak ada.
2. Pastikan fungsi tetap bekerja dengan record lama (tanpa fields quiz).

### Task 3 — Update learnScenario.js
1. Tambahkan variabel runtime di atas: `I.quizSelections = {}; I.quizSubmitted = false;`.
2. Tambah fungsi `chooseQuizOption(questionIndex, optionIndex)`:
   - Jika `I.quizSubmitted` adalah true, abaikan.
   - Simpan pilihan ke `I.quizSelections[questionIndex] = optionIndex`.
   - Panggil `window.LakuLearnRender.renderStep()` untuk update UI.
3. Tambah fungsi `submitQuiz()`:
   - Ambil scenario dan step kuis saat ini.
   - Hitung jumlah jawaban benar dengan membandingkan `I.quizSelections` dengan kunci jawaban benar.
   - Hitung XP gained = correctCount * step.xpPerCorrect.
   - Jika correctCount === totalQuestions, tambah bonus XP: `step.bonusXpIfAllCorrect`.
   - Tambah XP total lewat `S.addXp(gained + bonus)`.
   - Increment `I.state.scenarios[scenario.id].quizAttempts`.
   - Jika skor > `I.state.scenarios[scenario.id].quizBestScore`, update quizBestScore.
   - Set `I.quizSubmitted = true`.
   - Simpan state dan session.
   - Panggil `window.LakuLearnRender.renderStep()`.
4. Tambah fungsi `retryQuiz()`:
   - Reset `I.quizSelections = {}; I.quizSubmitted = false;`.
   - Panggil `window.LakuLearnRender.renderStep()`.
5. Integrasikan ke fungsi `startScenario`, `goStep`, `nextStep`, `goBack` untuk mengreset quiz state ketika masuk/keluari dari step quiz:
   - Di `startScenario`: jika tipe step saat ini adalah quiz, reset quiz state.
   - Di `goStep`: jika pindah ke/ dari step quiz, reset quiz state.
   - Di `nextStep` dan `goBack`: serupa.
6. Tambah fungsi-fungsi tersebut ke public API `window.LakuLearnScenario`.

### Task 4 — Update learnRender.js
1. Tambah fungsi `renderQuizContent(scenario, step)`:
   - Jika `I.quizSubmitted` false, tampilkan form kuis dengan pertanyaan dan opsi.
   - Setiap pertanyaan ditampilkan dalam div dengan label dan tombol opsi (gunakan gaya serupa dengan choice option).
   - Tombol "Submit" di bawah, disabled jika ada pertanyaan yang belum terpilih.
   - Jika `I.quizSubmitted` true, tampilkan hasil skor per pertanyaan dengan indikator benar/salah (gunakan class seperti di renderChoiceContent).
   - Tampilkan total XP yang diperoleh dan bonus jika ada.
   - Tombol "Ulangi Kuis" yang memanggil `window.LakuLearn.retryQuiz()`.
   - Tombol "Lanjut" yang memanggil `window.LakuLearn.nextStep()` (jika ada step setelah quiz) atau `window.LakuLearn.close()` jika ini adalah step terakhir.
2. Tambah fungsi helper untuk menentukan kelas opsi berdasarkan status (selected, correct, wrong) setelah submit.
3. Update dispatcher `renderStep`:
   - Tambah elseif `step.type === "quiz"` { html += renderQuizContent(scenario, step); }

### Task 5 — Update learnDOM.js (optional)
- Jika diperlukan, tambah caching untuk elemen quiz container untuk mempercepat penetapan innerHTML (biasanya tidak perlu karena kita menggunakan `I.dom.contentArea.innerHTML = html` seperti biasa).

### Task 6 — Update learnActions.js (optional)
- Tidak diperlukan, tetapi kita dapat menambahkan fungsi `refreshQuiz()` yang memanggil `window.LakuLearnRender.renderStep()` jika diperlukan.

### Task 7 — Pengujian dan Validasi
1. Buka learn.html dan pastikan modal pembelajaran berfungsi.
2. Jalani setiap skenario hingga sampai step kuis.
3. Verifikasi bahwa kuis muncul dengan pertanyaan dan opsi.
4. Verifikasi bahwa tidak dapat submit sebelum memilih semua pertanyaan.
5. Verifikasi bahwa submit menghitung skor dengan benar dan memberikan XP.
6. Verifikasi bahwa bonus XP diberikan jika semua jawaban benar.
7. Verifikasi bahwa skor terbaik dan jumlah percobaan disimpan di localStorage.
8. Verifikasi bahwa tombol "Ulangi Kuis" mengatur ulang pilihan dan memungkinkan percobaan baru.
9. Verifikasi bahwa setelah kuis, pengguna masih bisa lanjut ke skenario berikutnya atau tutup modal.
10. Pastikan tidak ada console error.
11. Lakukan regression test pada fungsi-fungsi belajar esistente (dialogue, choice, insight, action, result) untuk memastikan tidak terganggu.

## Validation Checklist

- [ ] Tambah kuis berhasil di skenario 1 (s1) dengan 3 pertanyaan.
- [ ] Pengguna dapat memilih satu opsi per pertanyaan.
- [ ] Tombol Submit disabled hingga semua pertanyaan terpilih.
- [ ] Submit menghitung skor benar dan memberikan XP sesuai konfigurasi.
- [ ] Bonus XP diberikan jika semua jawaban benar.
- [ ] Skor terbaik dan jumlah percobaan disimpan di localStorage dan tetap setelah refresh halaman.
- [ ] Tombol Ulangi Kuis mengreset pilihan dan memungkinkan submisi baru.
- [ ] Setelah kuis, tombol Lanjut tetap berfungsi ke skenario berikutnya.
- [ ] Kuis tidak memengaruhi fungsi tipe step lain (dialogue, choice, insight, action, result).
- [ ] Tidak ada console error di luar selama penggunaan kuis.
- [ ] Data scenario record aktualisasi fields quizScore, quizAttempts, quizBestScore.
- [ ] Service worker tidak membutuhkan update kecuali jika file JS berubah (bump CACHE_NAME jika diperlukan).

## Risiko dan mitigasi

- **Kuis mengganggu alur skenario existente:** Karena kita menambahkan step baru, kita harus memastikan bahwa index step sesuai. Mitigasi: dengan menambahkan step kuis setelah result, kita tidak mengubah urutan step sebelum result, sehingga fungsi seperti nextStep yang berjalan ke index berikutnya akan tetap bekerja karena kita menambahkan step di akhir. Namun, kita perlu memastikan bahwa logika completionscenario (yang terjadi di result step) tetap terjadi sebelum kuis; ini baik karena kuis hanya untuk tambahan.
- **State collision dengan variabel runtime:** Kita menggunakan variabel `I.quizSelections` dan `I.quizSubmitted`. Mitigasi: pastikan variabel ini di-reset pada transisi keluar masuk step quiz dan tidak collided dengan variabel lain seperti `I.selectedChoice`.
- **XP berlebihan:** Pastikan penambahan XP dari kuis tidak menyebabkan integer overflow (tidak masalah). Pastikan kita menggunakan fungsi `S.addXp` yang sudah ada.
- **Kuis terlalu sulit atau terlalu mudah:** Mitigasi: pertanyaan harus relevan dan bisa dijawab setelah membaca skenario. Kita bisa membuat pertanyaan yang langsung mengambil fakta dari insight atau consequence.
- **Penyimpanan state yang besar:** Menambahkan tiga fields numerik per skenario tidak signifikan.
- **Kompatibilitas dengan data lama:** Mitigasi: fungsi normalizeState dan createEmptyScenarioRecord harus menangani record lama dengan memberikan nilai default 0.

## Catatan
Rencana ini mengasumsikan bahwa kuis ditempatkan setelah result step. Jika ingin menempatkan kuis sebelum result (sebagai syarat untuk menyelesaikan skenario), maka ada penyesuaian pada logika completionscenario dan mungkin perlu menambahkan flag quizPassed. Namun, untuk kepraktisan dan minimisasi risiko, kuis sebagai step bonus setelah result lebih aman.

(End of file)