# Multi-tenant site app

One shared component set renders all **74 bilingual (EN/ES) client sites**. A
client is *content + theme + photos + a layout assignment* — no per-client
components exist anywhere.

> Fleet status + next steps: **[../STATUS.md](../STATUS.md)**

- **Stack:** Next.js 16 (App Router, SSG) · React 19 · TypeScript 6 ·
  Tailwind CSS v4 (CSS-first `@theme`) · Motion 12.
- **Routes:** `/` (flagship), `/sites` (filterable portfolio explorer),
  `/sites/<slug>` (clients), `/api/lead` (demo lead endpoint; set
  `LEAD_WEBHOOK_URL` to forward).

```bash
npm run dev        # develop (use -p 3010 if 3000 is taken)
npm run build      # SSG build + TS typecheck
npm run start      # serve the production build
npm run qa:all     # fleet-wide QA harness (see qa/README.md) — server must be running
npm run check:fleet            # registry ↔ content ↔ images (≥120KB) ↔ gen_images ↔ docs (python, stdlib)
python scripts/gen_blur.py     # regenerate LQIP blur.json after ANY photo swap
python scripts/gen_images.py   # fill empty photo slots with Flux drafts; also the prompt registry (see ../IMAGES.md)
```

## Anatomy of a client

| Piece | Where |
| --- | --- |
| Bilingual copy (strict EN/ES structural parity) | `content/clients/<slug>/copy.json` |
| Brand palette (10 `--color-*` vars) + display font | `content/clients/<slug>/theme.json` |
| 8 AI-generated photos (`hero`, `about`, `g1..g6`) | `public/img/<slug>/*.jpg` |
| LQIP blur placeholders | `content/clients/<slug>/blur.json` (`lib/blur.ts`) |
| Registration + layout assignment | `lib/clients.ts` (`CLIENTS` + `LAYOUTS`) |

Integrity rules: business name/address/phone are real (OpenStreetMap); menus,
prices, hours, and testimonials are demo content and each site says so; no
fabricated founding years, staff, or awards; phone-less clients never render
"call" CTAs in either language.

## Design system levers (`SiteLayout` in `lib/clients.ts`)

- `archetype` — section order/selection: warm default · `editorial` ·
  `authority` · `wellness` · `craft` (`lib/sections.ts`).
- `hero` — `left` · `centered` · `split` · `editorial` · `collage`
  (layered polaroid stack + ghost type at three parallax speeds).
- `menuKind` — `menu` (tabs + dotted leaders) · `services` · `carte` · `shelf`.
- `steps: "deck"` — process/ritual cards stack stickily as you scroll.
- `story: "scrolly"` — the pinned story photo crossfades per chapter.
- `gallery: "horizontal"` — snap filmstrip with a scroll-driven outlined
  ghost word behind the header.
- Scope levers: `edge: "hard"` (brutalist), `surface: "ink" | "mono"`,
  `tone: "calm" | "editorial" | "energetic"` — pure CSS `data-*` scopes.

Cross-cutting touches: count-up stats, pointer-fine 3D tilt on favorites,
View-Transition language crossfade, animated `<details>` FAQ, variable-font
optical sizing, OKLCH gradients, layered brand-tinted shadows.

Every animation is a progressive enhancement: no-JS, reduced-motion, and
forced-colors all get complete, legible pages.

## Gotchas encoded in the code (do not undo)

- `.reveal-clip` clips its **children**, never the observed element — a fully
  self-clipped element never intersects in Chromium and the reveal deadlocks
  (`app/globals.css`).
- No `overflow-x` on `html` — it stops `position: sticky` pinning in Chromium;
  clip decorative spill at its source instead (e.g. `.glow-conic`).
- `font-variation-settings` inherits as a resolved value — children that need
  a lighter weight must re-declare it (`.display-accent`).
- `text-box-trim` + `background-clip: text` amputates final-line descenders —
  `.text-gradient-accent` compensates with padding-bottom + negative margin.
- Marquee/hero labels must come from localized copy (`t.hero.eyebrow`), never
  from the English-only `vertical` field.
