// Theme toggle
(function () {
  const html = document.documentElement;
  const toggle = document.getElementById('theme-toggle');
  const icon = document.getElementById('theme-icon');

  const STORAGE_KEY = 'dv-theme';
  const DARK = 'dark';
  const LIGHT = 'light';

  function applyTheme(theme) {
    html.setAttribute('data-theme', theme);
    icon.textContent = theme === DARK ? '☀' : '☾';
    try { localStorage.setItem(STORAGE_KEY, theme); } catch (e) { /* noop */ }
  }

  // Restore saved preference or respect system preference
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    applyTheme(saved);
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    applyTheme(LIGHT);
  }

  if (toggle) {
    toggle.addEventListener('click', function () {
      const current = html.getAttribute('data-theme') || DARK;
      applyTheme(current === DARK ? LIGHT : DARK);
    });
  }

  // ============================================================
  // Mobile nav toggle with scroll lock & focus trap
  // ============================================================
  const navToggle = document.getElementById('nav-toggle');
  const siteNav = document.getElementById('site-nav');
  let savedScrollY = 0;

  function openNav() {
    savedScrollY = window.scrollY;
    siteNav.classList.add('is-open');
    navToggle.setAttribute('aria-expanded', 'true');
    document.body.classList.add('nav-open');
    document.body.style.top = `-${savedScrollY}px`;
  }

  function closeNav() {
    siteNav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('nav-open');
    document.body.style.top = '';
    window.scrollTo(0, savedScrollY);
  }

  if (navToggle && siteNav) {
    navToggle.addEventListener('click', function () {
      const isOpen = siteNav.classList.contains('is-open');
      if (isOpen) {
        closeNav();
      } else {
        openNav();
      }
    });

    // Close nav on link click (mobile)
    siteNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        if (siteNav.classList.contains('is-open')) {
          closeNav();
        }
      });
    });

    // Close nav on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && siteNav.classList.contains('is-open')) {
        closeNav();
        navToggle.focus();
      }
    });

    // Close nav if viewport resizes past mobile breakpoint
    window.addEventListener('resize', function () {
      if (window.innerWidth > 768 && siteNav.classList.contains('is-open')) {
        closeNav();
      }
    });

    // Focus trap inside open nav
    siteNav.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab' || !siteNav.classList.contains('is-open')) return;

      const focusable = siteNav.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])');
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });
  }

  // ============================================================
  // High-End Header Scroll Transitions
  // ============================================================
  const header = document.querySelector('.site-header');
  const heroImage = document.querySelector('.hero__image');
  const heroSection = document.getElementById('hero');
  const isMobile = () => window.innerWidth <= 768;

  if (header) {
    const handleScroll = () => {
      const scroll = window.scrollY;

      // If we are on the homepage (has hero section)
      if (heroSection) {
        const threshold = 20;
        if (scroll > threshold) {
          header.classList.add('site-header--scrolled');
        } else {
          header.classList.remove('site-header--scrolled');
        }

        // Subtle Hero Image Parallax/Fade — disabled on mobile to prevent jank
        if (heroImage && !isMobile()) {
          const heroHeight = heroSection.offsetHeight;
          if (scroll < heroHeight + 100) {
            const progress = Math.min(scroll / heroHeight, 1);
            heroImage.style.transform = `translateY(${scroll * 0.15}px)`;
            heroImage.style.opacity = Math.max(1 - progress * 1.5, 0);
          }
        } else if (heroImage && isMobile()) {
          // Reset any inline styles that may have been set before resize
          heroImage.style.transform = '';
          heroImage.style.opacity = '';
        }
      } else {
        // Sub-pages
        if (scroll > 20) {
          header.classList.add('site-header--scrolled');
        } else {
          header.classList.remove('site-header--scrolled');
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }

  // ============================================================
  // Advanced Animations (Apple-style reveal)
  // ============================================================
  const revealElements = document.querySelectorAll('.section, .snapshot-card, .pub-entry, .project-entry, .agent-card');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal--visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach((el, index) => {
    el.classList.add('reveal');
    // Stagger list items if needed
    if (el.classList.contains('snapshot-card') || el.classList.contains('pub-entry') || el.classList.contains('project-entry') || el.classList.contains('agent-card')) {
      const parent = el.parentElement;
      const items = Array.from(parent.children).filter(child =>
        child.classList.contains('snapshot-card') || child.classList.contains('pub-entry') || child.classList.contains('project-entry') || child.classList.contains('agent-card')
      );
      const staggerIndex = items.indexOf(el);
      el.style.setProperty('--stagger-index', staggerIndex);
      el.classList.add('stagger-item');
    }
    revealObserver.observe(el);
  });

  // Initialize Lucide icons
  if (window.lucide) {
    window.lucide.createIcons();
  }
})();
