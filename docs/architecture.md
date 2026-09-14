# Hogwarts Indonesia — Arsitektur

Frontend menggunakan HTML semantik yang diperkaya ES modules dan CSS modular. Source `index.html` lama dipertahankan sebagai shell kompatibel, lalu `bootstrap.js` menjalankan progressive upgrade melalui `shell.js` sebelum memuat router pengalaman baru di `app-v2.js`. Pendekatan ini menjaga build lama tetap dapat dipakai sambil mengubah pengalaman live secara bertahap tanpa server frontend.

## Frontend

- `frontend/js/bootstrap.js` — entry upgrade.
- `frontend/js/shell.js` — menyusun header, global search, entry gate, footer, dan stylesheet modular.
- `frontend/js/app-v2.js` — routing hash, bootstrap data, PWA registration.
- `frontend/js/pages-core.js` — Great Hall, indeks, detail artikel.
- `frontend/js/pages-explore.js` — field guide, peta, timeline, glosarium.
- `frontend/js/pages-meta.js` — bookmark/riwayat, sumber, kredit aset, tentang.
- `frontend/js/api.js` — Workers API dengan fallback static `catalog.json` + `reference.json`.
- `frontend/js/state.js` — bookmark, history, preferences lokal.
- `frontend/js/accessibility.js` — reveal observer, reduced-motion, shortcut pencarian, focus management.
- `frontend/css/*` — token, base, layout, component, animation, responsive layers.
- `frontend/assets/generated/*` — visual original yang tidak bergantung pada film.
- `frontend/admin.html` + `frontend/js/admin.js` — console CRUD konten berbasis admin API.

GitHub Pages adalah target hosting. Artikel HTML statis tetap dibangkitkan oleh `scripts/build.mjs` untuk SEO/progressive enhancement; pengalaman interaktif memakai hash routing agar refresh pada Pages tidak bergantung pada rewrite server.

## Backend

Cloudflare Workers memakai entry `worker/src/index-v2.js`. Endpoint domain baru ditangani di v2 dan endpoint content/admin yang sudah ada diteruskan ke `index.js`. D1 binding wajib bernama `DB`.

Migrations:

- `0001_initial.sql` — content, FTS, source, asset, audit, settings.
- `0002_seed.sql` — 12 koleksi + artikel awal.
- `0003_domain_model.sql` — users/roles/sessions dan model encyclopedia terstruktur.
- `0004_reference_seed.sql` — seed hasil riset untuk tokoh, makhluk, mantra, lokasi, timeline, glossary.
- `0005_extended_reference_seed.sql` — ramuan, artefak, herbologi, astronomi, relationships.

## Data flow

1. Frontend mencoba Workers bila `meta[name=api-base]` sudah diisi URL production.
2. Jika Worker belum aktif atau gagal, konten dasar dibaca dari `catalog.json` dan entity reference dari `reference.json`.
3. Saat Worker production aktif, API menjadi SSOT untuk domain terstruktur.
4. Bookmark/riwayat tetap lokal sampai account feature diaktifkan secara penuh.

## Security boundary

Secret tidak boleh berada di frontend/Git. Admin mutation saat ini dilindungi `ADMIN_TOKEN`, CORS allowlist, rate limiter, validation, payload cap, prepared statements, revision check, soft delete, dan audit log. Tabel users/roles/sessions sudah tersedia, tetapi bootstrap bearer-token admin masih harus diganti/diperkuat dengan session auth sebelum status final production.

## Release gate

Build belum boleh disebut selesai sebelum target konten (100+ tokoh, 50+ makhluk, 70+ mantra), asset matrix, CMS lengkap, graph, browser QA, accessibility/performance audit, Pages live, Worker live, D1 migration production, dan koneksi frontend→API production seluruhnya terverifikasi.

## Status 2026-09-14

Fondasi arsitektur, migration domain, seed reference, peta/timeline/glossary UI, field guide, PWA cache, dan console CRUD sudah ada di repository. GitHub Verify terakhir yang teramati setelah perubahan data berhasil, termasuk build dan validasi migration SQLite. Deployment Pages tetap membutuhkan workflow deploy manual dan Cloudflare belum dapat dideploy dari koneksi yang tersedia pada sesi ini.
