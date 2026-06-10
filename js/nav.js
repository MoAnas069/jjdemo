/* ═══════════════════════════════════════════════════════════════
   SHARED NAVIGATION & UI UTILITIES
   Reusable across all pages.
   ═══════════════════════════════════════════════════════════════ */

export function initNavigation() {
  const nav = document.getElementById('main-nav');
  const burger = document.getElementById('nav-burger');
  const links = document.getElementById('nav-links');
  const cta = document.querySelector('.run-light');

  if (!nav) return;

  // Scroll → solid nav
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        nav.classList.toggle('scrolled', window.scrollY > 60);
        ticking = false;
      });
      ticking = true;
    }
  });

  // Hamburger menu
  if (burger && links) {
    burger.addEventListener('click', () => {
      burger.classList.toggle('active');
      links.classList.toggle('mobile-open');
      if (cta) cta.classList.toggle('mobile-open');
      const isOpen = links.classList.contains('mobile-open');
      // Expand nav to full viewport so fixed menu isn't clipped
      nav.classList.toggle('menu-open', isOpen);
      // Lock body scroll so menu fills full viewport
      document.body.style.overflow = isOpen ? 'hidden' : '';
      // Notify particle system to pause/resume
      document.dispatchEvent(new CustomEvent('menu-toggle', { detail: { open: isOpen } }));
    });

    links.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        burger.classList.remove('active');
        links.classList.remove('mobile-open');
        if (cta) cta.classList.remove('mobile-open');
        nav.classList.remove('menu-open');
        document.body.style.overflow = '';
        document.dispatchEvent(new CustomEvent('menu-toggle', { detail: { open: false } }));
      });
    });
  }
}

export function initRevealAnimations() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => observer.observe(el));
}

export function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

export function initCountUp() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.counted) {
        entry.target.dataset.counted = 'true';
        animateCount(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
}

function animateCount(el) {
  const target = parseInt(el.dataset.count, 10);
  const suffix = el.dataset.suffix || '';
  const prefix = el.dataset.prefix || '';
  const duration = 2000;
  const start = performance.now();

  function tick(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    const current = Math.floor(eased * target);
    el.textContent = prefix + current.toLocaleString() + suffix;
    if (progress < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

/* ═══════════════════════════════════════════════════════════════
   INTERACTIVE GOLD DUST PARTICLES (A3)
   ═══════════════════════════════════════════════════════════════ */
export function initGoldDust() {
  const canvas = document.getElementById('ambient-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let animationFrameId = null;
  let particles = [];
  const maxParticles = 60; 
  
  const mouse = { x: null, y: null, radius: 150 };
  let isMenuOpen = false;

  document.addEventListener('menu-toggle', (e) => {
    isMenuOpen = e.detail.open;
  });

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  let lastWidth = window.innerWidth;
  let lastHeight = window.innerHeight;

  function resize() {
    const widthDiff = Math.abs(window.innerWidth - lastWidth);
    const heightDiff = Math.abs(window.innerHeight - lastHeight);
    
    // Only resize canvas if width changes or if height changes significantly (e.g. device rotation)
    // This avoids visual stutters when scrolling on mobile due to the address bar showing/hiding.
    if (widthDiff > 0 || heightDiff > 100) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      lastWidth = window.innerWidth;
      lastHeight = window.innerHeight;
    }
  }

  window.addEventListener('resize', resize);
  resize();

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  class Particle {
    constructor() {
      this.reset(true);
    }

    reset(init = false) {
      this.x = Math.random() * canvas.width;
      this.y = init ? Math.random() * canvas.height : canvas.height + 20;
      this.size = Math.random() * 2 + 0.5;
      this.speedY = Math.random() * 0.4 + 0.1;
      this.speedX = Math.random() * 0.2 - 0.1;
      this.alpha = Math.random() * 0.4 + 0.15;
      this.maxAlpha = this.alpha;
      this.fadeSpeed = Math.random() * 0.005 + 0.002;
      this.wobble = Math.random() * Math.PI * 2;
      this.wobbleSpeed = Math.random() * 0.02 + 0.005;
    }

    update() {
      this.y -= this.speedY;
      this.wobble += this.wobbleSpeed;
      this.x += this.speedX + Math.sin(this.wobble) * 0.15;

      if (mouse.x !== null && mouse.y !== null) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          const angle = Math.atan2(dy, dx);
          
          this.x += Math.cos(angle) * force * 1.5;
          this.y += Math.sin(angle) * force * 1.5;
        }
      }

      if (this.y < -20 || this.x < -20 || this.x > canvas.width + 20) {
        this.reset();
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(176, 141, 87, ${this.alpha})`;
      ctx.fill();
    }
  }

  function initParticles() {
    particles = [];
    for (let i = 0; i < maxParticles; i++) {
      particles.push(new Particle());
    }
  }
  initParticles();

  function animate() {
    if (isMenuOpen || prefersReducedMotion.matches) {
      animationFrameId = requestAnimationFrame(animate);
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
    }

    animationFrameId = requestAnimationFrame(animate);
  }

  animate();
  
  prefersReducedMotion.addEventListener('change', () => {
    if (prefersReducedMotion.matches) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  });
}

/* ═══════════════════════════════════════════════════════════════
   STICKY SCROLL OBSERVER (A2)
   ═══════════════════════════════════════════════════════════════ */
export function initStickyProcess() {
  const stickyImg = document.getElementById('sticky-process-img');
  const cards = document.querySelectorAll('.process-card-sticky');
  
  if (!stickyImg || !cards.length) return;

  const options = {
    root: null,
    rootMargin: '-35% 0px -45% 0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const newImgSrc = entry.target.dataset.image;
        if (newImgSrc && stickyImg.src !== window.location.origin + newImgSrc) {
          stickyImg.style.opacity = '0';
          stickyImg.style.transform = 'scale(0.96)';
          
          setTimeout(() => {
            stickyImg.src = newImgSrc;
            stickyImg.alt = entry.target.querySelector('h3')?.textContent || 'Process Step';
            stickyImg.style.opacity = '1';
            stickyImg.style.transform = 'scale(1)';
          }, 350);
        }
        
        cards.forEach(c => c.classList.remove('active'));
        entry.target.classList.add('active');
      }
    });
  }, options);

  cards.forEach(card => observer.observe(card));
}
