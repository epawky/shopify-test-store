/* ============================================
   AUREA PARIS — Scroll Animations & Interactions
   ============================================ */

(function () {
  'use strict';

  /* ── Scroll Reveal ── */
  const revealSelectors = [
    '.section-header',
    '.product-card',
    '.ingredient-card',
    '.testi-card',
    '.story-text > *',
    '.footer-grid > div',
    '.aurea-hero__text > *',
    '.collection-hero__content > *'
  ];

  function initReveal() {
    const elements = document.querySelectorAll(revealSelectors.join(','));
    elements.forEach((el, i) => {
      el.classList.add('aurea-reveal');
      if (!el.dataset.delay) {
        el.dataset.delay = String(i % 4);
      }
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    document.querySelectorAll('.aurea-reveal').forEach((el) => observer.observe(el));
  }

  /* ── Header Scroll Behavior ── */
  function initHeaderScroll() {
    const header = document.querySelector('.aurea-header');
    if (!header) return;

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          header.classList.toggle('header--scrolled', window.scrollY > 60);
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  /* ── Product Card Accordion (PDP) ── */
  function initAccordions() {
    document.querySelectorAll('.pdp-accordion__header').forEach((btn) => {
      btn.addEventListener('click', () => {
        const item = btn.closest('.pdp-accordion__item');
        const isOpen = item.classList.contains('is-open');
        item.classList.toggle('is-open', !isOpen);
      });
    });
  }

  /* ── Init ── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initReveal();
      initHeaderScroll();
      initAccordions();
    });
  } else {
    initReveal();
    initHeaderScroll();
    initAccordions();
  }
})();
