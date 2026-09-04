/* =========================================================
   GITHUB PAGES DATA RENDERER
   data.js contains data only; all DOM creation lives here.
   ========================================================= */
function renderBlogData() {
  const grid = document.getElementById('blogGrid');
  if (!grid || !Array.isArray(blogData)) return;

  grid.innerHTML = '';

  blogData.forEach(function(item) {
    const card = document.createElement('a');
    card.className = 'blog-card ' + (item.cat || 'cat4') + (item.isPrivate ? ' private' : '');
    card.href = item.url || '#';
    card.target = '_blank';
    card.rel = 'noopener noreferrer';

    if (item.added) card.setAttribute('data-added', item.added);
    if (item.revision !== undefined && item.revision !== null && String(item.revision) !== '') {
      card.setAttribute('data-revision', String(item.revision));
    }
    if (item.updateType) card.setAttribute('data-update-type', String(item.updateType));

    const badgeContainer = document.createElement('div');
    badgeContainer.className = 'badge-container';
    const badge = document.createElement('span');
    badge.className = 'badge-new';
    badge.textContent = 'New Update';
    badgeContainer.appendChild(badge);
    card.appendChild(badgeContainer);

    const heading = document.createElement('h3');
    const statusDot = document.createElement('span');
    statusDot.className = 'status-dot status-online';
    heading.appendChild(statusDot);
    heading.appendChild(document.createTextNode(item.name || 'Untitled'));
    card.appendChild(heading);

    const description = document.createElement('p');
    description.textContent = item.desc || '';
    card.appendChild(description);

    grid.appendChild(card);
  });
}

/* script.js is loaded after #blogGrid and after data.js. */
renderBlogData();

//
/* --- BLOG BADGE TRACKER v17.0 --- */
/*
  NEW ADDED
  - Blog lama pada pemasangan pertama dijadikan baseline (tidak semua terus jadi "New Added").
  - Selepas baseline wujud, URL blog baru yang dimasukkan ke mana-mana kategori akan
    menerima badge "New Added" selama 24 jam pada browser yang pernah membuka hub ini.
  - Jika mahu badge blog baru muncul kepada SEMUA pelawat, tambah pada kad:
      data-added='2026-08-24T23:40:00+08:00'

  NEW UPDATE
  - Automatik melalui Blogger feed.updated untuk post/feed.
  - Perubahan pada nama/deskripsi/link kad dalam hub turut dikesan.
  - Untuk perubahan code/theme/CSS/JS di blog (yang Blogger feed tidak laporkan),
    ubah nilai data-revision pada kad, contoh:
      data-revision='2'
    Setiap kali code/theme blog berubah, naikkan nombor/string revision itu.
*/

const NEW_ADDED_HOURS = 24;
const NEW_UPDATE_HOURS = 24;
const BLOG_REGISTRY_KEY = 'nimegun_blog_registry_v16';
const BLOG_REVISION_KEY = 'nimegun_blog_revision_v16';
const BLOG_LOCAL_UPDATE_KEY = 'nimegun_blog_local_update_v16';

function normalizeBlogUrl(url) {
  return (url || '')
    .trim()
    .replace(/\/+$/, '')
    .replace(/^http:\/\//i, 'https://');
}

function readStore(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value && typeof value === 'object' ? value : fallback;
  } catch (e) {
    return fallback;
  }
}

function writeStore(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {}
}

function simpleHash(str) {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return (hash >>> 0).toString(36);
}

function ensureCardMeta(card) {
  let box = card.querySelector('.badge-container');
  if (!box) {
    box = document.createElement('div');
    box.className = 'badge-container';
    card.insertBefore(box, card.firstChild);
  }

  let bNew = card.querySelector('.badge-new');
  if (!bNew) {
    bNew = document.createElement('span');
    bNew.className = 'badge-new';
    bNew.textContent = 'New Update';
    bNew.style.display = 'none';
  }
  if (bNew.parentNode !== box) box.appendChild(bNew);

  let bAdded = card.querySelector('.badge-added');
  if (!bAdded) {
    bAdded = document.createElement('span');
    bAdded.className = 'badge-added';
    bAdded.textContent = 'New Added';
    bAdded.style.display = 'none';
  }
  if (bAdded.parentNode !== box) box.appendChild(bAdded);

  let lastUpdate = card.querySelector('.last-update');
  if (!lastUpdate) {
    lastUpdate = document.createElement('span');
    lastUpdate.className = 'last-update';
    lastUpdate.setAttribute('data-time', '');
    card.appendChild(lastUpdate);
  }

  let countdown = card.querySelector('.badge-countdown');
  if (!countdown) {
    countdown = document.createElement('div');
    countdown.className = 'badge-countdown';
    countdown.setAttribute('aria-label', 'Baki masa badge');
    card.appendChild(countdown);
  }

  return { bNew, bAdded, lastUpdate, countdown };
}

function setBadgeExpiry(badge, startTime, durationHours) {
  if (!badge || !startTime) return;
  const expiry = Number(startTime) + (durationHours * 3600000);
  const oldExpiry = Number(badge.getAttribute('data-expiry')) || 0;
  // Jika ada lebih daripada satu sumber update, kekalkan expiry yang paling baru.
  badge.setAttribute('data-expiry', String(Math.max(oldExpiry, expiry)));
}

function getCountdownParts(ms) {
  let totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  totalSeconds %= 3600;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return { hours, minutes, seconds };
}

function formatCountdownYYMMDDHHMMSS(ms) {
  // Nilai penuh untuk logik dalaman sahaja: YYMMDDHHMMSS.
  // Tempoh badge maksimum 24 jam, jadi YY/MM/DD kekal 00.
  const t = getCountdownParts(ms);
  return '000000'
    + String(t.hours).padStart(2, '0')
    + String(t.minutes).padStart(2, '0')
    + String(t.seconds).padStart(2, '0');
}

function formatCountdownCard(ms) {
  // Paparan kad cuma 24 jam: HH.MM.SS
  const t = getCountdownParts(ms);
  return String(t.hours).padStart(2, '0') + '.'
    + String(t.minutes).padStart(2, '0') + '.'
    + String(t.seconds).padStart(2, '0');
}

function makeCountdownRow(label, remainingMs) {
  const row = document.createElement('div');
  row.className = 'countdown-row';

  const name = document.createElement('span');
  name.className = 'countdown-label';
  name.textContent = label;

  const time = document.createElement('span');
  time.className = 'countdown-time';
  // Simpan format penuh di belakang layar, tetapi jangan paparkan pada kad.
  time.setAttribute('data-timesago-full', formatCountdownYYMMDDHHMMSS(remainingMs));
  time.setAttribute('data-format', 'YYMMDDHHMMSS');
  time.textContent = formatCountdownCard(remainingMs);

  row.appendChild(name);
  row.appendChild(time);
  return row;
}

function updateBadgeCountdowns() {
  const now = Date.now();

  document.querySelectorAll('.blog-card').forEach(card => {
    const meta = ensureCardMeta(card);
    const rows = [];

    [
      { badge: meta.bNew, label: 'New Update' },
      { badge: meta.bAdded, label: 'New Added' }
    ].forEach(item => {
      const expiry = Number(item.badge.getAttribute('data-expiry')) || 0;

      if (expiry > now) {
        item.badge.style.display = 'inline-block';
        rows.push(makeCountdownRow(item.label, expiry - now));
      } else if (expiry > 0) {
        item.badge.style.display = 'none';
        item.badge.removeAttribute('data-expiry');
      }
    });

    meta.countdown.innerHTML = '';
    rows.forEach(row => meta.countdown.appendChild(row));
    meta.countdown.classList.toggle('show', rows.length > 0);

    card.classList.toggle('has-active-badge', rows.length > 0);
    card.classList.toggle('has-two-active-badges', rows.length > 1);
  });

  if (typeof updateHubStats === 'function') updateHubStats();
}

function markLocalUpdate(url, time) {
  const updates = readStore(BLOG_LOCAL_UPDATE_KEY, {});
  updates[url] = time || Date.now();
  writeStore(BLOG_LOCAL_UPDATE_KEY, updates);
}

function initBlogTracking() {
  const cards = Array.from(document.querySelectorAll('.blog-card'));
  const now = Date.now();

  let registry = readStore(BLOG_REGISTRY_KEY, null);
  const isFirstRun = !registry || Object.keys(registry).length === 0;
  if (!registry) registry = {};

  let revisions = readStore(BLOG_REVISION_KEY, {});
  let localUpdates = readStore(BLOG_LOCAL_UPDATE_KEY, {});

  cards.forEach(card => {
    const meta = ensureCardMeta(card);
    // Reset sekali semasa tracker bermula; callback feed selepas ini tidak akan memadam badge lain.
    meta.bNew.style.display = 'none';
    meta.bAdded.style.display = 'none';

    const url = normalizeBlogUrl(card.getAttribute('href'));
    if (!url) return;

    // --- NEW ADDED ---
    const explicitAdded = card.getAttribute('data-added');
    let addedTime = explicitAdded ? new Date(explicitAdded).getTime() : 0;

    if (!registry[url]) {
      registry[url] = {
        firstSeen: now,
        baseline: isFirstRun && !explicitAdded
      };

      // Jika bukan pemasangan pertama, blog ini memang URL baru.
      if (!isFirstRun && !explicitAdded) addedTime = now;
    } else if (!addedTime && registry[url] && !registry[url].baseline) {
      addedTime = Number(registry[url].firstSeen) || 0;
    }

    if (addedTime > 0) {
      const ageHours = (now - addedTime) / 3600000;
      if (ageHours >= 0 && ageHours < NEW_ADDED_HOURS) {
        meta.bAdded.style.display = 'inline-block';
        setBadgeExpiry(meta.bAdded, addedTime, NEW_ADDED_HOURS);
      }
    }

    // --- PERUBAHAN KAD / REVISION MANUAL ---
    const title = card.querySelector('h3') ? card.querySelector('h3').innerText.trim() : '';
    const desc = card.querySelector('p') ? card.querySelector('p').innerText.trim() : '';
    const manualRevision = card.getAttribute('data-revision') || '';
    const fingerprint = simpleHash([url, title, desc, manualRevision].join('|'));

    if (!(url in revisions)) {
      // Baseline: jangan label semua kad sebagai update masa v16 pertama dipasang.
      revisions[url] = fingerprint;
    } else if (revisions[url] !== fingerprint) {
      revisions[url] = fingerprint;
      localUpdates[url] = now;
    }

    const localUpdateTime = Number(localUpdates[url]) || 0;
    if (localUpdateTime > 0) {
      const localAge = (now - localUpdateTime) / 3600000;
      if (localAge >= 0 && localAge < NEW_UPDATE_HOURS) {
        meta.bNew.style.display = 'inline-block';
        setBadgeExpiry(meta.bNew, localUpdateTime, NEW_UPDATE_HOURS);
        meta.lastUpdate.setAttribute('data-time', new Date(localUpdateTime).toISOString());
      }
    }
  });

  writeStore(BLOG_REGISTRY_KEY, registry);
  writeStore(BLOG_REVISION_KEY, revisions);
  writeStore(BLOG_LOCAL_UPDATE_KEY, localUpdates);
}

function fetchAllUpdates() {
  // Elak JSONP dipanggil dua kali oleh startup lama + DOMContentLoaded.
  if (window.__nimegunUpdatesFetched) return;
  window.__nimegunUpdatesFetched = true;

  initBlogTracking();

  const cards = document.querySelectorAll('.blog-card');
  cards.forEach((card, index) => {
    const blogUrl = card.getAttribute('href');
    if (!blogUrl || !blogUrl.includes('http')) return;

    const cleanUrl = normalizeBlogUrl(blogUrl);
    const callbackName = 'setUpdate_' + index + '_' + Date.now();

    window[callbackName] = function(data) {
      try {
        if (data && data.feed) {
          const updatedStr = data.feed.updated ? data.feed.updated.$t : '';
          if (updatedStr !== '') {
            const meta = ensureCardMeta(card);
            const lastUpdateDate = new Date(updatedStr);
            const diffInHours = (Date.now() - lastUpdateDate.getTime()) / 3600000;

            // Simpan masa untuk butang "Terkini".
            meta.lastUpdate.setAttribute('data-time', updatedStr);

            // Blogger feed: post/feed berubah dalam 24 jam.
            if (diffInHours >= 0 && diffInHours < NEW_UPDATE_HOURS) {
              meta.bNew.style.display = 'inline-block';
              setBadgeExpiry(meta.bNew, lastUpdateDate.getTime(), NEW_UPDATE_HOURS);
            }
          }
        }
      } finally {
        // Bersihkan callback JSONP supaya tidak menumpuk.
        try { delete window[callbackName]; } catch (e) { window[callbackName] = undefined; }
      }

      updateHubStats();
    };

    const script = document.createElement('script');
    script.async = true;
    script.src = cleanUrl + '/feeds/posts/default?alt=json-in-script&max-results=1&callback='
      + callbackName + '&t=' + Date.now();

    script.onload = function() {
      setTimeout(function() {
        if (script.parentNode) script.parentNode.removeChild(script);
      }, 0);
    };

    script.onerror = function() {
      // Blog/feed gagal dibaca tidak menjadikan blog "offline"; cuma update feed tak dapat disemak.
      try { delete window[callbackName]; } catch (e) { window[callbackName] = undefined; }
      if (script.parentNode) script.parentNode.removeChild(script);
    };

    document.body.appendChild(script);
  });
}

/* Startup badge dipindahkan ke NIMEGUN SUITE v17.0 */


/* 2. SEARCH ENGINE */
function searchFunction() {
  const searchBar = document.getElementById('searchBar');
  if(!searchBar) return;
  let input = searchBar.value.toLowerCase();
  document.querySelectorAll('.blog-card').forEach(card => {
    let title = card.querySelector('h3').innerText.toLowerCase();
    card.style.display = title.includes(input) ? "" : "none";
  });
}

/* 3. FILTER SYSTEM */
function filterBlog(c) {
  let btns = document.querySelectorAll('.filter-btn');
  btns.forEach(b => b.classList.remove('active'));
  if(window.event && window.event.target) window.event.target.classList.add('active');

  document.querySelectorAll('.blog-card').forEach(card => {
    if (c === 'all') {
      card.classList.remove('hidden');
    } else {
      card.classList.toggle('hidden', !card.classList.contains(c));
    }
  });
}

/* 4. UI UTILITIES */
function toggleFab() { 
  const fabBtn = document.getElementById('fabBtn');
  const fabMenu = document.getElementById('fabMenu');
  if(fabBtn && fabMenu) {
    fabBtn.classList.toggle('active');
    fabMenu.classList.toggle('show');
  }
}

function toggleTheme() {
  const b = document.body;
  const currentTheme = b.getAttribute('data-theme');
  const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
  b.setAttribute('data-theme', nextTheme);
  try { localStorage.setItem('nimegun_theme_v175', nextTheme); } catch (e) {}
}

function scrollToTop() {
  // v17.4.1: floating menu sudah dibuang, jadi jangan panggil v173CloseFab().
  // Cuba smooth scroll dahulu.
  try {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  } catch (e) {
    window.scrollTo(0, 0);
  }

  // Fallback untuk Blogger / browser yang guna scrolling element berbeza.
  if (document.scrollingElement) {
    try {
      document.scrollingElement.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    } catch (e) {
      document.scrollingElement.scrollTop = 0;
    }
  }

  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

/* 5. SCROLL PROGRESS BAR */
window.onscroll = function() {
  let winScroll = document.body.scrollTop || document.documentElement.scrollTop;
  let height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  const myBar = document.getElementById("myBar");
  if(myBar && height > 0) {
    myBar.style.width = (winScroll / height) * 100 + "%";
  }

  const topBtn = document.getElementById('scrollTopBtn');
  if (topBtn) {
    topBtn.classList.toggle('show', winScroll > 320);
  }

  if (typeof v175HandleHeaderCollapse === 'function') {
    v175HandleHeaderCollapse(winScroll);
  }
};

/* 5. START UP (VERSA STABIL v13) */
// Set Tahun Footer
const yearEl = document.getElementById('year');
if(yearEl) yearEl.innerText = new Date().getFullYear();


// --- INI FUNGSI STAGGER YANG KAU MAU ---
if (typeof initReveal === "function") {
  initReveal(); 
}

// Notifikasi Bubble
setTimeout(() => {
  const notif = document.getElementById('notifBubble');
  if(notif) {
    notif.classList.add('show');
    setTimeout(() => { notif.classList.remove('show'); }, 5000);
  }
}, 2000);

/* STATISTIK AUTOMATIK BERDASARKAN KAD */
function updateHubStats() {
  const allCards = document.querySelectorAll('.blog-card').length;
  const activeUpdates = Array.from(document.querySelectorAll('.badge-new'))
                        .filter(b => b.style.display !== 'none').length;
  const activeAdded = Array.from(document.querySelectorAll('.badge-added'))
                        .filter(b => b.style.display !== 'none').length;

  const vCount = document.getElementById('vCount');
  const oCount = document.getElementById('oCount');
  const aCount = document.getElementById('aCount');

  if (vCount) vCount.innerText = allCards;
  if (oCount) oCount.innerText = activeUpdates;
  if (aCount) aCount.innerText = activeAdded;
}

// Jalankan fungsi setiap 5 saat untuk pantau update masuk
setInterval(updateHubStats, 5000);
// Jalankan sekali masa mula-mula buka page
setTimeout(updateHubStats, 3000); 

/* 1. FUNGSI RANDOM BLOG (SURPRISE) */
function randomBlog() {
  const cards = document.querySelectorAll('.blog-card');
  if (cards.length > 0) {
    const randomIndex = Math.floor(Math.random() * cards.length);
    const randomUrl = cards[randomIndex].getAttribute('href');
    alert("🎲 Memilih blog rawak untuk anda...");
    window.open(randomUrl, '_blank');
  }
}

/* 3. VISIT TRACKER (Glow Indicator) */
document.querySelectorAll('.blog-card').forEach(card => {
  card.addEventListener('click', () => {
    localStorage.setItem(card.href, 'visited');
    card.classList.add('visited');
  });
  if(localStorage.getItem(card.href) === 'visited') {
    card.classList.add('visited');
  }
});

/* 1. NETWORK STATUS INDICATOR */
function updateNetStatus() {
  const dot = document.getElementById('netDot');
  const txt = document.getElementById('netText');
  if (navigator.onLine) {
    dot.classList.remove('offline');
    txt.innerText = "Online";
    txt.style.color = "#22c55e";
  } else {
    dot.classList.add('offline');
    txt.innerText = "Offline";
    txt.style.color = "#ef4444";
  }
}
window.addEventListener('online', updateNetStatus);
window.addEventListener('offline', updateNetStatus);

/* 2. TRENDING SEARCH LOGIC */
let searchHistory = JSON.parse(localStorage.getItem('searchTrend')) || {};

function recordSearch(val) {
  if (val.length < 3) return;
  searchHistory[val] = (searchHistory[val] || 0) + 1;
  localStorage.setItem('searchTrend', JSON.stringify(searchHistory));
  updateTrendUI();
}

function updateTrendUI() {
  const topSearch = Object.keys(searchHistory).reduce((a, b) => searchHistory[a] > searchHistory[b] ? a : b, "...");
  const trendWord = document.getElementById('trendWord');
  if(trendWord) trendWord.innerText = topSearch;
}

function quickSearch() {
  const word = document.getElementById('trendWord').innerText;
  if(word !== "...") {
    document.getElementById('searchBar').value = word;
    searchFunction();
  }
}

/* 3. AUTO-SORT ENGINE */
function sortGrid(type) {
  const grid = document.getElementById('blogGrid');
  const cards = Array.from(grid.getElementsByClassName('blog-card'));

  cards.sort((a, b) => {
    if (type === 'name') {
      return a.querySelector('h3').innerText.localeCompare(b.querySelector('h3').innerText);
    } else if (type === 'update') {
      const lastA = a.querySelector('.last-update');
      const lastB = b.querySelector('.last-update');
      const timeA = new Date(lastA ? (lastA.getAttribute('data-time') || 0) : 0);
      const timeB = new Date(lastB ? (lastB.getAttribute('data-time') || 0) : 0);
      return timeB - timeA; 
    }
    return 0;
  });

  cards.forEach(card => grid.appendChild(card));
}

/* --- 4 & 5. MASTER STARTUP (INCIGNITO + STATUS + DATA) --- */
let pressTimer;

document.addEventListener('DOMContentLoaded', function() {
  // A. Panggil Data & Update UI
  if (typeof fetchAllUpdates === "function") fetchAllUpdates();
  if (typeof updateTrendUI === "function") updateTrendUI();
  if (typeof updateNetStatus === "function") updateNetStatus();

  // C. MOD INCOGNITO (Desktop & Mobile)
  const headerTitle = document.querySelector('header h1');
  if(headerTitle) {
    const startP = function() {
      pressTimer = window.setTimeout(function() {
        document.body.classList.toggle('incognito-active');
        alert(document.body.classList.contains('incognito-active') ? "🕵️ Mod Incognito Aktif" : "🔓 Mod Pentadbir Aktif");
      }, 2000);
    };
    const cancelP = function() { clearTimeout(pressTimer); };

    headerTitle.addEventListener('mousedown', startP);
    headerTitle.addEventListener('mouseup', cancelP);
    headerTitle.addEventListener('mouseleave', cancelP);
    headerTitle.addEventListener('touchstart', startP, {passive: true});
    headerTitle.addEventListener('touchend', cancelP);
  }

  // D. Statistik Tracker (Live)
  setInterval(function() {
    if (typeof updateHubStats === 'function') updateHubStats();
  }, 3000);
});

/* --- 6. CUSTOM CONTEXT MENU (STABLE) --- */
let currentMenuUrl = "";
document.addEventListener('contextmenu', function(e) {
  const card = e.target.closest('.blog-card');
  if (card) {
    e.preventDefault();
    currentMenuUrl = card.href;
    const menu = document.getElementById('customMenu');
    if (menu) {
      menu.style.display = 'block';
      menu.style.left = e.clientX + 'px';
      menu.style.top = e.clientY + 'px';
    }
  }
});

document.addEventListener('click', function() {
  const menu = document.getElementById('customMenu');
  if (menu) menu.style.display = 'none';
});

function openCurrent() { if(currentMenuUrl) window.open(currentMenuUrl, '_blank'); }
function copyCurrent() { 
  if(currentMenuUrl) {
    navigator.clipboard.writeText(currentMenuUrl); 
    alert("✅ Pautan berjaya disalin!"); 
  }
}

/* SMART GREETING & BATTERY SYSTEM */
function initAdminSystem() {
  const greetText = document.getElementById('greetText');
  if (greetText) {
    const hr = new Date().getHours();
    let greet = "Selamat Malam, Admin 🌙";
    if (hr < 12) greet = "Selamat Pagi, Admin 🌅";
    else if (hr < 18) greet = "Selamat Petang, Admin ☀️";
    greetText.innerText = greet;
  }

  // Battery Sync
  if (navigator.getBattery) {
    navigator.getBattery().then(bat => {
      const batLevel = document.getElementById('batLevel');
      if (batLevel) {
        const updateBat = () => {
          const pct = Math.round(bat.level * 100);
          batLevel.style.width = pct + "%";
          const pctText = document.getElementById('batPercent');
          if (pctText) pctText.textContent = pct + "%";
        };
        updateBat();
        bat.addEventListener('levelchange', updateBat);
        bat.addEventListener('chargingchange', updateBat);
      }
    });
  }
}

// Panggil dalam startup
document.addEventListener('DOMContentLoaded', initAdminSystem);

/* --- AUTO REVEAL ENGINE v13 (STAGGERED) --- */
function initReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        // Delay 100ms setiap kad supaya dia masuk satu-satu (Stagger)
        setTimeout(() => {
          entry.target.classList.add('reveal');
        }, index * 100); 
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.blog-card').forEach(card => {
    observer.observe(card);
  });
}

/* --- LOCK LOGIC (CLEAN VERSION) --- */
var pendingUrl = "";
var masterPass = "1234"; // GANTI PASSWORD KAU KAT SINI

// 1. Fungsi Kesan Klik Kad Private
document.addEventListener('click', function(e) {
  var card = e.target.closest('.blog-card');
  if (card && card.classList.contains('private')) {
    e.preventDefault();
    pendingUrl = card.href;
    document.getElementById('linkLock').style.display = 'block';
    // Fokuskan terus ke kotak input
    setTimeout(function() { document.getElementById('lockKey').focus(); }, 100);
  }
});

// 2. Logik Buka Kunci
document.getElementById('btnUnlock').onclick = function() {
  var val = document.getElementById('lockKey').value;
  if (val === masterPass) {
    window.open(pendingUrl, '_blank');
    closeLock();
  } else {
    alert("Kunci Salah Bah!");
    document.getElementById('lockKey').value = "";
  }
};

// 3. Fungsi Tutup
function closeLock() {
  document.getElementById('linkLock').style.display = 'none';
  document.getElementById('lockKey').value = "";
}


/* =========================================================
   NIMEGUN SUITE v17.1 - UPDATE TYPE FUNCTIONAL
   ========================================================= */
const V17_CARD_STATE_KEY = 'nimegun_card_state_v17';
const V17_CHANGELOG_KEY = 'nimegun_changelog_v17';
const V17_FAV_KEY = 'nimegun_favourites_v17';
const V17_VIEW_KEY = 'nimegun_view_v17';
const V17_UPDATE_TYPE_KEY = 'nimegun_update_type_v17';

let v17CurrentFilter = 'all';
let v17CurrentSort = 'original';
let v17RefreshPending = 0;
let v17CountdownTimer = null;
let v17UIReady = false;

function v17GetTitle(card) {
  const h = card ? card.querySelector('h3') : null;
  return h ? h.innerText.trim() : 'Blog';
}

function v17FormatExactTime(value) {
  const d = value instanceof Date ? value : new Date(value);
  if (isNaN(d.getTime())) return '-';
  const p = n => String(n).padStart(2, '0');
  return p(d.getDate()) + '/' + p(d.getMonth() + 1) + '/' + String(d.getFullYear()).slice(-2)
    + ' ' + p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds());
}

function v17GetFavorites() {
  const value = readStore(V17_FAV_KEY, {});
  return value && typeof value === 'object' ? value : {};
}

function v17SetFeedState(card, state, text) {
  const meta = ensureCardMeta(card);
  meta.feedState.classList.remove('checking', 'ok', 'error');
  meta.feedState.classList.add(state || 'checking');
  meta.feedText.textContent = text || (state === 'ok' ? 'Feed: OK' : state === 'error' ? 'Feed: Gagal' : 'Feed: Semak');
  if (typeof v172UpdateHeaderDashboard === 'function') v172UpdateHeaderDashboard();
  if (typeof v175UpdateFeedFilterCounts === 'function') v175UpdateFeedFilterCounts();
  if (typeof v175FeedFilter !== 'undefined' && v175FeedFilter !== 'all' && typeof v17ApplyFilters === 'function') v17ApplyFilters();
}

function v17AddChangeLog(url, type, text, time, uniqueId) {
  if (!url) return;
  const logs = readStore(V17_CHANGELOG_KEY, {});
  if (!Array.isArray(logs[url])) logs[url] = [];
  const id = uniqueId || (type + ':' + String(time || Date.now()) + ':' + simpleHash(text || ''));
  if (logs[url].some(item => item && item.id === id)) return;
  logs[url].unshift({
    id: id,
    type: type || 'INFO',
    text: text || 'Perubahan dikesan.',
    time: Number(time) || Date.now()
  });
  logs[url] = logs[url].slice(0, 12);
  writeStore(V17_CHANGELOG_KEY, logs);
}

function v17SetUpdateType(card, type, startTime) {
  const meta = ensureCardMeta(card);
  const cleanType = String(type || '').toUpperCase();
  if (!cleanType) return;

  // Jenis update disimpan pada New Update sebagai state. Ia tidak lagi dipaparkan
  // sebagai badge berasingan di sudut kad; renderer countdown akan meletakkannya
  // pada baris New Update dan menjadikannya butang changelog.
  meta.bNew.setAttribute('data-update-type', cleanType);
  if (startTime) meta.bNew.setAttribute('data-update-start', String(Number(startTime)));

  const map = readStore(V17_UPDATE_TYPE_KEY, {});
  const url = normalizeBlogUrl(card.getAttribute('href'));
  if (url) {
    map[url] = { type: cleanType, time: Number(startTime) || Date.now() };
    writeStore(V17_UPDATE_TYPE_KEY, map);
  }
}

function v17RestoreUpdateType(card) {
  const meta = ensureCardMeta(card);
  const url = normalizeBlogUrl(card.getAttribute('href'));
  const map = readStore(V17_UPDATE_TYPE_KEY, {});
  const saved = url && map[url] ? map[url] : null;
  if (!saved || !saved.type) return false;

  meta.bNew.setAttribute('data-update-type', String(saved.type).toUpperCase());
  if (saved.time) meta.bNew.setAttribute('data-update-start', String(Number(saved.time)));
  return true;
}

function ensureCardMeta(card) {
  let box = card.querySelector('.badge-container');
  if (!box) {
    box = document.createElement('div');
    box.className = 'badge-container';
    card.insertBefore(box, card.firstChild);
  }

  let bNew = card.querySelector('.badge-new');
  if (!bNew) {
    bNew = document.createElement('span');
    bNew.className = 'badge-new';
    bNew.textContent = 'New Update';
    bNew.style.display = 'none';
  }
  if (bNew.parentNode !== box) box.appendChild(bNew);

  // Compatibility node sahaja. Jenis update sebenar dipaparkan dalam countdown.
  let bType = card.querySelector('.badge-type');
  if (!bType) {
    bType = document.createElement('span');
    bType.className = 'badge-type';
    bType.setAttribute('aria-hidden', 'true');
    bType.style.display = 'none';
    card.appendChild(bType);
  }

  let bAdded = card.querySelector('.badge-added');
  if (!bAdded) {
    bAdded = document.createElement('span');
    bAdded.className = 'badge-added';
    bAdded.textContent = 'New Added';
    bAdded.style.display = 'none';
  }
  if (bAdded.parentNode !== box) box.appendChild(bAdded);

  let pin = card.querySelector('.pin-btn');
  if (!pin) {
    pin = document.createElement('span');
    pin.className = 'pin-btn';
    pin.setAttribute('role', 'button');
    pin.setAttribute('tabindex', '0');
    pin.setAttribute('aria-label', 'Pin blog');
    pin.setAttribute('title', 'Pin / Favourite');
    pin.textContent = '★';
    card.appendChild(pin);

    const activatePin = function(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      v17ToggleFavourite(card);
    };
    pin.addEventListener('click', activatePin);
    pin.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') activatePin(e);
    });
  }

  let lastUpdate = card.querySelector('.last-update');
  if (!lastUpdate) {
    lastUpdate = document.createElement('span');
    lastUpdate.className = 'last-update';
    lastUpdate.setAttribute('data-time', '');
    card.appendChild(lastUpdate);
  }

  let metaLine = card.querySelector('.card-meta-line');
  if (!metaLine) {
    metaLine = document.createElement('div');
    metaLine.className = 'card-meta-line';
    metaLine.innerHTML = "<span class='feed-state checking'><span class='feed-state-dot'></span><span class='feed-state-text'>Feed: Semak</span></span><span class='card-category-label'></span>";
    card.appendChild(metaLine);
  }
  const feedState = metaLine.querySelector('.feed-state');
  const feedText = metaLine.querySelector('.feed-state-text');
  const categoryLabel = metaLine.querySelector('.card-category-label');
  if (categoryLabel && !categoryLabel.textContent) {
    categoryLabel.textContent = card.classList.contains('cat1') ? 'Personal / Anime'
      : card.classList.contains('cat2') ? 'Radio / TV'
      : card.classList.contains('cat3') ? 'Safelink'
      : card.classList.contains('cat4') ? 'Tools' : 'Blog';
  }

  let countdown = card.querySelector('.badge-countdown');
  if (!countdown) {
    countdown = document.createElement('div');
    countdown.className = 'badge-countdown';
    countdown.setAttribute('aria-label', 'Baki masa badge');
    card.appendChild(countdown);
  }

  if (!bNew.getAttribute('data-v17-bound')) {
    bNew.setAttribute('data-v17-bound', '1');
    bNew.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      v17OpenChangeLog(card);
    });
  }

  const favs = v17GetFavorites();
  const url = normalizeBlogUrl(card.getAttribute('href'));
  const pinned = !!(url && favs[url]);
  pin.classList.toggle('pinned', pinned);
  card.classList.toggle('is-pinned', pinned);

  return { bNew, bAdded, bType, lastUpdate, countdown, pin, feedState, feedText, metaLine };
}

function v17ToggleFavourite(card) {
  const url = normalizeBlogUrl(card.getAttribute('href'));
  if (!url) return;
  const favs = v17GetFavorites();
  if (favs[url]) delete favs[url];
  else favs[url] = Date.now();
  writeStore(V17_FAV_KEY, favs);
  ensureCardMeta(card);
  sortGrid(v17CurrentSort || 'original');
  if (typeof v172UpdateHeaderDashboard === 'function') v172UpdateHeaderDashboard();
  if (v17CurrentFilter === 'fav') v17ApplyFilters();
}

function v17GetAddedTime(card) {
  const url = normalizeBlogUrl(card.getAttribute('href'));
  const explicit = card.getAttribute('data-added');
  if (explicit) {
    const t = new Date(explicit).getTime();
    if (!isNaN(t)) return t;
  }
  const registry = readStore(BLOG_REGISTRY_KEY, {});
  return url && registry[url] ? Number(registry[url].firstSeen) || 0 : 0;
}

function v17GetUpdateTime(card) {
  const last = card.querySelector('.last-update');
  if (last) {
    const t = new Date(last.getAttribute('data-time') || 0).getTime();
    if (!isNaN(t)) return t;
  }
  return 0;
}

function v17SetBadgeExpiry(badge, startTime, durationHours) {
  if (!badge || !startTime) return;
  const start = Number(startTime);
  const duration = Number(durationHours) * 3600000;
  const expiry = start + duration;
  const oldExpiry = Number(badge.getAttribute('data-expiry')) || 0;

  // Hanya sumber yang sama/lebih baru boleh mengganti masa aktif badge.
  // Ini memastikan POST/CODE/THEME/INFO merujuk kepada update yang memang terbaru.
  if (expiry >= oldExpiry) {
    badge.setAttribute('data-expiry', String(expiry));
    badge.setAttribute('data-start', String(start));
    badge.setAttribute('data-duration', String(duration));
  }
}


function setBadgeExpiry(badge, startTime, durationHours) {
  v17SetBadgeExpiry(badge, startTime, durationHours);
}

function makeCountdownRow(label, remainingMs, kind, startTime, durationMs, card, updateType) {
  const row = document.createElement('div');
  row.className = 'countdown-row';
  row.setAttribute('data-kind', kind || 'update');

  const main = document.createElement('div');
  main.className = 'countdown-main';

  const labelWrap = document.createElement('span');
  labelWrap.className = 'countdown-label-wrap';

  const name = document.createElement('span');
  name.className = 'countdown-label';
  name.textContent = label;
  labelWrap.appendChild(name);

  // POST / CODE / THEME / INFO hanya muncul untuk New Update yang sebabnya diketahui.
  // Klik type membuka changelog yang terus ditapis kepada jenis itu.
  const cleanType = String(updateType || '').toUpperCase();
  if (kind === 'update' && cleanType) {
    const typeBtn = document.createElement('span');
    typeBtn.className = 'countdown-update-type';
    typeBtn.setAttribute('role', 'button');
    typeBtn.setAttribute('tabindex', '0');
    typeBtn.setAttribute('data-type', cleanType);
    typeBtn.setAttribute('title', 'Lihat changelog ' + cleanType);
    typeBtn.textContent = cleanType;

    const openType = function(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      if (card) v17OpenChangeLog(card, cleanType);
    };
    typeBtn.addEventListener('click', openType);
    typeBtn.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') openType(e);
    });
    labelWrap.appendChild(typeBtn);
  }

  const time = document.createElement('span');
  time.className = 'countdown-time';
  time.setAttribute('data-timesago-full', formatCountdownYYMMDDHHMMSS(remainingMs));
  time.setAttribute('data-format', 'YYMMDDHHMMSS');
  time.textContent = formatCountdownCard(remainingMs);
  if (startTime) time.title = (kind === 'added' ? 'Ditambah: ' : 'Update: ') + v17FormatExactTime(startTime);

  main.appendChild(labelWrap);
  main.appendChild(time);

  const track = document.createElement('div');
  track.className = 'time-progress-track';
  const fill = document.createElement('div');
  fill.className = 'time-progress-fill';
  const duration = Number(durationMs) || 86400000;
  const pct = Math.max(0, Math.min(100, (remainingMs / duration) * 100));
  fill.style.width = pct.toFixed(3) + '%';
  track.appendChild(fill);

  row.appendChild(main);
  row.appendChild(track);
  return row;
}

function v17FadeBadge(badge) {
  if (!badge || badge.getAttribute('data-fading') === '1') return;
  badge.setAttribute('data-fading', '1');
  badge.classList.add('badge-expiring-out');
  setTimeout(function() {
    badge.style.display = 'none';
    badge.classList.remove('badge-expiring-out');
    badge.removeAttribute('data-fading');
    badge.removeAttribute('data-expiry');
    badge.removeAttribute('data-start');
    badge.removeAttribute('data-duration');
  }, 390);
}

function updateBadgeCountdowns() {
  const now = Date.now();
  document.querySelectorAll('.blog-card').forEach(card => {
    const meta = ensureCardMeta(card);
    const rows = [];
    const items = [
      { badge: meta.bNew, label: 'New Update', kind: 'update' },
      { badge: meta.bAdded, label: 'New Added', kind: 'added' }
    ];

    items.forEach(item => {
      const expiry = Number(item.badge.getAttribute('data-expiry')) || 0;
      const start = Number(item.badge.getAttribute('data-start')) || (expiry ? expiry - 86400000 : 0);
      const duration = Number(item.badge.getAttribute('data-duration')) || 86400000;
      if (expiry > now) {
        item.badge.style.display = 'inline-block';
        item.badge.classList.remove('badge-expiring-out');
        const exact = v17FormatExactTime(start);
        item.badge.title = (item.kind === 'added' ? 'Ditambah: ' : 'Update terakhir: ') + exact;
        let updateType = '';
        if (item.kind === 'update') {
          const typeStart = Number(meta.bNew.getAttribute('data-update-start')) || 0;
          const candidate = (meta.bNew.getAttribute('data-update-type') || '').toUpperCase();
          // Jangan paparkan label lama untuk update baru yang berbeza.
          if (candidate && (!typeStart || Math.abs(typeStart - start) <= 2000)) updateType = candidate;
        }
        rows.push(makeCountdownRow(item.label, expiry - now, item.kind, start, duration, card, updateType));
      } else if (expiry > 0) {
        v17FadeBadge(item.badge);
      }
    });

    meta.countdown.innerHTML = '';
    rows.forEach(row => meta.countdown.appendChild(row));
    meta.countdown.classList.toggle('show', rows.length > 0);
  });

  updateHubStats();
  v17UpdateFilterCounts();
  v17RenderUpdatedToday();
  if (v17CurrentFilter === 'new') v17ApplyFilters();
}

function initBlogTracking() {
  const cards = Array.from(document.querySelectorAll('.blog-card'));
  const now = Date.now();
  let registry = readStore(BLOG_REGISTRY_KEY, null);
  const isFirstRun = !registry || Object.keys(registry).length === 0;
  if (!registry) registry = {};

  let localUpdates = readStore(BLOG_LOCAL_UPDATE_KEY, {});
  const oldFingerprints = readStore(BLOG_REVISION_KEY, {});
  const cardStates = readStore(V17_CARD_STATE_KEY, {});

  cards.forEach((card, index) => {
    if (!card.hasAttribute('data-original-order')) card.setAttribute('data-original-order', String(index));
    const meta = ensureCardMeta(card);
    const url = normalizeBlogUrl(card.getAttribute('href'));
    if (!url) return;

    const explicitAdded = card.getAttribute('data-added');
    let addedTime = explicitAdded ? new Date(explicitAdded).getTime() : 0;
    if (!registry[url]) {
      registry[url] = { firstSeen: now, baseline: isFirstRun && !explicitAdded };
      if (!isFirstRun && !explicitAdded) addedTime = now;
      if (!isFirstRun || explicitAdded) {
        v17AddChangeLog(url, 'ADDED', 'Blog baru ditambah ke Nimegun.', addedTime || now, 'added:' + String(addedTime || now));
      }
    } else if (!addedTime && registry[url] && !registry[url].baseline) {
      addedTime = Number(registry[url].firstSeen) || 0;
    }

    if (addedTime > 0) {
      const age = (now - addedTime) / 3600000;
      if (age >= 0 && age < NEW_ADDED_HOURS) {
        meta.bAdded.style.display = 'inline-block';
        v17SetBadgeExpiry(meta.bAdded, addedTime, NEW_ADDED_HOURS);
      }
    }

    const title = v17GetTitle(card);
    const descEl = card.querySelector('p');
    const desc = descEl ? descEl.innerText.trim() : '';
    const revision = card.getAttribute('data-revision') || '';
    const manualType = (card.getAttribute('data-update-type') || '').toUpperCase();
    const currentState = { title: title, desc: desc, revision: revision };
    const previous = cardStates[url];

    if (!previous) {
      cardStates[url] = currentState;
      if (!(url in oldFingerprints)) {
        oldFingerprints[url] = simpleHash([url, title, desc, revision].join('|'));
      }
    } else {
      let changed = false;
      let type = 'INFO';
      const details = [];
      if (previous.revision !== revision) {
        changed = true;
        type = manualType || 'CODE';
        details.push(type === 'THEME' ? 'Theme blog berubah.' : 'Code / revision blog berubah.');
      }
      if (previous.title !== title) {
        changed = true;
        if (!manualType && type !== 'CODE') type = 'INFO';
        details.push('Nama blog berubah.');
      }
      if (previous.desc !== desc) {
        changed = true;
        if (!manualType && type !== 'CODE') type = 'INFO';
        details.push('Deskripsi blog berubah.');
      }
      if (changed) {
        const changedAt = now;
        localUpdates[url] = changedAt;
        cardStates[url] = currentState;
        v17SetUpdateType(card, manualType || type, changedAt);
        v17AddChangeLog(url, manualType || type, details.join(' ') || 'Perubahan blog dikesan.', changedAt,
          'state:' + simpleHash(JSON.stringify(currentState)));
      }
    }

    const localUpdateTime = Number(localUpdates[url]) || 0;
    if (localUpdateTime > 0) {
      const localAge = (now - localUpdateTime) / 3600000;
      if (localAge >= 0 && localAge < NEW_UPDATE_HOURS) {
        meta.bNew.style.display = 'inline-block';
        v17SetBadgeExpiry(meta.bNew, localUpdateTime, NEW_UPDATE_HOURS);
        meta.lastUpdate.setAttribute('data-time', new Date(localUpdateTime).toISOString());
        if (!meta.bNew.getAttribute('data-update-type')) v17RestoreUpdateType(card);
      }
    }
  });

  writeStore(BLOG_REGISTRY_KEY, registry);
  writeStore(BLOG_REVISION_KEY, oldFingerprints);
  writeStore(BLOG_LOCAL_UPDATE_KEY, localUpdates);
  writeStore(V17_CARD_STATE_KEY, cardStates);
}

function v17FinishRefreshOne() {
  v17RefreshPending = Math.max(0, v17RefreshPending - 1);
  if (v17RefreshPending === 0) {
    const btn = document.getElementById('refreshFeedBtn');
    if (btn) {
      btn.classList.remove('refreshing');
      btn.disabled = false;
      btn.title = 'Semak update sekarang';
    }
    try { localStorage.setItem('nimegun_last_sync_v172', String(Date.now())); } catch (e) {}
    updateBadgeCountdowns();
    if (typeof v172UpdateHeaderDashboard === 'function') v172UpdateHeaderDashboard();
  }
}

function fetchAllUpdates(force) {
  if (window.__nimegunUpdatesFetched && !force) return;
  window.__nimegunUpdatesFetched = true;
  initBlogTracking();

  const cards = Array.from(document.querySelectorAll('.blog-card'));
  v17RefreshPending = cards.length;
  if (cards.length === 0) return;

  cards.forEach((card, index) => {
    const blogUrl = card.getAttribute('href');
    if (!blogUrl || !blogUrl.includes('http')) {
      v17SetFeedState(card, 'error', 'Feed: Tiada');
      v17FinishRefreshOne();
      return;
    }

    v17SetFeedState(card, 'checking', 'Feed: Semak');
    const cleanUrl = normalizeBlogUrl(blogUrl);
    const callbackName = 'v17Feed_' + index + '_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
    let finished = false;
    let timer = null;

    const finish = function(state, label) {
      if (finished) return;
      finished = true;
      if (timer) clearTimeout(timer);
      v17SetFeedState(card, state, label);
      try { delete window[callbackName]; } catch (e) { window[callbackName] = undefined; }
      v17FinishRefreshOne();
    };

    window[callbackName] = function(data) {
      try {
        if (data && data.feed) {
          const updatedStr = data.feed.updated ? data.feed.updated.$t : '';
          if (updatedStr) {
            const meta = ensureCardMeta(card);
            const t = new Date(updatedStr).getTime();
            if (!isNaN(t)) {
              const previousVisibleTime = v17GetUpdateTime(card);
              if (t >= previousVisibleTime) meta.lastUpdate.setAttribute('data-time', updatedStr);
              const age = (Date.now() - t) / 3600000;
              if (age >= 0 && age < NEW_UPDATE_HOURS) {
                meta.bNew.style.display = 'inline-block';
                v17SetBadgeExpiry(meta.bNew, t, NEW_UPDATE_HOURS);
                const currentStart = Number(meta.bNew.getAttribute('data-update-start')) || 0;
                if (t >= currentStart) v17SetUpdateType(card, 'POST', t);
                v17AddChangeLog(cleanUrl, 'POST', 'Post / feed Blogger dikemas kini.', t, 'feed:' + updatedStr);
              }
            }
          }
          finish('ok', 'Feed: OK');
        } else {
          finish('error', 'Feed: Gagal');
        }
      } catch (e) {
        finish('error', 'Feed: Gagal');
      }
      updateBadgeCountdowns();
    };

    const script = document.createElement('script');
    script.async = true;
    script.src = cleanUrl + '/feeds/posts/default?alt=json-in-script&max-results=1&callback='
      + callbackName + '&t=' + Date.now();
    script.onload = function() {
      setTimeout(function() { if (script.parentNode) script.parentNode.removeChild(script); }, 0);
    };
    script.onerror = function() {
      if (script.parentNode) script.parentNode.removeChild(script);
      finish('error', 'Feed: Gagal');
    };
    timer = setTimeout(function() {
      if (script.parentNode) script.parentNode.removeChild(script);
      finish('error', 'Feed: Timeout');
    }, 9000);
    document.body.appendChild(script);
  });
}

function v17RefreshFeeds() {
  const btn = document.getElementById('refreshFeedBtn');
  if (btn) {
    btn.disabled = true;
    btn.classList.add('refreshing');
    btn.title = 'Sedang menyemak...';
  }
  window.__nimegunUpdatesFetched = false;
  fetchAllUpdates(true);
}

function searchFunction() {
  v17ApplyFilters();
}

function filterBlog(c, button) {
  v17CurrentFilter = c || 'all';
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  const target = button || (window.event && (window.event.currentTarget || (window.event.target && window.event.target.closest('.filter-btn'))));
  if (target) target.classList.add('active');
  v17ApplyFilters();
}

function v17CardIsNew(card) {
  const meta = ensureCardMeta(card);
  const now = Date.now();
  return (Number(meta.bNew.getAttribute('data-expiry')) || 0) > now
    || (Number(meta.bAdded.getAttribute('data-expiry')) || 0) > now;
}

function v17ApplyFilters() {
  const search = (document.getElementById('searchBar') ? document.getElementById('searchBar').value : '').trim().toLowerCase();
  document.querySelectorAll('.blog-card').forEach(card => {
    const title = v17GetTitle(card).toLowerCase();
    const desc = card.querySelector('p') ? card.querySelector('p').innerText.toLowerCase() : '';
    const searchOK = !search || title.includes(search) || desc.includes(search);
    let filterOK = true;
    if (v17CurrentFilter === 'new') {
      filterOK = v17CardIsNew(card);
    } else if (v17CurrentFilter === 'fav') {
      const favs = v17GetFavorites();
      const url = normalizeBlogUrl(card.getAttribute('href'));
      filterOK = !!(url && favs[url]);
    } else if (v17CurrentFilter !== 'all') {
      filterOK = card.classList.contains(v17CurrentFilter);
    }

    let feedOK = true;
    if (typeof v175FeedFilter !== 'undefined' && v175FeedFilter !== 'all') {
      const feed = card.querySelector('.feed-state');
      feedOK = !!(feed && feed.classList.contains(v175FeedFilter));
    }

    card.classList.toggle('hidden', !filterOK || !feedOK);
    card.classList.toggle('search-hidden', !searchOK);
  });
  if (typeof v178RefreshDescriptionStates === 'function') {
    setTimeout(v178RefreshDescriptionStates, 20);
  }

}

function v17UpdateFilterCounts() {
  const counts = {
    all: document.querySelectorAll('.blog-card').length,
    cat1: document.querySelectorAll('.blog-card.cat1').length,
    cat2: document.querySelectorAll('.blog-card.cat2').length,
    cat3: document.querySelectorAll('.blog-card.cat3').length,
    cat4: document.querySelectorAll('.blog-card.cat4').length,
    new: Array.from(document.querySelectorAll('.blog-card')).filter(v17CardIsNew).length
  };
  document.querySelectorAll('.filter-btn[data-filter]').forEach(btn => {
    const key = btn.getAttribute('data-filter');
    const count = btn.querySelector('.filter-count');
    if (count && key in counts) count.textContent = counts[key];
  });
}

function v17RenderUpdatedToday() {
  const panel = document.getElementById('updatedTodayPanel');
  const list = document.getElementById('updatedTodayList');
  const sub = document.getElementById('updatedTodaySub');
  if (!panel || !list) return;
  const cards = Array.from(document.querySelectorAll('.blog-card')).filter(v17CardIsNew);
  list.innerHTML = '';
  cards.sort((a, b) => Math.max(v17GetUpdateTime(b), v17GetAddedTime(b)) - Math.max(v17GetUpdateTime(a), v17GetAddedTime(a)));
  cards.forEach(card => {
    const chip = document.createElement('a');
    chip.className = 'today-chip';
    chip.href = card.getAttribute('href');
    chip.target = '_blank';
    chip.rel = 'noopener';
    const meta = ensureCardMeta(card);
    const kind = (Number(meta.bNew.getAttribute('data-expiry')) || 0) > Date.now()
      ? (meta.bType.textContent || 'UPDATE') : 'ADDED';
    chip.innerHTML = '<span>' + v17EscapeHTML(v17GetTitle(card)) + '</span><span class="today-kind">' + v17EscapeHTML(kind) + '</span>';
    list.appendChild(chip);
  });
  panel.classList.toggle('show', cards.length > 0);
  if (sub) sub.textContent = cards.length + ' aktif dalam 24 jam';
}

function v17EscapeHTML(text) {
  return String(text || '').replace(/[&<>'"]/g, function(ch) {
    return ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'})[ch];
  });
}

function v17SortTime(card, mode) {
  if (mode === 'added') return v17GetAddedTime(card);
  return v17GetUpdateTime(card);
}

function sortGrid(type) {
  v17CurrentSort = type || 'original';
  try { localStorage.setItem('nimegun_sort_v175', v17CurrentSort); } catch (e) {}
  const grid = document.getElementById('blogGrid');
  if (!grid) return;
  const favs = v17GetFavorites();
  const cards = Array.from(grid.getElementsByClassName('blog-card'));

  cards.sort((a, b) => {
    const aUrl = normalizeBlogUrl(a.getAttribute('href'));
    const bUrl = normalizeBlogUrl(b.getAttribute('href'));
    const ap = favs[aUrl] ? 1 : 0;
    const bp = favs[bUrl] ? 1 : 0;
    if (ap !== bp) return bp - ap;

    if (type === 'name') return v17GetTitle(a).localeCompare(v17GetTitle(b));
    if (type === 'update') return v17SortTime(b, 'update') - v17SortTime(a, 'update');
    if (type === 'added') return v17SortTime(b, 'added') - v17SortTime(a, 'added');
    if (type === 'oldest') {
      const at = v17SortTime(a, 'update');
      const bt = v17SortTime(b, 'update');
      if (!at && bt) return -1;
      if (at && !bt) return 1;
      return at - bt;
    }
    return Number(a.getAttribute('data-original-order') || 0) - Number(b.getAttribute('data-original-order') || 0);
  });

  cards.forEach(card => grid.appendChild(card));
  document.querySelectorAll('.sort-btn[data-sort]').forEach(btn => {
    btn.classList.toggle('active-sort', btn.getAttribute('data-sort') === v17CurrentSort);
  });
}

function v17ToggleView() {
  const grid = document.getElementById('blogGrid');
  if (!grid) return;
  const list = !grid.classList.contains('list-view');
  grid.classList.toggle('list-view', list);
  try { localStorage.setItem(V17_VIEW_KEY, list ? 'list' : 'grid'); } catch (e) {}
  v17UpdateViewButton();
  if (typeof v1776ClearMasonryStyles === 'function') {
    setTimeout(v1776ClearMasonryStyles, 0);
  }
  if (typeof v178HideDescriptionPopup === 'function') v178HideDescriptionPopup();
  if (typeof v178RefreshDescriptionStates === 'function') {
    setTimeout(v178RefreshDescriptionStates, 20);
  }
}

function v17UpdateViewButton() {
  const grid = document.getElementById('blogGrid');
  const btn = document.getElementById('viewToggleBtn');
  if (!grid || !btn) return;
  const list = grid.classList.contains('list-view');
  btn.innerHTML = list ? '▦ Grid' : '☷ List';
  btn.title = list ? 'Tukar ke Grid View' : 'Tukar ke List View';
}

function v17OpenChangeLog(card, filterType) {
  const overlay = document.getElementById('changeLogOverlay');
  const title = document.getElementById('changeLogTitle');
  const sub = document.getElementById('changeLogSub');
  const body = document.getElementById('changeLogBody');
  if (!overlay || !body) return;

  const url = normalizeBlogUrl(card.getAttribute('href'));
  const logs = readStore(V17_CHANGELOG_KEY, {});
  const allEntries = Array.isArray(logs[url]) ? logs[url] : [];
  const cleanFilter = String(filterType || '').toUpperCase();
  const entries = cleanFilter
    ? allEntries.filter(entry => String((entry && entry.type) || '').toUpperCase() === cleanFilter)
    : allEntries;

  if (title) title.textContent = v17GetTitle(card);
  if (sub) {
    const t = v17GetUpdateTime(card);
    const when = t ? 'Last Update: ' + v17FormatExactTime(t) : 'Belum ada masa update.';
    sub.textContent = cleanFilter ? ('Jenis: ' + cleanFilter + ' • ' + when) : when;
  }

  body.innerHTML = '';
  if (!entries.length) {
    body.innerHTML = "<div class='change-empty'>" + (cleanFilter
      ? ('Tiada changelog jenis ' + v17EscapeHTML(cleanFilter) + ' untuk blog ini.')
      : 'Tiada changelog tersimpan untuk blog ini.') + "</div>";
  } else {
    entries.forEach(entry => {
      const el = document.createElement('div');
      el.className = 'change-entry';
      el.innerHTML = "<div class='change-entry-top'><span class='change-type'>" + v17EscapeHTML(entry.type)
        + "</span><span class='change-time'>" + v17EscapeHTML(v17FormatExactTime(entry.time))
        + "</span></div><div class='change-text'>" + v17EscapeHTML(entry.text) + "</div>";
      body.appendChild(el);
    });
  }
  overlay.classList.add('show');
}

function v17CloseChangeLog() {
  const overlay = document.getElementById('changeLogOverlay');
  if (overlay) overlay.classList.remove('show');
}

function updateHubStats() {
  const allCards = document.querySelectorAll('.blog-card').length;
  const now = Date.now();
  const activeUpdates = Array.from(document.querySelectorAll('.badge-new'))
    .filter(b => (Number(b.getAttribute('data-expiry')) || 0) > now).length;
  const activeAdded = Array.from(document.querySelectorAll('.badge-added'))
    .filter(b => (Number(b.getAttribute('data-expiry')) || 0) > now).length;
  const vCount = document.getElementById('vCount');
  const oCount = document.getElementById('oCount');
  const aCount = document.getElementById('aCount');
  if (vCount) vCount.innerText = allCards;
  if (oCount) oCount.innerText = activeUpdates;
  if (aCount) aCount.innerText = activeAdded;
  if (typeof v172UpdateHeaderDashboard === 'function') v172UpdateHeaderDashboard();
}

function v17SetupUI() {
  if (v17UIReady) return;
  v17UIReady = true;

  const cards = Array.from(document.querySelectorAll('.blog-card'));
  cards.forEach((card, index) => {
    if (!card.hasAttribute('data-original-order')) card.setAttribute('data-original-order', String(index));
    ensureCardMeta(card);
  });

  const sortGroup = document.querySelector('.sort-group');
  if (sortGroup) {
    sortGroup.innerHTML = ""
      + "<button class='sort-btn' data-sort='name' onclick='sortGrid(\"name\")'>🔠 Nama</button>"
      + "<button class='sort-btn' data-sort='update' onclick='sortGrid(\"update\")'>🔥 Terkini</button>"
      + "<button class='sort-btn' data-sort='added' onclick='sortGrid(\"added\")'>🆕 Baru Ditambah</button>"
      + "<button class='sort-btn' data-sort='oldest' onclick='sortGrid(\"oldest\")'>⌛ Paling Lama</button>";
  }

  const filters = [
    ['all', '▦', 'Semua'], ['cat1', '✦', 'Personal / Anime'], ['cat2', '▶', 'Radio / TV'],
    ['cat3', '🔗', 'Safelink'], ['cat4', '⚙', 'Tools']
  ];
  const group = document.querySelector('.filter-group');
  if (group) {
    group.innerHTML = '';
    filters.forEach((item, idx) => {
      const btn = document.createElement('button');
      btn.className = 'filter-btn' + (idx === 0 ? ' active' : '');
      btn.setAttribute('data-filter', item[0]);
      btn.innerHTML = "<span class='filter-icon'>" + item[1] + "</span><span>" + item[2] + "</span><span class='filter-count'>0</span>";
      btn.addEventListener('click', function() { filterBlog(item[0], btn); });
      group.appendChild(btn);
    });
    const newBtn = document.createElement('button');
    newBtn.className = 'filter-btn new-filter';
    newBtn.setAttribute('data-filter', 'new');
    newBtn.innerHTML = "<span class='filter-icon'>🔥</span><span>New</span><span class='filter-count'>0</span>";
    newBtn.addEventListener('click', function() { filterBlog('new', newBtn); });
    group.appendChild(newBtn);
  }

  const categoryMenu = document.querySelector('.category-menu');
  if (categoryMenu && !document.getElementById('feedFilterBar')) {
    const feedBar = document.createElement('div');
    feedBar.id = 'feedFilterBar';
    feedBar.className = 'feed-filter-bar';
    feedBar.innerHTML = ""
      + "<span class='feed-filter-label'>Status Feed</span>"
      + "<button class='feed-filter-btn active' type='button' data-feed-filter='all' onclick='v175SetFeedFilter(&quot;all&quot;, this)'>Semua <span class='feed-filter-count'>0</span></button>"
      + "<button class='feed-filter-btn' type='button' data-feed-filter='ok' onclick='v175SetFeedFilter(&quot;ok&quot;, this)'>🟢 OK <span class='feed-filter-count'>0</span></button>"
      + "<button class='feed-filter-btn' type='button' data-feed-filter='error' onclick='v175SetFeedFilter(&quot;error&quot;, this)'>🔴 Gagal <span class='feed-filter-count'>0</span></button>"
      + "<button class='feed-filter-btn' type='button' data-feed-filter='checking' onclick='v175SetFeedFilter(&quot;checking&quot;, this)'>🟡 Semak <span class='feed-filter-count'>0</span></button>";
    categoryMenu.insertAdjacentElement('afterend', feedBar);
  }

  const container = document.querySelector('.container');
  const grid = document.getElementById('blogGrid');

  if (container && grid && !document.getElementById('utilityPanels')) {
    const utilities = document.createElement('div');
    utilities.id = 'utilityPanels';
    utilities.className = 'utility-panels';
    utilities.innerHTML = ""
      + "<section class='utility-panel empty' id='recentPanel'>"
      +   "<div class='utility-head'><div><div class='utility-title'>🕘 Recently Opened</div><div class='utility-sub' id='recentSub'>5 blog terakhir</div></div></div>"
      +   "<div class='utility-list' id='recentList'></div>"
      + "</section>";
    container.insertBefore(utilities, grid);
  }
  if (container && grid && !document.getElementById('updatedTodayPanel')) {
    const panel = document.createElement('div');
    panel.id = 'updatedTodayPanel';
    panel.className = 'today-panel';
    panel.innerHTML = "<div class='today-head'><div><div class='today-title'>🔥 Updated Today</div><div class='today-sub' id='updatedTodaySub'>0 aktif dalam 24 jam</div></div></div><div class='today-list' id='updatedTodayList'></div>";
    container.insertBefore(panel, grid);
  }

  if (!document.getElementById('changeLogOverlay')) {
    const overlay = document.createElement('div');
    overlay.id = 'changeLogOverlay';
    overlay.innerHTML = "<div class='change-modal'><div class='change-head'><div><h3 id='changeLogTitle'>Changelog</h3><p id='changeLogSub'></p></div><button class='change-close' type='button' onclick='v17CloseChangeLog()'>×</button></div><div class='change-body' id='changeLogBody'></div></div>";
    overlay.addEventListener('click', function(e) { if (e.target === overlay) v17CloseChangeLog(); });
    document.body.appendChild(overlay);
  }

  document.addEventListener('keydown', function(e) { if (e.key === 'Escape') v17CloseChangeLog(); });

  const savedView = (() => { try { return localStorage.getItem(V17_VIEW_KEY); } catch (e) { return null; } })();
  if (grid && savedView === 'list') grid.classList.add('list-view');
  v17UpdateViewButton();
  v17UpdateFilterCounts();
  v17RenderUpdatedToday();
}

document.addEventListener('DOMContentLoaded', function() {
  v17SetupUI();
  initBlogTracking();
  updateBadgeCountdowns();
  v17ApplyFilters();
  v172InitDashboard();
  v175InitEnhancements();
  v178InitDescriptionPopup();
  if (!v17CountdownTimer) v17CountdownTimer = setInterval(updateBadgeCountdowns, 1000);
  if (!window.__nimegunUpdatesFetched) fetchAllUpdates(false);
});


/* =========================================================
   NIMEGUN v17.2 - HEADER DASHBOARD LOGIC
   ========================================================= */
let v172ClockTimer = null;

function v172Pad2(n) {
  return String(n).padStart(2, '0');
}

function v172UpdateClock() {
  const d = new Date();
  const clock = document.getElementById('headerClock');
  const date = document.getElementById('headerDate');
  if (clock) clock.textContent = v172Pad2(d.getHours()) + ':' + v172Pad2(d.getMinutes()) + ':' + v172Pad2(d.getSeconds());
  if (date) {
    const days = ['Ahad','Isnin','Selasa','Rabu','Khamis','Jumaat','Sabtu'];
    date.textContent = days[d.getDay()] + ' • ' + v172Pad2(d.getDate()) + '/' + v172Pad2(d.getMonth() + 1) + '/' + String(d.getFullYear()).slice(-2);
  }
}

function v172FormatSyncTime(ms) {
  const t = Number(ms) || 0;
  if (!t) return 'Belum semak';
  const d = new Date(t);
  if (isNaN(d.getTime())) return 'Belum semak';
  return 'Sync ' + v172Pad2(d.getHours()) + ':' + v172Pad2(d.getMinutes()) + ':' + v172Pad2(d.getSeconds());
}

function v172UpdateHeaderDashboard() {
  const favs = v17GetFavorites();
  const favCountEl = document.getElementById('headerFavCount');
  if (favCountEl) favCountEl.textContent = Object.keys(favs).length;

  const cards = Array.from(document.querySelectorAll('.blog-card'));
  let ok = 0;
  let checking = 0;
  cards.forEach(card => {
    const state = card.querySelector('.feed-state');
    if (!state) return;
    if (state.classList.contains('ok')) ok++;
    else if (state.classList.contains('checking')) checking++;
  });

  const okEl = document.getElementById('headerFeedOkCount');
  const totalEl = document.getElementById('headerFeedTotalCount');
  if (okEl) okEl.textContent = ok;
  if (totalEl) totalEl.textContent = cards.length;

  const feedAddon = document.getElementById('headerFeedAddon');
  if (feedAddon) {
    feedAddon.classList.toggle('active', v17RefreshPending > 0 || checking > 0);
    feedAddon.title = checking > 0 ? ('Sedang semak ' + checking + ' feed') : 'Klik untuk semak feed sekarang';
  }

  const favAddon = document.getElementById('headerFavAddon');
  if (favAddon) favAddon.classList.toggle('active', v17CurrentFilter === 'fav');

  let lastSync = 0;
  try { lastSync = Number(localStorage.getItem('nimegun_last_sync_v172')) || 0; } catch (e) {}
  const lastEl = document.getElementById('headerLastSync');
  if (lastEl) {
    lastEl.textContent = v17RefreshPending > 0 ? ('Semak ' + v17RefreshPending + ' lagi...') : v172FormatSyncTime(lastSync);
  }
}

function v172FilterFavorites() {
  const favs = v17GetFavorites();
  const hasFav = Object.keys(favs).length > 0;
  v17CurrentFilter = (v17CurrentFilter === 'fav') ? 'all' : 'fav';

  document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
  if (v17CurrentFilter === 'all') {
    const allBtn = document.querySelector(".filter-btn[data-filter='all']");
    if (allBtn) allBtn.classList.add('active');
  }

  v17ApplyFilters();
  v172UpdateHeaderDashboard();

  if (!hasFav && v17CurrentFilter === 'fav') {
    const notif = document.getElementById('notifBubble');
    if (notif) {
      notif.textContent = '★ Belum ada blog Favourite.';
      notif.classList.add('show');
      setTimeout(function() { notif.classList.remove('show'); }, 2200);
    }
  }
}

function v172OpenNewFilter() {
  const btn = document.querySelector(".filter-btn[data-filter='new']");
  filterBlog('new', btn);
  v172UpdateHeaderDashboard();
}

function v172InitDashboard() {
  v172UpdateClock();
  if (!v172ClockTimer) v172ClockTimer = setInterval(v172UpdateClock, 1000);
  v172UpdateHeaderDashboard();

  const search = document.getElementById('searchBar');
  if (search) search.setAttribute('aria-label', 'Cari blog Nimegun');

  const topBtn = document.getElementById('scrollTopBtn');
  const scrollYNow = document.body.scrollTop || document.documentElement.scrollTop;
  if (topBtn) topBtn.classList.toggle('show', scrollYNow > 320);
}



/* =========================================================
   NIMEGUN v17.5 - DASHBOARD UTILITIES LOGIC
   ========================================================= */
const V175_RECENT_KEY = 'nimegun_recent_v175';
const V175_THEME_KEY = 'nimegun_theme_v175';
const V175_SORT_KEY = 'nimegun_sort_v175';
const V175_BACKUP_VERSION = 1;

let v175FeedFilter = 'all';
let v175LastScrollY = 0;
let v175RecentBound = false;

/* v17.5.1 anti-glitch state */
let v175HeaderCollapsed = false;
let v175HeaderIgnoreUntil = 0;
let v175HeaderDownDistance = 0;
let v175HeaderUpDistance = 0;
let v175HeaderRAF = 0;
let v175HeaderPendingY = 0;

function v175Notify(message) {
  const notif = document.getElementById('notifBubble');
  if (!notif) {
    alert(message);
    return;
  }
  notif.textContent = message;
  notif.classList.add('show');
  setTimeout(function() { notif.classList.remove('show'); }, 2600);
}

function v175ApplyHeaderState(collapse) {
  const header = document.querySelector('.dashboard-header');
  if (!header) return;
  if (collapse === v175HeaderCollapsed) return;

  v175HeaderCollapsed = collapse;
  header.classList.toggle('header-collapsed', collapse);

  /* Header sticky berubah tinggi. Abaikan scroll kecil yang browser
     hasilkan sendiri supaya tidak masuk loop buka/tutup. */
  v175HeaderIgnoreUntil = performance.now() + 380;
  v175HeaderDownDistance = 0;
  v175HeaderUpDistance = 0;
}

function v175ProcessHeaderScroll(y) {
  const now = performance.now();
  const current = Math.max(0, Number(y) || 0);
  const delta = current - v175LastScrollY;

  if (current < 120) {
    v175ApplyHeaderState(false);
    v175LastScrollY = current;
    return;
  }

  if (now < v175HeaderIgnoreUntil) {
    v175LastScrollY = current;
    return;
  }

  /* Ignore browser/touch noise. */
  if (Math.abs(delta) < 3) {
    v175LastScrollY = current;
    return;
  }

  if (delta > 0) {
    v175HeaderDownDistance += delta;
    v175HeaderUpDistance = 0;
  } else {
    v175HeaderUpDistance += Math.abs(delta);
    v175HeaderDownDistance = 0;
  }

  /* Collapse hanya selepas scroll turun yang betul-betul disengajakan. */
  if (!v175HeaderCollapsed && current > 230 && v175HeaderDownDistance >= 42) {
    v175ApplyHeaderState(true);
  }

  /* Expand perlu scroll naik lebih jauh supaya perubahan tinggi header
     sendiri tidak dianggap sebagai scroll pengguna. */
  if (v175HeaderCollapsed && v175HeaderUpDistance >= 70) {
    v175ApplyHeaderState(false);
  }

  v175LastScrollY = current;
}

function v175HandleHeaderCollapse(currentY) {
  // v17.5.6: sticky auto-collapse dimatikan untuk elak header overlay / layout jump.
  const header = document.querySelector('.dashboard-header');
  if (header) header.classList.remove('header-collapsed');
  v175LastScrollY = Number(currentY) || 0;
}

function v175SetFeedFilter(state, button) {
  v175FeedFilter = String(state || 'all').toLowerCase();
  document.querySelectorAll('.feed-filter-btn').forEach(function(btn) {
    btn.classList.toggle('active', btn === button || btn.getAttribute('data-feed-filter') === v175FeedFilter);
  });
  v17ApplyFilters();
}

function v175UpdateFeedFilterCounts() {
  const cards = Array.from(document.querySelectorAll('.blog-card'));
  const counts = { all: cards.length, ok: 0, error: 0, checking: 0 };

  cards.forEach(function(card) {
    const feed = card.querySelector('.feed-state');
    if (!feed) return;
    if (feed.classList.contains('ok')) counts.ok++;
    else if (feed.classList.contains('error')) counts.error++;
    else counts.checking++;
  });

  document.querySelectorAll('.feed-filter-btn[data-feed-filter]').forEach(function(btn) {
    const key = btn.getAttribute('data-feed-filter');
    const count = btn.querySelector('.feed-filter-count');
    if (count && Object.prototype.hasOwnProperty.call(counts, key)) count.textContent = counts[key];
  });
}

function v175RelativeTime(time) {
  const t = Number(time) || 0;
  if (!t) return '-';
  const seconds = Math.max(0, Math.floor((Date.now() - t) / 1000));
  if (seconds < 60) return seconds + 's lalu';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return minutes + 'm lalu';
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return hours + 'j lalu';
  const days = Math.floor(hours / 24);
  if (days < 30) return days + 'h lalu';
  return v17FormatExactTime(t);
}

function v175FindCardByUrl(url) {
  const clean = normalizeBlogUrl(url);
  return Array.from(document.querySelectorAll('.blog-card')).find(function(card) {
    return normalizeBlogUrl(card.getAttribute('href')) === clean;
  }) || null;
}

function v175GetRecent() {
  const data = readStore(V175_RECENT_KEY, []);
  return Array.isArray(data) ? data : [];
}

function v175RecordRecent(card) {
  if (!card) return;
  const url = normalizeBlogUrl(card.getAttribute('href'));
  if (!url) return;

  const item = {
    url: url,
    title: v17GetTitle(card),
    category: card.classList.contains('cat1') ? 'Personal / Anime'
      : card.classList.contains('cat2') ? 'Radio / TV'
      : card.classList.contains('cat3') ? 'Safelink'
      : card.classList.contains('cat4') ? 'Tools' : 'Blog',
    time: Date.now()
  };

  const recent = v175GetRecent().filter(function(old) {
    return old && normalizeBlogUrl(old.url) !== url;
  });
  recent.unshift(item);
  writeStore(V175_RECENT_KEY, recent.slice(0, 12));
  v175RenderRecent();
}

function v175RenderRecent() {
  const panel = document.getElementById('recentPanel');
  const list = document.getElementById('recentList');
  const sub = document.getElementById('recentSub');
  if (!panel || !list) return;

  const recent = v175GetRecent().slice(0, 5);
  list.innerHTML = '';

  recent.forEach(function(item) {
    const link = document.createElement('a');
    link.className = 'recent-item';
    link.href = item.url;
    link.target = '_blank';
    link.rel = 'noopener';
    link.innerHTML =
      "<span class='recent-top'><span class='recent-name'>" + v17EscapeHTML(item.title || 'Blog') + "</span></span>"
      + "<span class='recent-category'>" + v17EscapeHTML(item.category || 'Blog') + "</span>"
      + "<span class='recent-time'>" + v17EscapeHTML(v175RelativeTime(item.time)) + "</span>";
    list.appendChild(link);
  });

  panel.classList.toggle('empty', recent.length === 0);
  const wrapper = document.getElementById('utilityPanels');
  if (wrapper) wrapper.classList.toggle('empty', recent.length === 0);
  if (sub) sub.textContent = recent.length ? (recent.length + ' blog terakhir') : 'Belum ada sejarah';
}

function v175BindRecentTracker() {
  if (v175RecentBound) return;
  v175RecentBound = true;
  document.addEventListener('click', function(e) {
    const card = e.target.closest('.blog-card');
    if (!card) return;
    if (e.target.closest('.pin-btn, .badge-new, .badge-added, .countdown-update-type')) return;
    v175RecordRecent(card);
  }, true);
}

function v175CollectSettings() {
  const storage = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      const value = localStorage.getItem(key);
      const isVisitedUrl = /^https?:\/\//i.test(key) && value === 'visited';
      if (key.indexOf('nimegun_') === 0 || key === 'searchTrend' || isVisitedUrl) {
        storage[key] = value;
      }
    }
  } catch (e) {}

  return {
    app: 'Nimegun',
    backupVersion: V175_BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    theme: document.body.getAttribute('data-theme') || 'light',
    storage: storage
  };
}

function v175ExportSettings() {
  try {
    const data = v175CollectSettings();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const d = new Date();
    const name = 'nimegun-settings-'
      + d.getFullYear()
      + String(d.getMonth() + 1).padStart(2, '0')
      + String(d.getDate()).padStart(2, '0')
      + '-'
      + String(d.getHours()).padStart(2, '0')
      + String(d.getMinutes()).padStart(2, '0')
      + String(d.getSeconds()).padStart(2, '0')
      + '.json';

    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function() { URL.revokeObjectURL(url); }, 500);
    v175Notify('💾 Backup settings berjaya dibuat.');
  } catch (e) {
    v175Notify('⚠️ Backup settings gagal.');
  }
}

function v175ChooseImport() {
  let input = document.getElementById('nimegunSettingsImport');
  if (!input) {
    input = document.createElement('input');
    input.id = 'nimegunSettingsImport';
    input.type = 'file';
    input.accept = 'application/json,.json';
    input.addEventListener('change', v175ImportSettings);
    document.body.appendChild(input);
  }
  input.value = '';
  input.click();
}

function v175ImportSettings(event) {
  const file = event && event.target && event.target.files ? event.target.files[0] : null;
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function() {
    try {
      const data = JSON.parse(String(reader.result || ''));
      if (!data || data.app !== 'Nimegun' || !data.storage || typeof data.storage !== 'object') {
        throw new Error('Format backup tidak sah.');
      }

      if (!confirm('Restore backup ini? Settings Nimegun dalam browser ini akan diganti.')) return;

      Object.keys(data.storage).forEach(function(key) {
        const value = String(data.storage[key]);
        const isVisitedUrl = /^https?:\/\//i.test(key) && value === 'visited';
        if (key.indexOf('nimegun_') === 0 || key === 'searchTrend' || isVisitedUrl) {
          localStorage.setItem(key, value);
        }
      });

      if (data.theme === 'dark' || data.theme === 'light') {
        localStorage.setItem(V175_THEME_KEY, data.theme);
      }

      alert('Restore berjaya. Halaman akan dimuat semula.');
      location.reload();
    } catch (e) {
      v175Notify('⚠️ Fail backup tidak sah / rosak.');
    }
  };
  reader.readAsText(file);
}

function v175RestoreTheme() {
  try {
    const theme = localStorage.getItem(V175_THEME_KEY);
    if (theme === 'dark' || theme === 'light') document.body.setAttribute('data-theme', theme);
  } catch (e) {}
}

function v175InitEnhancements() {
  v175RestoreTheme();

  try {
    const savedSort = localStorage.getItem(V175_SORT_KEY);
    if (savedSort && ['original', 'name', 'update', 'added', 'oldest'].includes(savedSort)) {
      sortGrid(savedSort);
    }
  } catch (e) {}

  v175UpdateFeedFilterCounts();
  v175RenderRecent();
  v175BindRecentTracker();

  const y = document.body.scrollTop || document.documentElement.scrollTop;
  v175LastScrollY = y;
  const header = document.querySelector('.dashboard-header');
  v175HeaderCollapsed = !!(header && header.classList.contains('header-collapsed'));
  v175HeaderDownDistance = 0;
  v175HeaderUpDistance = 0;
  v175HandleHeaderCollapse(y);

  setInterval(function() {
    v175RenderRecent();
  }, 60000);
}


/* v17.7.6 - clear leftover masonry inline styles */
function v1776ClearMasonryStyles() {
  const grid = document.getElementById('blogGrid');
  if (!grid) return;
  grid.querySelectorAll(':scope > .blog-card').forEach(function(card) {
    card.style.removeProperty('grid-row-end');
    card.style.removeProperty('grid-row-start');
    card.style.removeProperty('grid-row');
  });
}

document.addEventListener('DOMContentLoaded', function() {
  setTimeout(v1776ClearMasonryStyles, 60);
});


/* =========================================================
   NIMEGUN v17.8 - ADMIN CLEANUP + DESCRIPTION POPUP LOGIC
   ========================================================= */
let v178DescPopupCard = null;
let v178DescPopupText = null;
let v178DescBound = false;

function v178ClearRemovedAdminData() {
  try {
    /* Buang card Steam-DL / card percubaan dari sistem Admin Panel lama. */
    localStorage.removeItem('nimegun_admin_cards_v177');
    localStorage.removeItem('nimegun_custom_blogs_v176');
  } catch (e) {}

  /* Safety untuk DOM lama jika template ditukar tanpa full reload. */
  document.querySelectorAll('#blogGrid .blog-card[data-admin-card="1"], #blogGrid .blog-card[data-custom-editor="1"]')
    .forEach(function(card) {
      card.remove();
    });
}

function v178DescriptionIsTruncated(p) {
  if (!p) return false;

  const grid = document.getElementById('blogGrid');
  if (!grid || grid.classList.contains('list-view')) return false;

  /* v17.8.2:
     Arahan UI ialah deskripsi yang SUDAH MENCAPAI 2 BARIS dianggap panjang.
     Jadi bukan tunggu baris ke-3 baru keluar "...".
     Ukur semua card dengan style/width sebenar; tiada hardcode nama blog. */
  const rect = p.getBoundingClientRect();
  if (!rect.width) return false;

  const cs = window.getComputedStyle(p);
  const clone = p.cloneNode(true);

  clone.classList.remove('desc-truncated');
  clone.style.position = 'fixed';
  clone.style.visibility = 'hidden';
  clone.style.pointerEvents = 'none';
  clone.style.zIndex = '-1';
  clone.style.left = '-10000px';
  clone.style.top = '0';

  /* rect.width ialah border-box sebenar card description.
     Paksa border-box supaya clone tidak menjadi lebih lebar daripada p asal. */
  clone.style.boxSizing = 'border-box';
  clone.style.width = rect.width + 'px';
  clone.style.height = 'auto';
  clone.style.minHeight = '0';
  clone.style.maxHeight = 'none';
  clone.style.overflow = 'visible';
  clone.style.display = 'block';
  clone.style.whiteSpace = 'normal';
  clone.style.webkitLineClamp = 'unset';
  clone.style.lineClamp = 'unset';
  clone.style.webkitBoxOrient = 'initial';

  /* Salin ukuran typography/layout yang menentukan wrap. */
  clone.style.fontFamily = cs.fontFamily;
  clone.style.fontSize = cs.fontSize;
  clone.style.fontWeight = cs.fontWeight;
  clone.style.fontStyle = cs.fontStyle;
  clone.style.letterSpacing = cs.letterSpacing;
  clone.style.wordSpacing = cs.wordSpacing;
  clone.style.lineHeight = cs.lineHeight;
  clone.style.paddingLeft = cs.paddingLeft;
  clone.style.paddingRight = cs.paddingRight;
  clone.style.border = '0';
  clone.style.margin = '0';

  document.body.appendChild(clone);

  let lineHeight = parseFloat(cs.lineHeight);
  if (!lineHeight || Number.isNaN(lineHeight)) {
    const fontSize = parseFloat(cs.fontSize) || 12;
    lineHeight = fontSize * 1.55;
  }

  const paddingTop = parseFloat(cs.paddingTop) || 0;
  const paddingBottom = parseFloat(cs.paddingBottom) || 0;
  const contentHeight = Math.max(0, clone.scrollHeight - paddingTop - paddingBottom);

  clone.remove();

  /* 1 baris ~ 1x lineHeight; 2 baris ~ 2x.
     Toleransi 1.45 mengelakkan rounding browser daripada salah klasifikasi. */
  const renderedLines = contentHeight / lineHeight;
  return renderedLines >= 1.45;
}

function v178RefreshDescriptionStates() {
  const grid = document.getElementById('blogGrid');
  if (!grid) return;

  grid.querySelectorAll(':scope > .blog-card > p').forEach(function(p) {
    const longEnough = v178DescriptionIsTruncated(p);
    p.classList.toggle('desc-truncated', longEnough);
    p.setAttribute('data-desc-popup', longEnough ? '1' : '0');
  });
}

function v178HideDescriptionPopup() {
  const popup = document.getElementById('descPopup');
  if (!popup) return;

  popup.classList.remove('show', 'above');
  popup.setAttribute('aria-hidden', 'true');
  v178DescPopupCard = null;
  v178DescPopupText = null;
}

function v178ShowDescriptionPopup(p) {
  if (!p || !v178DescriptionIsTruncated(p)) {
    v178HideDescriptionPopup();
    return;
  }

  const popup = document.getElementById('descPopup');
  const popupText = document.getElementById('descPopupText');
  const card = p.closest('.blog-card');
  if (!popup || !popupText || !card) return;

  const fullText = (p.textContent || '').trim();
  if (!fullText) return;

  popupText.textContent = fullText;
  popup.classList.remove('above');
  popup.classList.add('show');
  popup.setAttribute('aria-hidden', 'false');

  /* Lebar popup ikut lebar card tetapi tidak melepasi viewport. */
  const cardRect = card.getBoundingClientRect();
  const pRect = p.getBoundingClientRect();
  const viewportPad = 10;
  const width = Math.min(cardRect.width, window.innerWidth - (viewportPad * 2));

  popup.style.width = Math.max(180, width) + 'px';

  let left = cardRect.left;
  left = Math.max(viewportPad, Math.min(left, window.innerWidth - width - viewportPad));

  /* Ukur selepas width/text ditetapkan. */
  const popupHeight = popup.offsetHeight;
  const gap = 7;
  let top = pRect.bottom + gap;
  let showAbove = false;

  if (top + popupHeight > window.innerHeight - viewportPad) {
    top = pRect.top - popupHeight - gap;
    showAbove = true;
  }

  top = Math.max(viewportPad, Math.min(top, window.innerHeight - popupHeight - viewportPad));

  popup.style.left = left + 'px';
  popup.style.top = top + 'px';
  popup.classList.toggle('above', showAbove);

  v178DescPopupCard = card;
  v178DescPopupText = p;
}

function v178BindDescriptionPopup() {
  if (v178DescBound) return;
  v178DescBound = true;

  const grid = document.getElementById('blogGrid');
  if (!grid) return;

  /* Desktop: hover pada deskripsi yang ada ... */
  grid.addEventListener('mouseover', function(e) {
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      const p = e.target.closest('.blog-card > p');
      if (p && p.classList.contains('desc-truncated')) {
        v178ShowDescriptionPopup(p);
      }
    }
  });

  grid.addEventListener('mouseout', function(e) {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const p = e.target.closest('.blog-card > p');
    if (!p || p !== v178DescPopupText) return;

    const related = e.relatedTarget;
    if (related && p.contains(related)) return;
    v178HideDescriptionPopup();
  });

  /* HP / touch: tap deskripsi untuk buka, tap lagi atau tap luar untuk tutup. */
  grid.addEventListener('click', function(e) {
    const p = e.target.closest('.blog-card > p');
    if (!p || !p.classList.contains('desc-truncated')) return;

    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      e.preventDefault();
      e.stopPropagation();

      if (v178DescPopupText === p) {
        v178HideDescriptionPopup();
      } else {
        v178ShowDescriptionPopup(p);
      }
    }
  }, true);

  document.addEventListener('click', function(e) {
    if (!v178DescPopupText) return;
    const popup = document.getElementById('descPopup');

    if (
      e.target === v178DescPopupText ||
      (popup && popup.contains(e.target))
    ) return;

    v178HideDescriptionPopup();
  });

  window.addEventListener('resize', function() {
    v178HideDescriptionPopup();
    setTimeout(v178RefreshDescriptionStates, 40);
  });

  window.addEventListener('scroll', function() {
    v178HideDescriptionPopup();
  }, { passive: true });
}

function v178InitDescriptionPopup() {
  v178ClearRemovedAdminData();
  v178BindDescriptionPopup();

  requestAnimationFrame(function() {
    v178RefreshDescriptionStates();
  });

  /* Feed/timer/card metadata boleh ubah tinggi sedikit selepas startup. */
  setTimeout(v178RefreshDescriptionStates, 250);
  setTimeout(v178RefreshDescriptionStates, 1000);
}

//
