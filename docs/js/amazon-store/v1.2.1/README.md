---
title: amazon-store
layout: default
permalink: /index.html
---

[Home](/amazon-store/) · [Changelog](/amazon-store/changelog/)

**CDN:**  
`https://cdn.davecross.co.uk/js/amazon-store/v1/amazon-store.min.js` (rolling major)  
`https://cdn.davecross.co.uk/js/amazon-store/v1.2.0/amazon-store.min.js` (pinned)

![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/davorg/amazon-store?sort=semver)

A tiny, dependency‑free helper to route Amazon links to the viewer’s **local store** and add your **Associate tag**.
Works in any static site. Ship it from your own CDN.

- **No external trackers.** Uses **browser signals first** (`navigator.languages`, time zone), then falls back to `<html lang>` and hostname TLD. *(v1.2.0)*
- **Deterministic.** You can force a region per link or globally.
- **Progressive enhancement.** Plain links still work without JS.
- **UMD + ESM** builds. Versioned folders for long‑term caching.
- From **v1.1.0**: built‑in renderer for a “**More stores**” grid.
- From **v1.2.0**: **safer enhancement** for image links and `data-amazon-mode="link|button|auto"`.

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
    AmazonStore.renderStoreGridAll({ tag: 'davblog-21' });
  });
</script>
```

Markup for a **button**:

```html
<a class="btn btn-primary"
   data-amazon-asin="B0DJRYGFKM"
   data-amazon-text="Buy on Amazon"> </a>
```

### ESM (modern browsers)

**Pinned version (reproducible):**

```html
<script type="module">
  import { enhanceAll, renderStoreGridAll } from 'https://cdn.davecross.co.uk/js/amazon-store/v1.2.0/amazon-store.esm.js';
  enhanceAll({ tag: 'davblog-21' });
  renderStoreGridAll({ tag: 'davblog-21' });
</script>
```

**Or follow the moving pointer (latest v1.x):**

```html
<script type="module">
  import { enhanceAll, renderStoreGridAll } from 'https://cdn.davecross.co.uk/js/amazon-store/v1/amazon-store.esm.js';
  enhanceAll({ tag: 'davblog-21' });
  renderStoreGridAll({ tag: 'davblog-21' });
</script>
```

---

## Data attributes

For **buttons/links** you want auto‑wired:

- `data-amazon-asin="ASIN"` — preferred (uses `/dp/ASIN`)
- `data-amazon-search="search terms"` — alternative when ASIN differs by store

Optional per‑element overrides:

- `data-amazon-tag="davblog-21"`
- `data-amazon-region="DE"` — force a store for this element
- `data-amazon-params="ref=foo&bar=baz"` — extra query parameters
- `data-amazon-path="gp/product"` — use a different path than `/dp`
- `data-amazon-text="Buy now"` — fixed text; omit to auto‑label with the store name
- `data-amazon-mode="link|button|auto"` — *(v1.2.0)* how to treat the element:
  - **auto** (default): update `href/rel/target`; only set text if the element is empty and `data-amazon-text` is present.
  - **link**: never touch inner HTML (perfect for **image links**).
  - **button**: may set the label from `data-amazon-text` if the element is empty.

### Example — image link (preserve the image)
```html
<a class="cover-link"
   data-amazon-asin="1529922933"
   data-amazon-mode="link">
  <img src="…" alt="Cover of …">
</a>
```

---

## “More stores” grid (v1.1.0+)

**HTML:**
```html
<details class="more-stores">
  <summary>More stores</summary>
  <div class="store-grid"
       data-amazon-grid
       data-amazon-asin="B09VPLGMBN"></div>
</details>
```

**JS (already shown in Quick start):**
```js
AmazonStore.renderStoreGridAll({ tag: 'davblog-21' });
```

Optional grid attributes:

- `data-amazon-search="Book Title by Author"` — use search instead of a fixed ASIN
- `data-amazon-regions="UK,US,DE,FR"` — whitelist stores to show
- `data-amazon-current-first="false"` — disable “your region first”
- `data-amazon-link-class="store-pill"` — class to apply to each link
- `data-amazon-new-tab="false"` — open links in the same tab

---

## API

```ts
detectRegion(opts?) -> "UK" | "US" | "DE" | ...   // browser‑first (navigator → timeZone → html → TLD → fallback)
label(region) -> "Amazon UK"
url(asin, opts) -> string             // builds a store URL (supports search fallback)
enhance(elOrSelector, asin, opts)     // wire up a single element
enhanceAll(defaults)                  // wire up all matching elements

renderStoreGrid(elOrSelector, opts)   // build a “More stores” grid
renderStoreGridAll(defaults)          // build all grids on the page
```

`opts`:

```ts
{
  region?: "UK" | "US" | "DE" | ...,  // force region (optional)
  defaultRegion?: "UK" | "US" | ...,  // fallback only if undetectable
  tag?: string,
  path?: string,                      // default 'dp'
  params?: Record<string,string>,
  search?: string,                    // if set (and ASIN omitted), use /s?k=...
  // grids:
  currentFirst?: boolean, regions?: string[] | CSV, linkClass?: string, newTab?: boolean,
  // enhance:
  mode?: "link" | "button" | "auto", text?: string
}
```

---

## Versioning & CDN

- Versioned builds live under `amazon-store/vX.Y.Z/` (e.g., `v1.2.0/`).
- Convenience pointer `amazon-store/v1/` always points to the latest 1.x:
  - `amazon-store/v1/amazon-store.min.js` (UMD)
  - `amazon-store/v1/amazon-store.esm.js` (ESM)
- Cache versioned files **forever** (`max-age=31536000, immutable`). Cache the `/v1/` pointer more briefly and invalidate on release.

---

## SRI (optional)

Generate a Subresource Integrity hash:

```bash
openssl dgst -sha384 -binary amazon-store.min.js | openssl base64 -A
```

Include:

```html
<script src="…/amazon-store.min.js"
        integrity="sha384-…"
        crossorigin="anonymous" defer></script>
```

---

## Licence

MIT
