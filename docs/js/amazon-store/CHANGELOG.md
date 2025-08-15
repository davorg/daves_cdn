# Changelog

## 1.1.0 — Store grid helpers + ESM pointer
- **New:** `renderStoreGrid(elOrSelector, opts)` builds a “More stores” link grid for an ASIN or a search term.
- **New:** `renderStoreGridAll(defaults)` auto-renders every `[data-amazon-grid]` container on the page.
- **New:** Added **ESM pointer** alongside UMD under `/v1/`:
  - `/js/amazon-store/v1/amazon-store.min.js` (UMD)
  - `/js/amazon-store/v1/amazon-store.esm.min.js` (ESM)
- **Docs:** README updated with grid usage, ESM pointer includes, and API.
- **Compatibility:** No breaking changes. UMD and ESM exports are kept in parity.

## 1.0.0 — Initial release
- Locale + timezone based region detection (with 30‑day cache)
- Build Amazon URLs for `/dp/ASIN` with tag and extra params
- Per‑element overrides via data attributes
- Optional **search fallback** (`/s?k=…`) when ASIN isn’t universal
- `enhanceAll()` bulk enhancement for `[data-amazon-asin]` / `[data-amazon-search]`
- UMD (global `AmazonStore`) and ESM builds
