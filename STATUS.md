# Fleet status — 23 Aug 2026

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
| Image quality floor | **≥ 120KB** every slot (0 under floor — enforced by `npm run check:fleet`) |
| Integrity check | `npm run check:fleet` → registry ↔ content ↔ images ↔ `gen_images.py` ↔ README/IMAGES tables |

## What shipped recently (Aug 2026)

### 23 Aug — next-steps pass: CTA fold QA, caption fidelity, hero trim

- **`npm run qa:cta`** (`qa/cta-fold-check.mjs`, now part of `qa:all`): the
  hero's primary CTA must sit fully above the fold at 390×844 on every site;
  `CTA_FOLD_VIEWPORT=390x740` covers short phones (Safari toolbars). Fleet:
  **74/74 pass at 844**; at 740 the only failure was `my1-hair` (758px) —
  fixed by trimming the editorial hero's mobile photo band 32vh → 28vh
  (`components/Hero.tsx`), which lifts every editorial/wellness CTA ~30px.
  Feast/arch heroes (the ones flagged as at-risk on 20 Aug) all pass.
- **Gallery caption fidelity (food + cafés):** a vision audit of 36 slots
  found 19 mismatches, most of them *kits shot for a shuffled caption order*.
  Fixed without regenerating anything: **cast-iron-coffee** rotated
  (g3→g1, g5→g2, g1→g3, g2→g4, g4→g5), **dearborn-cafe** re-ordered
  (g3→g1, g1→g2, g2→g3, g5→g4, g4→g5), **star-34-cafe** g4⇄g6,
  **lord-stanleys** g4⇄g5, then `gen_blur.py`. Where no photo in the kit
  matched, the caption was rewritten (EN + ES) to what the photo shows:
  lord-stanleys g3/g6, cast-iron g5, dearborn g3–g5, exquisite-skillet g4/g5,
  pub-west g3–g6. `mvps-sports-bar` g3–g6 already matched.
- **Copy hidden under the fixed header (fleet-wide):** every copy-first hero
  (split ×32, arch ×6, collage ×7, feast ×6) started its eyebrow/headline
  10–26px *beneath* the 4rem glass header on mobile (2–18px on desktop, where
  editorial's copy column was affected too) — the densify pass cut hero top
  padding without accounting for the fixed nav. New `.hero-clear-header`
  (5.5rem / 6rem desktop) on those containers + `lg:pt-24` on the editorial
  copy panel; full-bleed heroes were already clear (copy at 96/112px). Verified
  by measuring first-text top vs header bottom across all variants at 390/1440
  (now 88–100px everywhere).
- **Spanish overflow fix (qa:es):** `sapphire-tattoo` and `hinks-bar-and-grill`
  overflowed 65–71px at 390px in ES — a long uppercase word ("PERFORACIONES",
  "HAMBURGUESAS,") in the hard-edge split hero. `.text-display` now uses
  `overflow-wrap: anywhere` (was `break-word`, which doesn't shrink grid
  min-content), so the `:lang(es)` hyphenation finally applies. `qa:es` back to
  0 flagged; `qa:all` now runs all five checks green.
- **Still worth a real re-shoot** (HQ generator, same filenames): pub-west g5
  (the pork tenderloin is a signature item — caption now says onion rings),
  lord-stanleys g3 (live music in the Annex), mvps g5 (garbled lettering on
  foreground caps), cast-iron g1 (portafilter floating, not locked in).

### 23 Aug — pipeline + docs sync

- **`scripts/check_fleet.py`** (`npm run check:fleet`, stdlib): fails if any
  registered slug lacks copy/theme/blur, EN/ES copy shapes differ, any of the
  8 slots is missing or < 120KB, the slug is absent from `gen_images.py`
  `CLIENTS` (or its vertical has no prompt), or it is missing from the README /
  IMAGES.md tables. Current run: **74 clients · 592 slots · OK**.
- `gen_images.py` is now the single prompt registry: `delts-electric` /
  `votaw-plumbing` added with `electrician` / `plumber` prompts (moved out of
  `regen_fleet.py`). `regen_fleet.py` now discovers the flagship too (its copy
  lives at `content/copy.json`), so `--dry-run` lists all 592 slots.
- Docs reconciled to the real fleet: README client table (was 64 rows, now 74),
  `72 → 74` in README/DEPLOY/CLAUDE.md, sitemap count (75 URLs), image floor
  120KB everywhere, Pollinations framed as draft-only, "Adding a client" steps
  aligned across README/CLAUDE.md, release checklist added to DEPLOY.md.

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

**20 Aug evening pass:** Cleared mid-band JPEGs (&lt;120KB) across about/gallery
slots (Johnny K’s full g1–g6 caption-aligned regen; toys, arcade, florist,
bikes, escape room, trades, books, etc.). Mobile `--hero-min` capped at 28rem.
`/sites` catalog header densified. FAQ row padding tightened. Overflow QA:
**148 checks, 0 flagged**.

**20 Aug night pass:** Motion polish — tone-tuned Ken Burns + rise/reveal,
polaroid hover lift, earlier scroll-reveal trigger. Caption-aligned kits for
**Tastee Bite**, **La Michoacana**, and **China House** (buffet/hibachi), plus
Chicago Beauty hero and Growing Place gallery refresh.

**20 Aug late-night densify + photo pass:** Killed leftover `:3010` Next servers.
Further cut `--section-y` / `--header-gap` / `--hero-min` (default ~34rem,
energetic ~30rem, mobile 24rem). Full-bleed heroes no longer double-`min-h`
the section; split/feast/collage/arch/about/story/visit tightened. Replaced
odd about/gallery/heroes for Cast Iron, Woody’s, Sapphire, Naperville Running,
Realize, Yellow Bird, Suburban Music, Lord Stanley’s, MVP’s, Pub West, Growing
Place, Chicago Beauty, Mad Batter. Overflow QA still **148/0**.

## How to verify

```bash
cd site
npx next dev -p 3010
# Archetype samples
open http://127.0.0.1:3010/                    # default feast/full-bleed flagship
open http://127.0.0.1:3010/sites/the-montcler  # editorial
open http://127.0.0.1:3010/sites/cronauer-law  # authority
open http://127.0.0.1:3010/sites/leza-nail-spa # wellness
open http://127.0.0.1:3010/sites/a1-auto       # craft
npm run qa:all   # overflow / ES parity / behavior / reveal / CTA fold (server up)
CTA_FOLD_VIEWPORT=390x740 npm run qa:cta   # short-phone fold
npm run check:fleet             # fleet integrity (no server needed)
npm run lint && npx tsc --noEmit && npm run build   # release gate (see DEPLOY.md)
```

Studio catalog + image audit: sibling repo `node scripts/sync-spec-audit.mjs`
→ http://127.0.0.1:8080/catalog

## Best next steps (priority order)

1. **Owner photo swap** — Replace AI kits with phone shots for paid closes;
   keep slot names + run `gen_blur.py`.
2. **Gallery re-shoots (4 slots)** — pub-west g5 (pork tenderloin), lord-stanleys
   g3 (live music), mvps g5 (cap lettering defect), cast-iron g1 (portafilter).
   Caption fidelity is otherwise done for the food/café set (23 Aug); when a
   slot is re-shot, restore the original caption intent EN + ES.
3. **Mobile CTA fold** — done and automated (`npm run qa:cta`, 74/74 at 844
   and at 740). Keep it in `qa:all`; re-run after any hero/spacing change.
4. **Lead webhook** — Wire `LEAD_WEBHOOK_URL` for production lead capture.
5. **Publish / Vercel** — Confirm `npm run build` + env (no secrets in repo).
6. **Studio sync** — New kits → `public/spec/<slug>/` then
   `./scripts/copy-spec-kit.sh` when staging from Razon Studio.

## Do not

- Re-run Pollinations / `regen_fleet.py` for heroes
- Ask visitors to “open localhost” — preview is the product surface
- Invent social providers beyond Better Auth Google/X (+ optional email)

## Key paths

| Path | Role |
| --- | --- |
| `site/lib/clients.ts` | `CLIENTS` + `LAYOUTS` archetypes |
| `site/scripts/check_fleet.py` | Fleet integrity gate (`npm run check:fleet`) |
| `site/scripts/gen_images.py` | Slug→vertical + `STYLE`/`HERO`/`ABOUT` prompt registry |
| `site/app/globals.css` | Spacing tokens, tones, bento |
| `site/components/Hero.tsx` | All hero variants |
| `site/public/img/<slug>/` | Live photo kits |
| `site/scripts/aesthetic_briefs.json` | Real-place look / avoid |
| `IMAGES.md` | Slot sizes + prompt formula |
| `docs` in Razon Studio | Product / factory slate |
