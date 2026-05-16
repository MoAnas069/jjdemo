export function initHeroLogoShatter() {
  const img = document.getElementById('hero-logo-img');
  if (!img) return;

  const section = document.getElementById('hero');
  
  const canvas = document.createElement('canvas');
  canvas.id = 'hero-particle-canvas';
  canvas.style.position = 'absolute';
  canvas.style.inset = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '1';
  section.insertBefore(canvas, section.firstChild);

  const ctx = canvas.getContext('2d', { alpha: true });
  
  let particles = [];
  let w = window.innerWidth;
  let h = window.innerHeight;
  let logoRect = null;
  
  let shatterActive = false;
  let reforming = false;
  let shatterWaveRadius = 0;
  let shatterOriginX = 0;
  let shatterOriginY = 0;
  let mouseX = -1000;
  let mouseY = -1000;
  
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  
  function resize() {
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  
  window.addEventListener('resize', resize);
  resize();

  // Handle Mouse movement
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Check if mouse is over the logo bounds when idle
    if (!shatterActive && particles.length > 0) {
      const rect = img.getBoundingClientRect();
      if (mouseX >= rect.left && mouseX <= rect.right &&
          mouseY >= rect.top && mouseY <= rect.bottom) {
          
        // Pixel-perfect collision check
        const mx = (mouseX - rect.left) / rect.width;
        const my = (mouseY - rect.top) / rect.height;
        let pixelHit = false;
        
        // Check if cursor is near any actual logo pixel
        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            if (Math.abs(p.nx - mx) < 0.02 && Math.abs(p.ny - my) < 0.02) {
                pixelHit = true;
                break;
            }
        }
        
        if (pixelHit) {
            triggerShatter(mouseX, mouseY, rect);
        }
      }
    }
  });

  // Handle Touch for Mobile
  window.addEventListener('touchstart', (e) => {
    if (!shatterActive && particles.length > 0 && e.touches.length > 0) {
      const touchX = e.touches[0].clientX;
      const touchY = e.touches[0].clientY;
      const rect = img.getBoundingClientRect();
      
      // On mobile, just use a loose bounding box check to make it easy to trigger
      // Expand the hit area slightly for thumbs
      if (touchX >= rect.left - 20 && touchX <= rect.right + 20 &&
          touchY >= rect.top - 20 && touchY <= rect.bottom + 20) {
        // Trigger explosion from touch point
        triggerShatter(touchX, touchY, rect);
      }
    }
  }, { passive: true });

  // Load image and generate relative particles
  const sourceImg = new Image();
  sourceImg.src = img.src;
  sourceImg.crossOrigin = "Anonymous";
  sourceImg.onload = () => {
    const offCanvas = document.createElement('canvas');
    const targetW = 350; // High detail sampling
    const targetH = Math.floor((sourceImg.naturalHeight / sourceImg.naturalWidth) * targetW);
    offCanvas.width = targetW;
    offCanvas.height = targetH;
    const offCtx = offCanvas.getContext('2d', { willReadFrequently: true });
    offCtx.drawImage(sourceImg, 0, 0, targetW, targetH);
    const data = offCtx.getImageData(0, 0, targetW, targetH).data;
    
    const step = 2; // Density
    for (let y = 0; y < targetH; y += step) {
      for (let x = 0; x < targetW; x += step) {
        const i = (y * targetW + x) * 4;
        const a = data[i + 3];
        if (a > 20) {
          // Boost gold vibrancy slightly
          const r = Math.min(255, data[i] * 1.1);
          const g = Math.min(255, data[i+1] * 1.05);
          const b = data[i+2];
          particles.push({
            nx: x / targetW,
            ny: y / targetH,
            color: `rgba(${r}, ${g}, ${b}, ${a / 255})`,
            x: 0, y: 0, vx: 0, vy: 0,
            originX: 0, originY: 0,
            active: false,
            phase: Math.random() * Math.PI * 2
          });
        }
      }
    }
    
    requestAnimationFrame(render);
  };

  let reformTimeout;
  let currentOpacity = 1;

  function triggerShatter(cx, cy, rect) {
    shatterActive = true;
    reforming = false;
    shatterWaveRadius = 0;
    shatterOriginX = cx;
    shatterOriginY = cy;
    logoRect = rect;
    
    // Capture exact opacity in case animation is still running
    const computedStyle = window.getComputedStyle(img);
    currentOpacity = parseFloat(computedStyle.opacity) || 1;
    
    // Hide original image instantly
    img.style.opacity = '0';
    img.style.transition = 'none';
    
    // Setup precise origin targets
    particles.forEach(p => {
      p.originX = rect.left + p.nx * rect.width;
      p.originY = rect.top + p.ny * rect.height;
      p.x = p.originX;
      p.y = p.originY;
      p.active = false;
      p.vx = 0;
      p.vy = 0;
    });
    
    clearTimeout(reformTimeout);
    reformTimeout = setTimeout(() => {
      reforming = true;
    }, 4500); // Wait 4.5s before pulling back
  }

  let time = 0;

  function render() {
    time += 0.016;
    ctx.clearRect(0, 0, w, h);
    
    if (!shatterActive) {
      requestAnimationFrame(render);
      return;
    }
    
    // Advance wave
    if (!reforming) {
      shatterWaveRadius += 30; // 30px per frame explosion wave
    }
    
    let allReformed = true;
    let anyActive = false;

    // Draw masking for unbroken part of logo
    if (shatterWaveRadius > 0 && shatterWaveRadius < Math.max(w, h) && !reforming) {
      ctx.save();
      ctx.beginPath();
      // Outer rect
      ctx.rect(0, 0, w, h);
      // Inner circle (CCW to mask out)
      ctx.arc(shatterOriginX, shatterOriginY, shatterWaveRadius, 0, Math.PI * 2, true);
      ctx.clip();
      
      // Use exact opacity captured at shatter moment
      ctx.globalAlpha = currentOpacity; 
      ctx.drawImage(sourceImg, logoRect.left, logoRect.top, logoRect.width, logoRect.height);
      ctx.restore();
    }
    
    // Apply opacity multiplier to particles
    const globalAlphaMod = currentOpacity;
    
    particles.forEach(p => {
      // Activate particles when wave hits them
      if (!reforming && !p.active) {
        const dx = p.originX - shatterOriginX;
        const dy = p.originY - shatterOriginY;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < shatterWaveRadius) {
          p.active = true;
          // Calculate explosive velocity
          const angle = Math.atan2(dy, dx);
          // Much stronger force to scatter across the whole screen
          const force = Math.max(5, 40 - dist * 0.1) + Math.random() * 15;
          p.vx = Math.cos(angle) * force + (Math.random() - 0.5) * 10;
          p.vy = Math.sin(angle) * force + (Math.random() - 0.5) * 10 - 5; // Upward bias
        }
      }
      
      if (p.active) {
        anyActive = true;
        if (!reforming) {
          // Physics: Chaos and drift
          p.x += p.vx;
          p.y += p.vy;
          
          // Lower friction so they travel much further across the page
          p.vx *= 0.96;
          p.vy *= 0.96;
          
          // Ambient wind/swirl - creates continuous organic drift
          p.x += Math.sin(p.originY * 0.01 + time + p.phase) * 0.8;
          p.y -= 1.2 + Math.cos(p.originX * 0.01 + time) * 0.5; // Stronger upward lift
          
          // Mouse interaction (repel/swirl)
          const mdx = p.x - mouseX;
          const mdy = p.y - mouseY;
          const mdist = Math.sqrt(mdx*mdx + mdy*mdy);
          if (mdist < 180) {
            const mforce = (180 - mdist) / 180;
            // Swirl tangent
            p.vx += (mdx / mdist) * mforce * 1.5 - (mdy / mdist) * mforce * 0.5;
            p.vy += (mdy / mdist) * mforce * 1.5 + (mdx / mdist) * mforce * 0.5;
          }
          allReformed = false;
        } else {
          // Physics: Reforming (Magnetic pull to origin)
          const dx = p.originX - p.x;
          const dy = p.originY - p.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          
          if (dist > 0.5) {
            allReformed = false;
            // Stronger pull the further away they are, creating a snap-in effect
            const pull = 0.03 + (dist * 0.0001); 
            p.vx += dx * pull;
            p.vy += dy * pull;
            p.vx *= 0.86; // dampen
            p.vy *= 0.86;
            p.x += p.vx;
            p.y += p.vy;
          } else {
            p.x = p.originX;
            p.y = p.originY;
            p.active = false;
          }
        }
        
        // Render active particle
        // Subtle shimmer based on velocity and phase
        const speed = Math.sqrt(p.vx*p.vx + p.vy*p.vy);
        const shimmer = 0.8 + Math.sin(time * 5 + p.phase) * 0.2 + Math.min(speed * 0.1, 0.5);
        
        ctx.globalAlpha = Math.min(1, shimmer) * globalAlphaMod;
        ctx.fillStyle = p.color;
        // Make them slightly longer in direction of movement (motion blur)
        if (speed > 2 && !reforming) {
           ctx.save();
           ctx.translate(p.x, p.y);
           ctx.rotate(Math.atan2(p.vy, p.vx));
           ctx.fillRect(-speed*0.5, -1, speed + 1, 2);
           ctx.restore();
        } else {
           ctx.fillRect(p.x, p.y, 2, 2);
        }
        ctx.globalAlpha = 1;
      }
    });
    
    // When completely reformed, return to IDLE state
    if (reforming && allReformed) {
      shatterActive = false;
      img.style.opacity = '1';
      img.style.transition = 'opacity 0.5s ease';
      // We don't need to clear canvas here, next frame handles it
    }
    
    requestAnimationFrame(render);
  }
}
