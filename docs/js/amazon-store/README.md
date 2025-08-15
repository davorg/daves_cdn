# Amazon Store Router (lo‑fi)

A tiny, dependency‑free helper to route Amazon links to the viewer’s **local
store** and add your **Associate tag**.
Works in any static site. Ship it from your own CDN.

- **No external trackers**. Uses `navigator.languages` + timezone as heuristics.
- **Deterministic**: you can force a region per link or fall back to a **search URL**.
- **Progressive enhancement**: plain links still work without JS.
- **UMD + ESM** builds. Versioned folders for long‑term caching.

## Quick start (UMD)

```html
<script src="https://cdn.example.com/amazon-store/v1/amazon-store.min.js" defer></script>
<script>
  document.addEventListener('DOMContentLoaded', () => {
    // Enhance any element that has data attributes:
    // <button data-amazon-asin="B0DJRYGFKM" data-amazon-tag="davblog-21">Buy</button>
    AmazonStore.enhanceAll({ tag: 'davblog-21' });

    // Or target explicit elements
    AmazonStore.enhance('#buyNowHeader', 'B0DJRYGFKM', { tag: 'davblog-21' });
  });
</script>
```

### Data attributes

- `data-amazon-asin="ASIN"` — preferred (uses `/dp/ASIN` route)
- `data-amazon-search="search terms"` — alternative when ASIN differs by store
- Optional overrides:
  - `data-amazon-tag="davblog-21"`
  - `data-amazon-region="DE"` (force store for this element)
  - `data-amazon-params="ref=foo&bar=baz"` (extra query parameters)
  - `data-amazon-path="gp/product"` (use different path than `/dp`)
  - `data-amazon-text="Buy now"` (button text, otherwise auto‑filled)

### ESM usage

```html
<script type="module">
  import { enhance, enhanceAll, url } from 'https://cdn.example.com/amazon-store/v1.0.0/amazon-store.esm.js';
  enhanceAll({ tag: 'davblog-21' });
  console.log(url('B0DJRYGFKM', { tag: 'davblog-21' }));
</script>
```

## API

- `detectRegion(override?) -> 'UK' | 'US' | 'DE' | …`
- `label(region) -> 'Amazon UK'` — human label
- `url(asin, opts)` — build a link for current/forced region
- `enhance(elOrSelector, asin, opts)` — wire a single link/button
- `enhanceAll(defaults)` — scan DOM for `[data-amazon-asin]` or `[data-amazon-search]`

`opts`:
```ts
{
  region?: 'UK' | 'US' | 'DE' | ...,
  tag?: string,
  path?: string,           // default 'dp'
  params?: Record<string,string>,
  search?: string          // if provided, uses /s?k=... instead of ASIN
}
```

## Versioning & CDN

- Versioned builds live under `amazon-store/vX.Y.Z/`.
- A convenience pointer `amazon-store/v1/amazon-store.min.js` always points to the latest 1.x.
- Cache versioned files with `Cache-Control: public, max-age=31536000, immutable`.
- Cache the `v1/` pointer for a shorter time (e.g. 1 day).

## SRI
Generate a Subresource Integrity hash:
```bash
openssl dgst -sha384 -binary amazon-store.min.js | openssl base64 -A
```
Then include:
```html
<script src="…/amazon-store.min.js" integrity="sha384-…"
        crossorigin="anonymous" defer></script>
```

## License
MIT
