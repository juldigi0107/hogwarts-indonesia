import test from 'node:test';
import assert from 'node:assert/strict';
import {readdirSync,statSync} from 'node:fs';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';

function files(dir){const out=[];for(const name of readdirSync(dir)){const p=join(dir,name);if(statSync(p).isDirectory())out.push(...files(p));else if(/\.(?:js|mjs)$/.test(name))out.push(p)}return out}

test('all JavaScript source files parse in Node 22',()=>{const list=[...files('frontend/js'),...files('worker/src'),...files('scripts')];assert.ok(list.length>=10);for(const file of list){execFileSync(process.execPath,['--check',file],{stdio:'pipe'})}});
