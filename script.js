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
    const getCenter = (el) => {
      const rect = el.getBoundingClientRect();
      return {
        x: rect.left + rect.width / 2 + window.scrollX,
        y: rect.top + rect.height / 2 + window.scrollY,
        w: rect.width
      };
    };

    let start = getCenter(heroImage);
    const scrollEnd = heroSection.offsetHeight + 400;

    let lastScroll = -1;
    const updateAvatar = () => {
      const scroll = window.scrollY;
      if (scroll !== lastScroll) {
        lastScroll = scroll;
        const progress = Math.min(Math.max(scroll / scrollEnd, 0), 1);

        if (progress > 0) {
          const target = getCenter(headerAvatar);
          const targetVisualY = target.y - scroll;
          const startAbsY = start.y;

          const tx = target.x - start.x;
          const ty = targetVisualY - startAbsY + scroll;
          const scale = 32 / start.w;

          // Use a more granular easing function for better response
          const eased = 1 - Math.pow(1 - progress, 2.5);

          // Apply transforms using translate3d for hardware acceleration
          heroImage.style.transform = `translate3d(${tx * eased}px, ${ty * eased}px, 0) scale(${1 + (scale - 1) * eased})`;

          if (progress > 0.9) {
            header.classList.add('site-header--scrolled');
          } else {
            header.classList.remove('site-header--scrolled');
          }
        } else {
          heroImage.style.transform = 'none';
          header.classList.remove('site-header--scrolled');
        }
      }
      requestAnimationFrame(updateAvatar);
    };

    // Start the granular update loop
    requestAnimationFrame(updateAvatar);

    window.addEventListener('resize', () => {
      start = getCenter(heroImage);
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
