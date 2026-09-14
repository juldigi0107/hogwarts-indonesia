import legacy from './index.js';

const ROUTES={
  '/characters':{sql:'SELECT id,slug,name,house,affiliation,summary,canon_status,metadata FROM characters ORDER BY name',limit:200},
  '/creatures':{sql:'SELECT id,slug,name,classification,habitat,danger_level,summary,metadata FROM creatures ORDER BY name',limit:200},
  '/spells':{sql:'SELECT id,slug,name,incantation,type,purpose,difficulty,legal_status,metadata FROM spells ORDER BY name',limit:250},
  '/potions':{sql:'SELECT id,slug,name,type,purpose,safety_note,metadata FROM potions ORDER BY name',limit:200},
  '/artifacts':{sql:'SELECT id,slug,name,type,summary,metadata FROM artifacts ORDER BY name',limit:200},
  '/plants':{sql:'SELECT id,slug,name,habitat,summary,metadata FROM plants ORDER BY name',limit:200},
  '/locations':{sql:'SELECT id,slug,name,region,summary,metadata FROM locations ORDER BY name',limit:200},
  '/glossary':{sql:'SELECT id,term,slug,definition,aliases FROM glossary ORDER BY term',limit:400},
  '/timeline':{sql:'SELECT e.id,e.slug,e.title,e.year,e.year_label,e.era,e.summary,l.slug AS location_slug,l.name AS location_name FROM events e LEFT JOIN locations l ON l.id=e.location_id ORDER BY CASE WHEN e.year IS NULL THEN 1 ELSE 0 END,e.year,e.id',limit:300},
  '/sources':{sql:'SELECT id,title,author,publisher,url,source_type,license,access_date,notes FROM sources ORDER BY id DESC',limit:500}
};

function corsHeaders(request,env,cache='public, max-age=120, s-maxage=600'){
  const origin=request.headers.get('Origin');
  const allowed=(env.ALLOWED_ORIGINS||'').split(',').map(x=>x.trim()).filter(Boolean);
  if(origin&&allowed.includes(origin))return {'Content-Type':'application/json; charset=utf-8','Access-Control-Allow-Origin':origin,'Vary':'Origin','Cache-Control':cache,'X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'none'; frame-ancestors 'none'",'Permissions-Policy':'camera=(), microphone=(), geolocation=()'};
  return {'Content-Type':'application/json; charset=utf-8','Vary':'Origin','Cache-Control':cache,'X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'none'; frame-ancestors 'none'",'Permissions-Policy':'camera=(), microphone=(), geolocation=()'};
}
function json(request,env,data,status=200,cache){return new Response(JSON.stringify(data),{status,headers:corsHeaders(request,env,cache)})}
function invalidOrigin(request,env){const origin=request.headers.get('Origin');if(!origin)return false;const allowed=(env.ALLOWED_ORIGINS||'').split(',').map(x=>x.trim()).filter(Boolean);return !allowed.includes(origin)}
function parseMeta(rows){return rows.map(row=>{for(const key of ['metadata','aliases']){if(typeof row[key]==='string'){try{row[key]=JSON.parse(row[key])}catch{}}}return row})}

export default {async fetch(request,env,ctx){
  const url=new URL(request.url);
  if(invalidOrigin(request,env))return json(request,env,{error:{code:'ORIGIN_NOT_ALLOWED'}},403,'no-store');
  if(request.method==='OPTIONS')return legacy.fetch(request,env,ctx);
  if(request.method!=='GET'||!url.pathname.startsWith('/api/v1/'))return legacy.fetch(request,env,ctx);
  if(!env.DB)return json(request,env,{error:{code:'DATABASE_NOT_CONFIGURED'}},503,'no-store');
  const path=url.pathname.slice('/api/v1'.length);
  try{
    if(ROUTES[path]){
      const config=ROUTES[path];
      const limit=Math.max(1,Math.min(config.limit,Number(url.searchParams.get('limit'))||config.limit));
      const offset=Math.max(0,Math.min(100000,Number(url.searchParams.get('offset'))||0));
      const result=await env.DB.prepare(`${config.sql} LIMIT ? OFFSET ?`).bind(limit,offset).all();
      return json(request,env,{items:parseMeta(result.results||[]),limit,offset});
    }
    if(path==='/daily-feature'){
      const date=url.searchParams.get('date')||new Date().toISOString().slice(0,10);
      const result=await env.DB.prepare('SELECT id,feature_date,feature_type,entity_type,entity_id,headline,note FROM daily_features WHERE feature_date<=? ORDER BY feature_date DESC,feature_type LIMIT 12').bind(date).all();
      return json(request,env,{items:result.results||[],date});
    }
    if(path==='/relationships'){
      const type=(url.searchParams.get('subject_type')||'').slice(0,40),id=Number(url.searchParams.get('subject_id'));
      if(!type||!Number.isSafeInteger(id)||id<1)return json(request,env,{error:{code:'INVALID_RELATIONSHIP_QUERY'}},400,'no-store');
      const result=await env.DB.prepare('SELECT id,subject_type,subject_id,object_type,object_id,relation,label,metadata FROM relationships WHERE subject_type=? AND subject_id=? ORDER BY id LIMIT 200').bind(type,id).all();
      return json(request,env,{items:parseMeta(result.results||[])});
    }
    return legacy.fetch(request,env,ctx);
  }catch(error){console.error(JSON.stringify({event:'domain_api_error',path,message:String(error?.message||'unknown').slice(0,160)}));return json(request,env,{error:{code:'INTERNAL_ERROR'}},500,'no-store')}
}};
