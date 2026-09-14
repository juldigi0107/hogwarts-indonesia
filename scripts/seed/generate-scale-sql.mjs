import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const here=dirname(fileURLToPath(import.meta.url));
const root=resolve(here,'../..');
const input={
  characters:resolve(root,'frontend/data/reference-scale.json'),
  creatures:resolve(root,'frontend/data/creatures-scale.json'),
  spells:resolve(root,'frontend/data/spells-scale.json')
};
const output=resolve(root,process.argv[2]||'worker/seeds/scale.sql');
const SOURCE_ID=2080;
const q=value=>value==null?'NULL':`'${String(value).replaceAll("'","''")}'`;
const json=value=>q(JSON.stringify(value));
const load=async path=>JSON.parse(await readFile(path,'utf8'));
const [charactersDoc,creaturesDoc,spellsDoc]=await Promise.all([load(input.characters),load(input.creatures),load(input.spells)]);
const source=charactersDoc.source||creaturesDoc.source||spellsDoc.source;
if(!source?.url||!source?.title)throw new Error('Scaled seed source metadata is incomplete');
const characters=charactersDoc.items||[],creatures=creaturesDoc.items||[],spells=spellsDoc.items||[];
const unique=(items,label)=>{const slugs=new Set(items.map(x=>x.slug));if(slugs.size!==items.length)throw new Error(`${label} contains duplicate slugs`)};
unique(characters,'characters');unique(creatures,'creatures');unique(spells,'spells');
if(characters.length<100||creatures.length<50||spells.length<70)throw new Error(`Scale threshold missed: ${characters.length}/${creatures.length}/${spells.length}`);
const metadata=json({provenanceLevel:'batch-index',sourceStatus:'needs-item-link',editorialStatus:'transformative-summary'});
const lines=['PRAGMA foreign_keys=ON;','BEGIN TRANSACTION;','',`INSERT OR IGNORE INTO sources(id,title,author,publisher,url,source_type,license,access_date,notes) VALUES(${SOURCE_ID},${q(source.title)},NULL,${q(source.publisher)},${q(source.url)},${q(source.source_type||'official-index')},NULL,${q(source.accessedAt)},${q(source.notes)});`,''];
for(const x of characters)lines.push(`INSERT OR IGNORE INTO characters(slug,name,house,affiliation,summary,canon_status,source_id,metadata) VALUES(${q(x.slug)},${q(x.name)},${q(x.house)},${q(x.affiliation)},${q(x.summary)},'Sumber tambahan',${SOURCE_ID},${metadata});`);
lines.push('');
for(const x of creatures)lines.push(`INSERT OR IGNORE INTO creatures(slug,name,classification,habitat,danger_level,summary,source_id,metadata) VALUES(${q(x.slug)},${q(x.name)},${q(x.classification)},${q(x.habitat)},${q(x.danger_level)},${q(x.summary)},${SOURCE_ID},${metadata});`);
lines.push('');
for(const x of spells)lines.push(`INSERT OR IGNORE INTO spells(slug,name,incantation,type,purpose,difficulty,legal_status,source_id,metadata) VALUES(${q(x.slug)},${q(x.name)},${q(x.incantation)},${q(x.type)},${q(x.purpose)},${q(x.difficulty)},${q(x.legal_status)},${SOURCE_ID},${metadata});`);
lines.push('','COMMIT;','',`-- Generated from curated static scale datasets: ${characters.length} characters, ${creatures.length} creatures, ${spells.length} spells.`,'-- Provenance is batch-level official index; item-level URLs remain an explicit CMS enrichment task.','');
await mkdir(dirname(output),{recursive:true});
await writeFile(output,lines.join('\n'),'utf8');
console.log(`Wrote ${output}`);
console.log(JSON.stringify({characters:characters.length,creatures:creatures.length,spells:spells.length,source:source.url},null,2));
