/**
 * popup.js - Custom Modal Dialog & Prompt System (LAKU Design Tokens)
 * Replaces native browser alert(), confirm(), and prompt() with custom styled UI.
 */

/**
 * showAlert — Reusable toast/inline alert (warning or error).
 * Warning: for validation reminders (field belum diisi, data kurang, dll).
 * Error: for fatal/unexpected problems (data hilang, operasi gagal, dll).
 *
 * Usage:
 *   window.showAlert({ type: "warning", title: "Perhatian", message: "Isi nama dulu ya!" });
 *   window.showAlert({ type: "error",   title: "Gagal",      message: "Data tidak ditemukan." });
 */
window.showAlert = function ({
  type = "warning",
  title = "",
  message = "",
  duration = 3500,
}) {
  const isWarning = type === "warning";
  const isSuccess = type === "success";

  const overlay = document.createElement("div");
  overlay.className = "fixed top-5 left-1/2 -translate-x-1/2 z-[300] max-w-md w-[92%] animate-fade-in-up";

  let iconSvg, bgClass, iconClass, titleClass, msgClass, closeBtnClass;

  if (isSuccess) {
    iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 shrink-0"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`;
    bgClass = "bg-emerald-50 border-emerald-200";
    iconClass = "text-emerald-700 bg-emerald-100";
    titleClass = "text-emerald-900";
    msgClass = "text-emerald-800";
    closeBtnClass = "text-emerald-700";
  } else if (isWarning) {
    iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 shrink-0"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>`;
    bgClass = "bg-amber-50 border-amber-200";
    iconClass = "text-amber-600 bg-amber-100";
    titleClass = "text-amber-800";
    msgClass = "text-amber-700";
    closeBtnClass = "text-amber-600";
  } else {
    iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 shrink-0"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>`;
    bgClass = "bg-rose-50 border-rose-200";
    iconClass = "text-rose-600 bg-rose-100";
    titleClass = "text-rose-800";
    msgClass = "text-rose-700";
    closeBtnClass = "text-rose-600";
  }

  overlay.innerHTML = `
    <div class="flex items-start gap-3 ${bgClass} border rounded-2xl p-4 shadow-lg backdrop-blur-sm">
      <div class="w-9 h-9 rounded-xl ${iconClass} flex items-center justify-center shrink-0 mt-0.5">
        ${iconSvg}
      </div>
      <div class="flex-1 min-w-0 space-y-0.5">
        ${title ? `<h4 class="text-sm font-bold ${titleClass}">${title}</h4>` : ""}
        <p class="text-sm ${msgClass} leading-relaxed">${message}</p>
      </div>
      <button class="shrink-0 mt-0.5 opacity-50 hover:opacity-100 transition-opacity cursor-pointer ${closeBtnClass}" onclick="this.closest('[class*=fixed]').remove()">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      </button>
    </div>
  `;

  document.body.appendChild(overlay);

  // Auto-dismiss
  setTimeout(() => {
    overlay.classList.add("opacity-0", "transition-opacity", "duration-300");
    setTimeout(() => overlay.remove(), 300);
  }, duration);
};

window.showCustomConfirm = function ({
  title = "Konfirmasi Tindakan",
  message = "Apakah Anda yakin ingin melanjutkan?",
  confirmText = "Ya, Lanjutkan",
  cancelText = "Batal",
  isDanger = false,
}) {
  return new Promise((resolve) => {
    // Remove any existing dialog container
    const existing = document.getElementById("lakuCustomDialogOverlay");
    if (existing) existing.remove();

    const overlay = document.createElement("div");
    overlay.id = "lakuCustomDialogOverlay";
    overlay.className =
      "fixed inset-0 z-[250] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in";

    overlay.innerHTML = `
      <div class="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-stone-100 space-y-6 animate-scale-up text-center">
        <div class="w-14 h-14 rounded-2xl ${isDanger ? "bg-rose-100 text-rose-600" : "bg-emerald-100 text-[#274c43]"} mx-auto flex items-center justify-center">
          ${
            isDanger
              ? `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-7 h-7"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`
              : `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-7 h-7"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>`
          }
        </div>
        <div class="space-y-2">
          <h3 class="text-xl font-bold text-gray-900">${title}</h3>
          <p class="text-gray-500 text-sm leading-relaxed">${message}</p>
        </div>
        <div class="flex items-center gap-3 pt-2">
          <button id="lakuDialogCancelBtn" class="flex-1 py-3 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-gray-700 font-bold text-sm transition-colors cursor-pointer">
            ${cancelText}
          </button>
          <button id="lakuDialogConfirmBtn" class="flex-1 py-3 px-4 rounded-xl ${isDanger ? "bg-rose-600 hover:bg-rose-700 text-white" : "bg-[#274c43] hover:bg-[#1f3d36] text-white"} font-bold text-sm transition-colors shadow-md cursor-pointer">
            ${confirmText}
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const cleanup = (value) => {
      overlay.classList.add("opacity-0", "transition-opacity", "duration-200");
      setTimeout(() => {
        overlay.remove();
        resolve(value);
      }, 200);
    };

    document.getElementById("lakuDialogCancelBtn").addEventListener("click", () => cleanup(false));
    document.getElementById("lakuDialogConfirmBtn").addEventListener("click", () => cleanup(true));
  });
};

window.showCustomPrompt = function ({
  title = "Masukkan Input",
  message = "Silakan isi data berikut:",
  placeholder = "Masukkan nilai...",
  defaultValue = "",
  inputType = "text",
  confirmText = "Simpan",
  cancelText = "Batal",
}) {
  return new Promise((resolve) => {
    const existing = document.getElementById("lakuCustomPromptOverlay");
    if (existing) existing.remove();

    const isNumeric = inputType === "number" || inputType === "currency";
    const actualType = isNumeric ? "text" : inputType;
    const numericEvents = isNumeric ? 'inputmode="numeric" oninput="window.NumberDecimal3Digit(this)"' : '';

    let formattedDefault = defaultValue !== undefined && defaultValue !== null ? defaultValue.toString() : "";
    if (isNumeric && formattedDefault) {
      const raw = formattedDefault.replace(/\D/g, "");
      if (raw) {
        formattedDefault = raw.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
      }
    }

    const overlay = document.createElement("div");
    overlay.id = "lakuCustomPromptOverlay";
    overlay.className =
      "fixed inset-0 z-[250] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in";

    overlay.innerHTML = `
      <div class="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-stone-100 space-y-6 animate-scale-up text-left">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-emerald-100 text-[#274c43] flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
          </div>
          <div>
            <h3 class="text-lg font-bold text-gray-900">${title}</h3>
            <p class="text-gray-500 text-xs mt-0.5">${message}</p>
          </div>
        </div>
        
        <div>
          <input type="${actualType}" ${numericEvents} id="lakuPromptInputField" placeholder="${placeholder}" class="w-full bg-[#f5f5f5] text-black-main font-semibold py-3.5 px-4 rounded-xl outline-none border border-transparent focus:border-[#274c43] text-sm" />
        </div>

        <div class="flex items-center gap-3 pt-2">
          <button id="lakuPromptCancelBtn" class="flex-1 py-3 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-gray-700 font-bold text-sm transition-colors cursor-pointer">
            ${cancelText}
          </button>
          <button id="lakuPromptConfirmBtn" class="flex-1 py-3 px-4 rounded-xl bg-[#274c43] hover:bg-[#1f3d36] text-white font-bold text-sm transition-colors shadow-md cursor-pointer">
            ${confirmText}
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    const inputEl = document.getElementById("lakuPromptInputField");
    inputEl.focus();
    inputEl.select();

    const cleanup = (value) => {
      overlay.classList.add("opacity-0", "transition-opacity", "duration-200");
      setTimeout(() => {
        overlay.remove();
        resolve(value);
      }, 200);
    };

    document.getElementById("lakuPromptCancelBtn").addEventListener("click", () => cleanup(null));
    document.getElementById("lakuPromptConfirmBtn").addEventListener("click", () => {
      cleanup(inputEl.value);
    });

    inputEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        cleanup(inputEl.value);
      } else if (e.key === "Escape") {
        cleanup(null);
      }
    });
  });
};
