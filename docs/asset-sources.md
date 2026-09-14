# Asset Sources & Provenance

## Policy

Aset visual publik dibagi menjadi `generated` dan `internet`. File dari internet tidak boleh masuk ke build hanya karena dapat diakses; lisensi penggunaan harus dapat diverifikasi terlebih dahulu. Website resmi Harry Potter/Wizarding World digunakan sebagai referensi riset konten, bukan dianggap otomatis sebagai sumber file visual yang boleh disalin.

## Prioritas sumber terbuka

Wikimedia Commons, Openverse, Unsplash, Pexels, Pixabay, Europeana, Internet Archive, Flickr Creative Commons dengan lisensi yang sesuai, museum/perpustakaan digital, serta repositori public-domain/open-license lain.

## Metadata wajib

Setiap record `frontend/assets/assets-manifest.json` memuat: `id`, `file`, `category`, `origin`, `sourceUrl`, `creator`, `license`, `attribution`, `accessedAt`, `usage`, `alt`, dan `notes`.

## Generated assets saat ini

- `assets/brand/monogram.svg` — monogram original HI, tidak menyalin crest resmi.
- `assets/generated/castle-entry.svg` — komposisi kastil fantasi original untuk environment hero.
- `assets/generated/castle-map.svg` — peta navigasi editorial original; bukan denah canon.

## Aturan kurasi internet

1. Simpan halaman sumber, bukan hanya URL file CDN.
2. Catat creator dan jenis lisensi secara eksplisit.
3. Pastikan lisensi mengizinkan jenis penggunaan yang direncanakan.
4. Simpan attribution yang diperlukan.
5. Jangan menghapus watermark atau credit.
6. Jangan hotlink bila file legal dapat disimpan lokal.
7. Buat AVIF/WebP/responsive variant hanya dari file yang memang boleh diubah.
8. Broken URL atau lisensi yang menjadi tidak jelas harus memblokir publikasi aset sampai ditinjau.

## Gap

Target asset matrix pada master prompt belum terpenuhi. Dua environment vector sekarang hanya fondasi. Sebelum status final, repository masih membutuhkan hero unik per collection, interior, location plates, creature plates, spell plates, potion still-life, artifact illustrations, herbology, astronomy, Quidditch, karakter editorial, ornament/icon system, offline/error art, dan social-preview variants.
