# Status Implementasi & QA

## Release verdict

**Belum boleh disebut production-ready.** Fondasi sudah berkembang dari katalog awal menjadi aplikasi ensiklopedia dengan domain model, peta, timeline, glosarium, relationship graph, PWA/offline state, static SEO routes, dan admin CRUD console. Namun Definition of Done masih memerlukan skala konten, asset matrix, backend Cloudflare live, frontend→API production, dan browser QA penuh.

## Yang sudah diimplementasikan

### Frontend public
- Progressive shell upgrade yang mengubah tampilan lama menjadi pengalaman kastil tanpa bergantung pada server frontend.
- Entry gate “Masuki Kastil”, default tanpa autoplay audio, reduced-motion aware.
- Great Hall hero, 12 collection cards, arsip pilihan, global search, bookmark, riwayat.
- Detail artikel bergaya folio, quick facts, provenance drawer, share, related content.
- Interactive castle map dengan 10 pin editorial.
- Timeline.
- Glosarium.
- Field guide tokoh, makhluk, mantra, ramuan, artefak, lokasi, dan astronomi.
- Relationship graph seed: 10 node / 8 edge plus accessible textual relationship list.
- Error, empty, dan offline state.
- Mobile bottom navigation dan touch-target design >=44px pada CSS utama.
- Modular CSS: tokens/base/layout/components/graph/animations/responsive.

### Static fallback data
- 12 collection.
- 12 artikel editorial awal.
- 10 tokoh.
- 6 makhluk.
- 7 mantra.
- 3 ramuan.
- 3 artefak.
- 6 lokasi.
- 6 timeline event.
- 12 glossary terms.
- 4 astronomy entries.
- 10 relationship nodes / 8 edges.

### D1 model/seed
Migration sekarang mencakup users, roles, user_roles, sessions, content_sections, content_categories, characters, creatures, spells, potions, artifacts, plants, locations, events, timeline_links, relationships, glossary, content_assets, bookmarks, view_history, daily_features, astronomy_entries, serta tabel fondasi awal content/sources/assets/audit/settings.

Seed D1 minimum saat ini berisi 12 tokoh, 7 makhluk, 7 mantra, 4 ramuan, 4 artefak, 4 tanaman, 4 astronomy entries, 6 lokasi, 8 events, 12 glossary terms, dan 8 structured relationships, selain 12 artikel awal.

### Backend API
- API content/categories/search/assets lama tetap dipertahankan.
- Endpoint domain baru: characters, creatures, spells, potions, artifacts, plants, locations, timeline, glossary, sources, daily-feature, relationships, astronomy.
- Prepared statements / bound parameters.
- Origin allowlist.
- Secure response headers pada domain endpoint.
- Admin content CRUD dengan bearer secret bootstrap, rate limiter requirement, payload cap, revision conflict, soft-delete, audit log.

### CMS browser
`frontend/admin.html` menyediakan console editorial untuk:
- koneksi Worker;
- membaca daftar content;
- membuat artikel;
- mengedit artikel;
- publish/draft status;
- revision concurrency melalui `If-Match`;
- soft delete;
- diagnostics dasar jumlah content/draft/published/source.

Token operator hanya berada di memori tab dan tidak disimpan ke localStorage. Ini masih mekanisme bootstrap, bukan final account/session auth.

### SEO / progressive enhancement
Build menghasilkan HTML crawlable untuk:
- 12 collection route;
- semua artikel awal;
- peta;
- timeline;
- glosarium;
- astronomi;
- relationship graph;
- tentang;
- sumber;
- kredit aset.

Sitemap dibangkitkan ulang dan structured data CollectionPage tersedia pada route statis utama.

### PWA
Service worker meng-cache shell, core CSS/JS, fallback data, generated SVG, map, graph, dan offline page. Runtime API config tidak sengaja dipaksa ke cache shell sehingga pergantian backend dapat tetap dilakukan lewat file config yang dibaca `no-store`.

## QA yang sudah terbukti

GitHub Actions `Verify` telah berhasil pada build yang mencakup migration domain dan enhanced SEO build. Pipeline memvalidasi unit test, npm build, migration SQLite seluruh file migration, dan foreign keys. Test tambahan di repository sekarang juga menjalankan `node --check` pada seluruh source JavaScript frontend/worker/build serta audit coverage static reference dan asset manifest.

Artifact build yang berhasil juga telah diunduh dan diperiksa secara lokal. Seluruh JavaScript pada artifact yang diperiksa lolos `node --check`. Static relative-reference scan tidak menemukan broken internal asset/link; satu temuan `/hogwarts-indonesia/` pada `404.html` adalah absolute GitHub Pages base path dan bukan missing artifact lokal.

Build script sekarang mempunyai `validate-build.mjs` yang memblokir build bila exploration routes, graph modules, generated assets, data fallback, article pages, sitemap routes, atau service-worker core references yang diwajibkan hilang.

## QA yang belum dapat diklaim

Playwright/Chromium tersedia di environment analisis, tetapi policy browser environment memblokir navigasi localhost/file dengan `ERR_BLOCKED_BY_ADMINISTRATOR`. Karena itu saya **tidak** mengklaim E2E browser visual dari artifact lokal. Browser QA production harus dilakukan setelah Pages dapat diakses melalui HTTPS publik.

Belum dilakukan secara valid:
- screenshot QA production;
- console/network audit pada URL Pages live;
- responsive visual QA di iPhone/Android viewport nyata;
- keyboard/focus walkthrough end-to-end;
- WCAG automated + manual audit;
- Lighthouse/Core Web Vitals;
- service-worker offline simulation pada origin production;
- D1 remote migration;
- Worker runtime test di Cloudflare;
- admin CRUD terhadap D1 production;
- CORS production cross-origin test.

## Gap terhadap Definition of Done

1. Target content belum tercapai: 100+ tokoh, 50+ makhluk, 70+ mantra, plus kedalaman ramuan/artefak/herbologi/lokasi.
2. Asset generation matrix masih jauh dari target. Repository baru mempunyai monogram, castle-entry vector, dan castle-map vector sebagai generated visual yang terdaftar.
3. Aset internet legal belum dimasukkan; ini disengaja sampai audit lisensi dapat dipertanggungjawabkan.
4. Account/session auth belum menggantikan bootstrap bearer-token admin.
5. Admin diagnostics masih dasar; orphan asset, broken source, duplicate slug, dan unattributed asset belum mempunyai dashboard lengkap.
6. Relationship graph masih seed kecil dan belum menggunakan endpoint D1 secara live.
7. `runtime-config.json` masih memakai static fallback karena URL Worker production belum tersedia.
8. GitHub Pages workflow belum dieksekusi/URL live belum diverifikasi.
9. Cloudflare Worker + D1 belum dideploy dari sesi yang tersedia.
10. Lighthouse, accessibility, mobile/desktop browser QA masih release blockers.

## Aturan status

Repository boleh disebut **buildable foundation with verified CI**, tetapi belum “production-ready”. Status final hanya boleh diubah setelah Pages live, Worker/D1 live, frontend memakai API production, browser QA selesai, content/asset target terpenuhi, dan seluruh release blocker di atas ditutup.
