# Changelog

## 1.2.2 — Documentation and npm availability

- **Available on npm**: The library can now be installed directly via `npm install amazon-store`, making it easy to use in bundled projects.
- **New `METHOD.md`**: Added detailed documentation explaining the region‑detection algorithm and the browser signals the library uses to pick the right Amazon storefront.
- **README improvements**: Added npm installation instructions, version badge, and a link to the package on npmjs.com.
- **Docs fixes**: Clarified TLD behaviour for `.au` / `.jp` and corrected the step‑by‑step debugging snippet in `METHOD.md`.
- **Website**: The Changelog is now linked from the README header for easier discovery.

## 1.2.1 — Maintenance and publishing infrastructure

- **Fixed `package.json` metadata**: The `repository` field now correctly points to the GitHub repository, so npm tooling (e.g. `npm repo`) works as expected.
- **Security**: Updated dependencies to address issues flagged by `npm audit`.
- **Docs**: Added `NPM_PUBLISH.md` — a step‑by‑step guide for maintainers publishing new releases to npm.

## 1.2.0 — Browser‑first detection, safer enhancement
- **Region detection is now browser‑first**: `navigator.languages` → time zone → `<html lang>` → hostname TLD → fallback.
  - Manual overrides still work via `enhanceAll({ region })` or per‑element `data-amazon-region="UK"`.
  - If a manual override is provided, it is remembered (localStorage). Auto‑detected values are **not** cached.
- **Safer enhancement for existing markup**:
  - We **never overwrite inner HTML** when the element already has children (e.g., image links in carousels).
  - New `data-amazon-mode`:
    - `auto` (default): update `href/rel/target`; only set text if the element is empty **and** `data-amazon-text` is present.
    - `link`: always treat as a plain link (preserve children).
    - `button`: allow setting the label from `data-amazon-text` when empty.
- **Enhance helpers**: `enhanceAll()` continues to wire all `[data-amazon-asin]` / `[data-amazon-search]` and then calls `renderStoreGridAll()` (unchanged behaviour).
- **Compatibility**: No breaking changes expected. Pages that previously saw image content disappear when enhanced will now be preserved. UMD and ESM builds remain in parity.
- **CDN**: Ship as `/js/amazon-store/v1.2.0/…` and mirror to `/js/amazon-store/v1/…` as the rolling pointer.

## 1.1.0 — Store grid helpers + ESM pointer
- **New:** `renderStoreGrid(elOrSelector, opts)` builds a “More stores” link grid for an ASIN or a search term.
- **New:** `renderStoreGridAll(defaults)` auto-renders every `[data-amazon-grid]` container on the page.
- **New:** Added **ESM pointer** alongside UMD under `/v1/`:
  - `/js/amazon-store/v1/amazon-store.min.js` (UMD)
  - `/js/amazon-store/v1/amazon-store.esm.js` (ESM)
- **Docs:** README updated with grid usage, ESM pointer includes, and API.
- **Compatibility:** No breaking changes. UMD and ESM exports are kept in parity.

## 1.0.0 — Initial release
- Locale + timezone based region detection (with 30‑day cache)
- Build Amazon URLs for `/dp/ASIN` with tag and extra params
- Per‑element overrides via data attributes
- Optional **search fallback** (`/s?k=…`) when ASIN isn’t universal
- `enhanceAll()` bulk enhancement for `[data-amazon-asin]` / `[data-amazon-search]`
- UMD (global `AmazonStore`) and ESM builds
