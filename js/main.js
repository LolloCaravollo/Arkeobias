// Seleziona elementi del DOM
const loader = document.getElementById('loader');
const navLogo = document.getElementById('nav-logo');
const homeLink = document.querySelector('.nav-links a[href="index.html"]');
const hamburgerBtn = document.getElementById('hamburger-btn');
const navLinks = document.getElementById('nav-links');

// Gestione Scroll della Pagina
function disableScroll() {
  document.body.style.overflow = 'hidden';
}

function enableScroll() {
  document.body.style.overflow = '';
}

// 1. GESTIONE SCHERMATA DI LOADING
function dismissLoader() {
  if (loader && !loader.classList.contains('hidden')) {
    loader.classList.add('hidden');
    enableScroll();
  }
}

function openLoader() {
  if (loader) {
    window.scrollTo({ top: 0, behavior: 'instant' });
    loader.classList.remove('hidden');
    disableScroll();
  }
}

if (loader && !loader.classList.contains('hidden')) {
  disableScroll();
}

window.addEventListener('wheel', (e) => {
  if (e.deltaY > 0) {
    dismissLoader();
  }
}, { passive: true });

window.addEventListener('touchmove', dismissLoader, { passive: true });

// 2. GESTIONE HAMBURGER MENU (Mobile & Tablet)
if (hamburgerBtn && navLinks) {
  hamburgerBtn.addEventListener('click', () => {
    const isOpen = navLinks.classList.contains('is-open');

    if (isOpen) {
      navLinks.classList.remove('is-open');
      hamburgerBtn.classList.remove('is-open');
      enableScroll();
    } else {
      navLinks.classList.add('is-open');
      hamburgerBtn.classList.add('is-open');
      disableScroll();
    }
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('is-open');
      hamburgerBtn.classList.remove('is-open');
      enableScroll();
    });
  });
}

// 3. CLIC SUL LOGO NAVBAR -> Riapre Loader
if (navLogo) {
  navLogo.addEventListener('click', (e) => {
    e.preventDefault();
    openLoader();
  });
}

// 4. CLIC SU "HOME" -> Scroll fluido in cima
if (homeLink) {
  homeLink.addEventListener('click', (e) => {
    const isHomePage = window.location.pathname.endsWith('index.html') || 
                       window.location.pathname.endsWith('/') || 
                       window.location.pathname === '';

    if (isHomePage) {
      e.preventDefault();
      dismissLoader();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
}