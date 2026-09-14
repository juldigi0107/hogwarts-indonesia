# Deployment

## GitHub Pages

Workflow Verify menghasilkan artifact frontend yang sudah melewati build, test data, syntax test tambahan, validasi migration SQLite, serta simulasi import seed D1 skala. Workflow `Deploy Pages` tersedia melalui `workflow_dispatch`. Pada Settings > Pages, pilih **GitHub Actions**, lalu jalankan workflow Deploy Pages secara manual.

Target URL: `https://juldigi0107.github.io/hogwarts-indonesia/` — URL ini baru boleh disebut live setelah deployment selesai dan halaman benar-benar dapat dibuka.

Build menghasilkan route statis crawlable untuk collection, artikel, peta, timeline, glosarium, astronomi, relationship graph, sumber, kredit aset, dan tentang. Pengalaman interaktif tetap memakai hash routing sehingga refresh eksplorasi tidak bergantung pada server rewrite.

## Runtime API configuration

Frontend membaca `frontend/data/runtime-config.json` dengan `cache: no-store` sebelum aplikasi utama dijalankan. Selama `apiBase` kosong, frontend menggunakan fallback data statis yang versioned di repository. Setelah Worker production terverifikasi, isi `apiBase` dengan origin Worker, misalnya `https://nama-worker.example.workers.dev` tanpa trailing slash. File ini **tidak boleh** berisi secret.

## Cloudflare Workers + D1

1. Buat D1 di akun tujuan.
2. Catat `database_id` aktual.
3. Tambahkan `[[d1_databases]]` pada `worker/wrangler.toml` dengan binding `DB`, `database_name`, `database_id`, dan `migrations_dir = "migrations"`.
4. Set secret `ADMIN_TOKEN` minimal 32 karakter melalui Wrangler/Cloudflare, bukan Git.
5. Tambahkan binding Workers Rate Limiting bernama `ADMIN_RATE_LIMITER` untuk admin mutation.
6. Jalankan migration remote D1 dari folder `worker`.
7. Dari root repository jalankan `npm run seed:generate`. Generator memvalidasi minimum 100 tokoh, 50 makhluk, 70 mantra, duplicate slug, dan metadata sumber lalu membuat `worker/seeds/scale.sql`.
8. Impor `worker/seeds/scale.sql` ke D1 production menggunakan Wrangler `d1 execute --remote --file ...` terhadap database yang benar. Jangan menganggap seed berhasil hanya karena file berhasil dibuat.
9. Jalankan query count remote dan pastikan `characters >= 100`, `creatures >= 50`, `spells >= 70` serta `PRAGMA foreign_key_check` tidak menunjukkan masalah.
10. Deploy Worker.
11. Verifikasi `/api/v1/health`, categories, content, characters, creatures, spells, potions, artifacts, plants, astronomy, locations, timeline, glossary, relationships, sources, assets, search, dan daily-feature.
12. Jalankan `/api/v1/admin/diagnostics` dengan kredensial operator dan pastikan bagian `scale` menandai target 100/50/70 sebagai tercapai.
13. Verifikasi CORS dari origin `https://juldigi0107.github.io`.
14. Setelah API lulus, isi `frontend/data/runtime-config.json`, commit, build, dan deploy Pages lagi.

Dataset scale dan kebijakan provenance dijelaskan di `docs/content-scale.md`. Scale seed memakai satu source record batch-level dari official Fact Files index. Itu bukan pengganti item-level source enrichment; entry prioritas tetap perlu direct-source URL melalui CMS.

Dokumentasi resmi Cloudflare yang menjadi referensi implementasi: D1 Get Started dan D1 Worker API pada `developers.cloudflare.com`.

## Admin

`frontend/admin.html` adalah console operator untuk CRUD konten yang memakai endpoint admin dan optimistic revision melalui `If-Match`. Token yang dimasukkan operator hanya berada di memori JavaScript tab dan tidak disimpan ke localStorage. Mekanisme bearer-token admin ini adalah bootstrap operator control; tabel users/roles/sessions sudah disiapkan untuk session authentication yang lebih matang sebelum final public release.

Panel diagnostics menampilkan jumlah domain, temuan provenance/broken relation/orphaned assets, dan progress target 100 tokoh / 50 makhluk / 70 mantra dari D1 aktif. Dengan demikian target statis dan target database production dapat dibedakan secara eksplisit.

## Verifikasi wajib sebelum menyebut production-ready

- `GET /api/v1/health` menunjukkan D1 reachable.
- D1 remote migration benar-benar berhasil; keberhasilan SQLite CI saja tidak cukup.
- `worker/seeds/scale.sql` benar-benar telah diimpor ke D1 production dan target 100/50/70 terbukti melalui query remote/diagnostics.
- Frontend production membaca API production, bukan fallback statis.
- Search, CORS, admin authorization, rate limit, revision conflict, soft-delete, dan audit log diuji.
- Browser console/network tidak mempunyai error fatal atau broken asset.
- Mobile, desktop, keyboard, reduced-motion, offline, invalid URL, empty state, dan long-content diuji.
- Item-level provenance diperkaya untuk konten prioritas; batch-level source saja tidak dinyatakan sebagai audit editorial final.
- URL Pages dan URL Worker dibuka dan diverifikasi setelah deployment.
