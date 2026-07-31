/* --- 1. STARTUP & UTILITIES --- */
document.addEventListener('DOMContentLoaded', function() {
    
    // A. LOAD DATA DARI data.js
    const grid = document.getElementById('blogGrid');
    if (grid && typeof blogData !== 'undefined') {
        blogData.forEach(item => {
            const card = document.createElement('a');
            card.className = `blog-card ${item.cat} ${item.isPrivate ? 'private' : ''}`;
            card.href = item.url;
            card.target = '_blank';
            
            // Semak status new (mengikut properti isNew dari data.js)
            const displayNew = item.isNew ? 'inline-block' : 'none';
            
            card.innerHTML = `
                <div class='badge-container'><span class='badge-new' style='display: ${displayNew};'>New</span></div>
                <h3><span class='status-dot status-online'></span>${item.name}</h3>
                <p>${item.desc}</p>
                <span class='last-update' data-time='2026-06-13'></span>
            `;
            grid.appendChild(card);
        });
    }

    // B. FUNGSI SISTEM (Startup)
    if (typeof updateTrendUI === "function") updateTrendUI();
    if (typeof updateNetStatus === "function") updateNetStatus();
    if (typeof initAdminSystem === "function") initAdminSystem();

    // Set Tahun Footer
    const yearEl = document.getElementById('year');
    if(yearEl) yearEl.innerText = new Date().getFullYear();

    // Mod Incognito & Statistik Tracker
    setupIncognito();
    setupStatsTracker();
    
    // C. ANIMASI REVEAL
    if (typeof initReveal === "function") initReveal();

    // Notifikasi
    setTimeout(() => {
        const notif = document.getElementById('notifBubble');
        if(notif) {
            notif.classList.add('show');
            setTimeout(() => { notif.classList.remove('show'); }, 5000);
        }
    }, 2000);
});

/* --- 2. SEARCH & FILTER --- */
function searchFunction() {
  const searchBar = document.getElementById('searchBar');
  if(!searchBar) return;
  let input = searchBar.value.toLowerCase();
  document.querySelectorAll('.blog-card').forEach(card => {
    let title = card.querySelector('h3').innerText.toLowerCase();
    card.style.display = title.includes(input) ? "" : "none";
  });
}

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

/* --- 3. UI UTILITIES --- */
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
  b.setAttribute('data-theme', currentTheme === 'light' ? 'dark' : 'light');
}

function scrollToTop() { 
  window.scrollTo({top: 0, behavior: 'smooth'}); 
}

function randomBlog() {
  const cards = document.querySelectorAll('.blog-card');
  if (cards.length > 0) {
    const randomIndex = Math.floor(Math.random() * cards.length);
    const randomUrl = cards[randomIndex].getAttribute('href');
    alert("🎲 Memilih blog rawak untuk anda...");
    window.open(randomUrl, '_blank');
  }
}

window.onscroll = function() {
  let winScroll = document.body.scrollTop || document.documentElement.scrollTop;
  let height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  const myBar = document.getElementById("myBar");
  if(myBar && height > 0) {
    myBar.style.width = (winScroll / height) * 100 + "%";
  }
};

/* --- 4. DATA TRACKERS --- */
function setupStatsTracker() {
  setInterval(function() {
    var a = document.querySelectorAll('.blog-card').length;
    var u = Array.from(document.querySelectorAll('.badge-new')).filter(function(b){ return b.style.display !== 'none' }).length;
    if (document.getElementById('vCount')) document.getElementById('vCount').innerText = a;
    if (document.getElementById('oCount')) document.getElementById('oCount').innerText = u;
  }, 3000);
}

document.addEventListener('click', function(e) {
  const card = e.target.closest('.blog-card');
  if(card) {
    localStorage.setItem(card.href, 'visited');
    card.classList.add('visited');
  }
});

/* --- 5. NETWORK & TRENDING --- */
function updateNetStatus() {
  const dot = document.getElementById('netDot');
  const txt = document.getElementById('netText');
  if (!dot || !txt) return;
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

let searchHistory = JSON.parse(localStorage.getItem('searchTrend')) || {};
function updateTrendUI() {
  const topSearch = Object.keys(searchHistory).reduce((a, b) => (searchHistory[a] || 0) > (searchHistory[b] || 0) ? a : b, "...");
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

/* --- 6. ADVANCED SYSTEM --- */
function setupIncognito() {
  let pressTimer;
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
    headerTitle.addEventListener('touchstart', startP, {passive: true});
    headerTitle.addEventListener('touchend', cancelP);
  }
}

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

document.addEventListener('click', function(e) {
  const menu = document.getElementById('customMenu');
  if (menu && !e.target.closest('#customMenu')) menu.style.display = 'none';
});

function openCurrent() { if(currentMenuUrl) window.open(currentMenuUrl, '_blank'); }
function copyCurrent() { 
  if(currentMenuUrl) {
    navigator.clipboard.writeText(currentMenuUrl); 
    alert("✅ Pautan berjaya disalin!"); 
  }
}

function initAdminSystem() {
  const greetText = document.getElementById('greetText');
  if (greetText) {
    const hr = new Date().getHours();
    let greet = "Selamat Malam, Admin 🌙";
    if (hr < 12) greet = "Selamat Pagi, Admin 🌅";
    else if (hr < 18) greet = "Selamat Petang, Admin ☀️";
    greetText.innerText = greet;
  }
  if (navigator.getBattery) {
    navigator.getBattery().then(bat => {
      const batLevel = document.getElementById('batLevel');
      if (batLevel) {
        const updateBat = () => { batLevel.style.width = (bat.level * 100) + "%"; };
        updateBat();
        bat.addEventListener('levelchange', updateBat);
      }
    });
  }
}

function initReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => { entry.target.classList.add('reveal'); }, index * 100); 
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.blog-card').forEach(card => observer.observe(card));
}

/* --- LOCK LOGIC (Dual: Dynamic Generated Key + SHA-256 Hash Storage) --- */
var pendingUrl = "";
// Tentukan password default anda di sini (cth: "LanzKey99")
var defaultMasterKey = "LanzKey99"; 

// Fungsi untuk pastikan kunci/hash sentiasa wujud dalam localStorage
async function getActiveMasterHash() {
  let savedHash = localStorage.getItem('site_master_hash');
  
  if (!savedHash) {
    // Jika tiada (atau lepas clear cache), auto-generate hash daripada defaultMasterKey
    const encoder = new TextEncoder();
    const data = encoder.encode(defaultMasterKey);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    savedHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    // Simpan hash tersebut ke dalam localStorage
    localStorage.setItem('site_master_hash', savedHash);
  }
  return savedHash;
}

document.addEventListener('click', function(e) {
  var card = e.target.closest('.blog-card');
  if (card && card.classList.contains('private')) {
    e.preventDefault();
    pendingUrl = card.href;
    document.getElementById('linkLock').style.display = 'block';
    setTimeout(function() { document.getElementById('lockKey').focus(); }, 100);
  }
});

const btnUnlock = document.getElementById('btnUnlock');
if(btnUnlock) {
  btnUnlock.onclick = async function() {
    var userInput = document.getElementById('lockKey').value;
    
    // Tukar input pengguna kepada SHA-256 secara langsung
    const encoder = new TextEncoder();
    const data = encoder.encode(userInput);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    var userInputHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Ambil hash yang aktif daripada localStorage (auto-generate baharu jika cache clear)
    var activeHash = await getActiveMasterHash();

    // Semak sama ada hash input sepadan dengan hash tersimpan
    if (userInputHash === activeHash) {
      window.open(pendingUrl, '_blank');
      closeLock();
    } else {
      alert("Kunci Salah Bah!");
      document.getElementById('lockKey').value = "";
    }
  };
}

function closeLock() {
  document.getElementById('linkLock').style.display = 'none';
  document.getElementById('lockKey').value = "";
}

/* --- MANUAL TRIGGER UNTUK LOCK POPUP --- */
function openLockModal() {
  pendingUrl = ""; // Kosongkan URL sebab ini buka secara manual (bukan klik kad private)
  updateLockUI();  // Kemaskini sama ada mod Register atau Login
  const lockModal = document.getElementById('linkLock');
  if(lockModal) {
    lockModal.style.display = 'block';
    setTimeout(function() { 
      const lockKey = document.getElementById('lockKey');
      if(lockKey) lockKey.focus(); 
    }, 100);
  }
}
