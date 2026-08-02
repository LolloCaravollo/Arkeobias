// Seleziona elementi del DOM
const loader = document.getElementById('loader');
const navLogo = document.getElementById('nav-logo');
const homeLink = document.querySelector('.nav-links a[href="index.html"], .nav-links a[href="#"]');
const hamburgerBtn = document.getElementById('hamburger-btn');
const navLinks = document.getElementById('nav-links');
const contactLink = document.querySelector('a[href="#contacts"]');

// ==========================================
// FUNZIONE UNIVERSALE PER SCROLL FLUIDO (rAF)
// ==========================================
function smoothScrollTo(targetPosition, duration = 800) {
  const startPosition = window.pageYOffset || document.documentElement.scrollTop;
  const distance = targetPosition - startPosition;
  let startTime = null;

  // Curva di accelerazione/decelerazione morbida (easeInOutCubic)
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

// 1. GESTIONE SCHERMATA DI LOADING
function dismissLoader() {
  if (loader && !loader.classList.contains('hidden')) {
    loader.classList.add('hidden');
  }
}

// Sblocca il loader alla prima rotellata o touch
window.addEventListener('wheel', dismissLoader, { passive: true });
window.addEventListener('touchmove', dismissLoader, { passive: true });

// 2. GESTIONE HAMBURGER MENU (Mobile & Tablet)
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

// 3. CLIC SUL LOGO NAVBAR -> Riapre Loader e torna in cima
if (navLogo) {
  navLogo.addEventListener('click', (e) => {
    e.preventDefault();
    if (loader) {
      loader.classList.remove('hidden');
    }
    smoothScrollTo(0, 800);
  });
}

// 4. CLIC SU "HOME" -> Scroll fluido in cima (800ms)
if (homeLink) {
  homeLink.addEventListener('click', (e) => {
    e.preventDefault();
    dismissLoader();
    smoothScrollTo(0, 800);
  });
}

// 5. CLIC SU "CONTACTS" -> Scroll fluido ai contatti (800ms)
if (contactLink) {
  contactLink.addEventListener('click', (e) => {
    e.preventDefault();
    dismissLoader();

    const targetSection = document.querySelector('#contacts');
    if (targetSection) {
      const navHeight = document.querySelector('.navbar')?.offsetHeight || 0;
      const targetPosition = targetSection.offsetTop - navHeight;
      
      smoothScrollTo(targetPosition, 800);
    }
  });
}

// 6. AVVIO ANIMAZIONE CONCEPT SOLO QUANDO VISIBILE SULLO SCHERMO
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

// 7. TOGGLE FLUIDO INPUT NEWSLETTER
const newsletterToggle = document.getElementById('newsletter-toggle');
const newsletterWrap = document.getElementById('newsletter-input-wrap');

if (newsletterToggle && newsletterWrap) {
  newsletterToggle.addEventListener('click', (e) => {
    e.preventDefault();
    newsletterWrap.classList.toggle('is-open');
  });
}

// 8. CLIC SUL LOGO DEL FOOTER -> Scroll fluido in cima (800ms)
const footerLogo = document.getElementById('footer-logo');

if (footerLogo) {
  footerLogo.addEventListener('click', (e) => {
    e.preventDefault();
    smoothScrollTo(0, 800);
  });
}