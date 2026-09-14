const timeout=ms=>new Promise((_,reject)=>setTimeout(()=>reject(new Error('TIMEOUT')),ms));
const json=async(url,options={})=>{
  const res=await Promise.race([
    fetch(url,{...options,headers:{Accept:'application/json',...(options.headers||{})}}),
    timeout(7000)
  ]);
  if(!res.ok){const error=new Error('HTTP_'+res.status);error.status=res.status;throw error}
  return res.json();
};

const normalize=value=>String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9\s-]/g,' ').replace(/\s+/g,' ').trim();
const searchableText=item=>normalize([
  item.title,item.name,item.term,item.slug,item.intro,item.summary,item.definition,
  item.purpose,item.description,item.house,item.affiliation,item.habitat,
  item.classification,item.region,item.type,item.incantation
].filter(Boolean).join(' '));
function editDistance(a,b){a=normalize(a);b=normalize(b);if(!a)return b.length;if(!b)return a.length;const row=Array.from({length:b.length+1},(_,i)=>i);for(let i=1;i<=a.length;i++){let prev=row[0];row[0]=i;for(let j=1;j<=b.length;j++){const old=row[j];row[j]=Math.min(row[j]+1,row[j-1]+1,prev+(a[i-1]===b[j-1]?0:1));prev=old}}return row[b.length]}
function looseMatch(text,term){if(!term)return true;const hay=normalize(text),needle=normalize(term);if(hay.includes(needle))return true;if(needle.length<4)return false;return hay.split(/\s+/).some(word=>Math.abs(word.length-needle.length)<=2&&editDistance(word,needle)<=Math.max(1,Math.floor(needle.length/4)))}

export function createApi({apiBase='',catalogUrl}){
  const base=(apiBase||'').replace(/\/$/,'');
  const referenceUrl=new URL('../data/reference.json',import.meta.url);
  const explorationUrl=new URL('../data/exploration.json',import.meta.url);
  let catalogPromise=null,referencePromise=null,explorationPromise=null;
  const catalog=()=>catalogPromise||(catalogPromise=json(catalogUrl));
  const reference=()=>referencePromise||(referencePromise=json(referenceUrl));
  const exploration=()=>explorationPromise||(explorationPromise=json(explorationUrl));
  const fallback=async kind=>{
    if(kind==='categories'){const data=await catalog();return{items:data.categories||[]}}
    if(kind==='content'){const data=await catalog();return{items:data.articles||[]}}
    if(kind==='mapNodes'||kind==='dailyFeatures'){const data=await exploration();return{items:data[kind]||[]}}
    const data=await reference();return{items:data[kind]||[]};
  };
  const get=async(path,kind)=>{
    if(base){try{return await json(base+path)}catch(error){console.warn('[Hogwarts Indonesia] API fallback',path,error.message)}}
    return fallback(kind);
  };
  const localSearch=async(params={})=>{
    const term=normalize(params.q||''),type=normalize(params.type||''),category=normalize(params.category||'');
    const [cat,ref]=await Promise.all([catalog(),reference()]);
    const groups={
      article:(cat.articles||[]).map(x=>({...x,entityType:'article',label:x.title,description:x.intro,route:'/artikel/'+x.slug})),
      character:(ref.characters||[]).map(x=>({...x,entityType:'character',label:x.name,description:x.summary,route:'/tokoh'})),
      creature:(ref.creatures||[]).map(x=>({...x,entityType:'creature',label:x.name,description:x.summary,route:'/makhluk'})),
      spell:(ref.spells||[]).map(x=>({...x,entityType:'spell',label:x.incantation||x.name,description:x.purpose,route:'/grimoire/mantra'})),
      potion:(ref.potions||[]).map(x=>({...x,entityType:'potion',label:x.name,description:x.purpose,route:'/grimoire/ramuan'})),
      artifact:(ref.artifacts||[]).map(x=>({...x,entityType:'artifact',label:x.name,description:x.summary,route:'/grimoire/artefak'})),
      location:(ref.locations||[]).map(x=>({...x,entityType:'location',label:x.name,description:x.summary,route:'/lokasi'})),
      glossary:(ref.glossary||[]).map(x=>({...x,entityType:'glossary',label:x.term,description:x.definition,route:'/glosarium'}))
    };
    let items=Object.values(groups).flat();
    if(type)items=items.filter(x=>normalize(x.entityType)===type);
    if(category)items=items.filter(x=>x.entityType!=='article'||normalize(x.category)===category);
    if(term)items=items.filter(x=>looseMatch(searchableText(x),term));
    return{items:items.slice(0,100),total:items.length,mode:'static-fallback'};
  };
  return{
    health:()=>base?json(base+'/api/v1/health'):Promise.resolve({status:'static-fallback'}),
    categories:()=>get('/api/v1/categories','categories'),
    content:(params={})=>{const q=new URLSearchParams(params);return get('/api/v1/content'+(q.size?'?'+q:''),'content')},
    contentBySlug:async slug=>{if(base){try{return await json(base+'/api/v1/content/'+encodeURIComponent(slug))}catch(error){console.warn('[Hogwarts Indonesia] detail fallback',error.message)}}const data=await catalog();return data.articles?.find(x=>x.slug===slug)||null},
    entities:kind=>get('/api/v1/'+kind,kind),
    timeline:()=>get('/api/v1/timeline','timeline'),
    glossary:()=>get('/api/v1/glossary','glossary'),
    map:()=>fallback('mapNodes'),
    daily:async()=>{if(base){try{return await json(base+'/api/v1/daily-feature')}catch(error){console.warn('[Hogwarts Indonesia] daily fallback',error.message)}}return fallback('dailyFeatures')},
    search:async(params={})=>{if(base){try{return await json(base+'/api/v1/search?'+new URLSearchParams(params))}catch(error){console.warn('[Hogwarts Indonesia] search fallback',error.message)}}return localSearch({...params,type:'article'})},
    searchAll:localSearch
  };
}
