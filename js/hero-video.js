/* ═══════════════════════════════════════════════════════════════
   HERO CINEMATIC VIDEO — Playback Controller & UI Choreography
   Manages video lifecycle: play → pause on final frame → blur →
   staggered component entrance with luxury-motion timing.
   ═══════════════════════════════════════════════════════════════ */

export function initHeroVideo() {
  const video = document.getElementById('hero-video');
  if (!video) return;

  // ── Select and load responsive video sources based on viewport width ──
  const isMobile = window.innerWidth <= 768;
  video.innerHTML = ''; // Clear default fallback contents

  const webmSource = document.createElement('source');
  const mp4Source = document.createElement('source');

  if (isMobile) {
    webmSource.src = '/joelmob.webm';
    webmSource.type = 'video/webm';
    mp4Source.src = '/joelmob.mp4';
    mp4Source.type = 'video/mp4';
  } else {
    webmSource.src = '/hero-bg.webm';
    webmSource.type = 'video/webm';
    mp4Source.src = '/Luxury_mansion_drone_reveal_202605270041.mp4';
    mp4Source.type = 'video/mp4';
  }

  video.appendChild(webmSource);
  video.appendChild(mp4Source);
  video.load();

  const nav = document.getElementById('main-nav');
  const content = document.querySelector('.hero__content');
  const slogan = document.querySelector('.hero__slogan');
  const primaryCta = document.getElementById('cta-consultation');
  const secondaryRow = document.querySelector('.hero__buttons-row-new');

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

  // ── Track if sequence has already fired ─────────────────────
  let sequenceComplete = false;

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

  // ── Settle sequence: blur + staggered UI reveal (simultaneous) ─
  function beginSettleSequence() {
    if (sequenceComplete) return;
    sequenceComplete = true;

    const LUXURY_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
    const DURATION = '1.6s';

    // Apply subtle premium blur to frozen final frame — starts WITH the UI entrance
    video.classList.add('hero__video--settled');

    // Nav entrance — immediate (same moment as blur)
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
  }

  // ── Fallback: if video fails to load, reveal UI immediately ─
  video.addEventListener('error', () => {
    if (!sequenceComplete) {
      sequenceComplete = true;
      if (nav) { nav.style.transition = 'opacity 0.8s ease'; nav.style.opacity = '1'; nav.style.transform = 'translateY(0)'; }
      if (content) { content.style.transition = 'opacity 0.8s ease'; content.style.opacity = '1'; content.style.transform = 'translateY(0)'; }
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
