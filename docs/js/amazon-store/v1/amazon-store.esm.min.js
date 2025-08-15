/*! Amazon Store Router v1.0.0 — MIT (ESM) */
const STORES = {
  AU:{name:"Australia",domain:"amazon.com.au"},
  BR:{name:"Brazil",domain:"amazon.com.br"},
  CA:{name:"Canada",domain:"amazon.ca"},
  DE:{name:"Germany",domain:"amazon.de"},
  ES:{name:"Spain",domain:"amazon.es"},
  FR:{name:"France",domain:"amazon.fr"},
  IN:{name:"India",domain:"amazon.in"},
  IT:{name:"Italy",domain:"amazon.it"},
  JP:{name:"Japan",domain:"amazon.co.jp"},
  MX:{name:"Mexico",domain:"amazon.com.mx"},
  NL:{name:"Netherlands",domain:"amazon.nl"},
  UK:{name:"UK",domain:"amazon.co.uk"},
  US:{name:"US",domain:"amazon.com"}
};

const LOCALE_MAP = [
  [/^en-GB/i,"UK"], [/^en-AU/i,"AU"], [/^en-CA/i,"CA"], [/^en-US/i,"US"], [/^en-NZ/i,"AU"],
  [/^fr(?:-|_)?/i,"FR"], [/^de(?:-|_)?/i,"DE"], [/^es(?:-|_)?/i,"ES"], [/^it(?:-|_)?/i,"IT"],
  [/^nl(?:-|_)?/i,"NL"], [/^ja(?:-|_)?/i,"JP"], [/^pt(?:-|_)?BR/i,"BR"], [/^hi(?:-|_)?/i,"IN"]
];

const CACHE_KEY = "amazonStoreRegion";
const CACHE_TTL_MS = 30*24*60*60*1000;

function getCache(){
  try{
    const raw = localStorage.getItem(CACHE_KEY);
    if(!raw) return null;
    const obj = JSON.parse(raw);
    if(!obj || !obj.code || !obj.ts) return null;
    if(Date.now()-obj.ts > CACHE_TTL_MS) return null;
    return obj.code;
  }catch(_){ return null; }
}
function setCache(code){
  try{ localStorage.setItem(CACHE_KEY, JSON.stringify({code, ts:Date.now()})); }catch(_){}
}

export function detectRegion(override){
  if(override && STORES[override]){ setCache(override); return override; }
  const cached = getCache(); if(cached && STORES[cached]) return cached;

  const nav = navigator || {};
  const langs = nav.languages || [nav.language || ""];
  for(const lang of langs){
    for(const [re,code] of LOCALE_MAP){
      if(re.test(lang)){ setCache(code); return code; }
    }
  }
  try{
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    if(/London|Europe\//.test(tz)){ setCache("UK"); return "UK"; }
    if(/America\//.test(tz)){ setCache("US"); return "US"; }
  }catch(_){}
  setCache("UK"); return "UK";
}

export function label(code){ return `Amazon ${STORES[code]?.name || "UK"}`; }

export function url(asin, opts={}){
  const region = detectRegion(opts.region);
  const domain = (STORES[region]||STORES.UK).domain;
  let u;
  if(opts.search && (!asin || opts.forceSearch)){
    u = new URL(`https://${domain}/s`);
    u.searchParams.set("k", opts.search);
  }else{
    const path = opts.path || "dp";
    if(!asin) throw new Error("ASIN is required when not using search fallback");
    u = new URL(`https://${domain}/${path}/${asin}`);
  }
  if(opts.tag) u.searchParams.set("tag", opts.tag);
  if(opts.params) for(const [k,v] of Object.entries(opts.params)) u.searchParams.set(k, String(v));
  return u.toString();
}

function parseParams(str){
  const o = {}; if(!str) return o;
  str.split("&").forEach(kv => {
    const p = kv.split("=");
    if(p[0]) o[decodeURIComponent(p[0])] = decodeURIComponent((p[1]||"").replace(/\+/g, " "));
  });
  return o;
}

export function enhance(elOrSelector, asin, opts={}){
  const el = (typeof elOrSelector === "string") ? document.querySelector(elOrSelector) : elOrSelector;
  if(!el) return;

  const data = el.dataset || {};
  const region = data.amazonRegion || opts.region;
  const tag = data.amazonTag || opts.tag;
  const path = data.amazonPath || opts.path;
  const text = data.amazonText || opts.text;
  const search = data.amazonSearch || opts.search;
  const params = Object.assign({}, opts.params || {}, parseParams(data.amazonParams||""));

  const finalOpts = { region, tag, path, params, search };
  let href;
  try{
    href = url(asin || data.amazonAsin, finalOpts);
  }catch(e){
    if(search){ href = url(null, finalOpts); } else { return; }
  }

  const regionFinal = detectRegion(region);

  if(el.tagName === "A"){
    el.href = href; el.target = "_blank"; el.rel = "noopener";
    if(!el.textContent.trim()) el.textContent = text || `Buy now on ${label(regionFinal)}`;
  }else{
    el.addEventListener('click', ()=> window.open(href, '_blank', 'noopener'));
    if(!el.textContent.trim()) el.textContent = text || `Buy now on ${label(regionFinal)}`;
  }
  el.setAttribute('data-amazon-region', regionFinal);
  return { region: regionFinal, href };
}

export function enhanceAll(defaults={}){
  document.querySelectorAll('[data-amazon-asin], [data-amazon-search]').forEach(el => {
    const asin = el.getAttribute('data-amazon-asin');
    enhance(el, asin, defaults);
  });
}

export function renderStoreGrid(elOrSelector, opts={}) {
  const node = typeof elOrSelector === 'string' ? document.querySelector(elOrSelector) : elOrSelector;
  if (!node) return;

  const d = node.dataset || {};
  const asin   = opts.asin   ?? d.amazonAsin;
  const search = opts.search ?? d.amazonSearch;
  const tag    = opts.tag    ?? d.amazonTag;

  const regionsAttr = (opts.regions ?? d.amazonRegions ?? '').trim();
  const include = regionsAttr ? regionsAttr.split(',').map(s => s.trim().toUpperCase()) : null;

  const currentFirst = (opts.currentFirst !== undefined)
    ? !!opts.currentFirst
    : d.amazonCurrentFirst !== 'false'; // default true

  const linkClass = opts.linkClass ?? d.amazonLinkClass ?? '';
  const newTab    = opts.newTab    ?? true;

  const current = detectRegion();
  const entries = Object.entries(STORES)
    .filter(([code]) => !include || include.includes(code))
    .sort((a,b) => currentFirst
      ? (a[0]===current?-1:b[0]===current?1:a[0].localeCompare(b[0]))
      : a[0].localeCompare(b[0]));

  node.innerHTML = '';
  for (const [code, meta] of entries) {
    const href = search ? url(null, { region: code, tag, search })
                        : url(asin,  { region: code, tag });
    const a = document.createElement('a');
    a.href = href; if (newTab) { a.target = '_blank'; a.rel = 'noopener'; }
    if (linkClass) a.className = linkClass;
    a.textContent = `Amazon ${meta.name}`;
    a.setAttribute('data-store', code);
    node.appendChild(a);
  }
}

export function renderStoreGridAll(defaults={}) {
  document.querySelectorAll('[data-amazon-grid]')
    .forEach(el => renderStoreGrid(el, defaults));
}

export default { STORES, detectRegion, label, url, enhance, enhanceAll,
                 renderStoreGrid, renderStoreGridAll };
