// ============================================================
//  LUMA WALLPAPERS — Modal Module
// ============================================================
const Modal = (() => {
  const overlay  = document.getElementById('modal-overlay');
  const closeBtn = document.getElementById('modal-close');
  const imgEl    = document.getElementById('modal-img');
  const titleEl  = document.getElementById('modal-title');
  const authorEl = document.getElementById('modal-author');
  const sourceEl = document.getElementById('modal-source');
  const dimsEl   = document.getElementById('modal-dims');
  const attrEl   = document.getElementById('modal-photo-attr');
  const dlGroup  = document.getElementById('modal-download-group');
  const shareBtn = document.getElementById('modal-share');
  const copyBtn  = document.getElementById('modal-copy');
  const openBtn  = document.getElementById('modal-open-source');

  let cur = null;

  const open = (photo) => {
    cur = photo;
    imgEl.src = photo.preview || photo.thumb;
    imgEl.alt = photo.title;
    imgEl.style.backgroundColor = photo.color || '#13162a';
    titleEl.textContent  = photo.title;
    authorEl.textContent = `by ${photo.photographer}`;
    sourceEl.textContent = photo.source === 'pexels' ? '📸 Pexels' : photo.source === 'unsplash' ? '🔵 Unsplash' : '🤖 AI';
    sourceEl.className   = `modal-source-badge source-${photo.source}`;
    dimsEl.textContent   = `${photo.width} × ${photo.height}`;

    // Attribution
    if (attrEl) {
      if (photo.source === 'pexels' && photo.pageUrl && photo.pageUrl !== '#') {
        attrEl.innerHTML = `<a href="${photo.pageUrl}" target="_blank" rel="noopener">Photo</a> by <a href="${photo.photographerUrl}" target="_blank" rel="noopener">${photo.photographer}</a> on <a href="https://www.pexels.com" target="_blank" rel="noopener">Pexels</a>`;
        attrEl.style.display = 'block';
      } else if (photo.source === 'unsplash') {
        attrEl.innerHTML = `Photo by <a href="${photo.photographerUrl}?utm_source=luma&utm_medium=referral" target="_blank" rel="noopener">${photo.photographer}</a> on <a href="https://unsplash.com?utm_source=luma&utm_medium=referral" target="_blank" rel="noopener">Unsplash</a>`;
        attrEl.style.display = 'block';
      } else {
        attrEl.style.display = 'none';
      }
    }

    // Download options
    dlGroup.innerHTML = '';
    CONFIG.RESOLUTIONS.forEach(res => {
      const btn = document.createElement('button');
      btn.className = 'dl-res-btn';
      btn.textContent = res.label;
      btn.addEventListener('click', () => downloadWithRes(photo, res));
      dlGroup.appendChild(btn);
    });

    if (openBtn) {
      openBtn.onclick = () => window.open(photo.pageUrl, '_blank');
      openBtn.style.display = photo.pageUrl && photo.pageUrl !== '#' ? 'flex' : 'none';
    }

    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const close = () => {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
    setTimeout(() => { imgEl.src = ''; cur = null; }, 300);
  };

  const downloadWithRes = async (photo, res) => {
    let url;
    if (photo.source === 'pexels') {
      url = `${photo.full}?auto=compress&cs=tinysrgb&w=${res.w}&h=${res.h}&fit=crop`;
    } else if (photo.source === 'unsplash') {
      url = `${photo.preview}?w=${res.w}&h=${res.h}&fit=crop&q=90`;
      await API.triggerUnsplashDownload(photo);
    } else {
      url = photo.full || photo.preview;
    }
    triggerDL(url, `LUMA-${photo.id}-${res.label.replace(/\s/g,'-')}.jpg`);
    showToast(`⬇️ Downloading ${res.label}…`);
  };

  const downloadDirect = (photo) => {
    const url = photo.full || photo.preview || photo.thumb;
    triggerDL(url, `LUMA-${photo.id}.jpg`);
    showToast('⬇️ Downloading…');
    if (photo.source === 'unsplash') API.triggerUnsplashDownload(photo);
  };

  const triggerDL = (url, name) => {
    const a = document.createElement('a');
    a.href = url; a.download = name; a.target = '_blank'; a.rel = 'noopener';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      if (!cur) return;
      const link = cur.pageUrl || cur.preview || window.location.href;
      navigator.clipboard?.writeText(link).then(() => showToast('🔗 Link copied!')).catch(() => showToast('🔗 Copy failed'));
    });
  }

  if (shareBtn) {
    shareBtn.addEventListener('click', async () => {
      if (!cur) return;
      if (navigator.share) {
        try { await navigator.share({ title: cur.title, url: cur.pageUrl || window.location.href }); } catch(_) {}
      } else { copyBtn?.click(); }
    });
  }

  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  if (closeBtn) closeBtn.addEventListener('click', close);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && overlay.classList.contains('active')) close(); });

  return { open, close, downloadDirect };
})();
