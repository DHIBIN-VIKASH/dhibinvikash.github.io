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

  // --- High-End Header Scroll Transitions ---
  const header = document.querySelector('.site-header');
  const heroImage = document.querySelector('.hero__image');
  const heroSection = document.getElementById('hero');

  if (header) {
    const handleScroll = () => {
      const scroll = window.scrollY;

      // If we are on the homepage (has hero section)
      if (heroSection) {
        const threshold = 80;
        if (scroll > threshold) {
          header.classList.add('site-header--scrolled');
        } else {
          header.classList.remove('site-header--scrolled');
        }

        // Suble Hero Image Parallax/Fade
        if (heroImage) {
          const heroHeight = heroSection.offsetHeight;
          if (scroll < heroHeight + 100) {
            const progress = Math.min(scroll / heroHeight, 1);
            heroImage.style.transform = `translateY(${scroll * 0.15}px)`;
            heroImage.style.opacity = Math.max(1 - progress * 1.5, 0);
          }
        }
      } else {
        // Sub-pages: Always show scrolled state background for readability
        // unless they are at the very top and want a transparent start
        if (scroll > 20) {
          header.classList.add('site-header--scrolled');
        } else {
          // You can choose to keep it scrolled or remove it.
          // For Research page, let's allow it to be transparent at top too for that high-end "airy" feel
          header.classList.remove('site-header--scrolled');
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
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
