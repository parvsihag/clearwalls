// ============================================================
//  LUMA WALLPAPERS — Gallery Module
// ============================================================

const Gallery = (() => {
  let allPhotos    = [];
  let currentPage  = 1;
  let isLoading    = false;
  let currentQuery = '';
  let currentSrc   = 'trending';

  const grid     = document.getElementById('gallery-grid');
  const loader   = document.getElementById('gallery-loader');
  const moreBtn  = document.getElementById('load-more-btn');

  // ── Build card ────────────────────────────────────────────
  const buildCard = (photo, idx) => {
    const card = document.createElement('div');
    card.className = 'gallery-card';
    card.style.animationDelay = `${(idx % 12) * 55}ms`;
    card.dataset.id = photo.id;

    const srcBadge = `<span class="source-badge source-${photo.source}">${
      photo.source === 'pexels' ? 'Pexels' : photo.source === 'unsplash' ? 'Unsplash' : 'AI'
    }</span>`;

    card.innerHTML = `
      <div class="card-img-wrap">
        <img class="card-img" src="${photo.thumb}" alt="${photo.title}" loading="lazy"
             style="background:${photo.color || '#13162a'};" />
        <div class="card-overlay">
          <div class="card-top">
            ${srcBadge}
            <button class="like-btn" data-id="${photo.id}" aria-label="Like">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </button>
          </div>
          <div class="card-bottom">
            <div class="card-info">
              <p class="card-title">${photo.title}</p>
              <p class="card-author">${photo.photographer}</p>
            </div>
            <div class="card-actions">
              <button class="card-action-btn preview-btn" aria-label="Preview">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                </svg>
              </button>
              <button class="card-action-btn dl-btn" aria-label="Download">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
        <div class="card-res">${photo.width} × ${photo.height}</div>
      </div>`;

    // Events
    card.querySelector('.card-img-wrap').addEventListener('click', () => Modal.open(photo));
    card.querySelector('.preview-btn').addEventListener('click', e => { e.stopPropagation(); Modal.open(photo); });
    card.querySelector('.dl-btn').addEventListener('click', e => { e.stopPropagation(); Modal.downloadDirect(photo); });
    card.querySelector('.like-btn').addEventListener('click', e => {
      e.stopPropagation();
      photo.liked = !photo.liked;
      const btn = e.currentTarget;
      btn.classList.toggle('liked', photo.liked);
      btn.querySelector('svg').setAttribute('fill', photo.liked ? 'currentColor' : 'none');
      showToast(photo.liked ? '❤️ Added to favourites' : 'Removed from favourites');
    });

    return card;
  };

  // ── Build in-feed ad card ─────────────────────────────────
  const buildAdCard = () => {
    const wrap = document.createElement('div');
    wrap.className = 'ad-card';
    wrap.innerHTML = `
      <div class="ad-card-inner">
        <span class="ad-label-sm">Ad</span>
        <ins class="adsbygoogle"
          style="display:block"
          data-ad-client="ca-pub-6988898499933953"
          data-ad-slot="856008435"
          data-ad-format="auto"
          data-full-width-responsive="true"></ins>
        <p>Advertisement</p>
        <small>AdSense in-feed unit</small>
      </div>`;
    try { (adsbygoogle = window.adsbygoogle || []).push({}); } catch(_) {}
    return wrap;
  };

  // ── Render batch ─────────────────────────────────────────
  const render = (photos, append = false) => {
    if (!append) { grid.innerHTML = ''; allPhotos = []; }
    photos.forEach((photo, i) => {
      if (i > 0 && i % 12 === 0) grid.appendChild(buildAdCard());
      grid.appendChild(buildCard(photo, i));
    });
    allPhotos.push(...photos);
  };

  // ── Loading state ─────────────────────────────────────────
  const setLoading = (on) => {
    isLoading = on;
    if (loader) loader.style.display = on ? 'flex' : 'none';
    if (moreBtn) moreBtn.disabled = on;
  };

  // ── Demo banner ───────────────────────────────────────────
  const showDemoBanner = (isDemo) => {
    document.getElementById('luma-demo-banner')?.remove();
    if (!isDemo) return;
    const b = document.createElement('div');
    b.id = 'luma-demo-banner'; b.className = 'demo-banner';
    b.innerHTML = `<span>⚡ Demo mode — add your API keys in <code>js/config.js</code></span>
      <a href="https://www.pexels.com/api/" target="_blank" rel="noopener">Get Pexels Key ↗</a>
      <a href="https://unsplash.com/developers" target="_blank" rel="noopener">Get Unsplash Key ↗</a>
      <button onclick="this.parentElement.remove()">×</button>`;
    document.getElementById('trending-section')?.prepend(b);
  };

  // ── Public: load ─────────────────────────────────────────
  const load = async (src, query = '', page = 1) => {
    setLoading(true);
    currentSrc = src; currentQuery = query; currentPage = page;

    let result;
    if (query) {
      if (src === 'pexels')   result = await API.fetchPexelsSearch(query, page);
      else if (src === 'unsplash') result = await API.fetchUnsplashSearch(query, page);
      else                    result = await API.fetchTrending(page);
    } else {
      if (src === 'pexels')   result = await API.fetchPexelsCurated(page);
      else if (src === 'unsplash') result = await API.fetchUnsplashCurated(page);
      else                    result = await API.fetchTrending(page);
    }

    render(result.photos, false);
    showDemoBanner(result.isDemo);
    setLoading(false);
    if (moreBtn) { moreBtn.style.display = 'flex'; moreBtn.textContent = 'Load more wallpapers ↓'; }
    if (page === 1) window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Public: load next page ────────────────────────────────
  const loadMore = async () => {
    if (isLoading) return;
    setLoading(true);
    currentPage++;
    let result;
    if (currentQuery) {
      if (currentSrc === 'pexels') result = await API.fetchPexelsSearch(currentQuery, currentPage);
      else if (currentSrc === 'unsplash') result = await API.fetchUnsplashSearch(currentQuery, currentPage);
      else result = await API.fetchTrending(currentPage);
    } else {
      if (currentSrc === 'pexels') result = await API.fetchPexelsCurated(currentPage);
      else if (currentSrc === 'unsplash') result = await API.fetchUnsplashCurated(currentPage);
      else result = await API.fetchTrending(currentPage);
    }
    if (!result.photos?.length) {
      if (moreBtn) moreBtn.textContent = 'All caught up ✦';
    } else {
      render(result.photos, true);
    }
    setLoading(false);
  };

  // ── Public: prepend (AI) ──────────────────────────────────
  const prependPhoto = (photo) => {
    allPhotos.unshift(photo);
    const card = buildCard(photo, 0);
    card.classList.add('new-card');
    grid.prepend(card);
  };

  // ── Public: get by id ─────────────────────────────────────
  const getById = (id) => allPhotos.find(p => p.id === id);

  // Load more button
  if (moreBtn) moreBtn.addEventListener('click', loadMore);

  return { load, loadMore, prependPhoto, getById };
})();
