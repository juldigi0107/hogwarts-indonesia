import domain from './index-v2.js';

function headers(request,env){
  const origin=request.headers.get('Origin');
  const allowed=(env.ALLOWED_ORIGINS||'').split(',').map(x=>x.trim()).filter(Boolean);
  const h={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'none'; frame-ancestors 'none'",'Permissions-Policy':'camera=(), microphone=(), geolocation=()','Vary':'Origin'};
  if(origin&&allowed.includes(origin))h['Access-Control-Allow-Origin']=origin;
  return h;
}
const send=(request,env,data,status=200)=>new Response(JSON.stringify(data),{status,headers:headers(request,env)});
function tokenMatches(actual,expected){let mismatch=actual.length^expected.length;for(let i=0;i<expected.length;i++)mismatch|=(actual.charCodeAt(i)||0)^expected.charCodeAt(i);return mismatch===0}
async function authenticate(request,env){
  if(!env.ADMIN_TOKEN||env.ADMIN_TOKEN.length<32)return{error:'ADMIN_NOT_CONFIGURED',status:503};
  if(!env.ADMIN_RATE_LIMITER)return{error:'RATE_LIMITER_NOT_CONFIGURED',status:503};
  const limited=await env.ADMIN_RATE_LIMITER.limit({key:request.headers.get('CF-Connecting-IP')||'unknown'});if(!limited.success)return{error:'RATE_LIMITED',status:429};
  const actual=request.headers.get('Authorization')||'',expected='Bearer '+env.ADMIN_TOKEN;if(!tokenMatches(actual,expected))return{error:'UNAUTHORIZED',status:401};
  return null;
}
async function diagnostics(env){
  const queries={
    contentWithoutSource:"SELECT id,slug,title FROM content WHERE deleted_at IS NULL AND (json_extract(document,'$.source.title') IS NULL OR trim(json_extract(document,'$.source.title'))='') ORDER BY id LIMIT 50",
    brokenRelated:"SELECT c.id,c.slug AS source_slug,j.value AS missing_slug FROM content c, json_each(c.document,'$.related') j LEFT JOIN content target ON target.slug=j.value AND target.deleted_at IS NULL WHERE c.deleted_at IS NULL AND target.id IS NULL ORDER BY c.id LIMIT 50",
    unattributedInternetAssets:"SELECT id,file FROM assets WHERE json_extract(metadata,'$.origin')='internet' AND (json_extract(metadata,'$.attribution') IS NULL OR trim(json_extract(metadata,'$.attribution'))='') ORDER BY id LIMIT 50",
    orphanedAssets:"SELECT a.id,a.file FROM assets a LEFT JOIN content_assets ca ON ca.asset_id=a.id WHERE ca.asset_id IS NULL ORDER BY a.id LIMIT 50",
    unpublishedContent:"SELECT id,slug,title,revision,updated_at FROM content WHERE deleted_at IS NULL AND status='draft' ORDER BY updated_at DESC LIMIT 50"
  };
  const results={};
  for(const [key,sql] of Object.entries(queries)){const response=await env.DB.prepare(sql).all();results[key]=response.results||[]}
  const counts=await env.DB.batch([
    env.DB.prepare("SELECT count(*) AS n FROM content WHERE deleted_at IS NULL"),
    env.DB.prepare("SELECT count(*) AS n FROM content WHERE deleted_at IS NULL AND status='published'"),
    env.DB.prepare('SELECT count(*) AS n FROM sources'),
    env.DB.prepare('SELECT count(*) AS n FROM assets'),
    env.DB.prepare('SELECT count(*) AS n FROM characters'),
    env.DB.prepare('SELECT count(*) AS n FROM creatures'),
    env.DB.prepare('SELECT count(*) AS n FROM spells'),
    env.DB.prepare('SELECT count(*) AS n FROM locations')
  ]);
  const names=['content','published','sources','assets','characters','creatures','spells','locations'];
  const summary=Object.fromEntries(names.map((name,index)=>[name,Number(counts[index]?.results?.[0]?.n||0)]));
  const issueCount=Object.values(results).reduce((sum,rows)=>sum+rows.length,0);
  return{summary,issues:results,issueCount,generatedAt:new Date().toISOString()};
}

export default {async fetch(request,env,ctx){
  const url=new URL(request.url);
  if(url.pathname==='/api/v1/admin/diagnostics'){
    if(request.method!=='GET')return send(request,env,{error:{code:'METHOD_NOT_ALLOWED'}},405);
    if(!env.DB)return send(request,env,{error:{code:'DATABASE_NOT_CONFIGURED'}},503);
    const auth=await authenticate(request,env);if(auth)return send(request,env,{error:{code:auth.error}},auth.status);
    try{return send(request,env,await diagnostics(env))}catch(error){console.error(JSON.stringify({event:'diagnostics_error',message:String(error?.message||'unknown').slice(0,160)}));return send(request,env,{error:{code:'INTERNAL_ERROR'}},500)}
  }
  return domain.fetch(request,env,ctx);
}};
