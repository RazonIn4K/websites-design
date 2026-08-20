# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

An end-to-end local-business site generator for the DeKalb County, IL corridor:

```
recon/  →  data/  →  site/
scan       manifest    one Next.js template → 72 themed client sites
```

- `recon/overpass_recon.py` (stdlib-only Python) queries the OpenStreetMap Overpass API, scores businesses as web-design leads, and writes `data/targets.json` + `data/PROSPECTS.md`.
- `site/` is a Next.js 16 (App Router, SSG) · React 19 · TypeScript · Tailwind CSS v4 (CSS-first `@theme`) · Motion 12 app in which **one shared component tree renders all 72 bilingual (EN/ES) client sites**. No per-client components exist anywhere.

**Next.js 16 differs from training data.** `site/AGENTS.md` (loaded via `site/CLAUDE.md`) says to read the relevant guide in `site/node_modules/next/dist/docs/` before writing Next.js code.

## Commands

All from `site/` unless noted:

```bash
npm run dev            # dev server at http://localhost:3000
npm run build          # SSG build (72 routes) — includes TS typecheck
npm run start          # serve the production build
npm run lint           # eslint
npx tsc --noEmit       # typecheck only

# QA harness (the test suite): requires a running production server
# (npm run build && npm run start), drives local Chrome headless via
# playwright-core. Override target with QA_BASE_URL.
npm run qa:all         # everything below
npm run qa:overflow    # no horizontal overflow on any site at 390px/1440px
npm run qa:es          # Spanish hydration + no ES-copy overflow at 390/768/1440
npm run qa:behavior    # lang toggle, menu tabs, nav dialog, carousel, lead form
npm run qa:reveal      # every .reveal element fires under real (non-reduced-motion) scroll

python scripts/gen_images.py   # regenerate AI photos (Pollinations/Flux, no key; skips existing)
python scripts/gen_blur.py     # regenerate LQIP blur.json after swapping photos

# repo root:
python recon/overpass_recon.py # re-run the business recon (stdlib only)
```

There are no unit tests; the deterministic fleet-wide QA harness in `site/qa/` is the verification layer.

## Architecture: content-driven multi-tenancy

A client is **content + theme + photos + a layout assignment** — never new components:

| Piece | Where |
| --- | --- |
| Bilingual copy (EN/ES must be structurally identical) | `site/content/clients/<slug>/copy.json` (typed by `LangContent` in `lib/content.ts`) |
| Brand palette (`--color-*` vars) + display font | `site/content/clients/<slug>/theme.json` |
| 8 photos: `hero`, `about`, `g1`–`g6` | `site/public/img/<slug>/*.jpg` |
| LQIP placeholders | `site/content/clients/<slug>/blur.json` (read via `lib/blur.ts`) |
| Registration: slug, vertical, emojis, JSON-LD types, layout | `CLIENTS` in `site/lib/clients.ts` |

**Theming** — `components/Providers.tsx` sets the client's CSS custom properties on a `.site-root` wrapper `div`; Tailwind v4 utilities read those vars, so one tree renders any brand. It also stamps `data-archetype` / `data-edge` / `data-surface` / `data-tone`, which pure-CSS scopes in `globals.css` key off. Two var-resolution rules matter: (1) any `@theme` token that references tenant vars (e.g. the shadow tokens) must be re-declared inside `.site-root` — custom properties substitute `var()` where they're *declared*, so a `:root` declaration bakes in default colors; (2) `surface:"ink"` (dark register) is merged into the inline themeVars by Providers (`INK_SURFACE_VARS`) because a stylesheet var swap loses the cascade to the inline palette. Edge registers: default soft, `crisp` (authority), `hard` (brutalist).

**Layout archetypes** — `lib/sections.ts` `SECTION_ORDER` is the single source of truth for per-archetype section order/selection (`default` warm-hospitality · `editorial` · `authority` · `wellness` · `craft`), consumed by both `SitePage` (what renders) and `Nav` (which anchors show). Per-client skin levers live on `SiteLayout` in `lib/clients.ts` (`hero`, `menuKind`, `highlights`, `gallery`, `steps`, `story`, `reviews` + scope levers `edge`/`surface`/`tone`). An **undefined layout must render the original composition byte-identical** — variants are strictly opt-in.

**Routes** — `/` is the flagship (flamengo), `/sites` is the portfolio explorer, `/sites/[client]` is SSG with `dynamicParams = false` (flamengo is excluded so it isn't emitted twice), `/api/lead` forwards a normalized per-tenant payload to `LEAD_WEBHOOK_URL` (demo mode: validate + log when unset).

**i18n** — `LanguageProvider` toggles EN⇄ES client-side (localStorage key `lbg:lang`, browser-language fallback). All user-visible strings come from the localized copy object `t`; the `vertical` field in `lib/clients.ts` is English-only and must never be rendered as copy.

**Animations are progressive enhancement** — content is visible by default and only hidden once JS is confirmed (`<html class="js">` inline script in `app/layout.tsx`); reveals use CSS + IntersectionObserver (`components/motion.tsx`, `.reveal` in `globals.css`). No-JS, reduced-motion, and forced-colors must always get complete, legible pages.

**Env vars** — `NEXT_PUBLIC_SITE_URL` (required in prod: canonical/OG/sitemap/JSON-LD URLs), `LEAD_WEBHOOK_URL`, `LEAD_WEBHOOK_TOKEN`. See `DEPLOY.md`.

## Adding a client

1. Create `content/clients/<slug>/copy.json` (same bilingual shape) + `theme.json`.
2. Add an entry to `CLIENTS` in `lib/clients.ts` (slug, vertical, emojis, display font, schema types, optional layout).
3. `python scripts/gen_images.py` (add the slug to its `CLIENTS` list) and `python scripts/gen_blur.py`.
4. `npm run build` — `/sites/<slug>` is generated automatically.

## Gotchas encoded in the code (do not undo)

- `.reveal-clip` clips its **children**, never the observed element — a fully self-clipped element never intersects in Chromium and the reveal deadlocks (`app/globals.css`).
- Never put `overflow-x` (even `clip`) on `html` — it stops `position: sticky` pinning in Chromium and masks real per-site overflow. Clip decorative spill at its source.
- Edge-fade masks go on a fixed wrapper, never on the translating marquee track.
- `font-variation-settings` inherits as a resolved value — children needing a lighter weight must re-declare it (`.display-accent`).
- `text-box-trim` + `background-clip: text` amputates final-line descenders — `.text-gradient-accent` compensates with padding-bottom + negative margin.
- Phone-less clients (e.g. barber, HVAC) must never render "call" CTAs in either language — CTAs route to the quote form.
- QA authoring rules (`site/qa/README.md`): always include a non-reduced-motion pass; Google Maps iframes render blank in headless Chrome (not a defect); fixed elements ghost in `fullPage: true` screenshots — use viewport shots; `body { overflow-x: hidden }` propagates to the viewport, so skip `body`/`html` when walking ancestors for clip checks.

## Images

Each site uses an 8-slot kit in `site/public/img/<slug>/`: `hero` (1536×960), `about` (1000×1000), `g1`–`g6` (800×800), all rendered through `object-cover` crops. Prompt sources are the `HERO`/`ABOUT`/`STYLE` dicts in `site/scripts/gen_images.py`; gallery prompts come from each site's own `gallery.captions`, and the caption text renders over the image — regenerating a gallery image means keeping (or updating, EN+ES) its caption. `IMAGES.md` at the repo root holds the full spec, per-register art direction, and external-AI prompt recipes. After any image swap: `python scripts/gen_blur.py`, and restart any running dev server only after all images are in place.

## Content integrity

Business name, address, phone, and coordinates are real (OpenStreetMap). Menus, prices, hours, testimonials, and photos are **illustrative demo content** and each site says so — never add fabricated specifics (founding years, awards, named individuals). These are spec/demo sites to show to owners; real photos drop into `public/img/<slug>/` under the same filenames (then regenerate `blur.json`).
