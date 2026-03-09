// ── Custom cursor ──────────────────────────────────────────────────────────
  const dot  = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  function animCursor() {
    rx += (mx - rx) * .15;
    ry += (my - ry) * .15;
    dot.style.left  = mx + 'px'; dot.style.top  = my + 'px';
    ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
    requestAnimationFrame(animCursor);
  }
  animCursor();

  document.querySelectorAll('a, button, .theme-card, .auto-pill, .feat-card').forEach(el => {
    el.addEventListener('mouseenter', () => {
      ring.style.width = '54px'; ring.style.height = '54px';
      ring.style.borderColor = 'rgba(245,158,11,.7)';
    });
    el.addEventListener('mouseleave', () => {
      ring.style.width = '36px'; ring.style.height = '36px';
      ring.style.borderColor = 'rgba(245,158,11,.5)';
    });
  });

  // ── Scroll reveal ──────────────────────────────────────────────────────────
  const observer = new IntersectionObserver(entries => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('visible'), i * 80);
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  // ── Auto wallpaper timer countdown (demo) ────────────────────────────────
  let secs = 2 * 3600 + 47 * 60 + 13;
  function pad(n) { return String(n).padStart(2,'0'); }
  function tick() {
    if (secs <= 0) secs = 3600;
    secs--;
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    const el = document.querySelector('.auto-timer');
    if (el) el.textContent = `${pad(h)}:${pad(m)}:${pad(s)}`;
  }
  setInterval(tick, 1000);

  // ── Auto-pill toggle (demo) ───────────────────────────────────────────────
  document.querySelectorAll('.auto-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.auto-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
    });
  });

  // ── AI typing animation ───────────────────────────────────────────────────
  const prompts = [
    'misty purple mountains at golden hour, ultra detailed',
    'cyberpunk city rain neon reflections 4k',
    'deep ocean bioluminescence, dark, ethereal',
    'macro cherry blossom petals, bokeh, pastel',
    'abstract geometric void, dark matter swirling'
  ];
  let pi = 0, ci = 0, deleting = false;
  const typingEl = document.querySelector('.ai-typing');

  function typeLoop() {
    const target = prompts[pi];
    if (!deleting) {
      if (ci < target.length) {
        typingEl.textContent = target.slice(0, ++ci);
        setTimeout(typeLoop, 45);
      } else {
        setTimeout(() => { deleting = true; typeLoop(); }, 2200);
      }
    } else {
      if (ci > 0) {
        typingEl.textContent = target.slice(0, --ci);
        setTimeout(typeLoop, 22);
      } else {
        deleting = false;
        pi = (pi + 1) % prompts.length;
        setTimeout(typeLoop, 400);
      }
    }
  }
  typeLoop();

  // ── Smooth nav active state ───────────────────────────────────────────────
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');
  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(s => {
      if (window.scrollY >= s.offsetTop - 200) current = s.id;
    });
    navLinks.forEach(a => {
      a.style.color = a.getAttribute('href') === '#' + current
        ? 'var(--text)' : '';
    });
  }, { passive: true });
