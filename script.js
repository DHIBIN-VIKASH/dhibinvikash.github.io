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

  // Header Scroll Animation (High-Granularity Smooth Transition)
  const header = document.querySelector('.site-header');
  const heroSection = document.getElementById('hero');
  const heroImage = document.querySelector('.hero__image');
  const headerAvatar = document.querySelector('.site-header__avatar');

  if (header && heroSection && heroImage && headerAvatar) {
    const getPos = (el) => {
      const rect = el.getBoundingClientRect();
      return {
        x: rect.left + window.scrollX,
        y: rect.top + window.scrollY,
        w: rect.width
      };
    };

    let startPos = getPos(heroImage);
    const scrollEnd = heroSection.offsetHeight + 200;

    let targetProgress = 0;
    let currentProgress = 0;
    let damping = 0.15;

    let lastScroll = -1;
    const animate = () => {
      const scroll = window.scrollY;
      targetProgress = Math.min(Math.max(scroll / scrollEnd, 0), 1);

      // Interpolate progress
      currentProgress += (targetProgress - currentProgress) * damping;

      if (currentProgress > 0.001) {
        const targetRect = headerAvatar.getBoundingClientRect();

        // Calculate deltas from original document position to current viewport target
        const tx = targetRect.left - (startPos.x - window.scrollX);
        const ty = targetRect.top - (startPos.y - window.scrollY);
        const scale = 32 / startPos.w;

        const eased = 1 - Math.pow(1 - currentProgress, 2.5);

        heroImage.style.transform = `translate3d(${tx * eased}px, ${ty * eased}px, 0) scale(${1 + (scale - 1) * eased})`;

        if (currentProgress > 0.9) {
          header.classList.add('site-header--scrolled');
        } else {
          header.classList.remove('site-header--scrolled');
        }
      } else if (currentProgress <= 0.001 && targetProgress === 0) {
        heroImage.style.transform = 'none';
        header.classList.remove('site-header--scrolled');
        currentProgress = 0;
      }

      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);

    window.addEventListener('resize', () => {
      startPos = getPos(heroImage);
    });
  }

  // --- Advanced Animations (Apple-style) ---
  const revealElements = document.querySelectorAll('.section, .snapshot-card, .pub-entry, .project-entry');

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
    if (el.classList.contains('snapshot-card') || el.classList.contains('pub-entry') || el.classList.contains('project-entry')) {
      const parent = el.parentElement;
      const items = Array.from(parent.children).filter(child =>
        child.classList.contains('snapshot-card') || child.classList.contains('pub-entry') || child.classList.contains('project-entry')
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
