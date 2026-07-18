import { initNavigation, initSmoothScroll, initGoldDust } from './nav.js';
import { initHeroVideo } from './hero-video.js';
import { loadHomepage } from './dynamic-content.js';

function initServiceCardVideos() {
  const isMobile = window.innerWidth <= 768;
  const cards = document.querySelectorAll('.service-card');
  
  if (isMobile) {
    cards.forEach(card => {
      const video = card.querySelector('.service-card__video');
      if (video) {
        video.remove();
      }
    });
    return;
  }

  cards.forEach(card => {
    const video = card.querySelector('.service-card__video');
    if (!video) return;
    
    // Ensure video preload is none initially
    video.setAttribute('preload', 'none');
    
    card.addEventListener('mouseenter', () => {
      video.setAttribute('preload', 'auto');
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.debug("Video play deferred:", error);
        });
      }
    });
    
    card.addEventListener('mouseleave', () => {
      video.pause();
    });
  });
}

document.fonts.ready.then(async () => {
  initNavigation();
  initSmoothScroll();
  initHeroVideo();
  
  await loadHomepage();
  initGoldDust();
  initServiceCardVideos();
});
