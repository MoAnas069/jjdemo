import { initNavigation, initSmoothScroll, initGoldDust } from './nav.js';
import { initHeroVideo } from './hero-video.js';
import { loadHomepage } from './dynamic-content.js';

document.fonts.ready.then(async () => {
  initNavigation();
  initSmoothScroll();
  initHeroVideo();
  initGoldDust();
  
  await loadHomepage();
});
