// ==========================================================
// 1. MOTORE PARTICOLARE CANVAS (POLVERE DI SCAVO INERZIALE)
// ==========================================================
(function initDustTrail() {
  const canvas = document.getElementById('dust-canvas') || (() => {
    const c = document.createElement('canvas');
    c.id = 'dust-canvas';
    document.body.appendChild(c);
    return c;
  })();

  const ctx = canvas.getContext('2d');
  let particles = [];
  let mouse = { x: -100, y: -100 };
  let brush = { x: -100, y: -100 };

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    if (brush.x === -100) {
      brush.x = mouse.x;
      brush.y = mouse.y;
    }
  });

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
      brush.x += dx * 0.14; // Inerzia (Lerp)
      brush.y += dy * 0.14;

      const distance = Math.hypot(dx, dy);

      if (distance > 0.5) {
        // Contrasto cromatico adattivo sopra la sezione contatti
        const contacts = document.querySelector('.contacts-section');
        let color = '206, 184, 167'; // Arkeo Brown

        if (contacts) {
          const rect = contacts.getBoundingClientRect();
          if (brush.y >= rect.top && brush.y <= rect.bottom && brush.x >= rect.left && brush.x <= rect.right) {
            color = '248, 244, 241'; // Arkeo White
          }
        }

        const count = Math.min(Math.floor(distance * 0.35) + 2, 8);
        for (let i = 0; i < count; i++) {
          particles.push(new Grain(brush.x, brush.y, Math.min(distance / 20, 1), color));
        }
      }
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].update();
      particles[i].draw();
      if (particles[i].alpha <= 0) particles.splice(i, 1);
    }

    requestAnimationFrame(animateDust);
  }

  animateDust();
})();


// ==========================================================
// 2. TRANSIZIONI PAGINA E GESTIONE SESSIONE (LOADER GSAP)
// ==========================================================
document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('is-loaded');
});

function navigateWithFade(url) {
  document.body.classList.remove('is-loaded');
  setTimeout(() => {
    window.location.href = url;
  }, 350);
}

const loader = document.getElementById('loader');
const hasVisited = sessionStorage.getItem('arkeobias_visited');
let isDismissing = false;
let heroTween = null;

// Prepara e nasconde i caratteri per eliminare qualsiasi micro-flash (FOUC)
function setupHeroTitle() {
  const heroTitle = document.querySelector('.hero-title');
  if (heroTitle && typeof gsap !== 'undefined' && typeof SplitType !== 'undefined') {
    if (!heroTitle.classList.contains('is-split')) {
      heroTitle.classList.add('is-split');
      const splitHero = new SplitType(heroTitle, { types: 'words, chars', tagName: 'span' });

      // Se il loader è ancora visibile a schermo, azzera istantaneamente l'opacità
      if (!hasVisited && loader && loader.style.display !== 'none') {
        gsap.set(splitHero.chars, {
          opacity: 0,
          x: -25,
          y: 35,
          filter: 'blur(8px)'
        });
      }

      heroTween = gsap.to(splitHero.chars, {
        opacity: 1,
        x: 0,
        y: 0,
        filter: 'blur(0px)',
        duration: 1.2,
        ease: 'power3.out',
        stagger: 0.025,
        paused: true
      });

      // Se il loader non c'è o è già stato visto, avvia subito
      if (hasVisited || !loader || loader.style.display === 'none') {
        heroTween.play();
      }
    }
  }
}

function dismissLoader() {
  if (!loader || isDismissing || loader.style.display === 'none') {
    return;
  }

  isDismissing = true;
  sessionStorage.setItem('arkeobias_visited', 'true');

  window.removeEventListener('wheel', dismissLoader);
  window.removeEventListener('touchmove', dismissLoader);

  // Mantiene il logo solido al 100% durante la risalita
  loader.classList.add('is-sliding');

  if (typeof gsap !== 'undefined') {
    const tl = gsap.timeline({
      onComplete: () => {
        loader.style.display = 'none';
        loader.classList.add('hidden');
      }
    });

    // Il loader scorre verso l'alto con inerzia fluida
    tl.to(loader, {
      yPercent: -100,
      duration: 1.0,
      ease: 'power3.inOut'
    });

    // Avvia i caratteri della Hero mentre il loader lascia lo schermo
    tl.add(() => {
      if (heroTween) heroTween.play();
    }, '-=0.55');

  } else {
    loader.style.display = 'none';
    loader.classList.add('hidden');
    if (heroTween) heroTween.play();
  }
}

if (hasVisited && loader) {
  loader.style.display = 'none';
  loader.classList.add('hidden');
} else if (loader) {
  window.addEventListener('wheel', dismissLoader, { passive: true });
  window.addEventListener('touchmove', dismissLoader, { passive: true });
}


// ==========================================================
// 3. NAVBAR & SMOOTH SCROLL (GSAP SCROLLTO PLUGIN)
// ==========================================================
const navLogo = document.getElementById('nav-logo');
const navLinks = document.getElementById('nav-links');
const hamburgerBtn = document.getElementById('hamburger-btn');
const footerLogo = document.getElementById('footer-logo');

if (typeof gsap !== 'undefined' && typeof ScrollToPlugin !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
}

function smoothScroll(target) {
  if (typeof gsap !== 'undefined' && typeof ScrollToPlugin !== 'undefined') {
    const navHeight = document.querySelector('.navbar')?.offsetHeight || 0;
    gsap.to(window, {
      scrollTo: { y: target, offsetY: target === 0 ? 0 : navHeight },
      duration: 0.9,
      ease: 'power3.inOut'
    });
  } else {
    window.scrollTo({ top: target, behavior: 'smooth' });
  }
}

if (navLogo) {
  navLogo.addEventListener('click', (e) => {
    e.preventDefault();
    sessionStorage.removeItem('arkeobias_visited');
    navigateWithFade('index.html');
  });
}

if (footerLogo) {
  footerLogo.addEventListener('click', (e) => {
    e.preventDefault();
    smoothScroll(0);
  });
}

if (navLinks) {
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      const currentPage = window.location.pathname.split('/').pop() || 'index.html';

      if (href === '#contacts') {
        e.preventDefault();
        dismissLoader();
        const contacts = document.querySelector('#contacts');
        if (contacts) smoothScroll(contacts);
      } else if (href === currentPage || (href === 'index.html' && (currentPage === '' || currentPage === 'index.html'))) {
        e.preventDefault();
        dismissLoader();
        smoothScroll(0);
      } else if (href && !href.startsWith('#')) {
        e.preventDefault();
        navigateWithFade(href);
      }
    });
  });
}

// Menu Mobile
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

// Newsletter Toggle
const newsletterToggle = document.getElementById('newsletter-toggle');
const newsletterWrap = document.getElementById('newsletter-input-wrap');
if (newsletterToggle && newsletterWrap) {
  newsletterToggle.addEventListener('click', (e) => {
    e.preventDefault();
    newsletterWrap.classList.toggle('is-open');
  });
}


// ==========================================================
// 4. ANIMAZIONI GSAP (SPLIT-TYPE & SCROLLTRIGGER)
// ==========================================================
window.addEventListener('load', () => {
  if (typeof gsap !== 'undefined' && typeof SplitType !== 'undefined') {
    setupHeroTitle();
  }

  if (typeof gsap === 'undefined') return;

  try {
    // 1. Titoli di sezione con ScrollTrigger (Concept, Archive, Volumes)
    const headings = document.querySelectorAll('.concept-text h2, .volume-title');
    headings.forEach((heading) => {
      const splitHeading = new SplitType(heading, { types: 'words, chars', tagName: 'span' });
      gsap.from(splitHeading.chars, {
        scrollTrigger: {
          trigger: heading,
          start: 'top 85%',
          once: true
        },
        opacity: 0,
        x: -18,
        y: 20,
        filter: 'blur(6px)',
        duration: 0.9,
        ease: 'power2.out',
        stagger: 0.02
      });
    });

    // 2. Gallerie orizzontali
    const galleries = document.querySelectorAll('.gallery-track');
    galleries.forEach((gallery) => {
      ScrollTrigger.create({
        trigger: gallery,
        start: 'top 80%',
        once: true,
        onEnter: () => gallery.classList.add('is-animated')
      });
    });

    // 3. Schede Volumi con ScrollTrigger
    const cards = document.querySelectorAll('.volume-card');
    cards.forEach((card) => {
      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: 'top 82%',
          once: true
        },
        opacity: 0,
        y: 45,
        duration: 0.85,
        ease: 'power2.out'
      });
    });

  } catch (err) {
    console.error('Errore durante le animazioni GSAP:', err);
  }
});