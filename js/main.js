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
  }, 250); // Corrisponde ai 0.35s della transizione CSS
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
// 6. ANIMAZIONE CONCEPT & ARCHIVE (INTERSECTION OBSERVER)
// ==========================================
const conceptSections = document.querySelectorAll('.concept-section');

if (conceptSections.length > 0) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const galleryTrack = entry.target.querySelector('.gallery-track');
        if (galleryTrack) {
          galleryTrack.classList.add('is-animated');
        }
      }
    });
  }, { 
    threshold: 0.3 
  });

  conceptSections.forEach(section => observer.observe(section));
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

// ==========================================
// 9. PULVISCOLO DI SCAVO DINAMICO (CONTRASTO ADATTIVO)
// ==========================================
(function initDustTrail() {
  let canvas = document.getElementById('dust-canvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'dust-canvas';
    document.body.appendChild(canvas);
  }

  const ctx = canvas.getContext('2d');
  let particles = [];
  
  let mouse = { x: -100, y: -100 };
  let brush = { x: -100, y: -100 };

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    if (brush.x === -100) {
      brush.x = mouse.x;
      brush.y = mouse.y;
    }
  });

  // Classe per i singoli granelli
  class Grain {
    constructor(x, y, speedFactor, colorRgb) {
      const angle = Math.random() * Math.PI * 2;
      const spread = Math.random() * 6;
      this.x = x + Math.cos(angle) * spread;
      this.y = y + Math.sin(angle) * spread;
      
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4 + 0.15;

      this.size = Math.random() * 1.5 + 1;
      this.alpha = Math.min(0.85, 0.4 + speedFactor * 0.5);
      this.decay = Math.random() * 0.012 + 0.009;
      
      // Assegna il colore calcolato (Arkeo White su Contacts, Arkeo Brown altrove)
      this.colorRgb = colorRgb; 
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.alpha -= this.decay;
    }

    draw() {
      ctx.fillStyle = `rgba(${this.colorRgb}, ${Math.max(this.alpha, 0)})`;
      ctx.fillRect(this.x, this.y, this.size, this.size);
    }
  }

  function animateDust() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (mouse.x !== -100) {
      const dx = mouse.x - brush.x;
      const dy = mouse.y - brush.y;
      brush.x += dx * 0.14;
      brush.y += dy * 0.14;

      const distance = Math.hypot(dx, dy);

      if (distance > 0.5) {
        // Controlla se il pennello si trova all'interno della sezione contatti
        const contactsSection = document.querySelector('.contacts-section');
        let particleColor = '206, 184, 167'; // Default: Arkeo Brown

        if (contactsSection) {
          const rect = contactsSection.getBoundingClientRect();
          // Se il cursore è dentro l'area dei contatti
          if (brush.y >= rect.top && brush.y <= rect.bottom && brush.x >= rect.left && brush.x <= rect.right) {
            particleColor = '248, 244, 241'; // Arkeo White
          }
        }

        const count = Math.min(Math.floor(distance * 0.35) + 2, 8);
        for (let i = 0; i < count; i++) {
          particles.push(new Grain(brush.x, brush.y, Math.min(distance / 20, 1), particleColor));
        }
      }
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].update();
      particles[i].draw();

      if (particles[i].alpha <= 0) {
        particles.splice(i, 1);
      }
    }

    requestAnimationFrame(animateDust);
  }

  animateDust();
})();