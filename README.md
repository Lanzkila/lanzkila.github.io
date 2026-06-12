# 🚀 Lanzkila Hub

Hub projek peribadi untuk menguruskan repositori dan link penting.

## 🛠️ Teknologi
- **HTML5 & CSS3**: Struktur dan paparan moden.
- **JavaScript (Vanilla)**: Enjin utama untuk filter, search, dan sistem sekuriti.
- **GitHub Pages**: Dihoskan secara percuma dan pantas.

## ✨ Ciri-ciri Utama
- 🔍 **Real-time Search**: Cari projek anda dengan pantas.
- 🏷️ **Category Filter**: Susun projek mengikut kategori (Personal, Tools, dll).
- 🔒 **Private Lock**: Sistem kunci untuk projek sensitif/peribadi.
- 📊 **Live Stats**: Statistik automatik untuk jumlah projek dan update terkini.
- 🌙 **Dark Mode Ready**: Sokongan tema gelap.

## 📁 Struktur Fail
- `index.html`: Kerangka utama website.
- `style.css`: Rekaan antaramuka (UI).
- `script.js`: Logik sistem (fungsi utama).
- `data.js`: Fail untuk menambah/menguruskan link projek anda.

## 📝 Cara Tambah Projek Baru
Hanya buka fail `data.js` dan tambah objek baru dalam array `blogData`:

```javascript
{ 
  name: "Nama Projek", 
  url: "[https://link-projek.com](https://link-projek.com)", 
  cat: "cat1", 
  desc: "Deskripsi ringkas", 
  isPrivate: false 
}
