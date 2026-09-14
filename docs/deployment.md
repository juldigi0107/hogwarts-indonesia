# Deployment

## GitHub Pages
Workflow Verify menghasilkan artifact frontend. Workflow Deploy Pages tersedia melalui workflow_dispatch. Pada Settings > Pages, pilih GitHub Actions, kemudian jalankan Deploy Pages. Target URL: https://juldigi0107.github.io/hogwarts-indonesia/ (harus diperiksa setelah deployment). Route interaktif memakai hash sehingga refresh tidak meminta path server berbeda. Artikel HTML berada pada /artikel/<slug>/.

## Cloudflare Workers + D1
Buat D1 di akun tujuan, catat database_id dan tambahkan [[d1_databases]] dengan binding = "DB", database_name yang sebenarnya, database_id yang sebenarnya, migrations_dir = "migrations" ke worker/wrangler.toml. Jalankan migration dengan Wrangler dari folder worker. Deploy Worker setelah binding benar.

Gunakan dokumentasi resmi: https://developers.cloudflare.com/d1/get-started/ dan https://developers.cloudflare.com/d1/worker-api/.

ALLOWED_ORIGINS berisi origin, bukan URL dengan path. ADMIN_TOKEN harus secret acak setidaknya 32 karakter, jangan commit. Tambahkan binding Workers Rate Limiting bernama ADMIN_RATE_LIMITER sebelum memakai admin. Admin menolak akses apabila limiter/secret tidak ada. Jangan menaruh token admin di frontend atau localStorage.

## Verifikasi wajib
GET /api/v1/health harus menunjukkan database reachable; cek content, pencarian, CORS, otorisasi, revision conflict dan soft-delete. Migrasi lokal SQLite tidak membuktikan D1 remote berhasil. Frontend saat ini belum membaca API production; integrasi ini masih gate rilis.
