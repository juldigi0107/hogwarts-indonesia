PRAGMA foreign_keys=ON;

CREATE TABLE IF NOT EXISTS astronomy_entries(
  id INTEGER PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'astronomy',
  summary TEXT NOT NULL DEFAULT '',
  source_id INTEGER REFERENCES sources(id),
  metadata TEXT NOT NULL DEFAULT '{}' CHECK(json_valid(metadata))
);

INSERT OR IGNORE INTO sources(id,title,author,publisher,url,source_type,license,access_date,notes) VALUES
(2040,'Harry Potter Fact Files — Polyjuice Potion','Harry Potter Editorial Team','HarryPotter.com','https://www.harrypotter.com/fact-file/plants-and-potions/polyjuice-potion','official-reference',NULL,'2026-09-14','Referensi riset; tidak digunakan sebagai resep dunia nyata.'),
(2041,'Harry Potter Fact Files — Felix Felicis','Harry Potter Editorial Team','HarryPotter.com','https://www.harrypotter.com/fact-file/plants-and-potions/felix-felicis','official-reference',NULL,'2026-09-14','Referensi riset; tidak digunakan sebagai resep dunia nyata.'),
(2042,'Harry Potter Fact Files — Veritaserum','Harry Potter Editorial Team','HarryPotter.com','https://www.harrypotter.com/fact-file/plants-and-potions/veritaserum','official-reference',NULL,'2026-09-14','Referensi riset; tidak digunakan sebagai resep dunia nyata.'),
(2043,'Harry Potter Fact Files — Mandrake Restorative Draught','Harry Potter Editorial Team','HarryPotter.com','https://www.harrypotter.com/fact-file/plants-and-potions/mandrake-restorative-draught','official-reference',NULL,'2026-09-14','Referensi riset.'),
(2050,'Harry Potter Fact Files — Sorting Hat','Harry Potter Editorial Team','HarryPotter.com','https://www.harrypotter.com/fact-file/objects/the-sorting-hat','official-reference',NULL,'2026-09-14','Referensi artefak.'),
(2051,'Harry Potter Fact Files — Invisibility Cloak','Harry Potter Editorial Team','HarryPotter.com','https://www.harrypotter.com/fact-file/objects/the-invisibility-cloak','official-reference',NULL,'2026-09-14','Referensi artefak.'),
(2052,'Harry Potter Fact Files — Time-Turner','Harry Potter Editorial Team','HarryPotter.com','https://www.harrypotter.com/fact-file/objects/time-turner','official-reference',NULL,'2026-09-14','Referensi artefak.'),
(2053,'Harry Potter Fact Files — Marauder''s Map','Harry Potter Editorial Team','HarryPotter.com','https://www.harrypotter.com/fact-file/objects/the-marauders-map','official-reference',NULL,'2026-09-14','Referensi artefak.'),
(2060,'Harry Potter Fact Files — Mandrake','Harry Potter Editorial Team','HarryPotter.com','https://www.harrypotter.com/fact-file/plants-and-potions/mandrake','official-reference',NULL,'2026-09-14','Referensi tanaman.'),
(2061,'Harry Potter Fact Files — Devil''s Snare','Harry Potter Editorial Team','HarryPotter.com','https://www.harrypotter.com/fact-file/plants-and-potions/devils-snare','official-reference',NULL,'2026-09-14','Referensi tanaman.'),
(2062,'Harry Potter Fact Files — Gillyweed','Harry Potter Editorial Team','HarryPotter.com','https://www.harrypotter.com/fact-file/plants-and-potions/gillyweed','official-reference',NULL,'2026-09-14','Referensi tanaman.'),
(2063,'Harry Potter Fact Files — Whomping Willow','Harry Potter Editorial Team','HarryPotter.com','https://www.harrypotter.com/fact-file/plants-and-potions/the-whomping-willow','official-reference',NULL,'2026-09-14','Referensi tanaman.'),
(2070,'Harry Potter Fact Files — Astronomy','Harry Potter Editorial Team','HarryPotter.com','https://www.harrypotter.com/fact-file/magical-miscellany/astronomy','official-reference',NULL,'2026-09-14','Referensi mata pelajaran astronomi.'),
(2071,'Harry Potter Fact Files — Astronomy Tower','Harry Potter Editorial Team','HarryPotter.com','https://www.harrypotter.com/fact-file/locations/the-astronomy-tower','official-reference',NULL,'2026-09-14','Referensi lokasi Astronomy Tower.');

INSERT OR IGNORE INTO potions(slug,name,type,purpose,safety_note,source_id) VALUES
('polyjuice-potion','Polyjuice Potion','Ramuan transformasi','Dalam lore, membuat peminum mengambil penampilan fisik manusia lain untuk jangka tertentu.','Unsur fiksi; jangan mencoba mereplikasi ramuan atau bahan cerita di dunia nyata.',2040),
('felix-felicis','Felix Felicis','Ramuan keberuntungan','Dalam lore, memberikan periode keberuntungan sementara dan dilarang dalam kompetisi tertentu.','Unsur fiksi; bukan produk atau instruksi konsumsi nyata.',2041),
('veritaserum','Veritaserum','Ramuan kebenaran','Dalam lore, digunakan untuk mendorong peminum mengungkapkan informasi dengan batasan dan kemungkinan resistensi.','Unsur fiksi; bukan panduan penggunaan zat terhadap orang lain.',2042),
('mandrake-restorative-draught','Mandrake Restorative Draught','Ramuan restoratif','Dalam lore, digunakan untuk memulihkan korban petrifikasi atau kondisi kutukan tertentu.','Unsur fiksi; bukan terapi medis.',2043);

INSERT OR IGNORE INTO artifacts(slug,name,type,summary,source_id) VALUES
('sorting-hat','Sorting Hat','Artefak Hogwarts','Topi sihir yang menilai murid baru dan menempatkan mereka ke salah satu dari empat asrama Hogwarts.',2050),
('invisibility-cloak','Invisibility Cloak','Deathly Hallow / artefak','Jubah langka yang memberikan invisibilitas berkelanjutan dan diwariskan dalam keluarga Potter.',2051),
('time-turner','Time-Turner','Perangkat waktu','Perangkat sihir yang memungkinkan perjalanan terbatas ke masa lalu dan penggunaannya berada di bawah pengawasan ketat.',2052),
('marauders-map','Marauder''s Map','Peta sihir','Peta Hogwarts yang menunjukkan struktur sekolah dan melacak pergerakan penghuni di dalamnya.',2053);

INSERT OR IGNORE INTO plants(slug,name,habitat,summary,source_id) VALUES
('mandrake','Mandrake','Greenhouses; habitat tanaman sihir','Tanaman sihir dengan daya restoratif dalam lore; tangis spesimen dewasa berbahaya bagi manusia.',2060),
('devils-snare','Devil''s Snare','Lingkungan gelap dan lembap','Tanaman berbahaya dengan sulur yang dapat menjerat korban dan sensitif terhadap cahaya serta panas.',2061),
('gillyweed','Gillyweed','Mediterranean Sea','Tanaman sihir yang dalam lore memberi kemampuan bernapas dan berenang di bawah air untuk waktu tertentu.',2062),
('whomping-willow','Whomping Willow','Hogwarts grounds','Pohon agresif yang menjaga jalan rahasia menuju Shrieking Shack dan dapat menyerang objek di dekatnya.',2063);

INSERT OR IGNORE INTO astronomy_entries(slug,name,type,summary,source_id) VALUES
('astronomy','Astronomy','Mata pelajaran','Mata pelajaran Hogwarts yang mempelajari bintang, bulan, planet, konstelasi, dan pembuatan star chart melalui observasi.',2070),
('astronomy-tower','Astronomy Tower','Lokasi belajar','Menara tertinggi Hogwarts yang digunakan untuk pelajaran Astronomy dan observasi langit malam.',2071),
('star-chart','Star Charts','Aktivitas pembelajaran','Pencatatan dan pemetaan posisi bintang menjadi bagian dari aktivitas kelas Astronomy.',2070),
('planetary-observation','Planetary Observation','Aktivitas pembelajaran','Murid mengamati planet serta bulan melalui teleskop dan mempelajari sifat serta pergerakannya.',2070);

INSERT OR IGNORE INTO relationships(subject_type,subject_id,object_type,object_id,relation,label,source_id) VALUES
('character',(SELECT id FROM characters WHERE slug='harry-potter'),'character',(SELECT id FROM characters WHERE slug='hermione-granger'),'friend','Sahabat dekat',2001),
('character',(SELECT id FROM characters WHERE slug='harry-potter'),'character',(SELECT id FROM characters WHERE slug='ron-weasley'),'friend','Sahabat dekat',2001),
('character',(SELECT id FROM characters WHERE slug='harry-potter'),'location',(SELECT id FROM locations WHERE slug='hogwarts'),'student-at','Murid Hogwarts',2001),
('character',(SELECT id FROM characters WHERE slug='draco-malfoy'),'character',(SELECT id FROM characters WHERE slug='harry-potter'),'rival','Rival sekolah',2008),
('character',(SELECT id FROM characters WHERE slug='sirius-black'),'character',(SELECT id FROM characters WHERE slug='harry-potter'),'godfather-of','Ayah baptis',2006),
('creature',(SELECT id FROM creatures WHERE slug='dementor'),'location',(SELECT id FROM locations WHERE slug='azkaban'),'guarded','Penjaga Azkaban dalam periode penting',2020),
('spell',(SELECT id FROM spells WHERE slug='expecto-patronum'),'creature',(SELECT id FROM creatures WHERE slug='dementor'),'defends-against','Pertahanan terhadap Dementor',2032),
('artifact',(SELECT id FROM artifacts WHERE slug='marauders-map'),'location',(SELECT id FROM locations WHERE slug='hogwarts'),'maps','Memetakan Hogwarts dan pergerakan penghuninya',2053);
