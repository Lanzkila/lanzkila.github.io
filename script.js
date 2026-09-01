/* Lanzkila Project Hub — Komikku-inspired redesign */
let activeCategory = 'all';
let currentMenuUrl = '';
let pendingUrl = '';
const defaultMasterKey = 'LanzKey99';

const categoryNames = {
  cat1: 'Personal / Anime',
  cat2: 'Radio / TV',
  cat3: 'Safelink',
  cat4: 'Tools'
};

function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, char => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;'
  }[char]));
}

function renderProjects() {
  const grid = document.getElementById('blogGrid');
  if (!grid || typeof blogData === 'undefined') return;

  grid.innerHTML = '';
  blogData.forEach((item, index) => {
    const card = document.createElement('a');
    card.className = `blog-card ${item.cat || ''} ${item.isPrivate ? 'private' : ''}`;
    card.href = item.url;
    card.target = '_blank';
    card.rel = 'noopener noreferrer';
    card.dataset.name = String(item.name || '').toLowerCase();
    card.dataset.index = String(index);
    card.innerHTML = `
      <div class="card-top">
        <div class="repo-icon">${escapeHtml((item.name || 'K').trim().charAt(0).toUpperCase())}</div>
        <div class="badge-container">
          <span class="badge-new" style="display:${item.isNew ? 'inline-flex' : 'none'}">New</span>
        </div>
      </div>
      <h3>${escapeHtml(item.name || 'Untitled project')}</h3>
      <p>${escapeHtml(item.desc || 'No description available.')}</p>
      <div class="card-foot">
        <span class="card-category">${escapeHtml(categoryNames[item.cat] || 'Project')}</span>
        <span class="card-open">Open
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg>
        </span>
      </div>`;

    if (localStorage.getItem(item.url) === 'visited') card.classList.add('visited');
    grid.appendChild(card);
  });

  initReveal();
  applyFilters();
  updateCounts();
}

function updateCounts() {
  const all = document.querySelectorAll('.blog-card').length;
  const newCount = [...document.querySelectorAll('.badge-new')].filter(el => el.style.display !== 'none').length;
  const visible = [...document.querySelectorAll('.blog-card')].filter(card => !card.classList.contains('hidden') && !card.classList.contains('search-hidden')).length;
  const v = document.getElementById('vCount');
  const o = document.getElementById('oCount');
  const shown = document.getElementById('visibleCount');
  const empty = document.getElementById('emptyState');
  if (v) v.textContent = all;
  if (o) o.textContent = newCount;
  if (shown) shown.textContent = visible;
  if (empty) empty.hidden = visible !== 0;
}

function searchFunction() {
  const search = document.getElementById('searchBar');
  if (!search) return;
  const query = search.value.trim().toLowerCase();

  document.querySelectorAll('.blog-card').forEach(card => {
    const text = `${card.dataset.name || ''} ${card.textContent || ''}`.toLowerCase();
    card.classList.toggle('search-hidden', !!query && !text.includes(query));
  });

  if (query.length >= 2) {
    searchHistory[query] = (searchHistory[query] || 0) + 1;
    localStorage.setItem('searchTrend', JSON.stringify(searchHistory));
    updateTrendUI();
  }
  updateCounts();
}

function filterBlog(category, button) {
  activeCategory = category;
  document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
  if (button) button.classList.add('active');
  applyFilters();
}

function applyFilters() {
  document.querySelectorAll('.blog-card').forEach(card => {
    card.classList.toggle('hidden', activeCategory !== 'all' && !card.classList.contains(activeCategory));
  });
  updateCounts();
}

function sortGrid(mode) {
  const grid = document.getElementById('blogGrid');
  if (!grid) return;
  const cards = [...grid.querySelectorAll('.blog-card')];

  cards.sort((a, b) => {
    if (mode === 'name') return (a.dataset.name || '').localeCompare(b.dataset.name || '');
    return Number(b.dataset.index || 0) - Number(a.dataset.index || 0);
  });
  cards.forEach(card => grid.appendChild(card));
}

function randomBlog() {
  const cards = [...document.querySelectorAll('.blog-card')].filter(card =>
    !card.classList.contains('hidden') &&
    !card.classList.contains('search-hidden') &&
    !card.classList.contains('private')
  );
  if (!cards.length) return;
  const chosen = cards[Math.floor(Math.random() * cards.length)];
  window.open(chosen.href, '_blank', 'noopener');
}

function toggleTheme() {
  const body = document.body;
  const next = body.dataset.theme === 'dark' ? 'light' : 'dark';
  body.dataset.theme = next;
  localStorage.setItem('lanzkila-theme', next);
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', next === 'dark' ? '#111113' : '#ffffff');
}

function toggleMobileMenu() {
  const nav = document.getElementById('mobileNav');
  const btn = document.getElementById('mobileMenuBtn');
  if (!nav || !btn) return;
  const open = nav.classList.toggle('open');
  btn.setAttribute('aria-expanded', String(open));
}

function closeMobileMenu() {
  document.getElementById('mobileNav')?.classList.remove('open');
  document.getElementById('mobileMenuBtn')?.setAttribute('aria-expanded', 'false');
}

function scrollToTop() { window.scrollTo({top:0,behavior:'smooth'}); }

function updateNetStatus() {
  const dot = document.getElementById('netDot');
  const text = document.getElementById('netText');
  if (!dot || !text) return;
  const online = navigator.onLine;
  dot.classList.toggle('offline', !online);
  text.textContent = online ? 'Online' : 'Offline';
}

let searchHistory = JSON.parse(localStorage.getItem('searchTrend') || '{}');
function updateTrendUI() {
  const keys = Object.keys(searchHistory);
  const top = keys.length ? keys.reduce((best, key) => (searchHistory[key] || 0) > (searchHistory[best] || 0) ? key : best, keys[0]) : '...';
  const el = document.getElementById('trendWord');
  if (el) el.textContent = top;
}
function quickSearch() {
  const trend = document.getElementById('trendWord')?.textContent || '...';
  const input = document.getElementById('searchBar');
  if (input && trend !== '...') {
    input.value = trend;
    searchFunction();
    input.focus();
  }
}

function initAdminSystem() {
  const greeting = document.getElementById('greetText');
  if (greeting) {
    const hour = new Date().getHours();
    greeting.textContent = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  }

  if (navigator.getBattery) {
    navigator.getBattery().then(battery => {
      const level = document.getElementById('batLevel');
      if (!level) return;
      const paint = () => { level.style.width = `${Math.round(battery.level * 100)}%`; };
      paint();
      battery.addEventListener('levelchange', paint);
    }).catch(() => {});
  }
}

function initReveal() {
  const cards = document.querySelectorAll('.blog-card');
  if (!('IntersectionObserver' in window)) {
    cards.forEach(card => card.classList.add('reveal'));
    return;
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal');
        observer.unobserve(entry.target);
      }
    });
  }, {threshold:.08});
  cards.forEach(card => observer.observe(card));
}

function setupIncognito() {
  let timer;
  const mark = document.querySelector('.brand-mark');
  if (!mark) return;
  const start = () => { timer = setTimeout(() => document.body.classList.toggle('incognito-active'), 1800); };
  const cancel = () => clearTimeout(timer);
  mark.addEventListener('mousedown', start);
  mark.addEventListener('mouseup', cancel);
  mark.addEventListener('mouseleave', cancel);
  mark.addEventListener('touchstart', start, {passive:true});
  mark.addEventListener('touchend', cancel);
}

async function getActiveMasterHash() {
  let savedHash = localStorage.getItem('site_master_hash');
  if (savedHash) return savedHash;
  const data = new TextEncoder().encode(defaultMasterKey);
  const buffer = await crypto.subtle.digest('SHA-256', data);
  savedHash = [...new Uint8Array(buffer)].map(b => b.toString(16).padStart(2,'0')).join('');
  localStorage.setItem('site_master_hash', savedHash);
  return savedHash;
}

function openLock(url) {
  pendingUrl = url;
  document.getElementById('linkLock')?.classList.add('show');
  document.getElementById('linkLockBackdrop')?.classList.add('show');
  setTimeout(() => document.getElementById('lockKey')?.focus(), 80);
}
function closeLock() {
  document.getElementById('linkLock')?.classList.remove('show');
  document.getElementById('linkLockBackdrop')?.classList.remove('show');
  const input = document.getElementById('lockKey');
  if (input) input.value = '';
}

function openCurrent() { if (currentMenuUrl) window.open(currentMenuUrl, '_blank', 'noopener'); hideContextMenu(); }
async function copyCurrent() {
  if (!currentMenuUrl) return;
  try { await navigator.clipboard.writeText(currentMenuUrl); showToast('Repository link copied.'); }
  catch { showToast('Unable to copy the link.'); }
  hideContextMenu();
}
function hideContextMenu() { const menu = document.getElementById('customMenu'); if (menu) menu.style.display = 'none'; }
function showToast(message) {
  const toast = document.getElementById('notifBubble');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 2800);
}

function updateScrollUI() {
  const top = window.scrollY || document.documentElement.scrollTop;
  const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  const bar = document.getElementById('myBar');
  if (bar) bar.style.width = height > 0 ? `${(top / height) * 100}%` : '0%';
  document.getElementById('backToTop')?.classList.toggle('show', top > 500);
}

function installEvents() {
  window.addEventListener('online', updateNetStatus);
  window.addEventListener('offline', updateNetStatus);
  window.addEventListener('scroll', updateScrollUI, {passive:true});

  document.addEventListener('keydown', event => {
    if (event.key === '/' && document.activeElement?.tagName !== 'INPUT') {
      event.preventDefault();
      document.getElementById('searchBar')?.focus();
    }
    if (event.key === 'Escape') {
      closeMobileMenu();
      closeLock();
      hideContextMenu();
    }
  });

  document.addEventListener('click', event => {
    const card = event.target.closest('.blog-card');
    if (card) {
      if (card.classList.contains('private')) {
        event.preventDefault();
        openLock(card.href);
        return;
      }
      localStorage.setItem(card.href, 'visited');
      card.classList.add('visited');
    }
    if (!event.target.closest('#customMenu')) hideContextMenu();
  });

  document.addEventListener('contextmenu', event => {
    const card = event.target.closest('.blog-card');
    if (!card) return;
    event.preventDefault();
    currentMenuUrl = card.href;
    const menu = document.getElementById('customMenu');
    if (!menu) return;
    menu.style.display = 'block';
    const maxX = window.innerWidth - 175;
    const maxY = window.innerHeight - 100;
    menu.style.left = `${Math.max(8, Math.min(event.clientX, maxX))}px`;
    menu.style.top = `${Math.max(8, Math.min(event.clientY, maxY))}px`;
  });

  const unlock = document.getElementById('btnUnlock');
  if (unlock) unlock.addEventListener('click', async () => {
    const input = document.getElementById('lockKey');
    if (!input) return;
    const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input.value));
    const hash = [...new Uint8Array(buffer)].map(b => b.toString(16).padStart(2,'0')).join('');
    if (hash === await getActiveMasterHash()) {
      window.open(pendingUrl, '_blank', 'noopener');
      closeLock();
    } else {
      showToast('Access key is incorrect.');
      input.value = '';
      input.focus();
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const storedTheme = localStorage.getItem('lanzkila-theme');
  if (storedTheme === 'dark' || storedTheme === 'light') document.body.dataset.theme = storedTheme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', document.body.dataset.theme === 'dark' ? '#111113' : '#ffffff');

  renderProjects();
  updateTrendUI();
  updateNetStatus();
  initAdminSystem();
  setupIncognito();
  installEvents();
  updateScrollUI();

  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
  setTimeout(() => showToast('Lanzkila Pages is ready.'), 650);
});
