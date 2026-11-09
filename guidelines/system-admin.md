# System admin guidelines

## SKU & Product naming
- Each SKU must include packaging and size information in the SKU name (e.g. `COLOMBIA-SUPREMO-250G-BAG` or `BRAZIL-SANTOS-1KG-BAG`).
- SKUs are registered under a specific company. The product/sku listing UI should always show the owning company next to the SKU.
- System table: `packaging_units` must define known package types and conversions (kg, g, bag, box). Use `System Tables Management` to configure.

## Navigation & Pages
- Logged-out users see a simplified nav. Hidden items: Sell, Agents, Operators, Business Admin, System Admin.
- Provide public landing pages for upsell and conversion:
  - `/become-seller` — landing to encourage sellers to onboard
  - `/become-agent` — landing to recruit agents

## Tech & Admin Notes
- Two-factor authentication (2FA) is mandatory for accounts that use credit card payments (EU compliance). Implement 2FA flows at signin & payment-critical actions.
- Languages and currencies are admin-selectable via the `System Tables Management`. Launch locales: English; Currencies: EUR, USD.
- Number formatting: repository uses `src/app/utils/numberFormat.ts` to format numbers with apostrophe as thousands separator and configurable decimals.

## System tables concepts (high level)
- `product_categories`: multilingual category definitions
- `document_types`: regulatory documents and certifications (safety, health, shipping)
- `transformation_types`: operational transformations (roasting, repackaging, sampling)
- `packaging_units`: packaging & unit conversion rules (kg, g, bag, box) - important for SKU name and inventory calculations
- `countries_locales`: mapping countries to default currency and number/date formats

## Next steps for implementation
- Wire real auth to `Navigation`'s `isLoggedIn` placeholder and show account-specific nav client-side or server-side as appropriate.
- Add 2FA enforcement to login and payment flows.
- Add admin UI for managing currencies and language packs.

