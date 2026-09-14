PRAGMA foreign_keys=ON;

CREATE TABLE IF NOT EXISTS users(
  id INTEGER PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  password_hash TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','disabled')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS roles(id INTEGER PRIMARY KEY,slug TEXT NOT NULL UNIQUE,title TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS user_roles(user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,PRIMARY KEY(user_id,role_id));
CREATE TABLE IF NOT EXISTS sessions(id TEXT PRIMARY KEY,user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,token_hash TEXT NOT NULL UNIQUE,expires_at TEXT NOT NULL,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,revoked_at TEXT);
CREATE INDEX IF NOT EXISTS sessions_user ON sessions(user_id,expires_at);

CREATE TABLE IF NOT EXISTS content_sections(
  id INTEGER PRIMARY KEY,
  content_id INTEGER NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  heading TEXT NOT NULL,
  body TEXT NOT NULL,
  section_type TEXT NOT NULL DEFAULT 'prose',
  metadata TEXT NOT NULL DEFAULT '{}' CHECK(json_valid(metadata)),
  UNIQUE(content_id,position)
);
CREATE TABLE IF NOT EXISTS content_categories(content_id INTEGER NOT NULL REFERENCES content(id) ON DELETE CASCADE,category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,PRIMARY KEY(content_id,category_id));

CREATE TABLE IF NOT EXISTS characters(
  id INTEGER PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  house TEXT,
  affiliation TEXT,
  summary TEXT NOT NULL DEFAULT '',
  canon_status TEXT NOT NULL DEFAULT 'Canon utama',
  source_id INTEGER REFERENCES sources(id),
  metadata TEXT NOT NULL DEFAULT '{}' CHECK(json_valid(metadata)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS creatures(
  id INTEGER PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  classification TEXT,
  habitat TEXT,
  danger_level TEXT,
  summary TEXT NOT NULL DEFAULT '',
  source_id INTEGER REFERENCES sources(id),
  metadata TEXT NOT NULL DEFAULT '{}' CHECK(json_valid(metadata))
);
CREATE TABLE IF NOT EXISTS spells(
  id INTEGER PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  incantation TEXT,
  type TEXT,
  purpose TEXT NOT NULL DEFAULT '',
  difficulty TEXT,
  legal_status TEXT,
  source_id INTEGER REFERENCES sources(id),
  metadata TEXT NOT NULL DEFAULT '{}' CHECK(json_valid(metadata))
);
CREATE TABLE IF NOT EXISTS potions(
  id INTEGER PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  type TEXT,
  purpose TEXT NOT NULL DEFAULT '',
  safety_note TEXT NOT NULL DEFAULT 'Unsur fiksi; bukan instruksi praktik dunia nyata.',
  source_id INTEGER REFERENCES sources(id),
  metadata TEXT NOT NULL DEFAULT '{}' CHECK(json_valid(metadata))
);
CREATE TABLE IF NOT EXISTS artifacts(
  id INTEGER PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  type TEXT,
  summary TEXT NOT NULL DEFAULT '',
  source_id INTEGER REFERENCES sources(id),
  metadata TEXT NOT NULL DEFAULT '{}' CHECK(json_valid(metadata))
);
CREATE TABLE IF NOT EXISTS plants(
  id INTEGER PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  habitat TEXT,
  summary TEXT NOT NULL DEFAULT '',
  source_id INTEGER REFERENCES sources(id),
  metadata TEXT NOT NULL DEFAULT '{}' CHECK(json_valid(metadata))
);
CREATE TABLE IF NOT EXISTS locations(
  id INTEGER PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  region TEXT,
  summary TEXT NOT NULL DEFAULT '',
  source_id INTEGER REFERENCES sources(id),
  metadata TEXT NOT NULL DEFAULT '{}' CHECK(json_valid(metadata))
);
CREATE TABLE IF NOT EXISTS events(
  id INTEGER PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  year INTEGER,
  year_label TEXT,
  era TEXT,
  summary TEXT NOT NULL DEFAULT '',
  location_id INTEGER REFERENCES locations(id),
  source_id INTEGER REFERENCES sources(id),
  metadata TEXT NOT NULL DEFAULT '{}' CHECK(json_valid(metadata))
);
CREATE INDEX IF NOT EXISTS events_time ON events(year,year_label);
CREATE TABLE IF NOT EXISTS timeline_links(event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,entity_type TEXT NOT NULL,entity_id INTEGER NOT NULL,relation TEXT NOT NULL DEFAULT 'participant',PRIMARY KEY(event_id,entity_type,entity_id,relation));
CREATE TABLE IF NOT EXISTS relationships(
  id INTEGER PRIMARY KEY,
  subject_type TEXT NOT NULL,
  subject_id INTEGER NOT NULL,
  object_type TEXT NOT NULL,
  object_id INTEGER NOT NULL,
  relation TEXT NOT NULL,
  label TEXT,
  source_id INTEGER REFERENCES sources(id),
  metadata TEXT NOT NULL DEFAULT '{}' CHECK(json_valid(metadata))
);
CREATE INDEX IF NOT EXISTS relationships_subject ON relationships(subject_type,subject_id);
CREATE INDEX IF NOT EXISTS relationships_object ON relationships(object_type,object_id);
CREATE TABLE IF NOT EXISTS glossary(
  id INTEGER PRIMARY KEY,
  term TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  definition TEXT NOT NULL,
  aliases TEXT NOT NULL DEFAULT '[]' CHECK(json_valid(aliases)),
  source_id INTEGER REFERENCES sources(id)
);
CREATE TABLE IF NOT EXISTS content_assets(content_id INTEGER NOT NULL REFERENCES content(id) ON DELETE CASCADE,asset_id TEXT NOT NULL REFERENCES assets(id) ON DELETE CASCADE,role TEXT NOT NULL DEFAULT 'inline',position INTEGER NOT NULL DEFAULT 0,PRIMARY KEY(content_id,asset_id,role));
CREATE TABLE IF NOT EXISTS bookmarks(user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,content_id INTEGER NOT NULL REFERENCES content(id) ON DELETE CASCADE,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,PRIMARY KEY(user_id,content_id));
CREATE TABLE IF NOT EXISTS view_history(id INTEGER PRIMARY KEY,user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,content_id INTEGER NOT NULL REFERENCES content(id) ON DELETE CASCADE,viewed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE INDEX IF NOT EXISTS view_history_user ON view_history(user_id,viewed_at DESC);
CREATE TABLE IF NOT EXISTS daily_features(
  id INTEGER PRIMARY KEY,
  feature_date TEXT NOT NULL,
  feature_type TEXT NOT NULL CHECK(feature_type IN ('fact','creature','spell','artifact','article')),
  entity_type TEXT NOT NULL,
  entity_id INTEGER NOT NULL,
  headline TEXT,
  note TEXT,
  UNIQUE(feature_date,feature_type)
);

INSERT OR IGNORE INTO roles(slug,title) VALUES('superadmin','Superadmin'),('editor','Editor'),('reader','Reader');
