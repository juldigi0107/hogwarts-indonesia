export const normalize=s=>String(s).normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
export function search(items,q,category=''){const terms=normalize(q).trim().split(/\s+/).filter(Boolean);return items.filter(a=>(!category||a.category===category)&&terms.every(t=>normalize(a.title+' '+a.intro+' '+a.sections.map(s=>s.text).join(' ')).includes(t)));}
