# Curated interactive design examples

Pinned source: RazonIn4K/websites-design at c157bf4ec20657f2558b47400c93536c4c5be990 (2026-09-21).

The additive `gallery/` app exports six existing concept designs with their original layout assignments, themes, generated image kits and self-hosted fonts. It is not a claim of commissioned client work or affiliation. The original clean August20 local checkout is preserved.

## Safety boundary

- Only the gallery, six /gallery/{slug}/ pages,404 and robots are exported.
- No API, managed-site, operator, lead, account, database, provider or analytics runtime is included.
- Real contact fields and contact occurrences are stripped before serialization. No original source testimonials or statistics are serialized or rendered; numeric illustrative menu prices remain qualified demo copy.
- No forms, inputs, map embeds, real telephone/email/directions/ordering links, or customer-data submission. The demonstration acknowledgment is local state only.
- Persistent RazonWorks branding, concept/generated-image disclosure and noindex on every response. The only external navigation targets are the verified main site `https://razonworks.com/` and its `/contact/` page; these are ordinary links, never embedded services or form submissions.
- Language, menu/category choices, native horizontal galleries and mobile navigation remain interactive. English content and all menu categories remain readable without JavaScript.
- Motion uses user reduced-motion settings; scroll reveals are visible in SSR and can never depend on JavaScript to uncover content.

## Build and validation

Existing matching Next16.2.9, React19.2.7, Motion12.42.2 and Tailwind4.3.2 dependencies were copied with APFS clone semantics; nothing installed or upgraded. Run Node24 with `node node_modules/next/dist/bin/next build` from `gallery/` (or `npm run build`). The existing `site/` application remains byte-identical to pinned upstream; its managed/API routes are outside this standalone build. Dependencies are declared and locked in `gallery/package.json` and `gallery/package-lock.json`. No .env files are used. Google fonts were actually fetched during the initial build and thereafter cached/self-hosted.

Run `node gallery/scripts/check-export.mjs` after the build for static export safety checks and the exact asset manifest. Run `node --test tests/worker.test.mjs` for eight mocked Worker boundary checks. These do not contact live providers.

Worker: worker.mjs with the sole ASSETS binding and GET/HEAD guard. Config contains no custom domains, DNS, routes, state or paid service bindings. Existing Wrangler4.128 validates a dry-run. Local workerd preview failed with EPIPE; screenshot QA uses a loopback Python static server, and Worker semantics are tested with a mocked ASSETS binding. Public binding verification must follow a separately reviewed demo upload.

## Provenance

The upstream README identifies the image kits and most marketing copy as generated/illustrative. No general LICENSE file was found in the pinned tree; this work follows David's explicit request to publish his source examples. No new client endorsement or broad reusable-stock claim is introduced. Do not import the prospect data, reconnaissance, managed drafts or operational routes into the public asset directory.

See the workspace validation/websites-design-gallery-20261019 receipts for exact hashes, render viewports and publication status. Root reviews the tested source/config/checks before any upload. No original production-client or RazonWorks deployment is involved.
