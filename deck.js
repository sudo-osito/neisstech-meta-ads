(() => {
  const W = 1600, H = 900;
  if (location.search.includes('static')) document.documentElement.classList.add('static');
  const stage = document.getElementById('stage');
  const slides = [...document.querySelectorAll('.slide')];
  const secEl = document.getElementById('sec');
  const countEl = document.getElementById('count');
  const bar = document.querySelector('#progress i');
  let cur = 0;

  // agrupa el contenido bajo el título para centrarlo verticalmente
  slides.forEach(s => {
    if (s.classList.contains("cover") || s.classList.contains("divider")) return;
    const h = s.querySelector(":scope > h2"); if (!h) return;
    const body = document.createElement("div"); body.className = "body";
    [...s.children].filter(c => c !== h && !c.classList.contains("foot")).forEach(c => body.appendChild(c));
    h.after(body);
  });

  // stagger index for entrance animations
  slides.forEach(s => s.querySelectorAll('.a').forEach((el, i) => el.style.setProperty('--i', i)));

  function fit() {
    const k = Math.min(innerWidth / W, innerHeight / H);
    stage.style.transform = `translate(-50%, -50%) scale(${k})`;
  }

  function countUp(el) {
    const to = +el.dataset.to, t0 = performance.now(), dur = 1400;
    const step = t => {
      const p = Math.min(1, (t - t0) / dur), v = Math.round(to * (1 - Math.pow(1 - p, 3)));
      el.textContent = '$' + v.toLocaleString('es-CL');
      if (p < 1) requestAnimationFrame(step);
    };
    setTimeout(() => requestAnimationFrame(step), 700);
  }

  function go(n, fromHash) {
    n = Math.max(0, Math.min(slides.length - 1, n));
    slides[cur].classList.remove('active');
    cur = n;
    const s = slides[cur];
    void s.offsetWidth; // restart animations
    s.classList.add('active');
    s.querySelectorAll('.count').forEach(countUp);
    secEl.textContent = s.dataset.sec || '';
    countEl.textContent = `${cur + 1} / ${slides.length}`;
    bar.style.width = ((cur + 1) / slides.length * 100) + '%';
    if (!fromHash) history.replaceState(null, '', '#' + (cur + 1));
  }

  addEventListener('keydown', e => {
    if (['ArrowRight', 'PageDown', ' ', 'Enter'].includes(e.key)) { e.preventDefault(); go(cur + 1); }
    if (['ArrowLeft', 'PageUp', 'Backspace'].includes(e.key)) { e.preventDefault(); go(cur - 1); }
    if (e.key === 'Home') go(0);
    if (e.key === 'End') go(slides.length - 1);
    if (e.key === 'f') document.documentElement.requestFullscreen?.();
  });
  document.getElementById('next').onclick = () => go(cur + 1);
  document.getElementById('prev').onclick = () => go(cur - 1);

  let tx = null;
  addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
  addEventListener('touchend', e => {
    if (tx === null) return;
    const dx = e.changedTouches[0].clientX - tx;
    if (Math.abs(dx) > 50) go(cur + (dx < 0 ? 1 : -1));
    tx = null;
  });

  addEventListener('resize', fit);
  addEventListener('hashchange', () => go((parseInt(location.hash.slice(1)) || 1) - 1, true));
  fit();
  go((parseInt(location.hash.slice(1)) || 1) - 1, true);
})();
