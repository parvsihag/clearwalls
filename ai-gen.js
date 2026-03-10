// ============================================================
//  LUMA WALLPAPERS — AI Generator (Pollinations.ai)
// ============================================================
const AIGenerator = (() => {
  const promptInput  = document.getElementById('ai-prompt');
  const generateBtn  = document.getElementById('ai-generate-btn');
  const resultWrap   = document.getElementById('ai-result-wrap');
  const resultImg    = document.getElementById('ai-result-img');
  const resultLoader = document.getElementById('ai-result-loader');
  const dlBtn        = document.getElementById('ai-download-btn');
  const addBtn       = document.getElementById('ai-add-gallery-btn');
  const charCount    = document.getElementById('ai-char-count');
  const enhanceBtn   = document.getElementById('ai-enhance-btn');

  let currentUrl = '';
  let currentStyle = CONFIG.AI_STYLES[0];
  let currentRes   = CONFIG.RESOLUTIONS[0];
  let history = [];
  try { history = JSON.parse(localStorage.getItem('luma_ai_history') || '[]'); } catch(_) {}

  // ── Style buttons ─────────────────────────────────────────
  const styleGrid = document.getElementById('ai-style-grid');
  if (styleGrid) {
    CONFIG.AI_STYLES.forEach((s, i) => {
      const btn = document.createElement('button');
      btn.className = 'ai-style-btn' + (i === 0 ? ' active' : '');
      btn.textContent = s.label;
      btn.addEventListener('click', () => {
        document.querySelectorAll('.ai-style-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active'); currentStyle = s;
      });
      styleGrid.appendChild(btn);
    });
  }

  // ── Resolution buttons ────────────────────────────────────
  const resGrid = document.getElementById('ai-res-grid');
  if (resGrid) {
    CONFIG.RESOLUTIONS.forEach((r, i) => {
      const btn = document.createElement('button');
      btn.className = 'ai-res-btn' + (i === 0 ? ' active' : '');
      btn.textContent = r.label;
      btn.addEventListener('click', () => {
        document.querySelectorAll('.ai-res-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active'); currentRes = r;
      });
      resGrid.appendChild(btn);
    });
  }

  // ── Char counter ──────────────────────────────────────────
  if (promptInput && charCount) {
    promptInput.addEventListener('input', () => charCount.textContent = promptInput.value.length);
  }

  // ── Prompt enhance via Claude ─────────────────────────────
  if (enhanceBtn) {
    enhanceBtn.addEventListener('click', async () => {
      const raw = promptInput?.value?.trim();
      if (!raw) { showToast('Enter a prompt first'); return; }
      enhanceBtn.disabled = true; enhanceBtn.textContent = '⏳ Enhancing…';
      try {
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514', max_tokens: 200,
            messages: [{ role: 'user', content: `You are an AI image prompt engineer. Enhance this wallpaper idea into a rich, detailed prompt under 150 words. Output ONLY the enhanced prompt.\n\nIdea: "${raw}"\nStyle: ${currentStyle.label}` }]
          })
        });
        const data = await res.json();
        const enhanced = data.content?.[0]?.text?.trim();
        if (enhanced && promptInput) {
          promptInput.value = enhanced;
          charCount && (charCount.textContent = enhanced.length);
          showToast('✨ Prompt enhanced!');
        }
      } catch(_) { showToast('Enhancement unavailable'); }
      enhanceBtn.disabled = false; enhanceBtn.textContent = '✨ Enhance with AI';
    });
  }

  // ── Generate ──────────────────────────────────────────────
  const generate = async () => {
    const raw = promptInput?.value?.trim();
    if (!raw) { showToast('Enter a prompt first'); promptInput?.focus(); return; }

    const full = `${raw}, ${currentStyle.suffix}, wallpaper, high quality, 8k`;
    const seed = Math.floor(Math.random() * 999999);
    currentUrl = `${CONFIG.AI_BASE_URL}${encodeURIComponent(full)}?width=${currentRes.w}&height=${currentRes.h}&seed=${seed}&nologo=true&model=flux`;

    generateBtn.disabled = true; generateBtn.textContent = '⏳ Generating…';
    resultWrap?.classList.remove('hidden');
    if (resultLoader) resultLoader.style.display = 'flex';
    if (resultImg)    { resultImg.style.display = 'none'; resultImg.src = ''; }
    if (dlBtn)        dlBtn.disabled = true;
    if (addBtn)       addBtn.disabled = true;

    const img = new Image();
    img.onload = () => {
      if (resultLoader) resultLoader.style.display = 'none';
      if (resultImg)    { resultImg.src = currentUrl; resultImg.style.display = 'block'; }
      if (dlBtn)        dlBtn.disabled = false;
      if (addBtn)       addBtn.disabled = false;
      generateBtn.disabled = false; generateBtn.textContent = '⚡ Generate Wallpaper';

      const entry = { url: currentUrl, prompt: raw, style: currentStyle.label, res: currentRes.label, ts: Date.now() };
      history.unshift(entry);
      if (history.length > 20) history.pop();
      try { localStorage.setItem('luma_ai_history', JSON.stringify(history)); } catch(_) {}
      renderHistory();
      showToast('🎨 Wallpaper created!');
    };
    img.onerror = () => {
      if (resultLoader) resultLoader.style.display = 'none';
      generateBtn.disabled = false; generateBtn.textContent = '⚡ Generate Wallpaper';
      showToast('❌ Generation failed — try a different prompt');
    };
    img.src = currentUrl;
  };

  if (generateBtn) generateBtn.addEventListener('click', generate);
  if (promptInput) promptInput.addEventListener('keydown', e => { if (e.ctrlKey && e.key === 'Enter') generate(); });

  // ── Download ──────────────────────────────────────────────
  if (dlBtn) {
    dlBtn.addEventListener('click', () => {
      if (!currentUrl) return;
      const a = document.createElement('a'); a.href = currentUrl; a.download = `LUMA-AI-${Date.now()}.jpg`;
      a.target = '_blank'; document.body.appendChild(a); a.click(); document.body.removeChild(a);
      showToast('⬇️ Downloading AI wallpaper…');
    });
  }

  // ── Add to gallery ────────────────────────────────────────
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      if (!currentUrl) return;
      const photo = {
        id: `ai-${Date.now()}`, source: 'ai',
        title: promptInput?.value?.trim() || 'AI Generated',
        photographer: 'LUMA AI', photographerUrl: '#',
        width: currentRes.w, height: currentRes.h,
        color: '#13162a', thumb: currentUrl, preview: currentUrl,
        full: currentUrl, download: currentUrl, pageUrl: '#', liked: false,
      };
      document.querySelector('[data-tab="trending"]').click();
      setTimeout(() => { Gallery.prependPhoto(photo); showToast('✅ Added to gallery!'); }, 400);
    });
  }

  // ── History ───────────────────────────────────────────────
  const renderHistory = () => {
    const wrap = document.getElementById('ai-history-grid');
    if (!wrap) return;
    wrap.innerHTML = '';
    if (!history.length) {
      wrap.innerHTML = '<p class="ai-history-empty">Your generated wallpapers will appear here.</p>';
      return;
    }
    history.slice(0, 8).forEach(item => {
      const card = document.createElement('div');
      card.className = 'ai-history-card';
      card.innerHTML = `<img src="${item.url}" alt="${item.prompt}" loading="lazy"/>
        <div class="ai-hc-meta"><span>${item.style}</span><span>${item.res}</span></div>
        <p>${item.prompt.slice(0, 60)}${item.prompt.length > 60 ? '…' : ''}</p>`;
      card.addEventListener('click', () => {
        currentUrl = item.url;
        if (promptInput) promptInput.value = item.prompt;
        resultWrap?.classList.remove('hidden');
        if (resultImg) { resultImg.src = item.url; resultImg.style.display = 'block'; }
        if (resultLoader) resultLoader.style.display = 'none';
        if (dlBtn) dlBtn.disabled = false;
        if (addBtn) addBtn.disabled = false;
        document.querySelector('[data-tab="ai"]')?.click();
      });
      wrap.appendChild(card);
    });
  };

  renderHistory();
  return { generate };
})();
