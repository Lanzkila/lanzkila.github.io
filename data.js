/* Kirin LP v17.5.6 — project/blog data
   Edit entries here to add/remove cards without touching index.html. */

window.KIRIN_LP_DATA = [
  {
    "category": "cat1",
    "title": "Nimegun",
    "description": "Update terkini dari Nimegun.",
    "url": "https://nimegun.blogspot.com",
    "private": false,
    "newUpdate": true,
    "newAdded": false
  },
  {
    "category": "cat1",
    "title": "License Kirin",
    "description": "License Kirin ini adalah blog khusus untuk buat lesen jika nanti tema itu dibeli.",
    "url": "https://lesen-kirin.blogspot.com",
    "private": true,
    "newUpdate": true,
    "newAdded": false
  },
  {
    "category": "cat1",
    "title": "LanzMagick RU",
    "description": "Kandungan terkini dari anime dan manga dari Anilist.",
    "url": "https://lanzm-aup.blogspot.com",
    "private": false,
    "newUpdate": true,
    "newAdded": false
  },
  {
    "category": "cat1",
    "title": "NoteCode Studio",
    "description": "Notepad dan Kod studio dari hasil gabungan antara beberapa tema.",
    "url": "https://not-egu.blogspot.com",
    "private": false,
    "newUpdate": true,
    "newAdded": false
  },
  {
    "category": "cat1",
    "title": "Feed",
    "description": "Update terkini dari feed.",
    "url": "https://prn-gun.blogspot.com",
    "private": false,
    "newUpdate": true,
    "newAdded": false
  },
  {
    "category": "cat1",
    "title": "Anilst",
    "description": "Anilst adalah blog utama dan salah satu yang masih ada post nya.",
    "url": "https://anilst.blogspot.com",
    "private": false,
    "newUpdate": true,
    "newAdded": false
  },
  {
    "category": "cat1",
    "title": "Nimegumi",
    "description": "Menyediakan update terkini dari perayaan dan hari jadi.",
    "url": "https://nimegumi.blogspot.com",
    "private": false,
    "newUpdate": true,
    "newAdded": false
  },
  {
    "category": "cat1",
    "title": "LanzMagick Vault",
    "description": "Kandungan terkini (Doujinshi) dari anime dan manga dari Anilist.",
    "url": "https://lanz-vl.blogspot.com/",
    "private": false,
    "newUpdate": true,
    "newAdded": false
  },
  {
    "category": "cat1",
    "title": "LanzMagick Library",
    "description": "Update Anime dan Manga di Anilist V2",
    "url": "https://lanz-la.blogspot.com/",
    "private": false,
    "newUpdate": true,
    "newAdded": false
  },
  {
    "category": "cat1",
    "title": "Bio Kirin",
    "description": "Untuk Bio Saja.",
    "url": "https://bio-kirin.blogspot.com/",
    "private": false,
    "newUpdate": true,
    "newAdded": false
  },
  {
    "category": "cat1",
    "title": "KoDBox",
    "description": "Blog khusus untuk simpan kode tapi tak selalu dipakai.",
    "url": "https://kodgun.blogspot.com/",
    "private": false,
    "newUpdate": true,
    "newAdded": false
  },
  {
    "category": "cat2",
    "title": "TVRad (TV dan Radio)",
    "description": "Info TV & Radio terkini adalah hasil gabungan antara radio dengan tv.",
    "url": "https://tvrad-tr.blogspot.com",
    "private": false,
    "newUpdate": true,
    "newAdded": false
  },
  {
    "category": "cat2",
    "title": "Kami Radio",
    "description": "Kami Radio adalah sejenis player yang mempunyai multifungsi dan menyokong perlbagai jenis format.",
    "url": "https://kami-radio.blogspot.com",
    "private": false,
    "newUpdate": true,
    "newAdded": false
  },
  {
    "category": "cat2",
    "title": "Kami Tivi",
    "description": "Kami TV adalah blog yang khusus untuk TV.",
    "url": "https://kami-tivi.blogspot.com",
    "private": false,
    "newUpdate": true,
    "newAdded": false
  },
  {
    "category": "cat2",
    "title": "Ovotube",
    "description": "Ovotube ini adalah sejenis video player yang multifungsi sama seperti kami radio tadi.",
    "url": "https://ovotube.blogspot.com/",
    "private": false,
    "newUpdate": true,
    "newAdded": false
  },
  {
    "category": "cat3",
    "title": "SafePoi",
    "description": "SafePoi adalah safelink kedua saya selepas slinknime tadi.",
    "url": "https://poisln.blogspot.com",
    "private": false,
    "newUpdate": true,
    "newAdded": false
  },
  {
    "category": "cat3",
    "title": "SLinkNime",
    "description": "SLinkNime adalah safelink pertama saya.",
    "url": "https://slinknime.blogspot.com",
    "private": false,
    "newUpdate": true,
    "newAdded": false
  },
  {
    "category": "cat3",
    "title": "MintSafe",
    "description": "MintSafe adalah safelink yang ketiga hasil gabungan antara safelink dengan shortlink.",
    "url": "https://mintsafe.blogspot.com",
    "private": false,
    "newUpdate": true,
    "newAdded": false
  },
  {
    "category": "cat4",
    "title": "Tools Kirin",
    "description": "Mempunyai 15 dalam 1 tools untuk kegunaan sendiri dan publik.",
    "url": "https://kirin-tools.blogspot.com",
    "private": false,
    "newUpdate": true,
    "newAdded": false
  },
  {
    "category": "cat4",
    "title": "L4D2 Tools",
    "description": "Tools untuk Left 4 Dead 2.",
    "url": "https://t-l4d2.blogspot.com/",
    "private": false,
    "newUpdate": true,
    "newAdded": false
  },
  {
    "category": "cat4",
    "title": "Kirin Manga Studio",
    "description": "Tools untuk converter manga yang pelbagai fungsi.",
    "url": "https://cbztopdf.blogspot.com/",
    "private": false,
    "newUpdate": true,
    "newAdded": false
  }
];

(function renderKirinLpData() {
  const grid = document.getElementById('blogGrid');
  if (!grid) return;

  grid.innerHTML = '';

  window.KIRIN_LP_DATA.forEach((item) => {
    const card = document.createElement('a');
    card.className = `blog-card ${item.category || 'cat1'}${item.private ? ' private' : ''}`;
    card.href = item.url || '#';
    card.target = '_blank';
    card.rel = 'noopener noreferrer';

    const badgeContainer = document.createElement('div');
    badgeContainer.className = 'badge-container';

    if (item.newUpdate) {
      const badge = document.createElement('span');
      badge.className = 'badge-new';
      badge.textContent = 'New Update';
      badgeContainer.appendChild(badge);
    }

    if (item.newAdded) {
      const badge = document.createElement('span');
      badge.className = 'badge-added';
      badge.textContent = 'New Added';
      badgeContainer.appendChild(badge);
    }

    if (badgeContainer.childElementCount) card.appendChild(badgeContainer);

    const heading = document.createElement('h3');
    const statusDot = document.createElement('span');
    statusDot.className = 'status-dot status-online';
    heading.appendChild(statusDot);
    heading.appendChild(document.createTextNode(item.title || 'Untitled'));
    card.appendChild(heading);

    const description = document.createElement('p');
    description.textContent = item.description || '';
    card.appendChild(description);

    grid.appendChild(card);
  });
})();
