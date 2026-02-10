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

  // Mobile nav toggle
  const navToggle = document.getElementById('nav-toggle');
  const siteNav = document.getElementById('site-nav');

  if (navToggle && siteNav) {
    navToggle.addEventListener('click', function () {
      const isOpen = siteNav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    // Close nav on link click (mobile)
    siteNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        siteNav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Header Scroll Animation (Improved Smooth Avatar Transition)
  const header = document.querySelector('.site-header');
  const heroSection = document.getElementById('hero');
  const heroImage = document.querySelector('.hero__image');
  const headerAvatar = document.querySelector('.site-header__avatar');

  if (header && heroSection && heroImage && headerAvatar) {
    let initialHeroRect = null;
    const scrollEnd = heroSection.offsetHeight - 60; // Dock just before hero ends

    window.addEventListener('scroll', () => {
      if (!initialHeroRect) {
        initialHeroRect = heroImage.getBoundingClientRect();
      }

      const scroll = window.scrollY;
      const progress = Math.min(Math.max(scroll / scrollEnd, 0), 1);

      if (progress > 0) {
        const targetRect = headerAvatar.getBoundingClientRect();

        // Calculate deltas with scroll compensation
        const diffX = targetRect.left + (targetRect.width / 2) - (initialHeroRect.left + (initialHeroRect.width / 2));
        const diffY = (targetRect.top + (targetRect.height / 2)) - (initialHeroRect.top + (initialHeroRect.height / 2)) + scroll;
        const scale = targetRect.width / initialHeroRect.width;

        // Ease out for smoother motion
        const easedProgress = 1 - Math.pow(1 - progress, 3);

        heroImage.style.transform = `translate3d(${diffX * easedProgress}px, ${diffY * easedProgress}px, 0) scale(${1 + (scale - 1) * easedProgress})`;

        if (progress > 0.9) {
          header.classList.add('site-header--scrolled');
        } else {
          header.classList.remove('site-header--scrolled');
        }
      } else {
        heroImage.style.transform = 'none';
        header.classList.remove('site-header--scrolled');
      }
    });
  }

  // Handle resize to recalibrate
  window.addEventListener('resize', () => {
    // Logic for recalibration if needed
  });


  // --- Advanced Animations (Apple-style) ---
  const revealElements = document.querySelectorAll('.section, .hero, .snapshot-card, .pub-entry');

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
    if (el.classList.contains('snapshot-card') || el.classList.contains('pub-entry')) {
      const parent = el.parentElement;
      const items = Array.from(parent.children).filter(child =>
        child.classList.contains('snapshot-card') || child.classList.contains('pub-entry')
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
