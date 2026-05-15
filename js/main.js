/* ═══════════════════════════════════════════════════════════════
   HOMEPAGE MAIN — Prism Hero + UI Systems
   ═══════════════════════════════════════════════════════════════ */

import { createMagicRings } from './MagicRings.js';
import { initLuxuryButton } from './LuxuryButton.js';
import { initNavigation, initRevealAnimations, initSmoothScroll } from './nav.js';

document.fonts.ready.then(() => {
  // Initialize MagicRings WebGL effect in the hero section
  const container = document.getElementById('hero-light-rays');
  if (container) {
    container.style.pointerEvents = 'auto';

    createMagicRings(container, {
      color: '#EAB308',
      colorTwo: '#4e3d06',
      ringCount: 6,
      speed: 1,
      attenuation: 10,
      lineThickness: 2,
      baseRadius: 0.35,
      radiusStep: 0.1,
      scaleRate: 0.1,
      opacity: 1,
      blur: 0,
      noiseAmount: 0.1,
      rotation: 0,
      ringGap: 1.5,
      fadeIn: 0.7,
      fadeOut: 0.5,
      followMouse: false,
      mouseInfluence: 0.15,
      hoverScale: 1.05,
      parallax: 0.05,
      clickBurst: false,
    });
  }

  initNavigation();
  initRevealAnimations();
  initSmoothScroll();
  initTestimonialsSlider();

  // Initialize luxury particle button on "Buy Your Home" CTA
  const buyBtn = document.getElementById('cta-buy');
  if (buyBtn) initLuxuryButton(buyBtn);
});

/* ═══════════════════════════════════════════════════════════════
   TESTIMONIALS SLIDER — Elegant Auto-Play
   ═══════════════════════════════════════════════════════════════ */
function initTestimonialsSlider() {
  const track = document.getElementById('slider-track');
  const dotsContainer = document.getElementById('slider-dots');
  const slider = document.getElementById('testimonials-slider');
  if (!track || !dotsContainer) return;

  const cards = track.querySelectorAll('.testimonial-card');
  const dots = dotsContainer.querySelectorAll('.slider-dot');
  const total = cards.length;
  let current = 0;
  let autoPlayTimer = null;

  function goTo(index) {
    current = ((index % total) + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;

    // Reset dot progress animations
    dots.forEach((d, i) => {
      d.classList.remove('active');
      // Force reflow to restart CSS animation
      void d.offsetWidth;
      if (i === current) d.classList.add('active');
    });
  }

  function next() { goTo(current + 1); }

  // Dot clicks
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      goTo(parseInt(dot.dataset.index, 10));
      resetAutoPlay();
    });
  });

  // Auto-play every 5s
  function startAutoPlay() {
    autoPlayTimer = setInterval(next, 5000);
  }
  function resetAutoPlay() {
    clearInterval(autoPlayTimer);
    startAutoPlay();
  }

  // Pause on hover, resume on leave
  if (slider) {
    slider.addEventListener('mouseenter', () => clearInterval(autoPlayTimer));
    slider.addEventListener('mouseleave', () => startAutoPlay());
  }

  // Touch swipe support
  let touchStartX = 0;
  track.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });
  track.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].screenX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goTo(current + 1); else goTo(current - 1);
      resetAutoPlay();
    }
  }, { passive: true });

  startAutoPlay();
}
