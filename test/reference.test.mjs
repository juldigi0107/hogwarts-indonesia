import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const read=p=>JSON.parse(readFileSync(p,'utf8'));
const catalog=read('frontend/data/catalog.json');
const ref=read('frontend/data/reference.json');
const astronomy=read('frontend/data/astronomy.json');
const assets=read('frontend/assets/assets-manifest.json');

test('twelve collections are unique and every article maps to one',()=>{assert.equal(catalog.categories.length,12);const cats=new Set(catalog.categories.map(x=>x.slug));assert.equal(cats.size,12);const slugs=new Set;for(const a of catalog.articles){assert.ok(cats.has(a.category),a.slug);assert.ok(a.source?.title,`missing source ${a.slug}`);assert.ok(!slugs.has(a.slug),`duplicate ${a.slug}`);slugs.add(a.slug)}});

test('static fallback has usable domain coverage',()=>{assert.ok(ref.characters.length>=10);assert.ok(ref.creatures.length>=6);assert.ok(ref.spells.length>=7);assert.ok(ref.locations.length>=6);assert.ok(ref.timeline.length>=6);assert.ok(ref.glossary.length>=10);assert.ok(astronomy.items.length>=4)});

test('reference slugs are unique within each entity type',()=>{for(const [kind,items] of Object.entries(ref)){if(!Array.isArray(items)||!items.length||!items[0]?.slug)continue;const set=new Set(items.map(x=>x.slug));assert.equal(set.size,items.length,`duplicates in ${kind}`)}});

test('asset manifest records resolve and contain provenance fields',()=>{assert.ok(assets.length>=3);for(const a of assets){for(const key of ['id','file','category','origin','creator','license','accessedAt','usage','alt','notes'])assert.ok(a[key]!==undefined&&a[key]!==null&&a[key]!=='',`${a.id}:${key}`);assert.ok(existsSync('frontend/'+a.file),`missing file ${a.file}`);if(a.origin==='internet'){assert.ok(a.sourceUrl);assert.ok(a.attribution)}}});
