# Fleet status — 20 Aug 2026

Living summary of the **websites-design** multi-tenant factory (74 live client
sites) and what to do next. Product desk / staging kits live in sibling repo
**wolf-star-aurora-tiger** (Razon Studio).

## Snapshot

| Metric | Value |
| --- | --- |
| Live client kits | **74** (`site/public/img/<slug>/`) |
| Images per kit | 8 (`hero`, `about`, `g1`–`g6`) + LQIP `blur.json` |
| Layout archetypes | default · editorial · authority · wellness · craft |
| Flagship | `/` → Flamingo (flamengo); catalog → `/sites` |
| Local preview | `npx next dev -p 3010` in `site/` |
| Image quality floor | Prefer ≥ ~120KB JPEG after regen (hero/about especially) |

## What shipped recently (Aug 2026)

### Spacing / density (commits `5a5f672`, `2e51928`, …)

Hollow first-screens were driven by `min-h-dvh` heroes, oversized
`--section-y` / `--header-gap` (especially calm/editorial), and tall about
collages beside short copy.

**Fixes (fleet-wide CSS + components):**

- Cap heroes with `--hero-min` (~34–38rem energetic/default) instead of full viewport
- Split/craft/authority: photo column stretches to copy height
- Feast: shorter photo band + tighter CTA card
- Collage/arch: smaller stacks, less top padding
- About: `aspect-[5/4]` (not square), top-aligned columns, shorter portraits
- Tighter menu rows, gallery tiles/filmstrip, stats, footer, bento rows
- Display type max reduced (`--step-6` cap ~5rem)

**QA heuristic:** hero height ≈ **0.55–0.75× viewport** on laptop; next section
should often peek. Authority/craft samples (Cronauer, A-1) ~0.60 after pass.

### Images

- **Ban Pollinations** for production heroes (muddy 30–90KB). Prefer Cursor /
  Grok Imagine → install → `python scripts/gen_blur.py`
- Research-backed aesthetics in `site/scripts/aesthetic_briefs.json`
- **20 Aug refresh:** regenerated ~20 weak `about.jpg` slots (butcher, dance,
  gym, pubs, boba, records, tires, body shop, running, brewery, dog bakery,
  nutrition, cobbler, theater, cafes, bakery, pottery, bikes, books, spices,
  Hink’s, etc.) and replaced over-compressed Delts `g2`/`g3`
- Recompressed runaway Delts/Votaw gallery kits (~10MB → ~1.1MB each) without
  nuking quality below floor

### Structure / UX (earlier in the sprint)

- Craft defaults to split + credentials (not restaurant full-bleed)
- Mosaic gallery captions always readable
- Services/trades: free-text party-size field on lead form
- Catalog categorize: electric/plumbing → Services & Trades
- Flamengo: `/sites/flamengo` → `/` (intentional)

**20 Aug follow-up:** Parallel Playwright QA across craft/authority (20/20 pass)
and food/retail samples; arch/collage heroes tightened further after sparse
reports on tastee-bite / la-michoacana / astro-fun-world. HTTP check: **74/74**
routes return 200.

```bash
cd site
npx next dev -p 3010
# Archetype samples
open http://127.0.0.1:3010/                    # default feast/full-bleed flagship
open http://127.0.0.1:3010/sites/the-montcler  # editorial
open http://127.0.0.1:3010/sites/cronauer-law  # authority
open http://127.0.0.1:3010/sites/leza-nail-spa # wellness
open http://127.0.0.1:3010/sites/a1-auto       # craft
npm run qa:all   # overflow / ES parity / behavior / reveal (server up)
```

Studio catalog + image audit: sibling repo `node scripts/sync-spec-audit.mjs`
→ http://127.0.0.1:8080/catalog

## Best next steps (priority order)

1. **Owner photo swap** — Replace AI kits with phone shots for paid closes;
   keep slot names + run `gen_blur.py`.
2. **Gallery caption fidelity** — Spot-check `g1`–`g6` against EN/ES captions
   on food sites; regenerate mismatches with aesthetic briefs.
3. **Remaining mid-band files** — Re-audit any JPEG still &lt; ~120KB (especially
   secondary gallery slots) after each compress pass.
4. **Mobile density pass** — Re-critique split/editorial heroes at 390px width
   (stack order, CTAs above fold).
5. **Lead webhook** — Wire `LEAD_WEBHOOK_URL` for production lead capture.
6. **Publish / Vercel** — Confirm `npm run build` + env (no secrets in repo).
7. **Studio sync** — New kits → `public/spec/<slug>/` then
   `./scripts/copy-spec-kit.sh` when staging from Razon Studio.

## Do not

- Re-run Pollinations / `regen_fleet.py` for heroes
- Ask visitors to “open localhost” — preview is the product surface
- Invent social providers beyond Better Auth Google/X (+ optional email)

## Key paths

| Path | Role |
| --- | --- |
| `site/lib/clients.ts` | `CLIENTS` + `LAYOUTS` archetypes |
| `site/app/globals.css` | Spacing tokens, tones, bento |
| `site/components/Hero.tsx` | All hero variants |
| `site/public/img/<slug>/` | Live photo kits |
| `site/scripts/aesthetic_briefs.json` | Real-place look / avoid |
| `IMAGES.md` | Slot sizes + prompt formula |
| `docs` in Razon Studio | Product / factory slate |
