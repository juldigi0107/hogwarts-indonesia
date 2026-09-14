# Status implementasi dan QA

Belum layak rilis sesuai master prompt.

## Ditambahkan
12 kategori, 12 artikel awal dengan sumber/rujukan bab, pencarian keyword/filter, detail artikel, bookmark/riwayat perangkat, halaman sumber/tentang, cache shell, build artikel HTML, sitemap, API content/categories/search/assets, migration SQLite/D1, admin CRUD API dengan bearer secret, rate limiter wajib, revision conflict dan soft-delete.

## Belum selesai
Target 100 tokoh, 50 makhluk dan 70 mantra; verifikasi sumber buku langsung; aset cinematic dan transfer gambar hasil generation; font lokal; API production integration; CMS browser/login/roles; tabel domain lengkap; peta, graph, timeline, glosarium; fitur harian; audit aset; offline per-bookmark; semua endpoint spesifik domain; metadata lengkap semua route; header CSP frontend; pengujian browser mobile/desktop, WCAG, performance dan deployment live.

## Pengujian
Workflow Verify menjalankan syntax checks, unit tests, build dan migration SQLite. Hasil workflow harus diperiksa di Actions; keberadaan tes bukan bukti tes lulus. Belum dilakukan E2E, screenshot, tes Worker dalam runtime Cloudflare, pengukuran Lighthouse/INP atau tes admin D1 nyata.

## Batasan
UI memakai katalog statis saat ini. Perubahan admin API belum otomatis masuk snapshot frontend. Jangan menyatakan CMS end-to-end sudah terintegrasi. Hero image percakapan belum berada dalam repository. SVG monogram bukan aset imagegen. Tidak ada aset internet yang diunduh. Halaman Pages belum dinyatakan aktif.
