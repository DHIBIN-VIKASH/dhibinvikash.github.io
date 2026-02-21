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
    // Sync browser theme-color meta to match current theme
    var themeColor = theme === DARK ? '#0d0d0d' : '#faf8f5';
    document.querySelectorAll('meta[name="theme-color"]').forEach(function (meta) {
      meta.setAttribute('content', themeColor);
      meta.removeAttribute('media');
    });
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
  // Scroll Handlers Registry (single listener for all scroll logic)
  // ============================================================
  var scrollHandlers = [];

  // ============================================================
  // High-End Header Scroll Transitions
  // ============================================================
  const header = document.querySelector('.site-header');
  // Target the wrapper so the spinning ring and image move/fade as one unit
  const heroImageWrapper = document.querySelector('.hero__image-wrapper');
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

        // Parallax/Fade on the wrapper — ring + image travel together
        if (heroImageWrapper && !isMobile()) {
          const heroHeight = heroSection.offsetHeight;
          heroImageWrapper.style.willChange = 'transform, opacity';
          if (scroll < heroHeight + 100) {
            const progress = Math.min(scroll / heroHeight, 1);
            heroImageWrapper.style.transform = `translateY(${scroll * 0.15}px)`;
            heroImageWrapper.style.opacity = Math.max(1 - progress * 1.5, 0);
          }
          // Remove will-change after scroll settles to save GPU memory
          clearTimeout(heroImageWrapper._willChangeTimer);
          heroImageWrapper._willChangeTimer = setTimeout(function () {
            heroImageWrapper.style.willChange = 'auto';
          }, 200);
        } else if (heroImageWrapper && isMobile()) {
          // Reset any inline styles set before resize
          heroImageWrapper.style.transform = '';
          heroImageWrapper.style.opacity = '';
        }
      } else {
        // Sub-pages — header is always in scrolled state (avatar always visible)
        header.classList.add('site-header--scrolled');
      }
    };

    scrollHandlers.push(handleScroll);
    handleScroll();
  }

  // ============================================================
  // Scroll-Spy — highlight active nav link as sections enter view
  // ============================================================
  const spyMap = [
    // Home sections
    { sectionId: 'hero', navId: 'nav-home' },
    { sectionId: 'snapshot', navId: 'nav-home' },
    { sectionId: 'projects', navId: 'nav-projects' },
    { sectionId: 'technical', navId: 'nav-projects' },
    { sectionId: 'smr-agents', navId: 'nav-agents' },
    { sectionId: 'about', navId: 'nav-about' },
    // Research sections
    { sectionId: 'publications', navId: 'nav-research' },
    { sectionId: 'active-projects', navId: 'nav-research' },
    // Contact is on all pages
    { sectionId: 'contact', navId: 'nav-contact' },
  ];

  const allNavLinks = document.querySelectorAll('.site-nav__link');

  const spySections = spyMap
    .map(({ sectionId, navId }) => ({
      el: document.getElementById(sectionId),
      navId,
    }))
    .filter(({ el }) => el !== null);

  if (spySections.length > 0) {
    const setActiveNav = (navId) => {
      // Don't override the active state if we are actually ON that page 
      // e.g. if we are on research.html, nav-research should stay active 
      // unless we scroll to bottom (contact)
      const currentPage = window.location.pathname.split('/').pop() || 'index.html';

      allNavLinks.forEach(link => link.classList.remove('site-nav__link--active'));

      // Special case: if on research page, nav-research is default active
      if (currentPage === 'research.html' && (navId === 'nav-home' || !navId)) {
        const researchNav = document.getElementById('nav-research');
        if (researchNav) researchNav.classList.add('site-nav__link--active');
        return;
      }

      const active = document.getElementById(navId);
      if (active) active.classList.add('site-nav__link--active');
    };

    const updateSpy = () => {
      // Trigger point: 40% down the viewport
      const triggerY = window.innerHeight * 0.4;
      // Walk sections in order; last one whose top is above triggerY wins
      let current = null;

      for (const section of spySections) {
        if (section.el.getBoundingClientRect().top <= triggerY) {
          current = section;
        }
      }

      if (current) {
        setActiveNav(current.navId);
      }
    };

    scrollHandlers.push(updateSpy);
    updateSpy(); // set correct state immediately on load
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

  // ============================================================
  // Back to Top Button
  // ============================================================
  const backToTop = document.getElementById('back-to-top');
  if (backToTop) {
    scrollHandlers.push(function () {
      if (window.scrollY > 400) {
        backToTop.classList.add('is-visible');
      } else {
        backToTop.classList.remove('is-visible');
      }
    });

    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ============================================================
  // Unified Scroll Listener (single rAF for all scroll handlers)
  // ============================================================
  if (scrollHandlers.length > 0) {
    var scrollTicking = false;
    window.addEventListener('scroll', function () {
      if (!scrollTicking) {
        requestAnimationFrame(function () {
          for (var i = 0; i < scrollHandlers.length; i++) {
            scrollHandlers[i]();
          }
          scrollTicking = false;
        });
        scrollTicking = true;
      }
    }, { passive: true });
  }

  // ============================================================
  // Page Transitions (subtle wipe + fade between pages)
  // ============================================================
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Entrance animation
  if (!prefersReducedMotion) {
    document.body.classList.add('page-enter');
    // Remove the class after animation completes so it doesn't interfere
    setTimeout(function () {
      document.body.classList.remove('page-enter');
    }, 600);
  }

  // Intercept internal navigation links for smooth page transitions
  const transition = document.getElementById('page-transition');
  if (transition && !prefersReducedMotion) {
    // Find all internal links that navigate between pages (not anchors)
    const internalLinks = document.querySelectorAll(
      'a[href="index.html"], a[href="research.html"], a[href="./index.html"], a[href="./research.html"]'
    );

    internalLinks.forEach(function (link) {
      link.addEventListener('click', function (e) {
        const href = link.getAttribute('href');

        // Skip if modifier key held (user wants new tab)
        if (e.metaKey || e.ctrlKey || e.shiftKey) return;

        // Skip links with hash on the same page
        if (href.includes('#') && !href.startsWith('index.html') && !href.startsWith('research.html')) return;

        e.preventDefault();

        // Activate wipe overlay
        transition.classList.add('is-active');

        // Navigate after the wipe animation
        setTimeout(function () {
          window.location.href = href;
        }, 420);
      });
    });

    // Also handle nav links that point to index.html#section  
    const crossPageAnchors = document.querySelectorAll(
      'a[href^="index.html#"], a[href^="research.html#"]'
    );

    crossPageAnchors.forEach(function (link) {
      link.addEventListener('click', function (e) {
        const href = link.getAttribute('href');
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const targetPage = href.split('#')[0];

        // Only intercept if we're navigating to a DIFFERENT page
        if (targetPage !== currentPage) {
          if (e.metaKey || e.ctrlKey || e.shiftKey) return;
          e.preventDefault();
          transition.classList.add('is-active');
          setTimeout(function () {
            window.location.href = href;
          }, 420);
        }
      });
    });
  }

  // ============================================================
  // Dynamic Copyright Year
  // ============================================================
  var yearSpans = document.querySelectorAll('.copyright-year');
  if (yearSpans.length > 0) {
    var currentYear = new Date().getFullYear();
    yearSpans.forEach(function (span) {
      span.textContent = currentYear;
    });
  }
})();
