/* ==========================================================================
   INTERACTIVE.JS — Experiencia de Usuario, Animaciones y Navegación
   Bootcamp Digital Factory & IA 2026 (SENA Regional Atlántico)
   ========================================================================== */

(function () {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --------------------------------------------------------------------------
  // 1. NAVBAR STICKY & CLASE SCROLLED
  // --------------------------------------------------------------------------
  const headerWrapper = document.getElementById('mainHeader');
  if (headerWrapper) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) {
        headerWrapper.classList.add('scrolled');
      } else {
        headerWrapper.classList.remove('scrolled');
      }
    }, { passive: true });
  }

  // --------------------------------------------------------------------------
  // 2. MENÚ HAMBURGUESA MÓVIL Y OVERLAY
  // --------------------------------------------------------------------------
  const hamburger = document.getElementById('navHamburger');
  const navMenu = document.getElementById('navMenu');
  const navOverlay = document.getElementById('navMobileOverlay');

  function openMenu() {
    if (!hamburger || !navMenu) return;
    hamburger.classList.add('active');
    navMenu.classList.add('open');
    if (navOverlay) navOverlay.classList.add('active');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    if (!hamburger || !navMenu) return;
    hamburger.classList.remove('active');
    navMenu.classList.remove('open');
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

  document.querySelectorAll('.nav-link, .btn-nav-register').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // --------------------------------------------------------------------------
  // 3. BARRA DE PROGRESO DE SCROLL
  // --------------------------------------------------------------------------
  const progressBar = document.getElementById('scrollProgress');
  if (progressBar) {
    window.addEventListener('scroll', () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      progressBar.style.width = pct + '%';
    }, { passive: true });
  }

  // --------------------------------------------------------------------------
  // 4. BOTÓN VOLVER ARRIBA
  // --------------------------------------------------------------------------
  const btnBackTop = document.getElementById('btnBackTop');
  if (btnBackTop) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 450) {
        btnBackTop.classList.add('visible');
      } else {
        btnBackTop.classList.remove('visible');
      }
    }, { passive: true });

    btnBackTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // --------------------------------------------------------------------------
  // 5. SCROLL REVEAL CON INTERSECTION OBSERVER
  // --------------------------------------------------------------------------
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length > 0 && !reducedMotion) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -30px 0px'
    });

    revealEls.forEach(el => revealObserver.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('visible'));
  }

  // --------------------------------------------------------------------------
  // 6. ANIMACIÓN DE CONTADORES NUMÉRICOS DE ESTADÍSTICAS
  // --------------------------------------------------------------------------
  function animateCounter(el, target, suffix, duration) {
    let current = 0;
    const step = target / (duration / 16);

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
  if (statNumbers.length > 0 && !reducedMotion) {
    const metricsGrid = document.querySelector('.metrics-grid');
    if (metricsGrid) {
      const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            statNumbers.forEach(el => {
              const raw = el.textContent.trim();
              if (raw.includes('-')) {
                // Rango como "8-6", mantener texto estilizado
                return;
              }
              const match = raw.match(/^(\d+)(.*)$/);
              if (match) {
                const num = parseInt(match[1], 10);
                const suffix = match[2] || '';
                animateCounter(el, num, suffix, 1000);
              }
            });
            statsObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.25 });

      statsObserver.observe(metricsGrid);
    }
  }

  // --------------------------------------------------------------------------
  // 7. EFECTO 3D TILT EN TARJETAS
  // --------------------------------------------------------------------------
  if (!reducedMotion) {
    document.querySelectorAll('.tilt-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) / (rect.width / 2);
        const dy = (e.clientY - cy) / (rect.height / 2);
        const rotX = -dy * 6;
        const rotY = dx * 6;

        card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-4px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  // --------------------------------------------------------------------------
  // 8. PESTAÑAS DE LA AGENDA (DÍA 1 / DÍA 2)
  // --------------------------------------------------------------------------
  const agendaTabs = document.querySelectorAll('.agenda-tab-btn');
  const agendaDia1 = document.getElementById('agendaDia1');
  const agendaDia2 = document.getElementById('agendaDia2');

  agendaTabs.forEach(btn => {
    btn.addEventListener('click', () => {
      agendaTabs.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const target = btn.getAttribute('data-target');
      if (target === '#agendaDia1') {
        if (agendaDia1) agendaDia1.style.display = 'flex';
        if (agendaDia2) agendaDia2.style.display = 'none';
      } else if (target === '#agendaDia2') {
        if (agendaDia1) agendaDia1.style.display = 'none';
        if (agendaDia2) agendaDia2.style.display = 'flex';
      }
    });
  });

  // --------------------------------------------------------------------------
  // 9. SMOOTH SCROLL PARA ENLACES ANCLA
  // --------------------------------------------------------------------------
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#' || targetId === '') return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        const navHeight = headerWrapper ? headerWrapper.offsetHeight : 0;
        const elementPosition = targetEl.getBoundingClientRect().top + window.scrollY;
        const offsetPosition = elementPosition - navHeight - 12;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // --------------------------------------------------------------------------
  // 10. SINCRONIZACIÓN DE ENLACE ACTIVO CON EL SCROLL
  // --------------------------------------------------------------------------
  const sections = document.querySelectorAll('section[id], header[id]');
  const navLinks = document.querySelectorAll('.nav-menu .nav-link');

  if (sections.length && navLinks.length) {
    window.addEventListener('scroll', () => {
      const scrollPos = window.scrollY + 120;
      sections.forEach(section => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        const id = section.getAttribute('id');

        if (scrollPos >= top && scrollPos < top + height) {
          navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === '#' + id) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }
      });
    }, { passive: true });
  }

})();
