document.addEventListener("DOMContentLoaded", () => {
  const row1Data = [
    { type: "text", text: "Produk", style: "white" },
    {
      type: "icon",
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none" /><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16.629 23.25a1.5 1.5 0 0 0 1.06-.439l5.122-5.122a1.5 1.5 0 0 0 .439-1.06V2.25a1.5 1.5 0 0 0-1.5-1.5H7.371a1.5 1.5 0 0 0-1.06.439L1.189 6.311a1.5 1.5 0 0 0-.439 1.06V21.75a1.5 1.5 0 0 0 1.5 1.5zm.621-.135V6.75m-10.5 10.5h16.365M1.189 22.811L6.75 17.25m10.5-10.5l5.561-5.561M17.25 6.75H.885M6.75.885V17.25" /></svg>`,
      style: "green",
    },
    { type: "text", text: "Kemasan", style: "blue" },
    { type: "text", text: "Promosi", style: "white" },
    { type: "text", text: "Pelanggan", style: "blue" },
    {
      type: "icon",
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none" /><path fill="currentColor" d="M4 6V4h16v2zm0 14v-6H3v-2l1-5h16l1 5v2h-1v6h-2v-6h-4v6zm2-2h6v-4H6z" /></svg>`,
      style: "white",
    },
    { type: "text", text: "Pemasukan", style: "blue" },
    { type: "text", text: "Pengeluaran", style: "white" },
    {
      type: "icon",
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 16 16"><path d="M0 0h16v16H0z" fill="none" /><path fill="currentColor" d="M8 1a2.5 2.5 0 0 1 2.5 2.5V4h-5v-.5A2.5 2.5 0 0 1 8 1m3.5 3v-.5a3.5 3.5 0 1 0-7 0V4H1v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4zM2 5h12v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1z" /></svg>
`,
      style: "green",
    },
    { type: "text", text: "Digitalisasi", style: "blue" },
  ];

  const row2Data = [
    {
      type: "icon",
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 640 640"><path d="M0 0h640v640H0z" fill="none" /><path fill="currentColor" d="M320 64c11.2 0 21.7 5.9 27.4 15.5l96 160c5.9 9.9 6.1 22.2.4 32.2S427.5 288 416 288H224c-11.5 0-22.2-6.2-27.8-16.2s-5.5-22.3.4-32.2l96-160C298.3 69.9 308.8 64 320 64M192 336c61.9 0 112 50.1 112 112s-50.1 112-112 112S80 509.9 80 448s50.1-112 112-112m200 16h112c22.1 0 40 17.9 40 40v112c0 22.1-17.9 40-40 40H392c-22.1 0-40-17.9-40-40V392c0-22.1 17.9-40 40-40" /></svg>
`,
      style: "white",
    },
    { type: "text", text: "Pelanggan", style: "blue" },
    {
      type: "icon",
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 15 15"><path d="M0 0h15v15H0z" fill="none" /><path fill="currentColor" d="M0 4.9c.06 1.41.82 2.73 2.15 3.45c1.51.82 3.34.65 4.76-.27l3.17 2.72l-1.64 1.67l1.36 1.16l.99-1.01l.45.39l-1 1.01l1.2 1.03l1.63-1.67l.11.1q.27.21.57.21c.24 0 .48-.1.72-.31l.15-.14c.25-.25.38-.51.38-.77c0-.21-.09-.39-.28-.56L8.44 6.5c1.28-2.14.62-4.78-1.49-5.93C4.81-.58 2.01.23.68 2.37C.19 3.18-.03 4.06 0 4.9m1.64.17c-.07-.85.77-1.7 2.07-1.3c-.69-1.94 2.05-2.78 2.71-.81c.33.96.33 2.78.29 3.62l-.45.02c-.99.02-2.54-.02-3.42-.28c-.79-.24-1.16-.74-1.2-1.25" /></svg>
`,
      style: "white",
    },
    { type: "text", text: "Pengeluaran", style: "green" },
    { type: "text", text: "Digitalisasi", style: "white" },
    { type: "text", text: "Produk", style: "blue" },
    {
      type: "icon",
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 12 12"><path d="M0 0h12v12H0z" fill="none" /><path fill="currentColor" d="M6 7h3V5H8V4H6Zm-5 4h1v-1H1Zm1 1h7v-1H2Zm-2-2h1V3H0Zm3-1h1V8H3Zm1 1h3V9H4ZM2 7h3V4H3v1H2Zm7 4h1v-1H9ZM1 3h1V2H1Zm6 6h1V8H7ZM2 2h7V1H2Zm8 8h1V3h-1ZM9 3h1V2H9Zm0 0" /></svg>
`,
      style: "green",
    },
    { type: "text", text: "Promosi", style: "blue" },
    { type: "text", text: "Kemasan", style: "white" },
    {
      type: "icon",
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none" /><path fill="currentColor" d="M3 6h18v12H3zm9 3a3 3 0 0 1 3 3a3 3 0 0 1-3 3a3 3 0 0 1-3-3a3 3 0 0 1 3-3M7 8a2 2 0 0 1-2 2v4a2 2 0 0 1 2 2h10a2 2 0 0 1 2-2v-4a2 2 0 0 1-2-2z" /></svg>
`,
      style: "green",
    },
  ];

  const getStyleClasses = (type, style) => {
    if (type === "text") {
      if (style === "white")
        return "border border-gray-200 bg-white text-black-main";
      if (style === "blue") return "bg-[#87c4fa] text-black-main";
      if (style === "green") return "bg-[#72bc23] text-black-main";
    } else {
      if (style === "white") return "border border-gray-200 bg-white";
      if (style === "green") return "bg-[#72bc23]";
    }
    return "";
  };

  const renderSet = (data) => {
    return data
      .map((item) => {
        const styleClasses = getStyleClasses(item.type, item.style);
        if (item.type === "text") {
          return `<button class="px-6 py-2.5 rounded-full text-sm font-semibold pointer-events-none whitespace-nowrap ${styleClasses}">${item.text}</button>`;
        } else {
          return `<div class="w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${styleClasses}">${item.svg}</div>`;
        }
      })
      .join("");
  };

  const row1Container = document.getElementById("marquee-row-1");
  const row2Container = document.getElementById("marquee-row-2");

  if (row1Container && row2Container) {
    const row1HTML = `<div class="flex gap-4 items-center">${renderSet(row1Data)}</div>`;
    row1Container.innerHTML = row1HTML + row1HTML;

    const row2HTML = `<div class="flex gap-4 items-center">${renderSet(row2Data)}</div>`;
    row2Container.innerHTML = row2HTML + row2HTML;
  }
});
