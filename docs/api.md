# Hogwarts Indonesia API v1

Backend target: Cloudflare Workers + D1. Semua endpoint menggunakan prefix `/api/v1`.

## Public

- `GET /health` — status Worker dan D1.
- `GET /categories` — 12 koleksi utama.
- `GET /content?category=&q=&limit=&offset=` — artikel publik.
- `GET /content/:slug` — detail artikel publik.
- `GET /characters` — indeks tokoh terstruktur.
- `GET /creatures` — field guide makhluk.
- `GET /spells` — indeks mantra.
- `GET /potions` — indeks ramuan; seluruh record harus menyatakan konteks fiksi dan tidak menjadi instruksi praktik nyata.
- `GET /artifacts` — artefak.
- `GET /plants` — herbologi.
- `GET /locations` — lokasi.
- `GET /timeline` — event terurut.
- `GET /glossary` — istilah dan definisi.
- `GET /sources` — provenance riset.
- `GET /assets` — metadata aset.
- `GET /daily-feature?date=YYYY-MM-DD` — fitur harian.
- `GET /relationships?subject_type=&subject_id=` — relasi entity.
- `GET /search?q=` — pencarian full-text artikel.

`index-v2.js` menangani endpoint domain baru kemudian meneruskan endpoint legacy yang sudah stabil ke `index.js`.

## Admin konten

- `GET /admin/content`
- `POST /admin/content`
- `PUT /admin/content/:id`
- `DELETE /admin/content/:id`

Update dan delete memakai optimistic concurrency lewat header `If-Match` yang berisi revision integer. Delete adalah soft-delete.

## Respons error

Bentuk umum:

```json
{"error":{"code":"ERROR_CODE"}}
```

Klien tidak boleh bergantung pada teks pesan error internal.

## CORS dan header keamanan

`ALLOWED_ORIGINS` berisi daftar origin dipisahkan koma. Origin GitHub Pages produksi saat ini adalah `https://juldigi0107.github.io` (path repository bukan bagian dari HTTP origin).

Respons API memasang `X-Content-Type-Options`, `Referrer-Policy`, `Content-Security-Policy` API-only, `Permissions-Policy`, `Vary: Origin`, dan cache policy yang sesuai. Mutasi admin menggunakan `no-store` pada jalur legacy.

## Admin authentication saat ini

Fondasi saat ini memakai `ADMIN_TOKEN` minimal 32 karakter dan Cloudflare rate limiting binding `ADMIN_RATE_LIMITER`. Token hanya boleh diset sebagai secret Cloudflare dan tidak boleh masuk Git. `frontend/admin.html` meminta token untuk sesi tab dan tidak menyimpannya ke localStorage.

Sebelum status production-final, mekanisme ini harus diganti atau diperkuat dengan session authentication berbasis `users`, `roles`, `user_roles`, dan `sessions`, cookie `Secure; HttpOnly; SameSite=Strict`, CSRF protection, rotasi sesi, dan audit identity per perubahan. Raw bearer operator token dianggap mekanisme bootstrap, bukan endpoint login publik.

## Cache

Entity publik dapat memakai browser cache singkat dan shared-cache lebih panjang. Endpoint admin, auth, bookmark akun, dan riwayat akun tidak boleh dimasukkan ke cache publik.
