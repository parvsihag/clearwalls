// ============================================================
//  LUMA WALLPAPERS — Main App Controller
// ============================================================

// ---- Global toast ----
window.showToast = (msg, duration = 3000) => {
  const old = document.getElementById('luma-toast');
  if (old) old.remove();
  const t = document.createElement('div');
  t.id = 'luma-toast'; t.className = 'toast'; t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 400); }, duration);
};

document.addEventListener('DOMContentLoaded', async () => {

  // ─── HERO SLIDESHOW ──────────────────────────────────────
  const heroSlides = document.getElementById('hero-slides');
  const heroDots   = document.getElementById('hero-dots');

  // Use Pexels curated to drive hero slides — these load fast as background-images
  const HERO_SEEDS = [
    'https://images.pexels.com/photos/1438761/pexels-photo-1438761.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
    'https://images.pexels.com/photos/1287145/pexels-photo-1287145.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
    'https://images.pexels.com/photos/1903702/pexels-photo-1903702.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
    'https://images.pexels.com/photos/624015/pexels-photo-624015.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
    'https://images.pexels.com/photos/1266808/pexels-photo-1266808.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
  ];

  let heroIdx = 0;

  const buildHero = () => {
    HERO_SEEDS.forEach((url, i) => {
      const slide = document.createElement('div');
      slide.className = 'hero-slide' + (i === 0 ? ' active' : '');
      slide.style.backgroundImage = `url(${url})`;
      heroSlides.appendChild(slide);

      const dot = document.createElement('button');
      dot.className = 'hero-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Slide ${i + 1}`);
      dot.addEventListener('click', () => goToSlide(i));
      heroDots.appendChild(dot);
    });
  };

  const goToSlide = (idx) => {
    const slides = document.querySelectorAll('.hero-slide');
    const dots   = document.querySelectorAll('.hero-dot');
    slides.forEach(s => s.classList.remove('active'));
    dots.forEach(d => d.classList.remove('active'));
    slides[idx]?.classList.add('active');
    dots[idx]?.classList.add('active');
    heroIdx = idx;
  };

  buildHero();
  setInterval(() => goToSlide((heroIdx + 1) % HERO_SEEDS.length), 6000);

  // ─── TAB NAVIGATION ──────────────────────────────────────
  const tabs     = document.querySelectorAll('[data-tab]');
  const sections = document.querySelectorAll('.app-section');
  const hero     = document.getElementById('hero');

  const switchTab = (tabId) => {
    tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === tabId));
    sections.forEach(s => s.classList.toggle('active', s.id === `${tabId}-section`));
    if (hero) hero.style.display = tabId === 'trending' ? '' : 'none';
    const titles = {
      trending:   'LUMA — Trending Wallpapers',
      pexels:     'LUMA — Pexels Collection',
      unsplash:   'LUMA — Unsplash Collection',
      categories: 'LUMA — Browse Categories',
      ai:         'LUMA — AI Creator',
    };
    document.title = titles[tabId] || 'LUMA Wallpapers';
  };

  tabs.forEach(tab => {
    tab.addEventListener('click', async () => {
      const id = tab.dataset.tab;
      switchTab(id);
      if (id === 'trending')    Gallery.load('trending');
      else if (id === 'pexels') Gallery.load('pexels');
      else if (id === 'unsplash') Gallery.load('unsplash');
      else if (id === 'categories') renderCategories();
    });
  });

  // ─── CATEGORIES ───────────────────────────────────────────
  const renderCategories = () => {
    const grid = document.getElementById('category-grid');
    if (!grid || grid.dataset.rendered) return;
    grid.dataset.rendered = '1';
    CONFIG.CATEGORIES.forEach(cat => {
      const card = document.createElement('div');
      card.className = 'cat-card';
      card.innerHTML = `<div class="cat-icon">${cat.icon}</div><span class="cat-label">${cat.label}</span>`;
      card.addEventListener('click', () => {
        document.querySelector('[data-tab="trending"]').click();
        setTimeout(() => {
          Gallery.load('trending', cat.query);
          document.getElementById('search-input').value = cat.query;
        }, 80);
        showToast(`Browsing ${cat.label}`);
      });
      grid.appendChild(card);
    });
  };

  // ─── SEARCH ───────────────────────────────────────────────
  const searchInput = document.getElementById('search-input');
  const searchBtn   = document.getElementById('search-btn');
  const clearBtn    = document.getElementById('search-clear');

  const doSearch = () => {
    const q = searchInput?.value?.trim();
    if (!q) return;
    const active = document.querySelector('[data-tab].active')?.dataset?.tab;
    if (active === 'ai' || active === 'categories') {
      document.querySelector('[data-tab="trending"]').click();
    }
    setTimeout(() => Gallery.load('trending', q), active === 'ai' || active === 'categories' ? 120 : 0);
    if (clearBtn) clearBtn.style.display = 'flex';
    showToast(`Searching "${q}"…`);
  };

  if (searchInput) {
    searchInput.addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(); });
    searchInput.addEventListener('input', () => {
      if (clearBtn) clearBtn.style.display = searchInput.value ? 'flex' : 'none';
    });
  }
  if (searchBtn) searchBtn.addEventListener('click', doSearch);
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      searchInput.value = ''; clearBtn.style.display = 'none';
      Gallery.load('trending'); searchInput.focus();
    });
  }

  // ─── SCROLL TO TOP ────────────────────────────────────────
  const stBtn = document.getElementById('scroll-top');
  if (stBtn) {
    window.addEventListener('scroll', () => stBtn.classList.toggle('visible', window.scrollY > 600));
    stBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  // ─── TRENDING TAGS ────────────────────────────────────────
  document.querySelectorAll('.tag-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      const q = pill.dataset.q;
      document.getElementById('search-input').value = q;
      document.querySelector('[data-tab="trending"]').click();
      setTimeout(() => Gallery.load('trending', q), 80);
      showToast(`Browsing "${q}"`);
    });
  });

  // ─── HERO CTA ─────────────────────────────────────────────
  document.getElementById('hero-explore-btn')?.addEventListener('click', () => {
    document.querySelector('.main-wrap')?.scrollIntoView({ behavior: 'smooth' });
  });
  document.getElementById('hero-ai-btn')?.addEventListener('click', () => {
    document.querySelector('[data-tab="ai"]').click();
  });

  // ─── INITIAL LOAD ─────────────────────────────────────────
  Gallery.load('trending');
});
