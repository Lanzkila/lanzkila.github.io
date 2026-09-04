# Kirin Landing Page

**Kirin Landing Page** ialah sebuah halaman hub berasaskan **GitHub Pages** yang digunakan untuk menghimpunkan pelbagai projek, blog, tools, radio, safelink dan laman lain dalam satu tempat.

Projek ini asalnya dibina sebagai tema Blogger, kemudian ditukar kepada struktur static GitHub Pages supaya lebih ringan, mudah diselenggara dan tidak lagi bergantung pada sistem template Blogger.

## Tentang Projek

Kirin Landing Page direka sebagai pusat navigasi ringkas untuk semua projek Kirin / Lanzkila. Setiap laman dipaparkan dalam bentuk blok atau card yang mengandungi nama, pautan, kategori dan penerangan ringkas.

Semua maklumat blok disimpan berasingan di dalam `data.js`, jadi kandungan boleh ditambah, dibuang atau diubah tanpa perlu menyentuh struktur utama halaman.

## Ciri Utama

- Responsive untuk desktop dan telefon.
- Light Mode dan Dark Mode.
- Carian projek atau blog.
- Filter mengikut kategori.
- Susunan berdasarkan nama, terkini, baru ditambah dan paling lama.
- Grid View dan List View.
- Favourite / pin menggunakan Local Storage.
- Recently Opened.
- Backup dan Restore tetapan.
- Badge **New Update** dengan tempoh 24 jam.
- Kandungan blok dikawal melalui `data.js`.
- Sesuai digunakan terus dengan GitHub Pages.

## Pengurusan Data

Semua blok utama berada di dalam:

```text
data.js
```

Contoh:

```js
const blogData = [
  {
    name: "Studio Converter",
    url: "https://github.com/Lanzkila/StudioConverter",
    cat: "cat4",
    desc: "Tempat Converter Manga yang Mendukung Format Seperti CBZ,ZIP dan lain-lain.",
    isPrivate: false,
    isNew: false
  }
];
```

`data.js` hanya digunakan untuk menyimpan data. Semua proses render, filter, badge, timer dan fungsi halaman dijalankan oleh `script.js`.

## Sistem New Update

Tetapkan:

```js
isNew: true
```

untuk mengaktifkan badge **New Update**.

Badge akan berjalan selama kira-kira **24 jam** dan kemudian hilang secara automatik. Statusnya disimpan di Local Storage supaya badge yang sudah tamat tidak muncul semula hanya kerana halaman direfresh.

Untuk projek biasa tanpa badge:

```js
isNew: false
```

## Struktur Projek

```text
/
├── index.html
├── style.css
├── script.js
├── data.js
└── README.md
```

## GitHub Pages

Projek ini dibina sebagai laman static, jadi ia boleh terus digunakan melalui GitHub Pages tanpa server atau database tambahan.

---

**Kirin Landing Page**  
Satu halaman untuk menghimpunkan semua projek dalam satu tempat.
