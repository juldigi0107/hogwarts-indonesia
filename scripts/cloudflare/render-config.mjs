import {mkdir,writeFile} from 'node:fs/promises';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const here=dirname(fileURLToPath(import.meta.url));
const root=resolve(here,'../..');
const output=resolve(root,process.argv[2]||'worker/wrangler.production.json');
const env=process.env;
const required=name=>{const value=(env[name]||'').trim();if(!value)throw new Error(`Missing required environment variable ${name}`);return value};
const d1Id=required('CF_D1_DATABASE_ID');
const d1Name=required('CF_D1_DATABASE_NAME');
const namespace=required('CF_RATE_LIMIT_NAMESPACE_ID');
const workerName=(env.CF_WORKER_NAME||'hogwarts-indonesia-api').trim();
const origins=(env.CF_ALLOWED_ORIGINS||'https://juldigi0107.github.io').split(',').map(x=>x.trim()).filter(Boolean);
if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(d1Id))throw new Error('CF_D1_DATABASE_ID must be a UUID');
if(!/^[1-9][0-9]*$/.test(namespace))throw new Error('CF_RATE_LIMIT_NAMESPACE_ID must be a positive integer encoded as a string');
if(!/^[a-z0-9][a-z0-9-]{1,62}[a-z0-9]$/.test(workerName))throw new Error('CF_WORKER_NAME has an invalid Workers name format');
if(!origins.every(x=>/^https:\/\//.test(x)))throw new Error('CF_ALLOWED_ORIGINS must contain HTTPS origins only');
const config={
  $schema:'./node_modules/wrangler/config-schema.json',
  name:workerName,
  main:'src/index-v3.js',
  compatibility_date:'2026-09-01',
  vars:{ALLOWED_ORIGINS:origins.join(',')},
  d1_databases:[{binding:'DB',database_name:d1Name,database_id:d1Id,migrations_dir:'migrations'}],
  ratelimits:[{name:'ADMIN_RATE_LIMITER',namespace_id:namespace,simple:{limit:30,period:60}}]
};
await mkdir(dirname(output),{recursive:true});
await writeFile(output,JSON.stringify(config,null,2)+'\n','utf8');
console.log(`Rendered ${output}`);
console.log(JSON.stringify({name:workerName,database_name:d1Name,database_id:'***'+d1Id.slice(-8),allowed_origins:origins,rate_limit:{limit:30,period:60}},null,2));
