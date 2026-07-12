document.addEventListener('DOMContentLoaded', () => {
  const navbar  = document.getElementById('navbar');
  const menuBtn = document.getElementById('nav-menu-btn');
  const overlay = document.getElementById('nav-overlay');
  const navLinks = document.querySelectorAll('.nav-link');

  let lastScrollY = 0;
  let ticking = false;
  let navbarHidden = false;
  let currentAnim = null;

  function closeMenu() {
    navbar.classList.remove('open');
    overlay.classList.remove('show');
    menuBtn.setAttribute('aria-expanded', 'false');
  }

  function openMenu() {
    navbar.classList.add('open');
    overlay.classList.add('show');
    menuBtn.setAttribute('aria-expanded', 'true');
  }

  function hideNavbar() {
    if (navbarHidden) return;
    navbarHidden = true;

    if (currentAnim) currentAnim.cancel();

    currentAnim = navbar.animate([
      { opacity: 1, transform: 'translateY(0)' },
      { opacity: 0, transform: 'translateY(-20px)' }
    ], {
      duration: 300,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)', 
      fill: 'forwards'
    });
  }

  function showNavbar() {
    if (!navbarHidden) return;
    navbarHidden = false;

    if (currentAnim) currentAnim.cancel();

    currentAnim = navbar.animate([
      { opacity: 0, transform: 'translateY(-20px)' },
      { opacity: 1, transform: 'translateY(0)' }
    ], {
      duration: 300,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      fill: 'forwards'
    });
  }

  function handleScroll() {
    const currentScrollY = window.pageYOffset;

    if (navbar.classList.contains('open')) {
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

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(handleScroll);
      ticking = true;
    }
  }, { passive: true });

  menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    navbar.classList.contains('open') ? closeMenu() : openMenu();
  });

  overlay.addEventListener('click', closeMenu);

  navLinks.forEach(link => link.addEventListener('click', closeMenu));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });
});
