# Content Scale & Provenance

## Tujuan batch

Master prompt menetapkan seed minimum agar 12 koleksi tidak terasa kosong: **100+ tokoh, 50+ makhluk, dan 70+ mantra**, ditambah ramuan, artefak, lokasi, glosarium, timeline, relationship, source records, dan asset records.

Batch `content-scale-20260915` memenuhi tiga ambang kuantitatif utama pada fallback statis dan menyediakan generator seed D1 deterministik dari dataset yang sama.

| Domain | File sumber statis | Minimum | Status batch |
| --- | --- | ---: | --- |
| Tokoh | `frontend/data/reference-scale.json` | 100 | >=100 |
| Makhluk | `frontend/data/creatures-scale.json` | 50 | >=50 |
| Mantra | `frontend/data/spells-scale.json` | 70 | >=70 |

CI menghitung ulang jumlah aktual, memeriksa slug unik, field wajib, placeholder text, provenance batch, kemudian menghasilkan `worker/seeds/scale.sql` dan mengaplikasikannya ke SQLite setelah seluruh migration D1.

## Model provenance batch

Ketiga dataset scale memiliki objek `source` yang menunjuk ke indeks resmi **Harry Potter Fact Files / HarryPotter.com**. Ini diperlakukan sebagai **batch-level official index**, bukan klaim bahwa setiap kalimat pada setiap entri memiliki URL fact-file langsung yang sudah diverifikasi satu per satu.

Karena itu generator D1 menandai metadata setiap row dengan:

- `provenanceLevel = batch-index`
- `sourceStatus = needs-item-link`
- `editorialStatus = transformative-summary`

Kebijakan ini sengaja konservatif. UI boleh memakai entri tersebut untuk membuat aplikasi hidup dan searchable, tetapi CMS diagnostics dan proses editorial selanjutnya harus memperkaya item-level source URL untuk entri prioritas sebelum aplikasi disebut selesai secara editorial.

## Bahasa dan transformasi

Ringkasan ditulis ulang dalam Bahasa Indonesia. Dataset tidak dimaksudkan sebagai salinan teks fact-file resmi, novel, dialog film, atau transkrip karya berhak cipta. Detail yang memerlukan kutipan atau klaim presisi tinggi harus masuk workflow verifikasi sumber item-level sebelum diterbitkan sebagai artikel panjang.

## D1 scale seed

Jalankan dari root repository:

```bash
npm run seed:generate
```

Perintah tersebut membaca tiga dataset scale dan menulis:

```text
worker/seeds/scale.sql
```

Generator menolak proses bila:

- tokoh < 100;
- makhluk < 50;
- mantra < 70;
- terdapat duplicate slug;
- metadata source batch tidak lengkap.

Setelah migration D1 diterapkan, file hasil generate dapat diimpor ke database remote. Seed memakai `INSERT OR IGNORE`, sehingga dapat dijalankan kembali tanpa membuat duplicate slug.

## Prioritas enrichment berikutnya

1. Tambahkan direct fact-file URL atau sumber resmi lain untuk entry populer dan high-risk facts.
2. Hubungkan tokoh ke relationship table, events, locations, artifacts, spells, dan organizations secara lebih lengkap.
3. Perluas fakta makhluk menjadi ciri, perilaku, interaksi manusia, danger context, dan related location/character.
4. Perluas mantra dengan context note dan provenance per entry; pertahankan label jelas untuk Unforgivable Curses dan sihir berbahaya.
5. Tambahkan portrait/plate original dan `assets`/`content_assets` provenance untuk entry prioritas.
6. Audit fakta ambigu dan gunakan label `Canon utama`, `Sumber tambahan`, `Interpretasi editorial`, atau `Non-canon / imajinasi` sesuai kekuatan sumber.

## Batas klaim

Tercapainya target 100/50/70 **tidak sama dengan Definition of Done keseluruhan**. Production release masih membutuhkan Worker + D1 live, frontend terhubung ke API production, item-level provenance yang lebih matang, asset matrix, seluruh route/detail experience, E2E browser QA, accessibility, performance, mobile, offline, dan final production audit.
