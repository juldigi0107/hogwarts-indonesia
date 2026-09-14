import {upgradeShell} from './shell.js';
upgradeShell();
try{const url=new URL('../data/runtime-config.json',import.meta.url);const res=await fetch(url,{cache:'no-store'});if(res.ok){const config=await res.json();const meta=document.querySelector('meta[name="api-base"]');if(meta&&typeof config.apiBase==='string')meta.content=config.apiBase.trim().replace(/\/$/,'')}}catch(error){console.warn('[Hogwarts Indonesia] runtime config fallback',error?.message||error)}
await import('./app-v2.js');
