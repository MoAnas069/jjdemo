export function initHeroScroll() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  const frameCount = 192;
  const images = [];
  let currentFrameIndex = 0;
  let isMobile = window.innerWidth <= 768;
  
  // Set canvas size
  function resizeCanvas() {
    const wasMobile = isMobile;
    isMobile = window.innerWidth <= 768;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // If layout changes between mobile and desktop, reload images
    if (wasMobile !== isMobile || images.length === 0) {
      loadImages();
    } else {
      render(currentFrameIndex);
    }
  }

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  function getImagePath(index) {
    const folder = isMobile ? 'joeljoyphone' : 'joeljoydesktop';
    const paddedIndex = index.toString().padStart(4, '0');
    return `/${folder}/frame_${paddedIndex}.webp`;
  }

  function loadImages() {
    images.length = 0; // clear existing images
    let loadedCount = 0;
    
    for (let i = 1; i <= frameCount; i++) {
      const img = new Image();
      const path = getImagePath(i);
      img.src = path;
      img.onload = () => {
        loadedCount++;
        if (loadedCount === 1) {
          // Render first frame immediately once loaded
          render(0);
          canvas.style.opacity = 1;
        }
      };
      images.push(img);
    }
  }

  function render(index) {
    const img = images[index];
    if (img && img.complete && img.naturalWidth !== 0) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Crop the bottom part to remove the watermark
      const cropBottomRatio = 0.12; // Crop 12% from the bottom
      const sWidth = img.width;
      const sHeight = img.height * (1 - cropBottomRatio);

      // Cover logic based on cropped dimensions
      const scale = Math.max(canvas.width / sWidth, canvas.height / sHeight);
      const dx = (canvas.width / 2) - (sWidth / 2) * scale;
      const dy = (canvas.height / 2) - (sHeight / 2) * scale;
      
      ctx.drawImage(img, 0, 0, sWidth, sHeight, dx, dy, sWidth * scale, sHeight * scale);
    }
  }

  function onScroll() {
    const heroSection = document.getElementById('hero');
    if (!heroSection) return;
    
    const rect = heroSection.getBoundingClientRect();
    const sectionTop = rect.top;
    const sectionHeight = rect.height - window.innerHeight;
    
    // Calculate scroll progress (0 to 1)
    let progress = -sectionTop / sectionHeight;
    progress = Math.max(0, Math.min(1, progress));
    
    const maxFrameIndex = frameCount - 1;
    const frameIndex = Math.min(maxFrameIndex, Math.floor(progress * maxFrameIndex));
    
    if (frameIndex !== currentFrameIndex) {
      currentFrameIndex = frameIndex;
      requestAnimationFrame(() => render(currentFrameIndex));
    }

    const content = document.querySelector('.hero__content');
    if (content) {
      const startFade = 0.8;
      if (progress > startFade) {
        const contentProgress = (progress - startFade) / (1 - startFade);
        content.style.opacity = contentProgress;
        content.style.transform = `translateY(${30 * (1 - contentProgress)}px)`;
        canvas.style.filter = `blur(${contentProgress * 10}px)`;
      } else {
        content.style.opacity = 0;
        content.style.transform = `translateY(30px)`;
        canvas.style.filter = `blur(0px)`;
      }
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
}
