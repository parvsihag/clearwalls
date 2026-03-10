// ============================================================
//  LUMA WALLPAPERS — API Layer
//  Handles Pexels, Unsplash, and demo data
// ============================================================

const API = (() => {
  // --- Normalise Pexels photo to common format ---
  const normalisePexels = (photo) => ({
    id:         `pexels-${photo.id}`,
    source:     'pexels',
    title:      photo.alt || 'Untitled',
    photographer: photo.photographer,
    photographerUrl: photo.photographer_url,
    width:      photo.width,
    height:     photo.height,
    color:      photo.avg_color,
    thumb:      photo.src.medium,
    preview:    photo.src.large2x,
    full:       photo.src.original,
    download:   `https://www.pexels.com/photo/${photo.id}/download/`,
    pageUrl:    photo.url,
    liked:      false,
  });

  // --- Normalise Unsplash photo to common format ---
  const normaliseUnsplash = (photo) => ({
    id:         `unsplash-${photo.id}`,
    source:     'unsplash',
    title:      photo.description || photo.alt_description || 'Untitled',
    photographer: photo.user?.name || 'Unknown',
    photographerUrl: photo.user?.links?.html || '#',
    width:      photo.width,
    height:     photo.height,
    color:      photo.color,
    thumb:      photo.urls?.regular,
    preview:    photo.urls?.full,
    full:       photo.urls?.raw + '&w=3840&q=90',
    download:   photo.links?.download_location,
    pageUrl:    photo.links?.html,
    liked:      false,
  });

  // --- Check if keys are configured ---
  const hasKey = (type) => {
    if (type === 'pexels')   return CONFIG.PEXELS_API_KEY   !== 'YOUR_PEXELS_API_KEY_HERE';
    if (type === 'unsplash') return CONFIG.UNSPLASH_ACCESS_KEY !== 'YOUR_UNSPLASH_ACCESS_KEY_HERE';
    return false;
  };

  // --- Demo placeholder data (shown when no API key is set) ---
  const getDemoPhotos = (source, count = 30) => {
    const topics = ['nature', 'architecture', 'space', 'abstract', 'city', 'ocean', 'mountains', 'forest', 'minimal', 'technology'];
    return Array.from({ length: count }, (_, i) => {
      const topic = topics[i % topics.length];
      const w = [1920, 2560, 3840][i % 3];
      const h = [1080, 1440, 2160][i % 3];
      return {
        id:           `demo-${source}-${i}`,
        source:       source,
        title:        `${topic.charAt(0).toUpperCase() + topic.slice(1)} Wallpaper`,
        photographer: 'Demo Artist',
        photographerUrl: '#',
        width:        w,
        height:       h,
        color:        ['#1a1a2e', '#16213e', '#0f3460', '#533483', '#2d6a4f', '#1b4332'][i % 6],
        thumb:        `https://picsum.photos/seed/${source}${i}/800/600`,
        preview:      `https://picsum.photos/seed/${source}${i}/1920/1080`,
        full:         `https://picsum.photos/seed/${source}${i}/3840/2160`,
        download:     `https://picsum.photos/seed/${source}${i}/3840/2160`,
        pageUrl:      '#',
        liked:        false,
        isDemo:       true,
      };
    });
  };

  // ---- PEXELS ----
  const fetchPexelsCurated = async (page = 1) => {
    if (!hasKey('pexels')) return { photos: getDemoPhotos('pexels'), isDemo: true };
    try {
      const res = await fetch(
        `https://api.pexels.com/v1/curated?per_page=${CONFIG.PER_PAGE}&page=${page}`,
        { headers: { Authorization: CONFIG.PEXELS_API_KEY } }
      );
      if (!res.ok) throw new Error(`Pexels API error: ${res.status}`);
      const data = await res.json();
      return { photos: data.photos.map(normalisePexels), total: data.total_results };
    } catch (err) {
      console.error(err);
      return { photos: getDemoPhotos('pexels'), isDemo: true, error: err.message };
    }
  };

  const fetchPexelsSearch = async (query, page = 1) => {
    if (!hasKey('pexels')) return { photos: getDemoPhotos('pexels'), isDemo: true };
    try {
      const res = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${CONFIG.PER_PAGE}&page=${page}&orientation=landscape`,
        { headers: { Authorization: CONFIG.PEXELS_API_KEY } }
      );
      if (!res.ok) throw new Error(`Pexels API error: ${res.status}`);
      const data = await res.json();
      return { photos: data.photos.map(normalisePexels), total: data.total_results };
    } catch (err) {
      console.error(err);
      return { photos: getDemoPhotos('pexels'), isDemo: true, error: err.message };
    }
  };

  // ---- UNSPLASH ----
  const fetchUnsplashCurated = async (page = 1) => {
    if (!hasKey('unsplash')) return { photos: getDemoPhotos('unsplash'), isDemo: true };
    try {
      const res = await fetch(
        `https://api.unsplash.com/photos?per_page=${CONFIG.PER_PAGE}&page=${page}&order_by=popular&client_id=${CONFIG.UNSPLASH_ACCESS_KEY}`
      );
      if (!res.ok) throw new Error(`Unsplash API error: ${res.status}`);
      const data = await res.json();
      return { photos: data.map(normaliseUnsplash), total: data.length };
    } catch (err) {
      console.error(err);
      return { photos: getDemoPhotos('unsplash'), isDemo: true, error: err.message };
    }
  };

  const fetchUnsplashSearch = async (query, page = 1) => {
    if (!hasKey('unsplash')) return { photos: getDemoPhotos('unsplash'), isDemo: true };
    try {
      const res = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${CONFIG.PER_PAGE}&page=${page}&orientation=landscape&client_id=${CONFIG.UNSPLASH_ACCESS_KEY}`
      );
      if (!res.ok) throw new Error(`Unsplash API error: ${res.status}`);
      const data = await res.json();
      return { photos: data.results.map(normaliseUnsplash), total: data.total };
    } catch (err) {
      console.error(err);
      return { photos: getDemoPhotos('unsplash'), isDemo: true, error: err.message };
    }
  };

  // ---- TRENDING (mix of both) ----
  const fetchTrending = async (page = 1) => {
    const [pexels, unsplash] = await Promise.all([
      fetchPexelsCurated(page),
      fetchUnsplashCurated(page),
    ]);
    // Interleave results
    const mixed = [];
    const maxLen = Math.max(pexels.photos.length, unsplash.photos.length);
    for (let i = 0; i < maxLen; i++) {
      if (pexels.photos[i])   mixed.push(pexels.photos[i]);
      if (unsplash.photos[i]) mixed.push(unsplash.photos[i]);
    }
    return { photos: mixed, isDemo: pexels.isDemo || unsplash.isDemo };
  };

  // ---- Trigger download (Unsplash requires hitting download endpoint) ----
  const triggerUnsplashDownload = async (photo) => {
    if (!hasKey('unsplash') || !photo.download) return;
    try {
      await fetch(`${photo.download}?client_id=${CONFIG.UNSPLASH_ACCESS_KEY}`);
    } catch (_) {}
  };

  return {
    hasKey,
    fetchTrending,
    fetchPexelsCurated,
    fetchPexelsSearch,
    fetchUnsplashCurated,
    fetchUnsplashSearch,
    triggerUnsplashDownload,
  };
})();
