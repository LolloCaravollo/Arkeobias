// Seleziona gli elementi del DOM
const loader = document.getElementById('loader');
const navLogo = document.getElementById('nav-logo');
const homeLink = document.querySelector('.nav-links a[href="index.html"]');

// Funzioni per gestire lo scroll della pagina
function disableScroll() {
  document.body.style.overflow = 'hidden';
}

function enableScroll() {
  document.body.style.overflow = '';
}

// 1. CHIUDE IL LOADER (Da Caricamento a Home)
function dismissLoader() {
  if (loader && !loader.classList.contains('hidden')) {
    loader.classList.add('hidden');
    enableScroll(); // Riapre lo scroll della pagina solo ad animazione avviata
  }
}

// 2. APRI IL LOADER (Da Home a Caricamento)
function openLoader() {
  if (loader) {
    window.scrollTo({ top: 0, behavior: 'instant' });
    loader.classList.remove('hidden');
    disableScroll(); // Blocca lo scroll mentre c'è il loader
  }
}

// All'avvio della pagina blocchiamo lo scroll se il loader è attivo
if (loader && !loader.classList.contains('hidden')) {
  disableScroll();
}

// Rileva lo scroll della rotella verso il basso per CHIUDERE il loader
window.addEventListener('wheel', (e) => {
  if (e.deltaY > 0) { 
    dismissLoader();
  }
}, { passive: true });

// Rileva lo swipe su dispositivi touch
window.addEventListener('touchmove', dismissLoader, { passive: true });

// 3. CLIC SUL LOGO NAVBAR -> Riapre la tendina di caricamento
if (navLogo) {
  navLogo.addEventListener('click', (e) => {
    e.preventDefault();
    openLoader();
  });
}

// 4. CLIC SU "HOME" -> Scroll fluido in cima senza riaprire il loader
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