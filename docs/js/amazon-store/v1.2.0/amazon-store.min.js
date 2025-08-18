/*! Amazon Store Router v1.2.0 — MIT */
(function (global, factory) {
  if (typeof module === "object" && typeof module.exports === "object") {
    module.exports = factory();
  } else if (typeof define === "function" && define.amd) {
    define([], factory);
  } else {
    global.AmazonStore = factory();
  }
})(typeof window !== "undefined" ? window : this, function () {
  "use strict";

  var STORES = {
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

  var CC_TO_REGION = {
    GB:'UK', UK:'UK', IE:'UK',
    US:'US', CA:'CA', AU:'AU',
    DE:'DE', ES:'ES', FR:'FR', IT:'IT', NL:'NL',
    IN:'IN', JP:'JP', MX:'MX', BR:'BR'
  };

  function fromNavigator(){
    var nav = (typeof navigator !== "undefined") ? navigator : {};
    var list = (nav.languages && nav.languages.length) ? nav.languages : [nav.language];
    for (var i=0;i<(list||[]).length;i++){
      var l = list[i] || "";
      var m = /[-_]([A-Za-z]{2})$/.exec(l);
      if (m) {
        var r = CC_TO_REGION[m[1].toUpperCase()];
        if (r) return r;
      }
    }
    return null;
  }
  function fromTimeZone(){
    try{
      var tz = (Intl.DateTimeFormat().resolvedOptions().timeZone || "").toLowerCase();
      var map = {
        'europe/london':'UK','europe/dublin':'UK',
        'europe/berlin':'DE','europe/paris':'FR','europe/madrid':'ES','europe/rome':'IT','europe/amsterdam':'NL',
        'asia/tokyo':'JP','asia/kolkata':'IN',
        'australia/sydney':'AU','australia/melbourne':'AU','australia/perth':'AU',
        'america/new_york':'US','america/chicago':'US','america/denver':'US','america/los_angeles':'US',
        'america/toronto':'CA','america/vancouver':'CA','america/montreal':'CA',
        'america/mexico_city':'MX','america/sao_paulo':'BR'
      };
      return map[tz] || null;
    }catch(e){ return null; }
  }
  function fromHtmlLang(){
    var lang = (document.documentElement.lang || "").trim();
    var m = /[-_]([A-Za-z]{2})$/.exec(lang);
    return m ? (CC_TO_REGION[m[1].toUpperCase()] || null) : null;
  }
  function fromTLD(){
    var host = location.hostname.toLowerCase();
    if (host.endsWith('.co.uk') || host.endsWith('.uk')) return 'UK';
    var tld = host.split('.').pop();
    var map = { de:'DE', fr:'FR', es:'ES', it:'IT', nl:'NL', ca:'CA', au:'AU', in:'IN', jp:'JP', mx:'MX', br:'BR' };
    return map[tld] || null;
  }

  var CACHE_KEY = "amazonStoreRegion";
  function getManualOverride(){
    try{
      var raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      var obj = JSON.parse(raw);
      return (obj && obj.code && obj.src === 'manual') ? obj.code : null;
    }catch(e){ return null; }
  }
  function setManualOverride(code){
    try{ localStorage.setItem(CACHE_KEY, JSON.stringify({code:code, ts:Date.now(), src:'manual'})); }catch(e){}
  }

  function detectRegion(overrideOrOpts){
    if (typeof overrideOrOpts === 'string' && STORES[overrideOrOpts]) {
      setManualOverride(overrideOrOpts);
      return overrideOrOpts;
    }
    var opts = overrideOrOpts || {};
    if (opts.region && STORES[opts.region]) {
      setManualOverride(opts.region);
      return opts.region;
    }

    var manual = getManualOverride();
    if (manual && STORES[manual]) return manual;

    return (
      fromNavigator() ||
      fromTimeZone() ||
      fromHtmlLang() ||
      fromTLD() ||
      opts.defaultRegion || 'UK'
    );
  }

  function label(code){ return "Amazon " + (STORES[code] ? STORES[code].name : "UK"); }

  function buildUrl(asin, opts){
    opts = opts || {};
    var region = detectRegion({ region: opts.region, defaultRegion: opts.defaultRegion });
    var domain = (STORES[region]||STORES.UK).domain;
    var u;
    if (opts.search && (!asin || opts.forceSearch)) {
      u = new URL("https://" + domain + "/s");
      u.searchParams.set("k", opts.search);
    } else {
      var path = opts.path || "dp";
      if (!asin) throw new Error("ASIN is required when not using search fallback");
      u = new URL("https://" + domain + "/" + path + "/" + asin);
    }
    if (opts.tag) u.searchParams.set("tag", opts.tag);
    if (opts.params) for (var k in opts.params) if (Object.prototype.hasOwnProperty.call(opts.params,k)) u.searchParams.set(k, String(opts.params[k]));
    return u.toString();
  }

  function parseParams(str){
    var o = {}; if(!str) return o;
    str.split("&").forEach(function(kv){
      var p = kv.split("=");
      if (p[0]) o[decodeURIComponent(p[0])] = decodeURIComponent((p[1]||"").replace(/\+/g, " "));
    });
    return o;
  }

  // data-amazon-mode: "auto" | "link" | "button"
  function enhance(elOrSelector, asin, opts){
    opts = opts || {};
    var el = (typeof elOrSelector === "string") ? document.querySelector(elOrSelector) : elOrSelector;
    if (!el) return;

    var d = el.dataset || {};
    var mode   = (d.amazonMode || opts.mode || 'auto').toLowerCase();
    var region = d.amazonRegion || opts.region;
    var tag    = d.amazonTag || opts.tag;
    var path   = d.amazonPath || opts.path;
    var text   = d.amazonText || opts.text;
    var search = d.amazonSearch || opts.search;
    var params = Object.assign({}, opts.params || {}, parseParams(d.amazonParams||""));

    var finalOpts = { region: region, tag: tag, path: path, params: params, search: search, defaultRegion: opts.defaultRegion };
    var href;
    try{
      href = buildUrl(asin || d.amazonAsin, finalOpts);
    }catch(e){
      if (search){ href = buildUrl(null, finalOpts); } else { return; }
    }

    var regionFinal = detectRegion({ region: region, defaultRegion: opts.defaultRegion });

    if (el.tagName === "A") {
      el.href = href; el.target = "_blank"; el.rel = "noopener";
    } else {
      el.addEventListener('click', function(){ window.open(href, '_blank', 'noopener'); });
    }

    var hasChildren = el.children && el.children.length > 0;
    var wantsText = !!d.amazonText || !!opts.text;

    if (mode !== 'link') {
      var currentText = (el.textContent || '').trim();
      if (!hasChildren && !currentText) {
        var base = text || 'Buy on Amazon';
        el.textContent = base.indexOf('Amazon') >= 0 ? base : (base + ' ' + label(regionFinal).replace('Amazon ',''));
      } else if (wantsText && !hasChildren) {
        el.textContent = text;
      }
    }

    el.setAttribute('data-amazon-region', regionFinal);
    return { region: regionFinal, href: href };
  }

  function enhanceAll(defaults){
    defaults = defaults || {};
    var region = detectRegion({ region: defaults.region, defaultRegion: defaults.defaultRegion });
    var settings = Object.assign({}, defaults, { region: region });

    var nodes = document.querySelectorAll("[data-amazon-asin], [data-amazon-search]");
    nodes.forEach(function(el){
      var asin = el.getAttribute("data-amazon-asin");
      enhance(el, asin, settings);
    });

    renderStoreGridAll({ tag: settings.tag, region: settings.region });
  }

  function renderStoreGrid(elOrSelector, opts){
    opts = opts || {};
    var node = (typeof elOrSelector === 'string') ? document.querySelector(elOrSelector) : elOrSelector;
    if (!node) return;

    var d = node.dataset || {};
    var asin   = (opts.asin   !== undefined ? opts.asin   : d.amazonAsin);
    var search = (opts.search !== undefined ? opts.search : d.amazonSearch);
    var tag    = (opts.tag    !== undefined ? opts.tag    : d.amazonTag);

    var regionsAttr = (opts.regions !== undefined ? opts.regions : d.amazonRegions || '').trim();
    var include = regionsAttr ? regionsAttr.split(',').map(function(s){ return s.trim().toUpperCase(); }) : null;

    var currentFirst = (opts.currentFirst !== undefined)
      ? !!opts.currentFirst
      : d.amazonCurrentFirst !== 'false';

    var linkClass = (opts.linkClass !== undefined ? opts.linkClass : d.amazonLinkClass || '');
    var newTab    = (opts.newTab    !== undefined ? opts.newTab    : true);

    var current = detectRegion({ region: opts.region, defaultRegion: opts.defaultRegion });
    var entries = Object.entries(STORES)
      .filter(function(pair){ return !include || include.includes(pair[0]); })
      .sort(function(a,b){
        return currentFirst
          ? (a[0]===current?-1:b[0]===current?1:a[0].localeCompare(b[0]))
          : a[0].localeCompare(b[0]);
      });

    node.innerHTML = '';
    entries.forEach(function(pair){
      var code = pair[0], meta = pair[1];
      var href = search ? buildUrl(null, { region: code, tag: tag, search: search })
                        : buildUrl(asin,  { region: code, tag: tag });
      var a = document.createElement('a');
      a.href = href; if (newTab) { a.target = '_blank'; a.rel = 'noopener'; }
      if (linkClass) a.className = linkClass;
      a.textContent = "Amazon " + meta.name;
      a.setAttribute('data-store', code);
      node.appendChild(a);
    });
  }

  function renderStoreGridAll(defaults){
    defaults = defaults || {};
    var nodes = document.querySelectorAll('[data-amazon-grid]');
    nodes.forEach(function(el){ renderStoreGrid(el, defaults); });
  }

  return {
    STORES: STORES,
    detectRegion: detectRegion,
    label: label,
    url: buildUrl,
    enhance: enhance,
    enhanceAll: enhanceAll,
    renderStoreGrid: renderStoreGrid,
    renderStoreGridAll: renderStoreGridAll
  };
});

