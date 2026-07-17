/* ═══════════════════════════════════════════════════════════════
   HERO CINEMATIC VIDEO — Playback Controller & UI Choreography
   Manages video lifecycle: play → pause on final frame → blur →
   staggered component entrance with luxury-motion timing.
   ═══════════════════════════════════════════════════════════════ */

export function initHeroVideo() {
  const video = document.getElementById('hero-video');
  if (!video) return;

  const nav = document.getElementById('main-nav');
  const content = document.querySelector('.hero__content');
  const slogan = document.querySelector('.hero__slogan-container');
  const primaryCta = document.getElementById('cta-consultation');
  const secondaryRow = document.querySelector('.hero__button-row');
  const scrollIndicator = document.getElementById('hero-scroll');

  // ── Track if sequence has already fired ─────────────────────
  let sequenceComplete = false;

  // ── Check if video has played in this session ───────────────
  const hasPlayed = sessionStorage.getItem('heroVideoPlayed') === 'true';

  if (hasPlayed) {
    sequenceComplete = true;
    
    // Hide video instantly
    video.style.display = 'none';

    // Start slideshow immediately
    const slideshow = document.getElementById('hero-slideshow');
    if (slideshow) {
      slideshow.classList.add('active');
      startSlideshow(slideshow);
    }

    // Instantly reveal all UI elements without any transitions/delays
    if (nav) {
      nav.style.opacity = '1';
      nav.style.transform = 'translateY(0)';
    }
    if (content) {
      content.style.opacity = '1';
      content.style.transform = 'translateY(0)';
    }
    if (slogan) {
      slogan.style.opacity = '1';
      slogan.style.transform = 'translateY(0)';
    }
    if (primaryCta) {
      primaryCta.style.opacity = '1';
      primaryCta.style.transform = 'translateY(0)';
    }
    if (secondaryRow) {
      secondaryRow.style.opacity = '1';
      secondaryRow.style.transform = 'translateY(0)';
    }
    if (scrollIndicator) {
      scrollIndicator.style.opacity = '0.75';
    }
    return;
  }

  // ── Select and load responsive video sources based on viewport width ──
  const isMobile = window.innerWidth <= 768;
  video.innerHTML = ''; // Clear default fallback contents

  if (isMobile) {
    video.style.display = 'none';
    beginSettleSequence();
    return;
  }

  const webmSource = document.createElement('source');
  const mp4Source = document.createElement('source');

  webmSource.src = '/joeldesk_clean.webm';
  webmSource.type = 'video/webm';
  mp4Source.src = '/joeldesk_clean.mp4';
  mp4Source.type = 'video/mp4';

  video.appendChild(webmSource);
  video.appendChild(mp4Source);
  video.load();

  // ── Hide UI initially ──────────────────────────────────────
  if (nav) {
    nav.style.opacity = '0';
    nav.style.transform = 'translateY(-18px)';
    nav.style.transition = 'none';
  }
  if (content) {
    content.style.opacity = '0';
    content.style.transform = 'translateY(28px)';
    content.style.transition = 'none';
  }
  if (scrollIndicator) {
    scrollIndicator.style.opacity = '0';
    scrollIndicator.style.transition = 'none';
  }

  // ── Playback: detect final frame & pause ────────────────────
  function onTimeUpdate() {
    if (sequenceComplete) return;

    // Pause ~0.08s before end to land cleanly on last visible frame
    if (video.duration && video.currentTime >= video.duration - 0.08) {
      video.pause();
      video.removeEventListener('timeupdate', onTimeUpdate);
      beginSettleSequence();
    }
  }

  video.addEventListener('timeupdate', onTimeUpdate);

  // Fallback: if 'ended' fires before our timeupdate catches it
  video.addEventListener('ended', () => {
    if (!sequenceComplete) {
      video.pause();
      video.removeEventListener('timeupdate', onTimeUpdate);
      beginSettleSequence();
    }
  }, { once: true });

  // ── Settle sequence: slideshow activation + staggered UI reveal ─
  function beginSettleSequence() {
    if (sequenceComplete) return;
    sequenceComplete = true;

    // Set played flag in sessionStorage
    sessionStorage.setItem('heroVideoPlayed', 'true');

    const LUXURY_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
    const DURATION = '1.6s';

    // Fade out video and start slideshow
    video.classList.add('hero__video--settled');
    const slideshow = document.getElementById('hero-slideshow');
    if (slideshow) {
      slideshow.classList.add('active');
      startSlideshow(slideshow);
    }

    // Nav entrance — immediate
    if (nav) {
      nav.style.transition = `opacity ${DURATION} ${LUXURY_EASE}, transform ${DURATION} ${LUXURY_EASE}`;
      nav.style.opacity = '1';
      nav.style.transform = 'translateY(0)';
    }

    // Hero content wrapper — 100ms stagger
    if (content) {
      setTimeout(() => {
        content.style.transition = `opacity ${DURATION} ${LUXURY_EASE}, transform ${DURATION} ${LUXURY_EASE}`;
        content.style.opacity = '1';
        content.style.transform = 'translateY(0)';
      }, 100);
    }

    // Slogan — 200ms stagger
    if (slogan) {
      slogan.style.opacity = '0';
      slogan.style.transform = 'translateY(18px)';
      slogan.style.transition = 'none';
      setTimeout(() => {
        slogan.style.transition = `opacity ${DURATION} ${LUXURY_EASE}, transform ${DURATION} ${LUXURY_EASE}`;
        slogan.style.opacity = '1';
        slogan.style.transform = 'translateY(0)';
      }, 200);
    }

    // Primary CTA — 450ms stagger
    if (primaryCta) {
      primaryCta.style.opacity = '0';
      primaryCta.style.transform = 'translateY(14px)';
      primaryCta.style.transition = 'none';
      setTimeout(() => {
        primaryCta.style.transition = `opacity 1.4s ${LUXURY_EASE}, transform 1.4s ${LUXURY_EASE}`;
        primaryCta.style.opacity = '1';
        primaryCta.style.transform = 'translateY(0)';
      }, 450);
    }

    // Secondary buttons row — 650ms stagger
    if (secondaryRow) {
      secondaryRow.style.opacity = '0';
      secondaryRow.style.transform = 'translateY(12px)';
      secondaryRow.style.transition = 'none';
      setTimeout(() => {
        secondaryRow.style.transition = `opacity 1.4s ${LUXURY_EASE}, transform 1.4s ${LUXURY_EASE}`;
        secondaryRow.style.opacity = '1';
        secondaryRow.style.transform = 'translateY(0)';
      }, 650);
    }

    // Scroll Indicator — 850ms stagger
    if (scrollIndicator) {
      setTimeout(() => {
        scrollIndicator.style.transition = `opacity 1.4s ${LUXURY_EASE}`;
        scrollIndicator.style.opacity = '0.75';
      }, 850);
    }
  }

  // ── Fallback: if video fails to load, trigger settle sequence ─
  video.addEventListener('error', () => {
    if (!sequenceComplete) {
      beginSettleSequence();
    }
  });

  // ── Fallback: maximum wait time (12s) to prevent stuck state ─
  setTimeout(() => {
    if (!sequenceComplete) {
      video.pause();
      beginSettleSequence();
    }
  }, 12000);
}

// ── Slideshow Logic: Ken Burns Autoplay Controller ─────────────────
function startSlideshow(slideshow) {
  const slides = slideshow.querySelectorAll('.hero__slide');
  if (!slides.length) return;

  let currentSlide = 0;
  // Activate first slide immediately
  slides[currentSlide].classList.add('active');

  // Cycle slides every 5.5s with smooth Ken Burns transition
  setInterval(() => {
    slides[currentSlide].classList.remove('active');
    currentSlide = (currentSlide + 1) % slides.length;
    slides[currentSlide].classList.add('active');
  }, 5500);
}
