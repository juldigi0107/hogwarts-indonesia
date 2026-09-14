const PUBLIC="status='published' AND deleted_at IS NULL";
const slugOK=s=>typeof s==='string'&&/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s)&&s.length<=120;
export function validateContent(x){return x&&slugOK(x.slug)&&slugOK(x.category)&&typeof x.title==='string'&&x.title.trim().length>0&&x.title.length<=200&&typeof x.intro==='string'&&x.intro.length<=2000&&Array.isArray(x.sections)&&x.sections.length>0&&x.sections.length<=30&&x.sections.every(s=>typeof s.heading==='string'&&s.heading.length<=200&&typeof s.text==='string'&&s.text.length<=20000)&&['draft','published'].includes(x.status)&&x.source&&typeof x.source.title==='string'&&x.source.title.length>0}
export default {async fetch(request,env){const url=new URL(request.url),origin=request.headers.get('Origin'),allowed=(env.ALLOWED_ORIGINS||'').split(',').map(s=>s.trim()).filter(Boolean);
const headers={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'none'; frame-ancestors 'none'",'Permissions-Policy':'camera=(), microphone=(), geolocation=()','Vary':'Origin'};
const send=(data,status=200)=>new Response(JSON.stringify(data),{status,headers});const fail=(code,status)=>send({error:{code}},status);
if(origin&&!allowed.includes(origin))return fail('ORIGIN_NOT_ALLOWED',403);
if(origin)headers['Access-Control-Allow-Origin']=origin;
if(request.method==='OPTIONS'){headers['Access-Control-Allow-Methods']='GET, POST, PUT, DELETE, OPTIONS';headers['Access-Control-Allow-Headers']='Content-Type, Authorization, If-Match';return new Response(null,{status:204,headers})}
if(!url.pathname.startsWith('/api/v1/'))return fail('NOT_FOUND',404);
const path=url.pathname.slice(7);
try{
if(!env.DB)return fail('DATABASE_NOT_CONFIGURED',503);
if(path==='/health'&&request.method==='GET'){await env.DB.prepare('SELECT 1').first();return send({status:'ok',database:'reachable'})}
if(path.startsWith('/admin/')){
if(!env.ADMIN_TOKEN||env.ADMIN_TOKEN.length<32)return fail('ADMIN_NOT_CONFIGURED',503);
if(!env.ADMIN_RATE_LIMITER)return fail('RATE_LIMITER_NOT_CONFIGURED',503);
const limit=await env.ADMIN_RATE_LIMITER.limit({key:request.headers.get('CF-Connecting-IP')||'unknown'});if(!limit.success)return fail('RATE_LIMITED',429);
const expected='Bearer '+env.ADMIN_TOKEN,actual=request.headers.get('Authorization')||'';let mismatch=actual.length^expected.length;for(let i=0;i<expected.length;i++)mismatch|=(actual.charCodeAt(i)||0)^expected.charCodeAt(i);if(mismatch)return fail('UNAUTHORIZED',401);
const match=path.match(/^\/admin\/content(?:\/(\d+))?$/);if(!match)return fail('NOT_FOUND',404);const id=match[1]?Number(match[1]):null;
if(request.method==='GET'){const res=await env.DB.prepare('SELECT * FROM content WHERE deleted_at IS NULL ORDER BY id DESC LIMIT 100').all();return send({items:res.results})}
if(!['POST','PUT','DELETE'].includes(request.method))return fail('METHOD_NOT_ALLOWED',405);
if(request.method==='POST'&&id||request.method!=='POST'&&!id)return fail('INVALID_ROUTE',400);
if(request.method==='DELETE'){const revision=Number(request.headers.get('If-Match'));if(!Number.isSafeInteger(revision)||revision<1)return fail('REVISION_REQUIRED',428);const result=await env.DB.batch([env.DB.prepare("UPDATE content SET deleted_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP,revision=revision+1 WHERE id=? AND revision=? AND deleted_at IS NULL").bind(id,revision),env.DB.prepare("INSERT INTO admin_audit_logs(action,content_id) SELECT 'delete',? WHERE changes()>0").bind(id)]);return result[0].meta.changes?send({deleted:true}):fail('REVISION_CONFLICT',409)}
if(!(request.headers.get('Content-Type')||'').startsWith('application/json'))return fail('JSON_REQUIRED',415);
const reader=request.body?.getReader();if(!reader)return fail('INVALID_JSON',400);let size=0,parts=[];while(true){const chunk=await reader.read();if(chunk.done)break;size+=chunk.value.byteLength;if(size>128000){await reader.cancel();return fail('PAYLOAD_TOO_LARGE',413)}parts.push(chunk.value)}const bytes=new Uint8Array(size);let offset=0;for(const p of parts){bytes.set(p,offset);offset+=p.length}let input;try{input=JSON.parse(new TextDecoder().decode(bytes))}catch{return fail('INVALID_JSON',400)}if(!validateContent(input))return fail('INVALID_CONTENT',422);
const category=await env.DB.prepare('SELECT id FROM categories WHERE slug=?').bind(input.category).first();if(!category)return fail('UNKNOWN_CATEGORY',422);
const document=JSON.stringify({slug:input.slug,category:input.category,title:input.title,intro:input.intro,sections:input.sections,source:input.source,note:typeof input.note==='string'?input.note:'',related:Array.isArray(input.related)?input.related.filter(slugOK):[],status:input.status});
if(request.method==='POST'){const result=await env.DB.batch([env.DB.prepare("INSERT INTO content(slug,category,title,intro,document,status,published_at) VALUES(?,?,?,?,?,?,CASE WHEN ?='published' THEN CURRENT_TIMESTAMP ELSE NULL END)").bind(input.slug,input.category,input.title,input.intro,document,input.status,input.status),env.DB.prepare("INSERT INTO admin_audit_logs(action,content_id) VALUES('create',last_insert_rowid())")]);return send({id:result[0].meta.last_row_id,revision:1},201)}
const revision=Number(request.headers.get('If-Match'));if(!Number.isSafeInteger(revision)||revision<1)return fail('REVISION_REQUIRED',428);
const result=await env.DB.batch([env.DB.prepare("UPDATE content SET slug=?,category=?,title=?,intro=?,document=?,status=?,published_at=CASE WHEN ?='published' THEN COALESCE(published_at,CURRENT_TIMESTAMP) ELSE NULL END,updated_at=CURRENT_TIMESTAMP,revision=revision+1 WHERE id=? AND revision=? AND deleted_at IS NULL").bind(input.slug,input.category,input.title,input.intro,document,input.status,input.status,id,revision),env.DB.prepare("INSERT INTO admin_audit_logs(action,content_id) SELECT 'update',? WHERE changes()>0").bind(id)]);
return result[0].meta.changes?send({id,revision:revision+1}):fail('REVISION_CONFLICT',409)
}
if(request.method!=='GET')return fail('METHOD_NOT_ALLOWED',405);
if(path==='/categories')return send({items:(await env.DB.prepare('SELECT * FROM categories ORDER BY id').all()).results});
if(path==='/assets')return send({items:(await env.DB.prepare('SELECT * FROM assets ORDER BY id').all()).results});
if(path.startsWith('/content/')){const slug=path.slice(9);if(!slugOK(slug))return fail('INVALID_SLUG',400);const row=await env.DB.prepare('SELECT document,revision FROM content WHERE slug=? AND '+PUBLIC).bind(slug).first();return row?send({...JSON.parse(row.document),revision:row.revision}):fail('NOT_FOUND',404)}
if(path==='/content'||path==='/search'){const limit=Math.max(1,Math.min(100,Number(url.searchParams.get('limit'))||30)),offset=Math.max(0,Math.min(100000,Number(url.searchParams.get('offset'))||0));const category=url.searchParams.get('category')||'';const q=(url.searchParams.get('q')||'').slice(0,200);const terms=q.match(/[\p{L}\p{N}]+/gu)||[];let query='SELECT c.document,c.revision FROM content c';const binds=[];if(terms.length){query+=' JOIN content_fts f ON f.rowid=c.id WHERE content_fts MATCH ? AND ';binds.push(terms.map(t=>'"'+t+'"*').join(' AND '))}else query+=' WHERE ';query+=PUBLIC;if(category){query+=' AND category=?';binds.push(category)}query+=' ORDER BY c.id LIMIT ? OFFSET ?';binds.push(limit,offset);const res=await env.DB.prepare(query).bind(...binds).all();return send({items:res.results.map(r=>({...JSON.parse(r.document),revision:r.revision})),limit,offset})}
return fail('NOT_FOUND',404)
}catch(error){if(String(error.message).includes('UNIQUE constraint'))return fail('DUPLICATE_SLUG',409);console.error(JSON.stringify({event:'api_error',path}));return fail('INTERNAL_ERROR',500)}
}};
