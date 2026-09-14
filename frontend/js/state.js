const PREFIX='hi:';
export function readList(key){try{const v=JSON.parse(localStorage.getItem(PREFIX+key)||'[]');return Array.isArray(v)?v.filter(x=>typeof x==='string'):[]}catch{return[]}}
export function writeList(key,value){try{localStorage.setItem(PREFIX+key,JSON.stringify(value));return true}catch{return false}}
export function toggleInList(key,value){const list=readList(key);const on=!list.includes(value);writeList(key,on?[value,...list.filter(x=>x!==value)]:list.filter(x=>x!==value));return on}
export function pushRecent(value,limit=60){const list=readList('history');writeList('history',[value,...list.filter(x=>x!==value)].slice(0,limit))}
export function getPreference(key,fallback=null){try{const v=localStorage.getItem(PREFIX+'pref:'+key);return v===null?fallback:JSON.parse(v)}catch{return fallback}}
export function setPreference(key,value){try{localStorage.setItem(PREFIX+'pref:'+key,JSON.stringify(value));return true}catch{return false}}
export function clearPersonalState(){for(const key of ['bookmarks','history','pref:entered','pref:audioMuted'])localStorage.removeItem(PREFIX+key)}
