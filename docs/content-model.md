# Content Model

Konten publik Hogwarts Indonesia ditulis dalam Bahasa Indonesia secara transformatif. Fakta penting harus dapat ditelusuri ke `sources` atau ke metadata sumber pada artikel.

## Label editorial

- Canon utama: fakta yang didukung karya utama atau sumber resmi yang relevan.
- Sumber tambahan: materi resmi tambahan.
- Interpretasi editorial: pembacaan redaksi, bukan fakta cerita.
- Non-canon / imajinasi: konten kreatif yang dipisahkan dari ensiklopedia canon.

## Artikel

Tabel `content` menyimpan slug, kategori, judul, intro, status, revision, timestamps, dan dokumen JSON. Dokumen artikel memuat sections, source, note, related, serta status. `content_sections` tersedia untuk normalisasi bagian artikel secara bertahap.

## Entity terstruktur

`characters`, `creatures`, `spells`, `potions`, `artifacts`, `plants`, `locations`, `astronomy_entries`, `events`, `relationships`, `glossary`, dan `daily_features` membentuk indeks domain. Tabel relationship adalah edge generik bertipe agar graph dapat menghubungkan tokoh, tempat, organisasi, artefak, mantra, dan makhluk.

## Kronologi

Jangan mengarang tanggal. `events.year` boleh kosong; `year_label` dan `era` dipakai ketika sumber hanya mendukung periode relatif seperti “tahun keempat Harry”.

## Slug

Slug publik menggunakan huruf kecil ASCII, angka, dan tanda hubung, maksimal 120 karakter. Perubahan slug harus disertai strategi redirect/canonical sebelum rilis final.
