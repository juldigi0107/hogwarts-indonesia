import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const load=async path=>JSON.parse(await readFile(path,'utf8'));

const forbidden=/\b(lorem ipsum|dummy|placeholder|coming soon|todo)\b/i;

test('castle map exposes all required exploration areas',async()=>{
  const data=await load('frontend/data/exploration.json');
  const required=['great-hall','library','astronomy-tower','greenhouses','dungeons','courtyard','forbidden-forest','quidditch-grounds','common-room-archives','ministry-portal','diagon-alley-portal','hogsmeade-portal'];
  assert.equal(data.mapNodes.length,12);
  assert.deepEqual(new Set(data.mapNodes.map(x=>x.id)),new Set(required));
  for(const node of data.mapNodes){assert.ok(node.label);assert.ok(node.description);assert.match(node.route,/^\//);assert.ok(Number.isFinite(node.x)&&node.x>=0&&node.x<=100);assert.ok(Number.isFinite(node.y)&&node.y>=0&&node.y<=100)}
});

test('daily features are complete enough for the Great Hall',async()=>{
  const {dailyFeatures}=await load('frontend/data/exploration.json');
  assert.ok(dailyFeatures.length>=4);
  assert.equal(new Set(dailyFeatures.map(x=>x.type)).size,dailyFeatures.length);
  for(const item of dailyFeatures){assert.ok(item.title);assert.ok(item.summary);assert.match(item.route,/^\//)}
});

test('reference entities have stable unique slugs and no placeholder language',async()=>{
  const data=await load('frontend/data/reference.json');
  for(const [kind,items] of Object.entries(data)){
    if(!Array.isArray(items))continue;
    const slugs=items.map(x=>x.slug).filter(Boolean);
    assert.equal(slugs.length,new Set(slugs).size,`duplicate slug in ${kind}`);
    for(const item of items){assert.doesNotMatch(JSON.stringify(item),forbidden,`placeholder text in ${kind}`)}
  }
});

test('asset manifest follows provenance rules',async()=>{
  const manifest=await load('frontend/assets/assets-manifest.json');
  const required=['id','file','category','origin','sourceUrl','creator','license','attribution','accessedAt','usage','alt','notes'];
  const ids=new Set();
  for(const asset of manifest){for(const key of required)assert.ok(Object.hasOwn(asset,key),`${asset.id||'asset'} missing ${key}`);assert.ok(!ids.has(asset.id),`duplicate asset id ${asset.id}`);ids.add(asset.id);assert.ok(['generated','internet'].includes(asset.origin));assert.ok(Array.isArray(asset.usage));assert.ok(asset.alt);if(asset.origin==='internet'){assert.ok(asset.sourceUrl);assert.ok(asset.license);assert.ok(asset.attribution)}}
});
