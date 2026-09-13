/* ==========================================================================
   INTERACTIVE.JS — Bootcamp Digital Factory 2026
Funcionalidades: Cursor custom, Scroll reveal, Partículas, Stats animados,
    Tilt 3D, Flip countdown, Hero carousel, Hamburger nav, Back-to-top, Progress
   ========================================================================== */

(function () {
  'use strict';

  // ══════════════════════════════════════════════════
  //  PREFERES-REDUCED-MOTION CHECK
  // ══════════════════════════════════════════════════
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ══════════════════════════════════════════════════
  //  1. CURSOR PERSONALIZADO NEON
  // ══════════════════════════════════════════════════
  if (!reducedMotion) {
    const dot  = document.getElementById('cursorDot');
    const ring = document.getElementById('cursorRing');

    if (dot && ring) {
      let mouseX = 0, mouseY = 0;
      let ringX  = 0, ringY  = 0;
      let animId;

      document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        dot.style.left = mouseX + 'px';
        dot.style.top  = mouseY + 'px';
      });

      function animateRing() {
        ringX += (mouseX - ringX) * 0.12;
        ringY += (mouseY - ringY) * 0.12;
        ring.style.left = ringX + 'px';
        ring.style.top  = ringY + 'px';
        animId = requestAnimationFrame(animateRing);
      }
      animateRing();

      // Hover en interactivos
      const hoverTargets = 'a, button, label, [role="button"], .pillar-tag, .info-card, .hero-slide';
      document.querySelectorAll(hoverTargets).forEach(el => {
        el.addEventListener('mouseenter', () => {
          dot.classList.add('cursor-hover');
          ring.classList.add('cursor-hover');
        });
        el.addEventListener('mouseleave', () => {
          dot.classList.remove('cursor-hover');
          ring.classList.remove('cursor-hover');
        });
      });

      // Ocultar cursor cuando sale de la ventana
      document.addEventListener('mouseleave', () => {
        dot.style.opacity  = '0';
        ring.style.opacity = '0';
      });
      document.addEventListener('mouseenter', () => {
        dot.style.opacity  = '1';
        ring.style.opacity = '1';
      });
    }
  }

  // ══════════════════════════════════════════════════
  //  2. NAVBAR STICKY — Clases al hacer scroll
  // ══════════════════════════════════════════════════
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 60) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }, { passive: true });
  }

  // ══════════════════════════════════════════════════
  //  3. HAMBURGER MENU MÓVIL
  // ══════════════════════════════════════════════════
  const hamburger = document.getElementById('navHamburger');
  const navLinks  = document.getElementById('navLinks');
  const navOverlay = document.getElementById('navOverlay');

  function openMenu() {
    if (!hamburger || !navLinks) return;
    hamburger.classList.add('active');
    navLinks.classList.add('open');
    if (navOverlay) navOverlay.classList.add('active');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    if (!hamburger || !navLinks) return;
    hamburger.classList.remove('active');
    navLinks.classList.remove('open');
    if (navOverlay) navOverlay.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (hamburger) {
    hamburger.addEventListener('click', () => {
      if (hamburger.classList.contains('active')) {
        closeMenu();
      } else {
        openMenu();
      }
    });
  }

  if (navOverlay) {
    navOverlay.addEventListener('click', closeMenu);
  }

  // Cerrar al hacer clic en link
  document.querySelectorAll('.nav-close-link').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // ══════════════════════════════════════════════════
  //  4. SCROLL PROGRESS BAR
  // ══════════════════════════════════════════════════
  const progressBar = document.getElementById('scrollProgress');
  if (progressBar) {
    window.addEventListener('scroll', () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      progressBar.style.width = pct + '%';
    }, { passive: true });
  }

  // ══════════════════════════════════════════════════
  //  5. BOTÓN VOLVER ARRIBA
  // ══════════════════════════════════════════════════
  const btnBackTop = document.getElementById('btnBackTop');
  if (btnBackTop) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) {
        btnBackTop.classList.add('visible');
      } else {
        btnBackTop.classList.remove('visible');
      }
    }, { passive: true });

    btnBackTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ══════════════════════════════════════════════════
  //  6. SCROLL REVEAL — IntersectionObserver
  // ══════════════════════════════════════════════════
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length > 0) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    revealEls.forEach(el => revealObserver.observe(el));
  }

  // ══════════════════════════════════════════════════
  //  7. STATS ANIMADOS — Contador al entrar en viewport
  // ══════════════════════════════════════════════════
  function animateCounter(el, target, suffix, duration) {
    const start  = 0;
    const step   = (target - start) / (duration / 16);
    let current  = start;

    const interval = setInterval(() => {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(interval);
      }
      el.textContent = Math.floor(current) + suffix;
    }, 16);
  }

  const statNumbers = document.querySelectorAll('.stat-number');
  if (statNumbers.length > 0) {
    const statsStrip = document.querySelector('.stats-strip');
    if (statsStrip) {
      const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            statNumbers.forEach(el => {
              const raw = el.textContent.trim();
              // Detectar número + sufijo (p.ej. "48h", "8-6", "5", "2")
              const match = raw.match(/^(\d+)(.*)$/);
              if (match) {
                const num    = parseInt(match[1], 10);
                const suffix = match[2] || '';
                animateCounter(el, num, suffix, 1200);
              }
            });
            statsObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.4 });

      statsObserver.observe(statsStrip);
    }
  }

  // ══════════════════════════════════════════════════
  //  8. EFECTO 3D TILT EN CARDS
  // ══════════════════════════════════════════════════
  if (!reducedMotion) {
    document.querySelectorAll('.tilt-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect   = card.getBoundingClientRect();
        const cx     = rect.left + rect.width  / 2;
        const cy     = rect.top  + rect.height / 2;
        const dx     = (e.clientX - cx) / (rect.width  / 2);
        const dy     = (e.clientY - cy) / (rect.height / 2);
        const rotX   = -dy * 8;
        const rotY   =  dx * 8;

        card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-8px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  // ══════════════════════════════════════════════════
  //  9. COUNTDOWN CON ANIMACIÓN FLIP
  // ══════════════════════════════════════════════════
  // (complementa el countdown existente en script.js)
  const cdEls = {
    days:    document.getElementById('cdDays'),
    hours:   document.getElementById('cdHours'),
    minutes: document.getElementById('cdMinutes'),
    seconds: document.getElementById('cdSeconds')
  };

  const prevValues = { days: '', hours: '', minutes: '', seconds: '' };

  function triggerFlip(key, newVal) {
    const el = cdEls[key];
    if (!el) return;
    if (prevValues[key] !== newVal) {
      prevValues[key] = newVal;
      el.classList.remove('flip');
      void el.offsetWidth; // reflow
      el.classList.add('flip');
    }
  }

  // Observar cambios en los elementos del countdown
  const countdownObserver = new MutationObserver((mutations) => {
    mutations.forEach(m => {
      const el = m.target;
      if (el.id === 'cdDays')    triggerFlip('days',    el.textContent);
      if (el.id === 'cdHours')   triggerFlip('hours',   el.textContent);
      if (el.id === 'cdMinutes') triggerFlip('minutes', el.textContent);
      if (el.id === 'cdSeconds') triggerFlip('seconds', el.textContent);
    });
  });

  Object.values(cdEls).forEach(el => {
    if (el) countdownObserver.observe(el, { childList: true, subtree: true, characterData: true });
  });

  // ══════════════════════════════════════════════════
  //  10. HERO CAROUSEL DE IMÁGENES (banner dinámico)
  // ══════════════════════════════════════════════════
  const carousel = document.getElementById('heroCarousel');
  if (carousel) {
    const track = carousel.querySelector('.hero-carousel-track');

    // Imágenes del banner (source/)
    const HERO_SLIDES = [
      {
        img: 'source/act1.jpg',
        tag: 'IA & Automatización',
        caption: 'Registro y acreditación de participantes'
      },
      {
        img: 'source/act2.jpg',
        tag: 'Industria 4.0',
        caption: 'Talleres aplicados en el Nodo TIC'
      },
      {
        img: 'source/act3.jpg',
        tag: 'Mentoría Especializada',
        caption: 'Acompañamiento de expertos del SENA'
      },
      {
        img: 'source/act4.jpg',
        tag: 'Robótica',
        caption: 'Soluciones robóticas para la industria'
      },
      {
        img: 'source/act5.jpg',
        tag: 'Hackathon',
        caption: 'Retos productivos y prototipado rápido'
      },
      {
        img: 'source/act6.jpg',
        tag: 'Trabajo en Equipo',
        caption: 'Aprendices construyendo soluciones digitales'
      },
      {
        img: 'source/act7.jpg',
        tag: 'Demo Day',
        caption: 'Presentaciones finales ante el jurado'
      },
      {
        img: 'source/informacion.png',
        tag: 'Bootcamp 2026',
        caption: 'Información oficial del evento'
      }
    ];

    let current = 0;
    let autoplayTimer = null;
    const AUTOPLAY_MS = 5000;

    function buildSlides() {
      HERO_SLIDES.forEach((slide, i) => {
        const div = document.createElement('div');
        div.className = 'hero-slide' + (i === 0 ? ' active' : '');
        div.setAttribute('role', 'group');
        div.setAttribute('aria-roledescription', 'slide');
        div.setAttribute('aria-label', 'Imagen ' + (i + 1) + ' de ' + HERO_SLIDES.length);

        const bg = document.createElement('div');
        bg.className = 'hero-slide-bg';
        bg.style.backgroundImage = "url('" + slide.img + "')";
        div.appendChild(bg);

        const overlay = document.createElement('div');
        overlay.className = 'hero-slide-overlay';
        div.appendChild(overlay);

        const info = document.createElement('div');
        info.className = 'hero-slide-info';
        info.innerHTML = '<span class="hero-slide-tag">' + slide.tag + '</span>' +
                         '<span class="hero-slide-caption">' + slide.caption + '</span>';
        div.appendChild(info);

        track.appendChild(div);
      });
    }

    function goTo(index) {
      const slides = track.querySelectorAll('.hero-slide');
      if (!slides.length) return;

      const next = (index + slides.length) % slides.length;
      slides[current].classList.remove('active');
      slides[next].classList.add('active');
      current = next;
    }

    function startAutoplay() {
      if (reducedMotion) return;
      stopAutoplay();
      autoplayTimer = setInterval(() => goTo(current + 1), AUTOPLAY_MS);
    }

    function stopAutoplay() {
      if (autoplayTimer) {
        clearInterval(autoplayTimer);
        autoplayTimer = null;
      }
    }

    buildSlides();
    startAutoplay();
  }

  // ══════════════════════════════════════════════════
  //  11. PARTÍCULAS FLOTANTES EN EL HERO
  // ══════════════════════════════════════════════════
  if (!reducedMotion) {
    const canvas = document.getElementById('particles-canvas');
    if (canvas) {
      const ctx    = canvas.getContext('2d');
      const hero   = canvas.closest('.hero-banner-card');
      let W, H, particles;

      function resize() {
        if (!hero) return;
        W = canvas.width  = hero.offsetWidth;
        H = canvas.height = hero.offsetHeight;
      }

      const COLORS = ['rgba(232,253,54,', 'rgba(33,230,193,', 'rgba(123,44,191,'];

      function createParticles(n) {
        return Array.from({ length: n }, () => ({
          x:  Math.random() * W,
          y:  Math.random() * H,
          r:  Math.random() * 2 + 0.5,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          alpha: Math.random() * 0.5 + 0.1,
        }));
      }

      function drawParticles() {
        ctx.clearRect(0, 0, W, H);
        particles.forEach(p => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = p.color + p.alpha + ')';
          ctx.fill();

          p.x += p.vx;
          p.y += p.vy;

          if (p.x < 0)  p.x = W;
          if (p.x > W)  p.x = 0;
          if (p.y < 0)  p.y = H;
          if (p.y > H)  p.y = 0;
        });
        requestAnimationFrame(drawParticles);
      }

      resize();
      particles = createParticles(55);
      drawParticles();

      const resizeObserver = new ResizeObserver(resize);
      if (hero) resizeObserver.observe(hero);
    }
  }

  // ══════════════════════════════════════════════════
  //  12. PILLAR TAGS — Cursor hover dinámico
  //      (complementa CSS, para el cursor custom)
  // ══════════════════════════════════════════════════
  const pillarTags = document.querySelectorAll('.pillar-tag');
  pillarTags.forEach(tag => {
    // Wrapping de spans si no existen
    const text = tag.innerHTML;
    const hasSpan = tag.querySelector('span');
    if (!hasSpan) {
      const icon = tag.querySelector('i');
      if (icon) {
        const textNode = Array.from(tag.childNodes).find(n => n.nodeType === 3 && n.textContent.trim());
        if (textNode) {
          const span = document.createElement('span');
          span.textContent = textNode.textContent;
          tag.replaceChild(span, textNode);
        }
      }
    }
  });

  // ══════════════════════════════════════════════════
  //  13. SMOOTH ANCHOR SCROLL — Para nav links
  // ══════════════════════════════════════════════════
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const navH   = navbar ? navbar.offsetHeight : 0;
        const top    = target.getBoundingClientRect().top + window.scrollY - navH - 16;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // ══════════════════════════════════════════════════
  //  14. DYNAMIC ACTIVE NAV LINK (highlight on scroll)
  // ══════════════════════════════════════════════════
  const sections    = document.querySelectorAll('section[id]');
  const navAnchors  = document.querySelectorAll('.nav-links a[href^="#"]');

  if (sections.length && navAnchors.length) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navAnchors.forEach(a => {
            a.classList.toggle('nav-active', a.getAttribute('href') === '#' + id);
          });
        }
      });
    }, { threshold: 0.35 });

    sections.forEach(s => sectionObserver.observe(s));
  }

  // ══════════════════════════════════════════════════
  //  15. HOVER RE-ATTACH para cursor custom en elementos
  //      dinámicos (agenda tabs que se crean después)
  // ══════════════════════════════════════════════════
  if (!reducedMotion) {
    const dot  = document.getElementById('cursorDot');
    const ring = document.getElementById('cursorRing');
    if (dot && ring) {
      document.querySelectorAll('.btn-back-top, .btn-action-primary, .btn-action-secondary, .btn-submit-registration, .btn-modal-close').forEach(el => {
        el.addEventListener('mouseenter', () => {
          dot.classList.add('cursor-hover');
          ring.classList.add('cursor-hover');
        });
        el.addEventListener('mouseleave', () => {
          dot.classList.remove('cursor-hover');
          ring.classList.remove('cursor-hover');
        });
      });
    }
  }

})();
