# Hogwarts Indonesia — Arsitektur

Frontend: HTML semantik, CSS responsif dan ES modules, diterbitkan melalui GitHub Pages. Konten artikel dirender sebagai HTML saat build untuk aksesibilitas dan SEO; pencarian, bookmark, riwayat dan eksplorasi diperkaya JavaScript. URL menggunakan base path /hogwarts-indonesia/. Backend: Cloudflare Workers dengan binding D1 bernama DB. Secret hanya berada di Workers/GitHub secrets.

## Pemisahan tanggung jawab

- frontend/: antarmuka publik, artikel, aset lokal dan manifest provenance.
- worker/: API /api/v1, otorisasi admin, validasi dan migration D1.
- scripts/: build, seed dan validasi referensi.
- docs/: status QA, deployment, sumber dan batasan rilis.

## Gate rilis

Jangan menyebut build production-ready sebelum 12 collection, 100 tokoh, 50 makhluk, 70 mantra, sumber dan aset unik lengkap; seluruh fitur CMS, pencarian, peta, timeline, graph dan offline diuji; Pages dan Workers/D1 diverifikasi live. Artikel tanpa sumber tidak diterbitkan. Aset tanpa provenance tidak digunakan. Status implementasi dan pengujian dicatat terpisah.

## Integritas editorial

Narasi berbahasa Indonesia dan transformatif. Canon utama, sumber tambahan, interpretasi editorial serta non-canon harus dibedakan. Tidak menggunakan screenshot film, logo resmi, likeness aktor atau soundtrack tanpa izin.

## Referensi teknis

- https://developers.cloudflare.com/d1/worker-api/
- https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages

## Status awal

2026-09-14: repository dapat dibaca. Belum ada bukti build, pengujian browser, deployment Pages, deployment Worker atau migration D1. Dokumen ini adalah spesifikasi implementasi, bukan bukti penyelesaian.
