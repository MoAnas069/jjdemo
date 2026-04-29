/* ═══════════════════════════════════════════════════════════════
   HOMEPAGE MAIN — Cinematic Gold Dust Experience
   ═══════════════════════════════════════════════════════════════ */

import { GlitterSystem } from './particles.js';
import { initNavigation, initRevealAnimations, initSmoothScroll } from './nav.js';

document.fonts.ready.then(() => {
  // Initialize cinematic particle system
  const glitter = new GlitterSystem('particle-canvas', 'JR');

  // After particles form THE J, schedule a subtle scroll-triggered scatter
  let scattered = false;
  window.addEventListener('scroll', () => {
    if (!scattered && window.scrollY > window.innerHeight * 0.3) {
      scattered = true;
      glitter.scatter();
    }
    if (scattered && window.scrollY < 100) {
      scattered = false;
      glitter.morphToText('JR');
    }
  });

  initNavigation();
  initRevealAnimations();
  initSmoothScroll();
  initTestimonialsSlider();
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
