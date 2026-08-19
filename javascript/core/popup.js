/**
 * popup.js - Custom Modal Dialog & Prompt System (LAKU Design Tokens)
 * Replaces native browser alert(), confirm(), and prompt() with custom styled UI.
 */

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
          <input type="${inputType}" id="lakuPromptInputField" value="${defaultValue}" placeholder="${placeholder}" class="w-full bg-[#f5f5f5] text-black-main font-semibold py-3.5 px-4 rounded-xl outline-none border border-transparent focus:border-[#274c43] text-sm" />
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
