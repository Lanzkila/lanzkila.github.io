# Lanzkila Hub

Direktori projek peribadi untuk GitHub Pages. Versi ini menggunakan UI baru yang **berinspirasikan struktur dan rasa visual Wotaku Wiki**: topbar minimal, carian sentiasa mudah dicapai, directory card besar, resource card bersih, dan light/dark mode yang neutral.

> Rework ini membuang visual tema GitHub-style v18 yang lama. Kod baharu dibuat sendiri untuk Lanzkila Hub; kandungan Wotaku Wiki tidak disalin.

## Fail utama

- `index.html` — struktur halaman dan layout utama.
- `style.css` — keseluruhan visual/responsive baharu.
- `script.js` — search, filter, sort, favourite, feed status, tracking, backup/restore dan fungsi UI.
- `data.js` — **sumber data projek. Edit fail ini untuk tambah atau ubah projek.**

## Edit projek melalui `data.js`

`data.js` sengaja dikekalkan sebagai pusat data supaya tidak perlu sentuh HTML setiap kali menambah projek.

Contoh:

```js
const blogData = [
  {
    name: "Nama Projek",
    url: "https://github.com/username/repository",
    cat: "cat4",
    desc: "Penerangan ringkas projek.",
    isPrivate: false,
    isNew: false
  }
];
```

### Kategori

| Nilai | Kategori |
| --- | --- |
| `cat1` | Personal / Anime |
| `cat2` | Radio / TV |
| `cat3` | Safelink |
| `cat4` | Tools |

`isPrivate: true` mengaktifkan logic private link sedia ada. `isNew` boleh digunakan untuk state data manual yang disokong renderer.

## Ciri yang dikekalkan

- Search projek secara langsung.
- Filter kategori + filter New.
- Sort Name / Latest / Added / Oldest.
- Favourite / pin projek.
- Feed/update state dan changelog tracker sedia ada.
- Recently Opened.
- Grid/List view.
- Light/Dark appearance.
- Backup dan restore settings browser.
- Responsive desktop/laptop dan HP.
- `data.js` kekal berasingan dan mudah diedit.

## UI rework

- Sticky topbar minimal.
- Search berada terus di header.
- Hero ringkas dengan status projek.
- Directory menggunakan card besar seperti laman indeks/wiki moden.
- Project/resource card lebih padat dan mudah dibaca.
- Kurang gradient, glow, pill berlebihan dan dekorasi tema lama.
- Stylesheet lama dibuang dan diganti sepenuhnya, bukan sekadar override tambahan.
- Mobile menggunakan satu kolum dan action bar yang tidak bertindih.

## Deploy ke GitHub Pages

Upload/overwrite fail berikut pada root repository:

```text
index.html
style.css
script.js
README.md
```

Jangan overwrite `data.js` jika repository kau sudah mempunyai senarai projek terkini. Patch rework ini memang direka supaya `data.js` lama boleh terus digunakan.
