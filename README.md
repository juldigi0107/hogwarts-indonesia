# Hogwarts Indonesia

Ensiklopedia dunia sihir berbahasa Indonesia. **Implementasi awal; belum memenuhi definition of done master prompt dan belum layak dinyatakan production-ready.**

## Struktur

- `frontend/`: antarmuka editorial, katalog JSON, pencarian, bookmark, riwayat dan service worker.
- `worker/src/index.js`: API content D1 dan admin CRUD berbasis bearer secret.
- `worker/migrations/`: schema awal dan 12 artikel seed.
- `scripts/build.mjs`: build statis dengan halaman artikel HTML, sitemap dan 404.
- `test/`: tes katalog, pencarian, validasi dan penolakan akses API.
- `.github/workflows/`: verifikasi dan deployment Pages manual.
- `docs/`: arsitektur, deployment dan status QA.

## Menjalankan

Membutuhkan Node.js 22. Tidak ada dependency aplikasi eksternal.

```sh
npm test
npm run build
```

Hasil frontend berada di `dist/`. Sajikan melalui server HTTP; jangan membuka file melalui `file://` karena fetch katalog memerlukan HTTP. GitHub Actions Verify juga dapat membangun artifact tanpa perintah lokal.

## Cakupan saat ini

12 kategori dan 12 artikel awal; belum mencapai 100 tokoh, 50 makhluk atau 70 mantra. Sumber buku dicatat dengan bab dan belum diperiksa terhadap salinan buku pada sesi implementasi. Frontend membaca snapshot JSON, belum API production. Bookmark dan riwayat hanya disimpan di perangkat.

API yang tersedia: `/api/v1/health`, `/content`, `/content/:slug`, `/categories`, `/search`, `/assets`, serta admin `/admin/content` dan `/admin/content/:id`. Admin memerlukan secret dan rate limiter; UI CMS, login pengguna dan tabel domain lengkap belum dibuat. Admin CRUD belum memperbarui tabel provenance secara otomatis sehingga belum memenuhi CMS final.

Aset repository saat ini hanya satu SVG monogram original. Hero image hasil generation pada percakapan belum ditransfer; tidak ada aset internet yang diunduh. Tampilan cinematic penuh belum terimplementasi.

## Deployment dan QA

Lihat [deployment](docs/deployment.md) dan [status QA](docs/qa-report.md). Penambahan workflow bukan bukti pengujian berhasil. Saat commit dokumentasi ini disusun, Actions belum mengembalikan workflow run; Pages/Workers/D1 belum diverifikasi live.

Target frontend: `https://juldigi0107.github.io/hogwarts-indonesia/` — belum dinyatakan aktif. URL API dan database_id D1 belum tersedia.

## Independensi dan hak

Hogwarts Indonesia adalah proyek ensiklopedis/fan-made independen berbahasa Indonesia dan tidak berafiliasi dengan Warner Bros. Discovery, J.K. Rowling, Wizarding World, atau pemegang hak terkait.

Penggunaan nama, merek dan intellectual property untuk tujuan komersial memerlukan tinjauan hukum dan lisensi yang sesuai. Narasi ditulis ulang; visual resmi dan soundtrack tidak disalin.
