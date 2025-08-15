# Amazon Store Router (lo-fi)

A tiny, dependency-free helper to route Amazon links to the viewer’s **local store** and add your **Associate tag**.
Works in any static site. Ship it from your own CDN.

- **No external trackers.** Uses `navigator.languages` + timezone as heuristics.
- **Deterministic.** You can force a region per link or fall back to a **search URL**.
- **Progressive enhancement.** Plain links still work without JS.
- **UMD + ESM** builds. Versioned folders for long-term caching.
- From **v1.1.0**: built-in renderer for a “**More stores**” grid, and an **ESM pointer** under `/v1/`.

---

## Quick start

### UMD (global) — easiest

```html
<script src="https://cdn.davecross.co.uk/js/amazon-store/v1/amazon-store.min.js" defer></script>
<script>
  document.addEventListener('DOMContentLoaded', () => {
    // Upgrade all elements with data attributes:
    AmazonStore.enhanceAll({ tag: 'davblog-21' });

    // (Optional) render any “More stores” grids
    AmazonStore.renderStoreGridAll();
  });
</script>
```

Markup for a button:

```html
<button class="buy"
  data-amazon-asin="B0DJRYGFKM"
  data-amazon-tag="davblog-21">Buy now</button>
```

### ESM (modern browsers)

**Pinned version (reproducible):**

```html
<script type="module">
  import { enhanceAll, renderStoreGridAll } from 'https://cdn.davecross.co.uk/js/amazon-store/v1.1.0/amazon-store.esm.min.js';
  enhanceAll({ tag: 'davblog-21' });
  renderStoreGridAll();
</script>
```

**Or follow the moving pointer (latest v1.x):**

```html
<script type="module">
  import { enhanceAll, renderStoreGridAll } from 'https://cdn.davecross.co.uk/js/amazon-store/v1/amazon-store.esm.min.js';
  enhanceAll({ tag: 'davblog-21' });
  renderStoreGridAll();
</script>
```

---

## Data attributes

For **buttons/links** you want auto-wired:

- `data-amazon-asin="ASIN"` — preferred (uses `/dp/ASIN`)
- `data-amazon-search="search terms"` — alternative when ASIN differs by store

Optional per-element overrides:

- `data-amazon-tag="davblog-21"`
- `data-amazon-region="DE"` (force store for this element)
- `data-amazon-params="ref=foo&bar=baz"` (extra query parameters)
- `data-amazon-path="gp/product"` (use a different path than `/dp`)
- `data-amazon-text="Buy now"` (fixed text; omit to auto-label with the store name)

---

## “More stores” grid (v1.1.0+)

**HTML:**

```html
<details class="more-stores">
  <summary>More stores</summary>
  <div class="store-grid"
       data-amazon-grid
       data-amazon-asin="B09VPLGMBN"
       data-amazon-tag="davblog-21"></div>
</details>
```

**JS (already shown in Quick start):**

```js
AmazonStore.renderStoreGridAll(); // fills every [data-amazon-grid]
```

Optional grid attributes:

- `data-amazon-search="Book Title by Author"` — use search instead of a fixed ASIN
- `data-amazon-regions="UK,US,DE,FR"` — whitelist stores to show
- `data-amazon-current-first="false"` — disable “your region first”
- `data-amazon-link-class="btn btn-secondary"` — class to apply to each link
- `data-amazon-new-tab="false"` — open links in the same tab

---

## API

```ts
detectRegion(override?) -> "UK" | "US" | "DE" | ...
label(region) -> "Amazon UK"
url(asin, opts) -> string             // builds a store URL (supports search fallback)
enhance(elOrSelector, asin, opts)     // wire up a single element
enhanceAll(defaults)                  // wire up all matching elements

// v1.1.0+
renderStoreGrid(elOrSelector, opts)   // build a “More stores” grid
renderStoreGridAll(defaults)          // build all grids on the page
```

`opts`:

```ts
{
  region?: "UK" | "US" | "DE" | ...,
  tag?: string,
  path?: string,             // default 'dp'
  params?: Record<string,string>,
  search?: string,           // if set (and ASIN omitted), use /s?k=...
  currentFirst?: boolean,    // grids only; default true
  regions?: string[] | CSV,  // grids only; whitelist
  linkClass?: string,        // grids only
  newTab?: boolean           // grids only; default true
}
```

---

## Versioning & CDN

- Versioned builds live under `amazon-store/vX.Y.Z/`.
- Convenience pointer `amazon-store/v1/` always points to the latest 1.x:
  - `amazon-store/v1/amazon-store.min.js` (UMD)
  - `amazon-store/v1/amazon-store.esm.min.js` (ESM)
- Cache versioned files **forever** (`max-age=31536000, immutable`).
- Cache the `/v1/` pointer for a **shorter** time and invalidate on release.

---

## SRI

Generate a Subresource Integrity hash:

```bash
openssl dgst -sha384 -binary amazon-store.min.js | openssl base64 -A
```

Then include:

```html
<script src="…/amazon-store.min.js"
        integrity="sha384-…"
        crossorigin="anonymous" defer></script>
```

---

## Licence

MIT
