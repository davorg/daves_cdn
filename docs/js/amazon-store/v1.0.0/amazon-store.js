/*! Amazon Store Router v1.0.0 — MIT */
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

  var LOCALE_MAP = [
    [/^en-GB/i,"UK"], [/^en-AU/i,"AU"], [/^en-CA/i,"CA"], [/^en-US/i,"US"], [/^en-NZ/i,"AU"],
    [/^fr(?:-|_)?/i,"FR"], [/^de(?:-|_)?/i,"DE"], [/^es(?:-|_)?/i,"ES"], [/^it(?:-|_)?/i,"IT"],
    [/^nl(?:-|_)?/i,"NL"], [/^ja(?:-|_)?/i,"JP"], [/^pt(?:-|_)?BR/i,"BR"], [/^hi(?:-|_)?/i,"IN"]
  ];

  var CACHE_KEY = "amazonStoreRegion";
  var CACHE_TTL_MS = 30*24*60*60*1000; // 30 days

  function getCache() {
    try {
      var raw = (typeof localStorage !== "undefined") ? localStorage.getItem(CACHE_KEY) : null;
      if (!raw) return null;
      var obj = JSON.parse(raw);
      if (!obj || !obj.code || !obj.ts) return null;
      if (Date.now() - obj.ts > CACHE_TTL_MS) return null;
      return obj.code;
    } catch (e) { return null; }
  }
  function setCache(code) {
    try {
      if (typeof localStorage === "undefined") return;
      localStorage.setItem(CACHE_KEY, JSON.stringify({code:code, ts:Date.now()}));
    } catch (e) {}
  }

  function detectRegion(override) {
    if (override && STORES[override]) { setCache(override); return override; }
    var cached = getCache(); if (cached && STORES[cached]) return cached;

    var nav = (typeof navigator !== "undefined") ? navigator : {};
    var langs = nav.languages || [nav.language || ""];
    for (var i=0;i<langs.length;i++) {
      var lang = langs[i];
      for (var j=0;j<LOCALE_MAP.length;j++) {
        var pair = LOCALE_MAP[j];
        if (pair[0].test(lang)) { setCache(pair[1]); return pair[1]; }
      }
    }
    try {
      var tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
      if (/London|Europe\//.test(tz)) { setCache("UK"); return "UK"; }
      if (/America\//.test(tz)) { setCache("US"); return "US"; }
    } catch (e) {}
    setCache("UK"); return "UK";
  }

  function label(code){ return "Amazon " + (STORES[code] ? STORES[code].name : "UK"); }

  function buildUrl(asin, opts) {
    opts = opts || {};
    var region = detectRegion(opts.region);
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

  function parseParams(str) {
    var o = {}; if (!str) return o;
    str.split("&").forEach(function (kv) {
      var p = kv.split("=");
      if (p[0]) o[decodeURIComponent(p[0])] = decodeURIComponent((p[1]||"").replace(/\\+/g, " "));
    }); return o;
  }

  function enhance(elOrSelector, asin, opts) {
    opts = opts || {};
    var el = (typeof elOrSelector === "string") ? document.querySelector(elOrSelector) : elOrSelector;
    if (!el) return;

    // Pull overrides from data-attributes
    var data = el.dataset || {};
    var region = data.amazonRegion || opts.region;
    var tag = data.amazonTag || opts.tag;
    var path = data.amazonPath || opts.path;
    var text = data.amazonText || opts.text;
    var search = data.amazonSearch || opts.search;
    var params = Object.assign({}, opts.params || {}, parseParams(data.amazonParams||""));

    var finalOpts = { region: region, tag: tag, path: path, params: params, search: search };
    var href;
    try {
      href = buildUrl(asin || data.amazonAsin, finalOpts);
    } catch (e) {
      if (search) {
        href = buildUrl(null, finalOpts); // search fallback
      } else {
        return;
      }
    }

    var info = { region: detectRegion(region), href: href };

    if (el.tagName === "A") {
      el.href = href; el.target = "_blank"; el.rel = "noopener";
      if (!el.textContent.trim()) el.textContent = text || ("Buy now on " + label(info.region));
    } else {
      el.addEventListener("click", function(){ window.open(href, "_blank", "noopener"); });
      if (!el.textContent.trim()) el.textContent = text || ("Buy now on " + label(info.region));
    }
    el.setAttribute("data-amazon-region", info.region);
    return info;
  }

  function enhanceAll(defaults) {
    defaults = defaults || {};
    var nodes = document.querySelectorAll("[data-amazon-asin], [data-amazon-search]");
    nodes.forEach(function (el) {
      var asin = el.getAttribute("data-amazon-asin");
      enhance(el, asin, defaults);
    });
  }

  return { STORES: STORES, detectRegion: detectRegion, label: label, url: buildUrl, enhance: enhance, enhanceAll: enhanceAll };
});
