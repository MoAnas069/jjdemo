import { supabase } from './supabase-client.js';
import { initRevealAnimations, initCountUp, initStickyProcess } from './nav.js';

let siteContent = {};

// Load and inject the custom modal and portal styles into the head
const modalStyles = `
/* Premium Real Estate Modal Styles */
.prop-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(10, 8, 7, 0.75);
  backdrop-filter: blur(10px);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.4s cubic-bezier(0.25, 1, 0.5, 1);
  padding: 24px;
}
.prop-modal-overlay.active {
  opacity: 1;
  pointer-events: auto;
}
.prop-modal-card {
  background: #14110F;
  border: 1px solid rgba(176, 141, 87, 0.4);
  border-radius: 16px;
  width: 100%;
  max-width: 900px;
  max-height: 88vh;
  overflow-y: auto;
  position: relative;
  transform: translateY(20px) scale(0.97);
  transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1);
  box-shadow: 0 30px 70px rgba(0, 0, 0, 0.7);
  color: #F5F6F7;
}
.prop-modal-overlay.active .prop-modal-card {
  transform: translateY(0) scale(1);
}
.prop-modal-close {
  position: absolute;
  top: 18px;
  right: 18px;
  background: rgba(20, 17, 15, 0.75);
  border: 1px solid #B08D57;
  color: #fff;
  font-size: 18px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}
.prop-modal-close:hover {
  background: #B08D57;
  color: #14110F;
  transform: rotate(90deg);
}
.prop-modal-hero {
  position: relative;
  height: 420px;
  width: 100%;
  overflow: hidden;
}
@media (max-width: 768px) {
  .prop-modal-hero {
    height: 280px;
  }
}
.prop-modal-hero img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.8s ease;
}
.prop-modal-hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, transparent 40%, rgba(20, 17, 15, 0.95));
}
.prop-modal-gallery {
  display: flex;
  gap: 12px;
  padding: 16px 28px;
  overflow-x: auto;
  background: #1b1714;
  border-bottom: 1px solid rgba(176, 141, 87, 0.15);
}
.prop-modal-gallery::-webkit-scrollbar {
  height: 6px;
}
.prop-modal-gallery::-webkit-scrollbar-thumb {
  background: rgba(176, 141, 87, 0.5);
  border-radius: 3px;
}
.prop-modal-gallery img {
  width: 110px;
  height: 74px;
  object-fit: cover;
  border-radius: 6px;
  cursor: pointer;
  border: 2px solid transparent;
  opacity: 0.6;
  transition: all 0.3s ease;
  flex-shrink: 0;
}
.prop-modal-gallery img:hover, .prop-modal-gallery img.active {
  border-color: #B08D57;
  opacity: 1;
  transform: translateY(-2px);
}
.prop-modal-body {
  padding: 32px 36px 48px;
}
@media (max-width: 600px) {
  .prop-modal-body {
    padding: 24px 20px;
  }
}
.prop-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 18px;
  margin-bottom: 24px;
}
.prop-modal-title-area h2 {
  font-family: 'Bodoni Moda', serif;
  font-size: 30px;
  margin: 0 0 6px 0;
  color: #fff;
  line-height: 1.2;
}
.prop-modal-title-area p {
  color: #bdb8af;
  margin: 0;
  font-size: 14px;
  letter-spacing: 0.03em;
}
.prop-modal-price {
  font-family: 'Playfair Display', serif;
  font-size: 32px;
  color: #B08D57;
  font-weight: 500;
  margin: 0;
}
.prop-modal-specs {
  display: flex;
  gap: 32px;
  padding: 16px 24px;
  background: rgba(176, 141, 87, 0.05);
  border: 1px solid rgba(176, 141, 87, 0.15);
  border-radius: 10px;
  margin-bottom: 28px;
}
.prop-modal-spec-item {
  display: flex;
  flex-direction: column;
}
.prop-modal-spec-label {
  font-size: 10px;
  text-transform: uppercase;
  color: #8a857d;
  letter-spacing: 0.08em;
  margin-bottom: 2px;
}
.prop-modal-spec-val {
  font-size: 18px;
  font-weight: 500;
  color: #fff;
}
.prop-modal-desc {
  line-height: 1.7;
  color: #cfcabf;
  font-size: 15px;
  margin-bottom: 36px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding-bottom: 28px;
}
.prop-modal-inquiry-box {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(176, 141, 87, 0.2);
  border-radius: 12px;
  padding: 28px;
}
.prop-modal-inquiry-box h3 {
  font-family: 'Playfair Display', serif;
  font-size: 22px;
  margin: 0 0 18px 0;
  color: #fff;
}
.prop-modal-grid-flds {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}
@media (max-width: 600px) {
  .prop-modal-grid-flds {
    grid-template-columns: 1fr;
    gap: 12px;
    margin-bottom: 12px;
  }
}
.prop-modal-inquiry-box input, .prop-modal-inquiry-box textarea {
  background: #181512;
  border: 1px solid rgba(176, 141, 87, 0.25);
  color: #fff;
  border-radius: 6px;
  padding: 12px 14px;
  font-size: 14px;
  width: 100%;
  transition: all 0.3s;
}
.prop-modal-inquiry-box input:focus, .prop-modal-inquiry-box textarea:focus {
  border-color: #B08D57;
  box-shadow: 0 0 0 3px rgba(176, 141, 87, 0.1);
  outline: none;
}
.prop-modal-inquiry-box button {
  background: #B08D57;
  color: #14110F;
  border: 1px solid #B08D57;
  font-weight: 600;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 14px 28px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  width: 100%;
  margin-top: 10px;
}
.prop-modal-inquiry-box button:hover {
  background: transparent;
  color: #B08D57;
}
`;

const styleEl = document.createElement('style');
styleEl.textContent = modalStyles;
document.head.appendChild(styleEl);

// Fetch site copy
export async function fetchSiteContent() {
  const cached = sessionStorage.getItem('siteContent');
  if (cached) {
    try {
      siteContent = JSON.parse(cached);
      return;
    } catch (e) {
      console.error('Error parsing cached site content:', e);
    }
  }

  const { data, error } = await supabase.from('site_content').select('*');
  if (error) {
    console.error('Error loading site content:', error);
    return;
  }
  data.forEach(row => {
    siteContent[row.key] = row.value;
  });
  try {
    sessionStorage.setItem('siteContent', JSON.stringify(siteContent));
  } catch (e) {
    console.error('Error saving to sessionStorage:', e);
  }
}

// Apply site copy to data-sc templates
export function applySiteContent() {
  document.querySelectorAll('[data-sc]').forEach(el => {
    const key = el.getAttribute('data-sc');
    const val = siteContent[key];
    if (val !== undefined && val !== null) {
      if (el.tagName === 'IMG') {
        el.src = val;
      } else if (el.tagName === 'SOURCE') {
        el.src = val;
        const parent = el.parentNode;
        if (parent && parent.tagName === 'VIDEO') parent.load();
      } else if (el.tagName === 'A') {
        if (key.includes('phone')) {
          el.href = 'tel:' + val.replace(/[^0-9+]/g, '');
        } else if (key.includes('email')) {
          el.href = 'mailto:' + val;
        }
        el.innerHTML = val;
      } else {
        el.innerHTML = val;
      }
    }
  });

  document.querySelectorAll('[data-sc-bg]').forEach(el => {
    const key = el.getAttribute('data-sc-bg');
    const val = siteContent[key];
    if (val) {
      el.style.backgroundImage = `url('${val}')`;
    }
  });
}

// Initialize Testimonials Auto Slider
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

    dots.forEach((d, i) => {
      d.classList.remove('active');
      void d.offsetWidth;
      if (i === current) d.classList.add('active');
    });
  }

  function next() { goTo(current + 1); }

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      goTo(parseInt(dot.dataset.index, 10));
      resetAutoPlay();
    });
  });

  function startAutoPlay() {
    autoPlayTimer = setInterval(next, 5000);
  }
  function resetAutoPlay() {
    clearInterval(autoPlayTimer);
    startAutoPlay();
  }

  if (slider) {
    slider.addEventListener('mouseenter', () => clearInterval(autoPlayTimer));
    slider.addEventListener('mouseleave', () => startAutoPlay());
  }

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

// Load dynamic data on Homepage
export async function loadHomepage() {
  const [contentRes, listingsRes, testimonialsRes] = await Promise.all([
    fetchSiteContent(),
    supabase
      .from('listings')
      .select('*')
      .eq('status', 'sold')
      .order('created_at', { ascending: false })
      .limit(6),
    supabase
      .from('content_blocks')
      .select('*')
      .eq('section', 'testimonials')
      .eq('status', 'published')
      .order('position')
  ]);

  applySiteContent();

  // Load Sold Listings
  const listingsGrid = document.querySelector('.sold-portfolio-grid');
  if (listingsGrid) {
    let listData = listingsRes.data;
    const listErr = listingsRes.error;

    if (listErr || !listData || listData.length === 0) {
      const fallback = await supabase
        .from('listings')
        .select('*')
        .eq('status', 'published')
        .eq('featured', true)
        .limit(3);
      listData = fallback.data;
    }

    if (listData && listData.length > 0) {
      listingsGrid.innerHTML = listData.map(item => {
        const isSold = item.status === 'sold';
        if (isSold) {
          return `
            <article class="sold-card reveal" id="sold-${item.id}">
              <div class="sold-card__image-wrap">
                <img src="${item.hero_image}" alt="${item.address}" loading="lazy" />
                <div class="sold-card__badge" style="background: #3f8f5f; color: #fff;">Sold</div>
              </div>
              <div class="sold-card__info">
                <h3 class="sold-card__title" style="font-size: 15px; font-weight: 500; font-family: 'Inter', sans-serif; color: #bdb8af; line-height: 1.5; margin-top: 8px;">${item.address}</h3>
              </div>
            </article>
          `;
        }

        const badgeText = 'Featured';
        const badgeStyle = '';
        const priceHtml = item.price ? `<p class="sold-card__price">Last Listed at $${Number(item.price).toLocaleString()}</p>` : '';
        const metaHtml = (item.beds || item.baths || item.sqft) ? `
          <div class="sold-card__meta">
            ${item.beds ? `${item.beds} Beds` : ''} 
            ${item.baths ? ` · ${item.baths} Baths` : ''} 
            ${item.sqft ? ` · ${Number(item.sqft).toLocaleString()} Sq Ft` : ''}
          </div>
        ` : '';
        const locationText = [item.neighborhood, item.city].filter(Boolean).join(', ') || 'Texas Real Estate';

        return `
          <article class="sold-card reveal" id="sold-${item.id}" style="cursor:pointer;" onclick="openListingDetailModal('${item.id}')">
            <div class="sold-card__image-wrap">
              <img src="${item.hero_image}" alt="${item.title}" loading="lazy" />
              <div class="sold-card__badge" ${badgeStyle}>${badgeText}</div>
            </div>
            <div class="sold-card__info">
              <span class="sold-card__location">${locationText}</span>
              <h3 class="sold-card__title">${item.title}</h3>
              ${priceHtml}
              ${metaHtml}
            </div>
          </article>
        `;
      }).join('');
    }
  }

  // Load Testimonials
  const track = document.getElementById('slider-track');
  const dotsContainer = document.getElementById('slider-dots');
  if (track && dotsContainer) {
    const testData = testimonialsRes.data;
    const testErr = testimonialsRes.error;

    if (!testErr && testData && testData.length > 0) {
      track.innerHTML = testData.map(item => `
        <div class="testimonial-card">
          <span class="quote-mark">“</span>
          <blockquote class="testimonial-card__quote">
            "${item.data.quote}"
          </blockquote>
          <div class="testimonial-card__author">
            <span class="testimonial-card__name" style="color: var(--color-brass);">${item.data.author}</span>
            <span class="testimonial-card__detail">${item.data.detail}</span>
          </div>
        </div>
      `).join('');

      dotsContainer.innerHTML = testData.map((_, idx) => `
        <button class="slider-dot ${idx === 0 ? 'active' : ''}" data-index="${idx}" aria-label="Go to review ${idx + 1}"></button>
      `).join('');

      initTestimonialsSlider();
    }
  }

  initRevealAnimations();
}

// Load dynamic data on Sold Portfolio Page
export async function loadSoldPage() {
  const [contentRes, listingsRes] = await Promise.all([
    fetchSiteContent(),
    supabase
      .from('listings')
      .select('*')
      .eq('status', 'sold')
      .order('created_at', { ascending: false })
  ]);

  applySiteContent();

  const grid = document.getElementById('sold-portfolio-grid');
  if (!grid) return;

  const { data, error } = listingsRes;

  if (error || !data) {
    console.error('Error fetching sold listings:', error);
    grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--color-muted); padding: 50px;">Failed to load sold portfolio.</div>';
    return;
  }

  if (data.length === 0) {
    grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--color-muted); padding: 50px;">No sold properties available.</div>';
    return;
  }

  grid.innerHTML = data.map(item => {
    return `
      <article class="sold-card reveal" id="sold-${item.id}">
        <div class="sold-card__image-wrap">
          <img src="${item.hero_image}" alt="${item.address}" loading="lazy" />
          <div class="sold-card__badge" style="background: #3f8f5f; color: #fff;">Sold</div>
        </div>
        <div class="sold-card__info">
          <h3 class="sold-card__title" style="font-size: 15px; font-weight: 500; font-family: 'Inter', sans-serif; color: #bdb8af; line-height: 1.5; margin-top: 8px;">${item.address}</h3>
        </div>
      </article>
    `;
  }).join('');

  initRevealAnimations(grid);
}

// Load dynamic data on About Page
export async function loadAboutPage() {
  const [contentRes, blocksRes] = await Promise.all([
    fetchSiteContent(),
    supabase
      .from('content_blocks')
      .select('*')
      .eq('section', 'stats')
      .eq('status', 'published')
      .order('position')
  ]);

  applySiteContent();

  const statsRow = document.querySelector('.stats-row');
  if (statsRow) {
    const { data, error } = blocksRes;

    if (!error && data && data.length > 0) {
      statsRow.innerHTML = data.map(item => `
        <div class="trust-stat">
          <span class="trust-stat__number" data-count="${item.data.value}" data-prefix="${item.data.prefix || ''}" data-suffix="${item.data.suffix || ''}">0</span>
          <span class="trust-stat__label">${item.data.label}</span>
        </div>
      `).join('');
      initCountUp();
    }
  }

  initRevealAnimations();
}

// Load dynamic data on Buy Page
export async function loadBuyPage() {
  const [contentRes, blocksRes] = await Promise.all([
    fetchSiteContent(),
    supabase
      .from('content_blocks')
      .select('*')
      .eq('section', 'buyer_steps')
      .eq('status', 'published')
      .order('position')
  ]);

  applySiteContent();

  const stepsContainer = document.querySelector('.sticky-process-steps');
  if (stepsContainer) {
    const { data, error } = blocksRes;

    if (!error && data && data.length > 0) {
      stepsContainer.innerHTML = data.map((item, idx) => `
        <div class="process-card-sticky reveal ${idx === 0 ? 'active' : ''}" data-step="${idx + 1}" data-image="${item.data.image}">
          <span class="process-card-number">${item.data.number}</span>
          <div class="process-card-body">
            <h3>${item.data.title}</h3>
            <p>${item.data.description}</p>
          </div>
        </div>
      `).join('');

      const visualImg = document.getElementById('sticky-process-img');
      if (visualImg && data[0]) {
        visualImg.src = data[0].data.image;
        visualImg.alt = data[0].data.title;
      }

      initStickyProcess();
    }
  }

  initRevealAnimations();
}

// Load dynamic data on Sell Page
export async function loadSellPage() {
  const [contentRes, blocksRes] = await Promise.all([
    fetchSiteContent(),
    supabase
      .from('content_blocks')
      .select('*')
      .eq('section', 'seller_steps')
      .eq('status', 'published')
      .order('position')
  ]);

  applySiteContent();

  const stepsContainer = document.querySelector('.sticky-process-steps');
  if (stepsContainer) {
    const { data, error } = blocksRes;

    if (!error && data && data.length > 0) {
      stepsContainer.innerHTML = data.map((item, idx) => `
        <div class="process-card-sticky reveal ${idx === 0 ? 'active' : ''}" data-step="${idx + 1}" data-image="${item.data.image}">
          <span class="process-card-number">${item.data.number}</span>
          <div class="process-card-body">
            <h3>${item.data.title}</h3>
            <p>${item.data.description}</p>
          </div>
        </div>
      `).join('');

      const visualImg = document.getElementById('sticky-process-img');
      if (visualImg && data[0]) {
        visualImg.src = data[0].data.image;
        visualImg.alt = data[0].data.title;
      }

      initStickyProcess();
    }
  }

  initRevealAnimations();
}

// Load dynamic data on Communities Page
export async function loadCommunitiesPage() {
  const [contentRes, communitiesRes] = await Promise.all([
    fetchSiteContent(),
    supabase
      .from('communities')
      .select('*')
      .eq('status', 'published')
      .order('name')
  ]);

  applySiteContent();

  const grid = document.querySelector('.community-grid');
  if (grid) {
    const { data, error } = communitiesRes;

    if (!error && data && data.length > 0) {
      grid.innerHTML = data.map(item => `
        <a href="/listings.html" class="community-card reveal" id="comm-${item.slug}">
          <div class="community-card__image"><img src="${item.hero_image}" alt="${item.name}" loading="lazy" /></div>
          <div class="community-card__content">
            <h3>${item.name}</h3>
            <p>${item.description}</p>
            <span class="community-card__link">Explore listings →</span>
          </div>
        </a>
      `).join('');
    }
  }

  initRevealAnimations();
}

// Load dynamic data on Listings Page
export async function loadListingsPage() {
  const [contentRes, listingsRes] = await Promise.all([
    fetchSiteContent(),
    supabase
      .from('listings')
      .select('*')
      .eq('status', 'published')
      .order('featured', { ascending: false })
      .order('created_at', { ascending: false })
  ]);

  applySiteContent();

  const grid = document.querySelector('.listings-grid');
  if (grid) {
    const { data, error } = listingsRes;

    if (!error && data && data.length > 0) {
      grid.innerHTML = data.map(item => `
        <article class="listing-card reveal" style="cursor:pointer;" onclick="openListingDetailModal('${item.id}')">
          <div class="listing-card__image">
            <img src="${item.hero_image}" alt="${item.title}" loading="lazy" />
            <div class="listing-card__overlay"><span class="listing-card__tag">${item.featured ? 'Featured' : 'Active'}</span></div>
          </div>
          <div class="listing-card__info">
            <h3 class="listing-card__price">$${Number(item.price).toLocaleString()}</h3>
            <p class="listing-card__address">${item.address}, ${item.city}</p>
            <div class="listing-card__details">
              <span><strong>${item.beds}</strong> Beds</span>
              <span><strong>${item.baths}</strong> Baths</span>
              <span><strong>${Number(item.sqft).toLocaleString()}</strong> Sq Ft</span>
            </div>
          </div>
        </article>
      `).join('');
    } else if (data && data.length === 0) {
      grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--color-muted); padding: 50px;">No properties match your search criteria. Check back soon.</div>';
    }
  }

  initRevealAnimations();
}

// Load dynamic data on Blog Page
export async function loadBlogPage() {
  const [contentRes, postsRes] = await Promise.all([
    fetchSiteContent(),
    supabase
      .from('blog_posts')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
  ]);

  applySiteContent();

  const grid = document.querySelector('.blog-grid');
  if (grid) {
    const { data, error } = postsRes;

    if (!error && data && data.length > 0) {
      grid.innerHTML = data.map(item => `
        <article class="blog-card reveal" id="blog-${item.id}">
          <div class="blog-card__image"><img src="${item.cover_image}" alt="${item.title}" loading="lazy" /></div>
          <div class="blog-card__content">
            <span class="blog-card__category">${item.tags && item.tags[0] ? item.tags[0] : 'Insight'}</span>
            <h3>${item.title}</h3>
            <p>${item.excerpt}</p>
            <span class="blog-card__date">${new Date(item.published_at || item.created_at).toLocaleDateString(undefined, {month: 'long', day: 'numeric', year: 'numeric'})}</span>
          </div>
        </article>
      `).join('');
    }
  }

  initRevealAnimations();
}

// =========================================================================
// REAL ESTATE PLATFORM MODAL SYSTEM & INQUIRY FLOW
// =========================================================================

export async function openListingDetailModal(id) {
  const { data, error } = await supabase.from('listings').select('*').eq('id', id).single();
  if (error || !data) {
    console.error('Error fetching listing details:', error);
    return;
  }

  let existing = document.getElementById('prop-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'prop-modal';
  modal.className = 'prop-modal-overlay';
  
  const galleryImages = Array.isArray(data.gallery) ? data.gallery : [];
  let galleryHtml = '';
  if (galleryImages.length > 0) {
    galleryHtml = `
      <div class="prop-modal-gallery">
        ${galleryImages.map((img, idx) => `
          <img src="${img}" alt="Gallery image ${idx + 1}" class="${idx === 0 ? 'active' : ''}" onclick="changeModalHero(this, '${img}')" />
        `).join('')}
      </div>
    `;
  }

  modal.innerHTML = `
    <div class="prop-modal-card">
      <button class="prop-modal-close" onclick="closeListingDetailModal()">✕</button>
      <div class="prop-modal-hero">
        <img id="prop-modal-hero-img" src="${data.hero_image}" alt="${data.title}" />
        <div class="prop-modal-hero-overlay"></div>
      </div>
      
      ${galleryHtml}
      
      <div class="prop-modal-body">
        <div class="prop-modal-header">
          <div class="prop-modal-title-area">
            <h2>${data.title}</h2>
            <p>${data.address}, ${data.neighborhood || ''}, ${data.city}</p>
          </div>
          <p class="prop-modal-price">${data.price ? `$${Number(data.price).toLocaleString()}` : 'Sold'}</p>
        </div>
        
        ${(data.beds || data.baths || data.sqft) ? `
        <div class="prop-modal-specs">
          ${data.beds ? `
          <div class="prop-modal-spec-item">
            <span class="prop-modal-spec-label">Beds</span>
            <span class="prop-modal-spec-val">${data.beds}</span>
          </div>
          ` : ''}
          ${data.baths ? `
          <div class="prop-modal-spec-item">
            <span class="prop-modal-spec-label">Baths</span>
            <span class="prop-modal-spec-val">${data.baths}</span>
          </div>
          ` : ''}
          ${data.sqft ? `
          <div class="prop-modal-spec-item">
            <span class="prop-modal-spec-label">Sq Ft</span>
            <span class="prop-modal-spec-val">${Number(data.sqft).toLocaleString()}</span>
          </div>
          ` : ''}
        </div>
        ` : ''}
        
        <div class="prop-modal-desc">
          ${data.description || 'No description available for this property.'}
        </div>
        
        <div class="prop-modal-inquiry-box">
          <h3>Schedule a Private Showing</h3>
          <form id="prop-inquiry-form" onsubmit="submitPropertyInquiry(event, '${data.title}')">
            <div class="prop-modal-grid-flds">
              <input type="text" id="pi-firstname" placeholder="First Name *" required />
              <input type="text" id="pi-lastname" placeholder="Last Name *" required />
            </div>
            <div class="prop-modal-grid-flds">
              <input type="email" id="pi-email" placeholder="Email Address *" required />
              <input type="tel" id="pi-phone" placeholder="Phone Number" />
            </div>
            <textarea id="pi-message" rows="3" placeholder="Message ...">I am interested in scheduling a private showing for ${data.title}. Please contact me to coordinate.</textarea>
            <button type="submit" id="pi-submit">Send Inquiry</button>
          </form>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  
  // Show it with transition
  setTimeout(() => modal.classList.add('active'), 10);
  
  // Lock body scroll
  document.body.style.overflow = 'hidden';
}

window.openListingDetailModal = openListingDetailModal;

window.closeListingDetailModal = function() {
  const modal = document.getElementById('prop-modal');
  if (modal) {
    modal.classList.remove('active');
    setTimeout(() => modal.remove(), 400);
  }
  document.body.style.overflow = '';
}

window.changeModalHero = function(imgEl, src) {
  const heroImg = document.getElementById('prop-modal-hero-img');
  if (heroImg) {
    heroImg.style.transform = 'scale(1.02)';
    setTimeout(() => {
      heroImg.src = src;
      heroImg.style.transform = 'scale(1)';
    }, 150);
  }
  document.querySelectorAll('.prop-modal-gallery img').forEach(el => el.classList.remove('active'));
  imgEl.classList.add('active');
}

window.submitPropertyInquiry = async function(event, propertyTitle) {
  event.preventDefault();
  const btn = document.getElementById('pi-submit');
  const originalText = btn.textContent;
  
  btn.textContent = 'Sending...';
  btn.disabled = true;

  const first = document.getElementById('pi-firstname').value.trim();
  const last = document.getElementById('pi-lastname').value.trim();
  const email = document.getElementById('pi-email').value.trim();
  const phone = document.getElementById('pi-phone').value.trim();
  const msg = document.getElementById('pi-message').value.trim();

  try {
    const { error } = await supabase.from('contact_inquiries').insert([{
      first_name: first,
      last_name: last,
      email: email,
      phone: phone || null,
      interest: propertyTitle,
      message: msg || null
    }]);

    if (error) throw error;

    btn.textContent = 'Inquiry Sent ✓';
    btn.style.background = '#3f8f5f';
    btn.style.color = '#fff';
    btn.style.borderColor = '#3f8f5f';
    document.getElementById('prop-inquiry-form').reset();
    
    setTimeout(() => {
      window.closeListingDetailModal();
    }, 2000);
  } catch (err) {
    console.error('Inquiry submission failed:', err);
    btn.textContent = 'Failed to Send';
    btn.style.background = '#c0473b';
    btn.style.color = '#fff';
    btn.style.borderColor = '#c0473b';
    
    setTimeout(() => {
      btn.textContent = originalText;
      btn.style.background = '';
      btn.style.color = '';
      btn.style.borderColor = '';
      btn.disabled = false;
    }, 3000);
  }
}
