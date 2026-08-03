// Seleziona elementi del DOM
const loader = document.getElementById('loader');
const navLogo = document.getElementById('nav-logo');
const hamburgerBtn = document.getElementById('hamburger-btn');
const navLinks = document.getElementById('nav-links');

// ==========================================
// 1. DISSOLVENZA PAGINA (PAGE TRANSITIONS)
// ==========================================

// Mostra la pagina con fade-in all'avvio
document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('is-loaded');
});

// Funzione per cambiare pagina con dissolvenza in uscita (Fade-out)
function navigateWithFade(targetUrl) {
  document.body.classList.remove('is-loaded');
  setTimeout(() => {
    window.location.href = targetUrl;
  }, 350); // Corrisponde ai 0.35s della transizione CSS
}

// ==========================================
// 2. GESTIONE SMART DEL LOADER (sessionStorage)
// ==========================================
const hasVisited = sessionStorage.getItem('arkeobias_visited');

function dismissLoader() {
  if (loader && !loader.classList.contains('hidden')) {
    loader.classList.add('hidden');
    sessionStorage.setItem('arkeobias_visited', 'true');

    // Verifica se ci troviamo sulla Home (index.html o root)
    const isHome = window.location.pathname.endsWith('index.html') || 
                   window.location.pathname.endsWith('/') || 
                   window.location.pathname === '';

    // Se lo scroll sul loader avviene da un'altra pagina (es. Archive), porta alla Home
    if (!isHome) {
      navigateWithFade('index.html');
    }
  }
}

// Se l'utente ha già visitato il sito in questa sessione, nasconde il loader subito
if (hasVisited && loader) {
  loader.classList.add('hidden');
}

// Sblocca il loader alla prima rotellata o touch (se visibile)
window.addEventListener('wheel', dismissLoader, { passive: true });
window.addEventListener('touchmove', dismissLoader, { passive: true });


// ==========================================
// 3. FUNZIONE UNIVERSALE PER SCROLL FLUIDO
// ==========================================
function smoothScrollTo(targetPosition, duration = 800) {
  const startPosition = window.pageYOffset || document.documentElement.scrollTop;
  const distance = targetPosition - startPosition;
  let startTime = null;

  function easeInOutCubic(t) {
    return t < 0.5 
      ? 4 * t * t * t 
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function animation(currentTime) {
    if (startTime === null) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const progress = Math.min(timeElapsed / duration, 1);
    const easeProgress = easeInOutCubic(progress);

    window.scrollTo(0, startPosition + (distance * easeProgress));

    if (timeElapsed < duration) {
      requestAnimationFrame(animation);
    }
  }

  requestAnimationFrame(animation);
}


// ==========================================
// 4. GESTIONE HAMBURGER MENU (Mobile & Tablet)
// ==========================================
if (hamburgerBtn && navLinks) {
  hamburgerBtn.addEventListener('click', () => {
    const isOpen = navLinks.classList.contains('is-open');
    navLinks.classList.toggle('is-open', !isOpen);
    hamburgerBtn.classList.toggle('is-open', !isOpen);
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('is-open');
      hamburgerBtn.classList.remove('is-open');
    });
  });
}


// ==========================================
// 5. LOGICA NAVBAR CON DISSOLVENZA
// ==========================================

// CLIC SUL LOGO NAVBAR -> Resetta la sessione per mostrare il Loader e torna alla Home
if (navLogo) {
  navLogo.addEventListener('click', (e) => {
    e.preventDefault();
    sessionStorage.removeItem('arkeobias_visited'); // Forza il loader
    navigateWithFade('index.html');
  });
}

// Gestione dei link (Home, Archive, Volumes, Contacts)
if (navLinks) {
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      const currentPage = window.location.pathname.split('/').pop() || 'index.html';

      // 1. Clic su "Contacts" -> Scroll fluido in fondo
      if (href === '#contacts') {
        e.preventDefault();
        dismissLoader();

        const targetSection = document.querySelector('#contacts');
        if (targetSection) {
          const navHeight = document.querySelector('.navbar')?.offsetHeight || 0;
          const targetPosition = targetSection.offsetTop - navHeight;
          smoothScrollTo(targetPosition, 800);
        }
      } 
      // 2. Clic sul link della PAGINA CORRENTE -> Scroll fluido in cima
      else if (href === currentPage || (href === 'index.html' && (currentPage === '' || currentPage === 'index.html'))) {
        e.preventDefault();
        dismissLoader();
        smoothScrollTo(0, 800);
      }
      // 3. Clic su una PAGINA DIVERSA -> Cambia pagina con dissolvenza (Fade)
      else if (href && !href.startsWith('#')) {
        e.preventDefault();
        navigateWithFade(href);
      }
    });
  });
}


// ==========================================
// 6. ANIMAZIONE CONCEPT (INTERSECTION OBSERVER)
// ==========================================
const conceptSection = document.querySelector('.concept-section');
const galleryTrack = document.querySelector('.gallery-track');

if (conceptSection && galleryTrack) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        galleryTrack.classList.add('is-animated');
      }
    });
  }, { 
    threshold: 0.3 
  });

  observer.observe(conceptSection);
}


// ==========================================
// 7. TOGGLE FLUIDO INPUT NEWSLETTER
// ==========================================
const newsletterToggle = document.getElementById('newsletter-toggle');
const newsletterWrap = document.getElementById('newsletter-input-wrap');

if (newsletterToggle && newsletterWrap) {
  newsletterToggle.addEventListener('click', (e) => {
    e.preventDefault();
    newsletterWrap.classList.toggle('is-open');
  });
}


// ==========================================
// 8. CLIC SUL LOGO FOOTER -> Scroll in cima
// ==========================================
const footerLogo = document.getElementById('footer-logo');

if (footerLogo) {
  footerLogo.addEventListener('click', (e) => {
    e.preventDefault();
    smoothScrollTo(0, 800);
  });
}