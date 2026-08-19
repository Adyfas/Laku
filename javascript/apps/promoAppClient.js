/**
 * promoAppClient.js - Logika Interaktif AI Generator Promo WA & Sosmed
 */
function initPromoAppLogic() {
  const getApiKey = () => {
    try {
      if (typeof window !== "undefined" && window.AI_API_GROQ) return window.AI_API_GROQ;
    } catch (e) {}
    return "";
  };

  const generateAiCaption = async (nama, kategori, tone, detail) => {


    // if (apiKey) {
    //   try {
    //     const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    //       method: "POST",
    //       headers: {
    //         "Content-Type": "application/json",
    //         "Authorization": `Bearer ${apiKey.trim()}`,
    //       },
    //       body: JSON.stringify({
    //         model: "groq/compound-mini",
    //         messages: [
    //           {
    //             role: "system",
    //             content: "Kamu adalah copywriter pemasaran profesional spesialis UMKM Indonesia. Buatkan 1 teks promosi WhatsApp yang sangat menarik, natural, efektif, lengkap dengan emoji dan Call to Action pemesanan.",
    //           },
    //           {
    //             role: "user",
    //             content: `Nama Produk: ${nama}\nKategori: ${kategori}\nGaya Bahasa: ${tone}\nDetail Promo/Keunggulan: ${detail}`,
    //           },
    //         ],
    //         temperature: 0.7,
    //         max_tokens: 300,
    //       }),
    //     });

    //     if (response.ok) {
    //       const json = await response.json();
    //       console.log("Groq AI Response:", json);
    //       if (json.choices && json.choices[0] && json.choices[0].message) {
    //         return {
    //           text: json.choices[0].message.content.trim(),
    //           source: "⚡ AI Groq Copywriter",
    //         };
    //       }
    //     } else {
    //       const errorDetails = await response.json().catch(() => ({}));
    //       console.error("Groq API Error:", response.status, errorDetails);
    //     }
    //   } catch (err) {
    //     console.warn("AI API Fallback to Smart Template:", err);
    //   }
    // }

    // Local recommendation fallback (jika offline / limit / error)
    let templateText = "";
    if (tone === "heboh") {
      templateText = `PROMO GEMPAR ${nama.toUpperCase()}!\n\nJangan sampai kehabisan! Spesial hari ini untuk ${kategori} favoritmu:\n🔥 ${detail} 🔥\n\nStok terbatas banget, yuk langsung klik & chat WhatsApp sekarang sebelum kehabisan promo spesialnya!`;
    } else if (tone === "profesional") {
      templateText = `Penawaran Istimewa dari ${nama}\n\nNikmati kualitas terbaik produk ${kategori} kami. Dapatkan penawaran khusus: ${detail}.\n\nKami siap melayani pemesanan terbaik untuk Anda. Hubungi kami via WhatsApp untuk reservasi & pemesanan.`;
    } else if (tone === "lucu") {
      templateText = `Lagi pusing atau galau? Tenang, ${nama} punya solusinya!\n\nKhusus hari ini ada yang manis/spesial buat kamu: ${detail}!\n\nDaripada nyesel ngebayangin doang, mumpung promo yuk langsung order via WhatsApp sekarang juga!`;
    } else {
      templateText = `PROMO SPESIAL ${nama.toUpperCase()}!\n\nHai Kak! Lagi cari ${kategori} kualitas terbaik?\nDapatkan penawaran menarik: ${detail} khusus hari ini!\n\nSiap melayani pemesanan via WhatsApp. Klik & chat sekarang sebelum promo berakhir ya!`;
    }

    return {
      text: templateText,
      source: "✨ Smart Local Copywriter Engine",
    };
  };

  const promoForm = document.getElementById("promoForm");
  if (promoForm) {
    promoForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const nama = document.getElementById("promoNama").value.trim();
      const kategori = document.getElementById("promoKategori").value;
      const tone = document.getElementById("promoTone").value;
      const detail = document.getElementById("promoDetail").value.trim();

      const submitBtn = document.getElementById("submitPromoAiBtn");
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `Sedang Memproses AI...`;
      }

      const result = await generateAiCaption(nama, kategori, tone, detail);

      document.getElementById("promoTextOutput").textContent = result.text;
      const aiBadge = document.getElementById("aiBadgeStatus");
      if (aiBadge) aiBadge.textContent = result.source;

      document.getElementById("promoResult").classList.remove("hidden");

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4.5 h-4.5"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
          Generate Caption Promosi AI
        `;
      }
    });

    const copyBtn = document.getElementById("copyPromoBtn");
    if (copyBtn) {
      copyBtn.addEventListener("click", () => {
        const text = document.getElementById("promoTextOutput").textContent;
        navigator.clipboard.writeText(text).then(() => {
          copyBtn.innerHTML = `✓ Teks Berhasil Disalin!`;
          setTimeout(() => {
            copyBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4.5 h-4.5"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg> Salin Teks Promosi`;
          }, 2500);
        });
      });
    }
  }
}

function renderPromoApp(container) {
  if (!container) return;
  container.innerHTML = getPromoAppUI();
  initPromoAppLogic();
}
