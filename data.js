/* Kirin LP v17.5.6 — repository data
   Edit this list only when adding/removing GitHub projects. */

const blogData = [
  {
    name: "Studio Converter",
    url: "https://github.com/Lanzkila/StudioConverter",
    cat: "cat4",
    desc: "Tempat Converter Manga yang Mendukung Format Seperti CBZ,ZIP dan lain-lain.",
    isPrivate: false,
    isNew: false
  },
  {
    name: "L4d2 Tools",
    url: "https://github.com/Lanzkila/Tools-L4D2",
    cat: "cat4",
    desc: "Tools Game Left 4 Dead 2.",
    isPrivate: false,
    isNew: false
  },
  {
    name: "Manga Reader",
    url: "https://github.com/Lanzkila/Manga-Reader",
    cat: "cat4",
    desc: "Pembaca manga berasaskan web yang privasi-sentrik.",
    isPrivate: false,
    isNew: false
  },
  {
    name: "Kirin PDF Reader",
    url: "https://github.com/Lanzkila/Kirin-Dynamic-PDF",
    cat: "cat4",
    desc: "Kirin PDF Reader adalah viewer PDF berasaskan web yang ringan dan pantas, direka khas untuk peminat manga dan dokumen panjang.",
    isPrivate: false,
    isNew: false
  }
];

/* Render the original blogData format into the card markup expected by script.js. */
(function renderBlogData() {
  const grid = document.getElementById('blogGrid');
  if (!grid) return;

  grid.innerHTML = '';

  blogData.forEach((item) => {
    const card = document.createElement('a');
    card.className = `blog-card ${item.cat || 'cat4'}${item.isPrivate ? ' private' : ''}`;
    card.href = item.url || '#';
    card.target = '_blank';
    card.rel = 'noopener noreferrer';

    if (item.isNew) {
      const badgeContainer = document.createElement('div');
      badgeContainer.className = 'badge-container';

      const badge = document.createElement('span');
      badge.className = 'badge-new';
      badge.textContent = 'New Update';
      badgeContainer.appendChild(badge);
      card.appendChild(badgeContainer);
    }

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
})();
