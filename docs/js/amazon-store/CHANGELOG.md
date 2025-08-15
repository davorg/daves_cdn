# Changelog

## 1.0.0 — Initial release
- Locale + timezone based region detection (with 30‑day cache)
- Build Amazon URLs for `/dp/ASIN` with tag and extra params
- Per‑element overrides via data attributes
- Optional **search fallback** (`/s?k=…`) when ASIN isn’t universal
- `enhanceAll()` bulk enhancement for `[data-amazon-asin]` / `[data-amazon-search]`
- UMD (global `AmazonStore`) and ESM builds
