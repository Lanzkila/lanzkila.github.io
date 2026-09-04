# Kirin Landing Page — GitHub Pages v1.1

Static GitHub Pages version. `data.js` kekal **data blok sahaja**; semua renderer dan logic berada dalam `script.js`.

## File utama

- `index.html` — struktur halaman.
- `style.css` — CSS.
- `data.js` — data blok/card sahaja.
- `script.js` — renderer + logic halaman + tracker `isNew` 24 jam.
- `backup/Kirin Landing Page.xml` — backup source Blogger asal.
- `backup/v1.0/` — backup `data.js` dan `script.js` sebelum update v1.1.

## Edit blok di `data.js`

Format:

```js
{
  name: "Nama Blok",
  url: "https://example.com",
  cat: "cat4",
  desc: "Penerangan blok.",
  isPrivate: false,
  isNew: false
}
```

Kategori:

- `cat1` — Personal / Anime
- `cat2` — Radio / TV
- `cat3` — Safelink
- `cat4` — Tools

## Cara `isNew` v1.1 bekerja

`isNew` tidak memerlukan script di dalam `data.js`.

- `isNew: false` — normal, tiada badge. Keadaan ini juga **re-arm** tracker di belakang layar.
- `isNew: true` — badge **New Update** bermula dan hidup selama 24 jam.
- Selepas 24 jam — badge hilang sendiri. `script.js` menyimpan keadaan expired dalam `localStorage`, jadi reload page tidak menghidupkannya semula walaupun source masih `true`.
- Untuk guna semula pada update akan datang: tukar item itu ke `false`, deploy/buka versi itu, kemudian bila ada update baru tukar semula ke `true`.

> Nota: GitHub Pages ialah static site, jadi JavaScript tidak boleh menulis balik `true` menjadi `false` di fail `data.js` pada server. Sebab itu keadaan efektif selepas 24 jam disimpan oleh tracker di browser, sama konsep tracker localStorage pada versi Blogger.

## Metadata lama yang masih disokong

```js
added: "2026-09-04T13:40:00+08:00",
revision: "2",
updateType: "CODE"
```

## Deploy GitHub Pages

Upload `index.html`, `style.css`, `data.js`, dan `script.js` ke root repository, kemudian aktifkan **Settings → Pages → Deploy from a branch**.
