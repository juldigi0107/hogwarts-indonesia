import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const load=async name=>JSON.parse(await readFile(new URL(`../frontend/data/${name}`,import.meta.url),'utf8'));
const [characters,creatures,spells]=await Promise.all([load('reference-scale.json'),load('creatures-scale.json'),load('spells-scale.json')]);
const banned=/\b(lorem|ipsum|placeholder|todo|tbd|dummy|coming soon)\b/i;
const validate=(doc,{label,min,required})=>{
  test(`${label} scale seed reaches ${min}+ entries with unique slugs`,()=>{
    assert.ok(Array.isArray(doc.items));
    assert.ok(doc.items.length>=min,`${label}: ${doc.items.length} < ${min}`);
    const slugs=doc.items.map(x=>x.slug);
    assert.equal(new Set(slugs).size,slugs.length,`${label} duplicate slug`);
    for(const row of doc.items){
      assert.match(row.slug,/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      for(const field of required)assert.ok(String(row[field]??'').trim(),`${label}/${row.slug} missing ${field}`);
      assert.equal(banned.test(JSON.stringify(row)),false,`${label}/${row.slug} contains placeholder text`);
    }
  });
  test(`${label} scale seed declares auditable batch provenance`,()=>{
    assert.equal(doc.source?.source_type,'official-index');
    assert.match(doc.source?.url||'',/^https:\/\/www\.harrypotter\.com\/fact-file/);
    assert.ok(doc.source?.title);
    assert.match(doc.source?.accessedAt||'',/^\d{4}-\d{2}-\d{2}$/);
    assert.ok(doc.source?.notes);
  });
};
validate(characters,{label:'characters',min:100,required:['name','summary']});
validate(creatures,{label:'creatures',min:50,required:['name','classification','habitat','danger_level','summary']});
validate(spells,{label:'spells',min:70,required:['name','incantation','type','purpose','difficulty','legal_status']});

test('high-risk spell statuses are explicitly separated from ordinary entries',()=>{
  const map=new Map(spells.items.map(x=>[x.slug,x]));
  for(const slug of ['avada-kedavra','crucio','imperio'])assert.equal(map.get(slug)?.legal_status,'Terlarang');
});
