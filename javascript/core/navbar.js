document.addEventListener("DOMContentLoaded", () => {
  const navbar = document.getElementById("navbar");
  const menuBtn = document.getElementById("nav-menu-btn");
  const overlay = document.getElementById("nav-overlay");
  const navLinks = document.querySelectorAll(".nav-link");
  const navbarItemsSection = document.getElementById("items-nav");

  let navbarItems = [
    {
      title: "Beranda",
      link: "/",
      path: "/",
    },
    {
      title: "Tentang",
      link: "./about.html",
      path: "/about",
    },
    {
      title: "Belajar",
      link: "./learn.html",
      path: "/learn",
    },
    {
      title: "Kontak",
      link: "./kontak.html",
      path: "/kontak",
    },
  ];

  let lastScrollY = 0;
  let ticking = false;
  let navbarHidden = false;
  let currentAnim = null;

  function closeMenu() {
    navbar.classList.remove("open");
    overlay.classList.remove("show");
    menuBtn.setAttribute("aria-expanded", "false");
  }

  function openMenu() {
    navbar.classList.add("open");
    overlay.classList.add("show");
    menuBtn.setAttribute("aria-expanded", "true");
  }

  function hideNavbar() {
    if (navbarHidden) return;
    navbarHidden = true;

    if (currentAnim) currentAnim.cancel();

    currentAnim = navbar.animate(
      [
        { opacity: 1, transform: "translateY(0)" },
        { opacity: 0, transform: "translateY(-20px)" },
      ],
      {
        duration: 300,
        easing: "cubic-bezier(0.4, 0, 0.2, 1)",
        fill: "forwards",
      },
    );
  }

  function showNavbar() {
    if (!navbarHidden) return;
    navbarHidden = false;

    if (currentAnim) currentAnim.cancel();

    currentAnim = navbar.animate(
      [
        { opacity: 0, transform: "translateY(-20px)" },
        { opacity: 1, transform: "translateY(0)" },
      ],
      {
        duration: 300,
        easing: "cubic-bezier(0.4, 0, 0.2, 1)",
        fill: "forwards",
      },
    );
  }

  function handleScroll() {
    const currentScrollY = window.pageYOffset;

    if (navbar.classList.contains("open")) {
      lastScrollY = currentScrollY;
      ticking = false;
      return;
    }

    if (currentScrollY > lastScrollY && currentScrollY > 80) {
      hideNavbar();
    } else if (currentScrollY < lastScrollY) {
      showNavbar();
    }

    lastScrollY = currentScrollY;
    ticking = false;
  }

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        requestAnimationFrame(handleScroll);
        ticking = true;
      }
    },
    { passive: true },
  );

  menuBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    navbar.classList.contains("open") ? closeMenu() : openMenu();
  });

  overlay.addEventListener("click", closeMenu);

  navLinks.forEach((link) => link.addEventListener("click", closeMenu));

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  const navbarItemsSectionMapping = navbarItems
    .map(
      (item) => `
  <a
    href=${item.link}
    class="flex items-center justify-between nav-link no-underline text-black-main font-medium group transform transition-all duration-400 text-2xl ${item.path == window.location.pathname ? "text-black-main/50" : "hover:text-black-main/50"}"
    >${item.title}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      class="transform ${item.path == window.location.pathname ? "rotate-45" : "hover:rotate-45"} group-hover:rotate-45 transition-all duration-500"
    >
      <path d="M0 0h24v24H0z" fill="none" />
      <path
        fill="currentColor"
        d="M11 17v4h2v-8h8v-2h-8V3h-2v8H3v2h8z"
      />
    </svg>
  </a>
`,
    )
    .join("");

  navbarItemsSection.innerHTML = `
  ${navbarItemsSectionMapping}
  <div class="mt-2 pt-1 nav-link">
    <a href="./learn.html" class="rounded-2xl py-3 px-5 bg-lime-main hover:bg-lime-200 transition-all duration-300 text-black-main font-semibold w-full flex items-center justify-between gap-4 text-base no-underline cursor-pointer shadow-xs">
      <span>Aplikasi</span> 
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
      >
        <path d="M0 0h24v24H0z" fill="none" />
        <path
          fill="currentColor"
          d="M11 17v4h2v-8h8v-2h-8V3h-2v8H3v2h8z"
        />
      </svg>
    </a>
  </div>
  `;
});
