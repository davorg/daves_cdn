/*! Amazon Store Router v1.2.0 — MIT (ESM) */
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

// Country-code → region mapping
const CC_TO_REGION = {
  GB:'UK', UK:'UK', IE:'UK',
  US:'US', CA:'CA', AU:'AU',
  DE:'DE', ES:'ES', FR:'FR', IT:'IT', NL:'NL',
  IN:'IN', JP:'JP', MX:'MX', BR:'BR'
};

// ---- region detection helpers (browser-first) ----
function fromNavigator() {
  const list = (navigator.languages && navigator.languages.length)
    ? navigator.languages : [navigator.language];
  for (const l of (list || [])) {
    const m = /[-_]([A-Za-z]{2})$/.exec(l || "");
    if (m) {
      const r = CC_TO_REGION[m[1].toUpperCase()];
      if (r) return r;
    }
  }
  return null;
}
function fromTimeZone() {
  try {
    const tz = (Intl.DateTimeFormat().resolvedOptions().timeZone || "").toLowerCase();
    const map = {
      'europe/london':'UK','europe/dublin':'UK',
      'europe/berlin':'DE','europe/paris':'FR','europe/madrid':'ES','europe/rome':'IT','europe/amsterdam':'NL',
      'asia/tokyo':'JP','asia/kolkata':'IN',
      'australia/sydney':'AU','australia/melbourne':'AU','australia/perth':'AU',
      'america/new_york':'US','america/chicago':'US','america/denver':'US','america/los_angeles':'US',
      'america/toronto':'CA','america/vancouver':'CA','america/montreal':'CA',
      'america/mexico_city':'MX','america/sao_paulo':'BR'
    };
    return map[tz] || null;
  } catch { return null; }
}
function fromHtmlLang() {
  const lang = (document.documentElement.lang || "").trim();
  const m = /[-_]([A-Za-z]{2})$/.exec(lang);
  return m ? (CC_TO_REGION[m[1].toUpperCase()] || null) : null;
}
function fromTLD() {
  const host = location.hostname.toLowerCase();
  if (host.endsWith('.co.uk') || host.endsWith('.uk')) return 'UK';
  const tld = host.split('.').pop();
  const map = { de:'DE', fr:'FR', es:'ES', it:'IT', nl:'NL', ca:'CA', au:'AU', in:'IN', jp:'JP', mx:'MX', br:'BR' };
  return map[tld] || null; // .com ambiguous
}

// Manual override persistence (opt-in only)
const CACHE_KEY = "amazonStoreRegion";
function getManualOverride() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const obj = JSON.parse(raw);
    return (obj && obj.code && obj.src === 'manual') ? obj.code : null;
  } catch { return null; }
}
function setManualOverride(code) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({code, ts:Date.now(), src:'manual'})); } catch {}
}

// Back-compat: accept string override or opts object
export function detectRegion(overrideOrOpts) {
  if (typeof overrideOrOpts === 'string' && STORES[overrideOrOpts]) {
    setManualOverride(overrideOrOpts);
    return overrideOrOpts;
  }
  const opts = overrideOrOpts || {};
  if (opts.region && STORES[opts.region]) {
    setManualOverride(opts.region);
    return opts.region;
  }

  // honour a previously set manual override
  const manual = getManualOverride();
  if (manual && STORES[manual]) return manual;

  // browser-first auto detection (not cached)
  return (
    fromNavigator() ||
    fromTimeZone() ||
    fromHtmlLang() ||
    fromTLD() ||
    opts.defaultRegion || 'UK'
  );
}

export function label(code){ return `Amazon ${STORES[code]?.name || "UK"}`; }

export function url(asin, opts={}){
  const region = detectRegion({ region: opts.region, defaultRegion: opts.defaultRegion });
  const domain = (STORES[region]||STORES.UK).domain;
  let u;
  if (opts.search && (!asin || opts.forceSearch)) {
    u = new URL(`https://${domain}/s`);
    u.searchParams.set("k", opts.search);
  } else {
    const path = opts.path || "dp";
    if (!asin) throw new Error("ASIN is required when not using search fallback");
    u = new URL(`https://${domain}/${path}/${asin}`);
  }
  if (opts.tag) u.searchParams.set("tag", opts.tag);
  if (opts.params) for (const [k,v] of Object.entries(opts.params)) u.searchParams.set(k, String(v));
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

// data-amazon-mode: "auto" (default) | "link" | "button"
export function enhance(elOrSelector, asin, opts={}){
  const el = (typeof elOrSelector === "string") ? document.querySelector(elOrSelector) : elOrSelector;
  if(!el) return;

  const data = el.dataset || {};
  const mode   = (data.amazonMode || opts.mode || 'auto').toLowerCase();
  const region = data.amazonRegion || opts.region;
  const tag    = data.amazonTag || opts.tag;
  const path   = data.amazonPath || opts.path;
  const text   = data.amazonText || opts.text;
  const search = data.amazonSearch || opts.search;
  const params = Object.assign({}, opts.params || {}, parseParams(data.amazonParams||""));

  const finalOpts = { region, tag, path, params, search, defaultRegion: opts.defaultRegion };
  let href;
  try{
    href = url(asin || data.amazonAsin, finalOpts);
  }catch(e){
    if(search){ href = url(null, finalOpts); } else { return; }
  }

  const regionFinal = detectRegion({ region, defaultRegion: opts.defaultRegion });

  // Always wire link target/rel/href
  if (el.tagName === "A") {
    el.href = href; el.target = "_blank"; el.rel = "noopener";
  } else {
    el.addEventListener('click', ()=> window.open(href, '_blank', 'noopener'));
  }

  // Only set label when the element is "text-only" (no children) or explicitly asked
  const hasChildren = el.children && el.children.length > 0;
  const wantsText = !!data.amazonText || !!opts.text;

  if (mode !== 'link') {
    const currentText = (el.textContent || '').trim();
    if (!hasChildren && !currentText) {
      const base = text || 'Buy on Amazon';
      el.textContent = base.includes('Amazon') ? base : `${base} ${label(regionFinal).replace('Amazon ','')}`;
    } else if (wantsText && !hasChildren) {
      // explicit label request on empty element
      el.textContent = text;
    }
  }

  el.setAttribute('data-amazon-region', regionFinal);
  return { region: regionFinal, href };
}

export function enhanceAll(defaults={}){
  const region = detectRegion({ region: defaults.region, defaultRegion: defaults.defaultRegion });
  const settings = Object.assign({}, defaults, { region });

  document.querySelectorAll('[data-amazon-asin], [data-amazon-search]')
    .forEach(el => {
      const asin = el.getAttribute('data-amazon-asin');
      enhance(el, asin, settings);
    });

  // Keep previous behaviour: fill any store grids too
  renderStoreGridAll({ tag: settings.tag, region: settings.region });
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

  const current = detectRegion({ region: opts.region, defaultRegion: opts.defaultRegion });
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

export default {
  STORES, detectRegion, label, url, enhance, enhanceAll,
  renderStoreGrid, renderStoreGridAll
};

