import {createApi} from './api.js';
import {readList,getPreference,setPreference} from './state.js';
import {statusBlock} from './ui.js';
import {installAccessibility,focusMain} from './accessibility.js';
import {renderHome,renderIndex,renderArticle} from './pages-core.js';
import {renderEntity,renderMap,renderTimeline,renderGlossary,renderGraph,renderGrimoireHub} from './pages-explore.js';
import {renderPersonal,renderSources,renderCredits,renderAbout,renderMissing} from './pages-meta.js';

const main=document.querySelector('#main');
const noticeEl=document.querySelector('#notice');
const apiBase=document.querySelector('meta[name="api-base"]')?.content?.trim()||'';
const api=createApi({apiBase,catalogUrl:new URL('../data/catalog.json',import.meta.url)});
let categories=[],articles=[],timer;
const onRendered=()=>dispatchEvent(new CustomEvent('hi:route-rendered'));
const notice=text=>{if(!noticeEl)return;noticeEl.textContent=text;clearTimeout(timer);timer=setTimeout(()=>noticeEl.textContent='',4200)};
const routeState=()=>{const raw=location.hash.slice(1)||'/';const [path,query='']=raw.split('?');return{path,params:new URLSearchParams(query)}};
const categoryFor=path=>categories.find(c=>`/${c.slug}`===path);
const syncNav=()=>{const {path}=routeState();document.querySelectorAll('.top-nav a').forEach(a=>{const p=(a.getAttribute('href')||'').replace(/^#/,'');a.toggleAttribute('aria-current',p===path||p!=='/'&&path.startsWith(p))})};
const finish=title=>{document.title=title==='Hogwarts Indonesia'?title:`${title} — Hogwarts Indonesia`;focusMain();syncNav();onRendered()};
const missing=()=>renderMissing({main,finish});
const explorationProgress=()=>Math.min(100,Math.round(new Set(readList('history')).size/Math.max(articles.length,1)*100));

function gate(){const el=document.querySelector('#loading-gate');if(!el)return;if(getPreference('entered',false)){el.hidden=true;return}el.hidden=false;const close=()=>{setPreference('entered',true);el.classList.add('is-leaving');setTimeout(()=>{el.hidden=true;el.classList.remove('is-leaving')},780)};el.querySelector('[data-enter]')?.addEventListener('click',close,{once:true});el.querySelector('[data-skip]')?.addEventListener('click',close,{once:true})}

async function route(){
  window.__hiRouteCleanup?.();window.__hiRouteCleanup=null;
  const {path,params}=routeState();
  if(path==='/')return renderHome({main,categories,articles,progress:explorationProgress(),api,finish,onRendered});
  if(path==='/index')return renderIndex({main,categories,articles,params,api,finish,onRendered});
  const category=categoryFor(path);
  if(category){
    const relatedArticles=articles.filter(x=>x.category===category.slug);
    if(category.slug==='tokoh')return renderEntity({main,api,kind:'characters',title:'Tokoh',intro:'Arsip karakter dengan afiliasi, relasi, dan konteks.',relatedArticles,categories,finish,onRendered});
    if(category.slug==='makhluk')return renderEntity({main,api,kind:'creatures',title:'Makhluk Sihir',intro:'Field guide makhluk dengan klasifikasi, habitat, kemampuan, dan risiko dalam lore.',relatedArticles,categories,finish,onRendered});
    if(category.slug==='lokasi')return renderEntity({main,api,kind:'locations',title:'Lokasi Ikonik',intro:'Tempat penting ditautkan dengan peristiwa dan tokoh terkait.',relatedArticles,categories,finish,onRendered});
    if(category.slug==='herbologi')return renderEntity({main,api,kind:'plants',title:'Herbologi',intro:'Tanaman, habitat, karakteristik, dan fungsi dalam lore. Informasi ini bukan petunjuk botani atau medis dunia nyata.',relatedArticles,categories,finish,onRendered});
    if(category.slug==='grimoire')return renderGrimoireHub({main,articles,categories,finish});
    return renderIndex({main,categories,articles,category,params,api,finish,onRendered});
  }
  if(path==='/astronomi')return renderEntity({main,api,kind:'astronomy',title:'Astronomi',intro:'Observatorium, langit malam, dan catatan astronomi dalam pengalaman belajar.',finish,onRendered});
  if(path==='/grimoire/mantra')return renderEntity({main,api,kind:'spells',title:'Mantra',intro:'Indeks mantra sebagai unsur fiksi, lengkap dengan fungsi dan klasifikasi.',finish,onRendered});
  if(path==='/grimoire/ramuan')return renderEntity({main,api,kind:'potions',title:'Ramuan',intro:'Arsip ramuan dalam lore; bukan instruksi praktik dunia nyata.',finish,onRendered});
  if(path==='/grimoire/artefak')return renderEntity({main,api,kind:'artifacts',title:'Artefak',intro:'Benda sihir dan perannya dalam peristiwa penting.',finish,onRendered});
  if(path.startsWith('/artikel/'))return renderArticle({main,categories,articles,slug:path.split('/')[2],api,finish,notice,onRendered,missing});
  if(path==='/peta')return renderMap({main,api,finish,onRendered});
  if(path==='/timeline')return renderTimeline({main,api,finish,onRendered});
  if(path==='/graph')return renderGraph({main,articles,finish,onRendered});
  if(path==='/glosarium')return renderGlossary({main,api,finish,onRendered});
  if(path==='/bookmark')return renderPersonal({main,articles,categories,kind:'bookmarks',finish});
  if(path==='/riwayat')return renderPersonal({main,articles,categories,kind:'history',finish});
  if(path==='/sumber')return renderSources({main,articles,finish});
  if(path==='/kredit-aset')return renderCredits({main,finish});
  if(path==='/tentang')return renderAbout({main,finish});
  return missing();
}

function bindSearch(){const form=document.querySelector('#global-search-form');form?.addEventListener('submit',event=>{event.preventDefault();const q=form.q.value.trim();location.hash='/index'+(q?'?q='+encodeURIComponent(q):'')})}

async function bootstrap(){gate();bindSearch();installAccessibility();try{const [c,a]=await Promise.all([api.categories(),api.content({limit:100})]);categories=c.items||[];articles=a.items||[];if(!categories.length||!articles.length)throw new Error('EMPTY_CATALOG');await route();addEventListener('hashchange',route);if('serviceWorker'in navigator)navigator.serviceWorker.register(new URL('../service-worker.js',import.meta.url)).catch(()=>{})}catch(error){console.error(error);main.innerHTML=statusBlock(navigator.onLine?'error':'offline','Perpustakaan sedang kehilangan koneksi ke dunia Muggle.','Katalog belum dapat dibuka. Periksa koneksi lalu muat ulang.','<a class="button" href="./">Coba lagi</a>');document.title='Koneksi terputus — Hogwarts Indonesia'}}
bootstrap();
