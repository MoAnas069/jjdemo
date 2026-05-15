/* ═══════════════════════════════════════════════════════════════
   LUXURY BUTTON — Gold Dust Particles + House Silhouette
   Canvas-based premium interaction system
   ═══════════════════════════════════════════════════════════════ */

/**
 * House silhouette points (normalized 0-1 coordinate space)
 * Modern luxury architectural outline — abstract, elegant
 */
const HOUSE_POINTS = (() => {
  const pts = [];
  // Main roof peak
  const roofPeak = { x: 0.5, y: 0.18 };
  const roofLeft = { x: 0.15, y: 0.42 };
  const roofRight = { x: 0.85, y: 0.42 };
  // Body
  const bodyBL = { x: 0.18, y: 0.82 };
  const bodyBR = { x: 0.82, y: 0.82 };
  // Secondary roof (modern wing)
  const wingRoofLeft = { x: 0.58, y: 0.35 };
  const wingRoofRight = { x: 0.92, y: 0.48 };
  const wingBR = { x: 0.88, y: 0.82 };

  // Distribute points along roof lines
  const lerp = (a, b, t) => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
  const density = 14;

  // Left roof slope
  for (let i = 0; i <= density; i++) pts.push(lerp(roofLeft, roofPeak, i / density));
  // Right roof slope
  for (let i = 0; i <= density; i++) pts.push(lerp(roofPeak, roofRight, i / density));
  // Left wall
  for (let i = 0; i <= 10; i++) pts.push(lerp(roofLeft, bodyBL, i / 10));
  // Bottom
  for (let i = 0; i <= 12; i++) pts.push(lerp(bodyBL, bodyBR, i / 12));
  // Right wall
  for (let i = 0; i <= 10; i++) pts.push(lerp(roofRight, bodyBR, i / 10));
  // Wing roof
  for (let i = 0; i <= 8; i++) pts.push(lerp(wingRoofLeft, wingRoofRight, i / 8));
  // Wing wall
  for (let i = 0; i <= 6; i++) pts.push(lerp(wingRoofRight, wingBR, i / 6));
  // Door outline (centered bottom)
  const doorL = { x: 0.42, y: 0.82 };
  const doorR = { x: 0.58, y: 0.82 };
  const doorTL = { x: 0.42, y: 0.58 };
  const doorTR = { x: 0.58, y: 0.58 };
  for (let i = 0; i <= 6; i++) pts.push(lerp(doorL, doorTL, i / 6));
  for (let i = 0; i <= 6; i++) pts.push(lerp(doorTL, doorTR, i / 6));
  for (let i = 0; i <= 6; i++) pts.push(lerp(doorTR, doorR, i / 6));
  // Window (left side)
  const winL = { x: 0.24, y: 0.5 };
  const winR = { x: 0.36, y: 0.5 };
  const winBL = { x: 0.24, y: 0.65 };
  const winBR = { x: 0.36, y: 0.65 };
  for (let i = 0; i <= 4; i++) pts.push(lerp(winL, winR, i / 4));
  for (let i = 0; i <= 4; i++) pts.push(lerp(winR, winBR, i / 4));
  for (let i = 0; i <= 4; i++) pts.push(lerp(winBR, winBL, i / 4));
  for (let i = 0; i <= 4; i++) pts.push(lerp(winBL, winL, i / 4));

  return pts;
})();

class Particle {
  constructor(canvasW, canvasH) {
    this.reset(canvasW, canvasH);
    this.targetX = this.x;
    this.targetY = this.y;
    this.formProgress = 0; // 0 = ambient, 1 = formed
    this.assignedPoint = null;
  }

  reset(w, h) {
    this.x = Math.random() * w;
    this.y = Math.random() * h;
    this.vx = (Math.random() - 0.5) * 0.3;
    this.vy = (Math.random() - 0.5) * 0.15;
    this.size = 0.5 + Math.random() * 1.2;
    this.baseAlpha = 0.15 + Math.random() * 0.35;
    this.alpha = this.baseAlpha;
    this.phase = Math.random() * Math.PI * 2;
    this.speed = 0.3 + Math.random() * 0.5;
    this.turbulence = 0.2 + Math.random() * 0.6;
  }

  updateAmbient(time, w, h) {
    // Gentle horizontal drift with turbulence
    this.x += this.vx + Math.sin(time * this.speed + this.phase) * this.turbulence * 0.15;
    this.y += this.vy + Math.cos(time * this.speed * 0.7 + this.phase) * this.turbulence * 0.08;
    this.alpha = this.baseAlpha + Math.sin(time * 1.5 + this.phase) * 0.1;

    // Wrap around
    if (this.x < -5) this.x = w + 5;
    if (this.x > w + 5) this.x = -5;
    if (this.y < -5) this.y = h + 5;
    if (this.y > h + 5) this.y = -5;
  }

  updateForming(time, w, h, progress) {
    if (!this.assignedPoint) return;

    const tx = this.assignedPoint.x * w * 0.7 + w * 0.15;
    const ty = this.assignedPoint.y * h * 0.7 + h * 0.15;

    // Ease toward target
    const ease = 0.03 + progress * 0.06;
    this.x += (tx - this.x) * ease;
    this.y += (ty - this.y) * ease;

    // Add subtle jitter when formed to keep alive
    if (progress > 0.7) {
      this.x += Math.sin(time * 2 + this.phase) * 0.3 * (1 - progress * 0.5);
      this.y += Math.cos(time * 1.8 + this.phase) * 0.2 * (1 - progress * 0.5);
    }

    this.alpha = this.baseAlpha + progress * 0.4;
    this.size = (0.5 + Math.random() * 1.2) * (1 + progress * 0.3);
  }
}

/**
 * Initializes the luxury button effect on the given element.
 * @param {HTMLElement} btn — The button element to enhance.
 */
export function initLuxuryButton(btn) {
  if (!btn) return;

  // ── Create Canvas ──
  const canvas = document.createElement('canvas');
  canvas.className = 'luxury-btn__canvas';
  canvas.setAttribute('aria-hidden', 'true');
  btn.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  // ── Create shimmer overlay ──
  const shimmer = document.createElement('div');
  shimmer.className = 'luxury-btn__shimmer';
  btn.appendChild(shimmer);

  // ── Create light sweep element ──
  const sweep = document.createElement('div');
  sweep.className = 'luxury-btn__sweep';
  btn.appendChild(sweep);

  // ── Particle System ──
  const PARTICLE_COUNT = 300;
  let particles = [];
  let w = 0, h = 0;
  let isHovered = false;
  let hoverProgress = 0; // 0-1 smooth transition
  let formProgress = 0;
  let mouseX = 0, mouseY = 0;
  let offsetX = 0, offsetY = 0;
  let raf = null;
  let time = 0;
  let sweepTriggered = false;

  const dpr = Math.min(2, window.devicePixelRatio || 1);

  function resize() {
    const rect = btn.getBoundingClientRect();
    w = rect.width;
    h = rect.height;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Re-init particles if needed
    if (particles.length === 0) {
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const p = new Particle(w, h);
        // Assign house silhouette points
        if (i < HOUSE_POINTS.length) {
          p.assignedPoint = HOUSE_POINTS[i];
        } else {
          p.assignedPoint = HOUSE_POINTS[i % HOUSE_POINTS.length];
        }
        particles.push(p);
      }
    }
  }

  // ── Magnetic Effect ──
  function onMouseMove(e) {
    const rect = btn.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (isHovered) {
      // Magnetic pull — subtle displacement toward cursor
      const dx = (mouseX - cx) / rect.width;
      const dy = (mouseY - cy) / rect.height;
      const maxDisplace = 4; // px
      offsetX += (dx * maxDisplace - offsetX) * 0.12;
      offsetY += (dy * maxDisplace - offsetY) * 0.12;
    }
  }

  function onMouseEnter() {
    isHovered = true;
    sweepTriggered = false;
    btn.classList.add('luxury-btn--hover');
  }

  function onMouseLeave() {
    isHovered = false;
    sweepTriggered = false;
    btn.classList.remove('luxury-btn--hover');
  }

  // ── Render Loop ──
  function render() {
    time += 0.016;

    // Smooth hover transition
    const hoverTarget = isHovered ? 1 : 0;
    hoverProgress += (hoverTarget - hoverProgress) * 0.04;

    // Form progress — slightly delayed behind hover
    const formTarget = isHovered ? 1 : 0;
    formProgress += (formTarget - formProgress) * 0.025;

    // Magnetic offset easing back
    if (!isHovered) {
      offsetX += (0 - offsetX) * 0.08;
      offsetY += (0 - offsetY) * 0.08;
    }

    // Apply magnetic transform
    const elevate = hoverProgress * -3;
    btn.style.transform = `translate(${offsetX}px, ${offsetY + elevate}px)`;

    // Trigger sweep at 40% hover progress
    if (hoverProgress > 0.4 && !sweepTriggered) {
      sweepTriggered = true;
      sweep.classList.add('active');
      setTimeout(() => sweep.classList.remove('active'), 800);
    }

    // ── Draw Particles ──
    ctx.clearRect(0, 0, w, h);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      p.updateAmbient(time, w, h);

      // Gold color with varying warmth
      const warmth = 0.7 + Math.sin(time + p.phase) * 0.3;
      const r = Math.floor(212 + warmth * 30);
      const g = Math.floor(175 + warmth * 20);
      const b = Math.floor(55 + warmth * 15);

      // Glow layer (subtle bloom) on hover
      if (hoverProgress > 0.1 && p.size > 0.8) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${p.alpha * 0.15 * hoverProgress})`;
        ctx.fill();
      }

      // Core particle
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * (1 + hoverProgress * 0.2), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${p.alpha})`;
      ctx.fill();
    }

    // ── Border Shimmer (idle) ──
    if (hoverProgress < 0.1) {
      const shimmerPos = (time * 0.3) % 1;
      const gradient = ctx.createLinearGradient(0, 0, w, 0);
      gradient.addColorStop(Math.max(0, shimmerPos - 0.15), 'rgba(212,175,55,0)');
      gradient.addColorStop(shimmerPos, 'rgba(212,175,55,0.12)');
      gradient.addColorStop(Math.min(1, shimmerPos + 0.15), 'rgba(212,175,55,0)');
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 1;
      ctx.strokeRect(0.5, 0.5, w - 1, h - 1);
    }

    raf = requestAnimationFrame(render);
  }

  // ── Event Listeners ──
  btn.addEventListener('mouseenter', onMouseEnter);
  btn.addEventListener('mouseleave', onMouseLeave);
  btn.addEventListener('mousemove', onMouseMove);

  const ro = new ResizeObserver(resize);
  ro.observe(btn);
  resize();

  raf = requestAnimationFrame(render);

  // ── Cleanup ──
  return {
    destroy() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      btn.removeEventListener('mouseenter', onMouseEnter);
      btn.removeEventListener('mouseleave', onMouseLeave);
      btn.removeEventListener('mousemove', onMouseMove);
      canvas.remove();
      shimmer.remove();
      sweep.remove();
    }
  };
}
