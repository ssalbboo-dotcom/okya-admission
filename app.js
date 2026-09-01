(() => {
  'use strict';
  const TOTAL = 96;
  const MOBILE = () => matchMedia('(max-width: 760px)').matches;
  const book = document.getElementById('book');
  const status = document.getElementById('pageStatus');
  const input = document.getElementById('pageInput');
  const prev = document.getElementById('prev');
  const next = document.getElementById('next');
  const viewport = document.getElementById('viewport');
  let page = Number(sessionStorage.getItem('okya-page')) || 1;
  let zoom = 1;
  let touchX = 0;

  const src = n => `./pages/page-${String(n).padStart(3, '0')}.webp`;
  const visible = () => {
    if (MOBILE() || page === 1 || page === TOTAL) return [page];
    const left = page % 2 === 0 ? page : page - 1;
    return [left, Math.min(left + 1, TOTAL)];
  };
  const preload = n => { if (n >= 1 && n <= TOTAL) { const i = new Image(); i.src = src(n); } };
  function render(direction = '') {
    page = Math.max(1, Math.min(TOTAL, page));
    const pages = visible();
    book.className = `book ${pages.length === 1 ? 'single' : 'spread'} ${direction}`;
    book.innerHTML = '';
    pages.forEach(n => {
      const frame = document.createElement('div'); frame.className = 'page loading';
      const img = new Image(); img.alt = `가이드북 ${n}페이지`; img.decoding = 'async'; img.src = src(n);
      img.onload = () => frame.classList.remove('loading'); img.onerror = () => { frame.classList.remove('loading'); frame.textContent = '페이지를 불러오지 못했습니다.'; };
      frame.appendChild(img); book.appendChild(frame);
    });
    const label = pages.length === 2 ? `${pages[0]}–${pages[1]} / ${TOTAL}` : `${page} / ${TOTAL}`;
    status.textContent = label; input.value = page; prev.disabled = page <= 1; next.disabled = page >= TOTAL;
    sessionStorage.setItem('okya-page', page);
    const near = new Set(); pages.forEach(n => { for (let d=-3; d<=3; d++) near.add(n+d); }); near.forEach(preload);
    setTimeout(() => book.classList.remove('flip-next','flip-prev'), 540);
  }
  function step(dir) {
    if (dir > 0 && page >= TOTAL || dir < 0 && page <= 1) return;
    page += MOBILE() || page === 1 || page === TOTAL ? dir : dir * 2;
    if (dir < 0 && page < 1) page = 1;
    render(dir > 0 ? 'flip-next' : 'flip-prev');
  }
  prev.onclick = () => step(-1); next.onclick = () => step(1);
  document.getElementById('goPage').onclick = () => { page = Number(input.value) || 1; render(); };
  input.addEventListener('keydown', e => { if (e.key === 'Enter') document.getElementById('goPage').click(); });
  document.addEventListener('keydown', e => { if (e.target === input) return; if (e.key === 'ArrowLeft') step(-1); if (e.key === 'ArrowRight') step(1); });
  viewport.addEventListener('touchstart', e => touchX = e.changedTouches[0].clientX, {passive:true});
  viewport.addEventListener('touchend', e => { const dx = e.changedTouches[0].clientX-touchX; if (Math.abs(dx)>45) step(dx<0?1:-1); }, {passive:true});
  function setZoom(value){ zoom=Math.max(.75,Math.min(2,value)); document.documentElement.style.setProperty('--zoom',zoom); document.getElementById('zoomLabel').textContent=`${Math.round(zoom*100)}%`; }
  document.getElementById('zoomIn').onclick=()=>setZoom(zoom+.25); document.getElementById('zoomOut').onclick=()=>setZoom(zoom-.25);
  document.getElementById('fullscreen').onclick=async()=>{ if(!document.fullscreenElement) await document.documentElement.requestFullscreen(); else await document.exitFullscreen(); };
  let timer; addEventListener('resize',()=>{clearTimeout(timer);timer=setTimeout(()=>render(),150)});
  render();
})();
