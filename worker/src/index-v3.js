import app from './index-v2.js';

const allowedOrigins=env=>(env.ALLOWED_ORIGINS||'').split(',').map(x=>x.trim()).filter(Boolean);
function responseHeaders(request,env,cache='no-store'){const origin=request.headers.get('Origin'),allowed=allowedOrigins(env);const headers={'Content-Type':'application/json; charset=utf-8','Cache-Control':cache,'X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'none'; frame-ancestors 'none'",'Permissions-Policy':'camera=(), microphone=(), geolocation=()','Vary':'Origin'};if(origin&&allowed.includes(origin))headers['Access-Control-Allow-Origin']=origin;return headers}
const send=(request,env,data,status=200,cache='no-store')=>new Response(JSON.stringify(data),{status,headers:responseHeaders(request,env,cache)});
const invalidOrigin=(request,env)=>{const origin=request.headers.get('Origin');return Boolean(origin&&!allowedOrigins(env).includes(origin))};
function tokenMatches(actual,expected){let mismatch=actual.length^expected.length;for(let i=0;i<expected.length;i++)mismatch|=(actual.charCodeAt(i)||0)^expected.charCodeAt(i);return mismatch===0}
async function authenticate(request,env){if(!env.ADMIN_TOKEN||env.ADMIN_TOKEN.length<32)return{code:'ADMIN_NOT_CONFIGURED',status:503};if(!env.ADMIN_RATE_LIMITER)return{code:'RATE_LIMITER_NOT_CONFIGURED',status:503};const limited=await env.ADMIN_RATE_LIMITER.limit({key:request.headers.get('CF-Connecting-IP')||'unknown'});if(!limited.success)return{code:'RATE_LIMITED',status:429};const actual=request.headers.get('Authorization')||'',expected='Bearer '+env.ADMIN_TOKEN;return tokenMatches(actual,expected)?null:{code:'UNAUTHORIZED',status:401}}
async function diagnostics(env){
  const checks={contentWithoutSource:"SELECT id,slug,title FROM content WHERE deleted_at IS NULL AND (json_extract(document,'$.source.title') IS NULL OR trim(json_extract(document,'$.source.title'))='') ORDER BY id LIMIT 100",brokenRelated:"SELECT c.id,c.slug AS source_slug,j.value AS missing_slug FROM content c, json_each(c.document,'$.related') j LEFT JOIN content target ON target.slug=j.value AND target.deleted_at IS NULL WHERE c.deleted_at IS NULL AND target.id IS NULL ORDER BY c.id LIMIT 100",unattributedInternetAssets:"SELECT id,file FROM assets WHERE json_extract(metadata,'$.origin')='internet' AND (json_extract(metadata,'$.attribution') IS NULL OR trim(json_extract(metadata,'$.attribution'))='') ORDER BY id LIMIT 100",orphanedAssets:"SELECT a.id,a.file FROM assets a LEFT JOIN content_assets ca ON ca.asset_id=a.id WHERE ca.asset_id IS NULL ORDER BY a.id LIMIT 100",unpublishedContent:"SELECT id,slug,title,revision,updated_at FROM content WHERE deleted_at IS NULL AND status='draft' ORDER BY updated_at DESC LIMIT 100"};
  const issues={};for(const [key,sql] of Object.entries(checks)){const result=await env.DB.prepare(sql).all();issues[key]=result.results||[]}
  const counts=await env.DB.batch([env.DB.prepare("SELECT count(*) AS n FROM content WHERE deleted_at IS NULL"),env.DB.prepare("SELECT count(*) AS n FROM content WHERE deleted_at IS NULL AND status='published'"),env.DB.prepare('SELECT count(*) AS n FROM sources'),env.DB.prepare('SELECT count(*) AS n FROM assets'),env.DB.prepare('SELECT count(*) AS n FROM characters'),env.DB.prepare('SELECT count(*) AS n FROM creatures'),env.DB.prepare('SELECT count(*) AS n FROM spells'),env.DB.prepare('SELECT count(*) AS n FROM potions'),env.DB.prepare('SELECT count(*) AS n FROM artifacts'),env.DB.prepare('SELECT count(*) AS n FROM plants'),env.DB.prepare('SELECT count(*) AS n FROM locations'),env.DB.prepare('SELECT count(*) AS n FROM astronomy_entries'),env.DB.prepare('SELECT count(*) AS n FROM glossary'),env.DB.prepare('SELECT count(*) AS n FROM events'),env.DB.prepare('SELECT count(*) AS n FROM relationships')]);
  const names=['content','published','sources','assets','characters','creatures','spells','potions','artifacts','plants','locations','astronomy','glossary','events','relationships'];
  const summary=Object.fromEntries(names.map((name,index)=>[name,Number(counts[index]?.results?.[0]?.n||0)]));
  const targets={characters:100,creatures:50,spells:70};
  const scale=Object.fromEntries(Object.entries(targets).map(([name,target])=>[name,{actual:summary[name]||0,target,meetsTarget:(summary[name]||0)>=target,percent:Math.min(100,Math.round(((summary[name]||0)/target)*100))}]));
  const scaleReady=Object.values(scale).every(x=>x.meetsTarget);
  return{summary,targets,scale,scaleReady,issues,issueCount:Object.values(issues).reduce((sum,rows)=>sum+rows.length,0),generatedAt:new Date().toISOString()}
}

export default {async fetch(request,env,ctx){
  const url=new URL(request.url);
  if(invalidOrigin(request,env))return send(request,env,{error:{code:'ORIGIN_NOT_ALLOWED'}},403);
  if(request.method==='GET'&&url.pathname==='/api/v1/astronomy'){
    if(!env.DB)return send(request,env,{error:{code:'DATABASE_NOT_CONFIGURED'}},503);
    try{const result=await env.DB.prepare('SELECT id,slug,name,type,summary,metadata FROM astronomy_entries ORDER BY id LIMIT 100').all();const items=(result.results||[]).map(row=>{try{row.metadata=JSON.parse(row.metadata)}catch{}return row});return send(request,env,{items},200,'public, max-age=120, s-maxage=600')}catch(error){console.error(JSON.stringify({event:'astronomy_api_error',message:String(error?.message||'unknown').slice(0,120)}));return send(request,env,{error:{code:'INTERNAL_ERROR'}},500)}
  }
  if(url.pathname==='/api/v1/admin/diagnostics'){
    if(request.method!=='GET')return send(request,env,{error:{code:'METHOD_NOT_ALLOWED'}},405);
    if(!env.DB)return send(request,env,{error:{code:'DATABASE_NOT_CONFIGURED'}},503);
    const auth=await authenticate(request,env);if(auth)return send(request,env,{error:{code:auth.code}},auth.status);
    try{return send(request,env,await diagnostics(env))}catch(error){console.error(JSON.stringify({event:'diagnostics_error',message:String(error?.message||'unknown').slice(0,160)}));return send(request,env,{error:{code:'INTERNAL_ERROR'}},500)}
  }
  return app.fetch(request,env,ctx);
}};
