import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {spawnSync} from 'node:child_process';

const script=resolve('scripts/cloudflare/render-config.mjs');
const goodEnv={...process.env,CF_D1_DATABASE_ID:'123e4567-e89b-42d3-a456-426614174000',CF_D1_DATABASE_NAME:'hogwarts-indonesia',CF_RATE_LIMIT_NAMESPACE_ID:'1001',CF_WORKER_NAME:'hogwarts-indonesia-api',CF_ALLOWED_ORIGINS:'https://juldigi0107.github.io'};

test('renderer emits DB, rate limiter and strict origin configuration',async()=>{
  const dir=await mkdtemp(join(tmpdir(),'hi-cf-'));const out=join(dir,'wrangler.json');
  try{
    const run=spawnSync(process.execPath,[script,out],{env:goodEnv,encoding:'utf8'});
    assert.equal(run.status,0,run.stderr);
    const cfg=JSON.parse(await readFile(out,'utf8'));
    assert.equal(cfg.main,'src/index-v3.js');
    assert.equal(cfg.d1_databases[0].binding,'DB');
    assert.equal(cfg.ratelimits[0].name,'ADMIN_RATE_LIMITER');
    assert.equal(cfg.ratelimits[0].simple.period,60);
    assert.equal(cfg.vars.ALLOWED_ORIGINS,'https://juldigi0107.github.io');
  }finally{await rm(dir,{recursive:true,force:true})}
});

test('renderer fails closed on missing or malformed production identifiers',()=>{
  const env={...goodEnv,CF_D1_DATABASE_ID:'not-a-uuid'};
  const run=spawnSync(process.execPath,[script,join(tmpdir(),'should-not-exist-hi.json')],{env,encoding:'utf8'});
  assert.notEqual(run.status,0);
  assert.match(run.stderr,/UUID/);
});
