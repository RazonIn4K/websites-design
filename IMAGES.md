# Image system & generation guide

Every one of the **74** sites uses the same **8-slot image kit**, generated per
client into `site/public/img/<slug>/`. This file documents what each slot needs,
how the pipeline builds prompts, and how to generate replacements with any
external image AI (ChatGPT/GPT-image, Midjourney, Flux, Cursor Imagine, etc.).

> **Ops note (23 Aug 2026):** Prefer Cursor/Grok Imagine for production slots —
> do **not** use Pollinations/`regen_fleet.py` for heroes. After any install run
> `python scripts/gen_blur.py`, then `python scripts/check_fleet.py` (every slot
> present, ≥120KB, registry + docs in sync). Fleet status: [STATUS.md](./STATUS.md).
> Aesthetic research: `site/scripts/aesthetic_briefs.json`.

## 1. The 8 slots — sizes and where each renders

| File | Generated size | Aspect | Renders in |
|---|---|---|---|
| `hero.jpg` | 1536×960 | 8:5 | Full-bleed default hero · editorial/split hero column (cropped ~4:5) · arch frame (tall crop) · feast photo band (wide) · collage stack · `/sites` explorer card (wide) · OG/social card background · the `vt-hero` view-transition morph |
| `about.jpg` | 1000×1000 | 1:1 | About dominant frame (~4:5 crop) · **Highlights bento feature cell** (wide crop, dark scrim + white text) · Story chapter 1 |
| `g1.jpg`–`g3.jpg` | 800–1000² | 1:1 | Menu "favorites" photo cards (default-menu sites) · gallery |
| `g4.jpg` | 800–1000² | 1:1 | About offset square · Story chapter 2 · gallery |
| `g5.jpg` | 800–1000² | 1:1 | Story chapter 3 · gallery |
| `g6.jpg` | 800–1000² | 1:1 | Gallery |

Everything renders through `object-cover` center-crops at many aspect ratios
(mosaic tiles span differently; the filmstrip crops to ~4:5 portrait), so:

- **Keep the subject centered with generous margins** — assume any edge can be
  cropped away. The two exceptions:
- **Default/left hero**: white copy sits on the LEFT — the subject belongs on the
  right with darker, emptier negative space on the left (the `_LEFT` rider in
  `site/scripts/gen_images.py` encodes this).
- **Gallery images must depict their captions.** `g1..g6` prompts are derived
  from the site's own `gallery.captions` (EN), and the caption text renders in a
  visible bar over the image. If you regenerate a gallery image with different
  content, update the caption in `copy.json` (both `en` **and** `es`).

**Quality floor:** after regen, aim for **≥ ~120KB** JPEG per slot (about/hero
especially). Recompress oversized kits carefully — a hard quality drop can push
files back under the floor (seen on Delts gallery mid-Aug).

## 2. How the current pipeline works

`site/scripts/gen_images.py` (run from `site/`: `python scripts/gen_images.py`)
calls the Pollinations **Flux** endpoint (no API key), seeded, sequential,
rate-limit-friendly, and **skips existing files** — useful for drafts only.
**Production heroes/abouts should use Cursor/Grok Imagine** (or equivalent HQ
generator), then overwrite the slot file.

- `CLIENTS` in `gen_images.py` maps every slug → vertical key (all 74, including the
  Aug 2026 trades `electrician` / `plumber`); `check_fleet.py` fails if a registered
  slug is missing here or its vertical lacks a prompt entry.
- `HERO[vertical]` / `ABOUT[vertical]` / `STYLE[vertical]` in `gen_images.py`
- Gallery: `"{caption}, {STYLE[vertical]}"`
- Research look/avoid: `site/scripts/aesthetic_briefs.json`
- `site/scripts/regen_fleet.py` composes the same dicts with the researched
  `HERO_OVERRIDES` + a photoreal `QUALITY` rider for targeted re-shoots
  (`--dry-run --force --slug <slug>`, `--archetype craft`, `--slots hero`). It
  covers the flagship too. Use it to *list* prompts for an HQ generator; don't
  bulk-run it for heroes.

`site/scripts/regen_heroes*.py` are earlier one-off precedents.
After any image swap: `python scripts/gen_blur.py` regenerates LQIP placeholders.

## 3. Prompt formula for external AIs (ChatGPT, Midjourney, …)

Compose every prompt the same way the pipeline does, plus a register rider and
palette cue from the table below:

```
[SCENE]            ← HERO/ABOUT dict entry, or the gallery caption, from gen_images.py
+ [STYLE suffix]   ← STYLE[vertical] from gen_images.py
+ [REGISTER rider] ← from the design register (see 3a)
+ [PALETTE cue]    ← the site's theme concept (table below), e.g. "amber and charcoal tones"
+ [COMPOSITION]    ← slot rule from §1 (left negative space for default heroes; centered otherwise)
+ "no text, no signage, no logos, no watermark"
```

### 3a. Register riders — match the site's design system

The CSS post-processes images per register, so shoot for the register:

| Design register | Rider to append | Why |
|---|---|---|
| warm (default) | "warm golden-hour light, inviting, cozy" | The hospitality baseline |
| craft · hard-edge · energetic | "hard directional light, high contrast, confident, industrial" | CSS boosts saturation ×1.1 + contrast; brutalist frames want punchy images |
| authority · crisp · calm | "soft even daylight, uncluttered, orderly, professional" | Calm registers; avoid drama and clutter |
| wellness · mono · editorial | "airy, soft diffuse light, generous negative space, muted tones" | CSS desaturates to ~70% — shape and light must carry the image, not color |
| editorial tone (fine dining) | "chiaroscuro, candlelit, editorial magazine photography" | Slight desaturation applied; moody suits it |
| **ink surface (dark sites)** | "low-key lighting, rich deep shadows, moody, subject lit against darkness" | Pages are near-black; bright white backgrounds glare. Applies to: kiss-the-sky, sapphire-tattoo, victory-mma, noon-whistle-brewing, riddlebox-escape, lisle-lanes |

### 3b. Tool-specific settings

- **ChatGPT / GPT-image**: generate heroes at 1536×1024 (its landscape size),
  crop to 1536×960; squares natively at 1024×1024. It follows compositional
  instructions ("empty darker space on the left third for text") reliably —
  state them explicitly. One image per request keeps quality highest.
- **Midjourney**: `--ar 8:5` for heroes, `--ar 1:1` for the rest; keep
  `--style raw` and moderate `--stylize` so results stay photographic, not
  illustrated. Upscale before export.
- **Flux via Pollinations** (`gen_images.py`): wired and keyless, but output is
  muddy at 30–90KB — draft/new-client scaffolding only. It does not clear the
  120KB floor reliably, so finished slots should come from the tools above.
- **Any tool**: export JPG. The Next.js optimizer serves AVIF/WebP from it.

### 3c. Consistency & integrity rules

- **One "shoot" per site**: reuse identical lighting/lens language across all 8
  prompts for a slug so the set reads as one photographer's work.
- **No readable text anywhere** (menus, prices, signs, labels) — AI text
  artifacts are the #1 tell, and demo sites must not fabricate specifics.
- **No real brand logos or trademarks.**
- **People**: prefer anonymous framing (hands at work, backs, distance). For
  medical/law/vet, favor environment-only or hands-only shots.
- These images are **placeholders by design** — each site discloses illustrative
  content, and the owner's real photos drop into the same filenames later.

## 4. Drop-in workflow

1. Save as **exact filenames** (`hero.jpg`, `about.jpg`, `g1.jpg`…`g6.jpg`) into
   `site/public/img/<slug>/`.
2. `cd site && python scripts/gen_blur.py` — regenerate blur placeholders.
3. If a dev server was running during the swap, **finish all images first, then
   restart it** (the optimizer caches 404s mid-swap).
   **Same-filename swaps also survive a rebuild:** `next start` keeps
   `site/.next/cache/images` across builds and `minimumCacheTTL` is one year,
   so a swapped slot keeps serving the *old* optimized bytes at any width that
   was already requested. Delete `site/.next/cache/images` before restarting
   (confirm the new photo with `Read`/an image viewer on the raw `.jpg` if a
   page tile looks unchanged).
4. `npm run build` and spot-check `/sites/<slug>` (or `npm run qa:all`).

## 5. Per-site briefing table

Vertical key = the prompt-dict key in `site/scripts/gen_images.py`. Register =
the design system the images must suit (§3a). Palette cue = from each site's
`theme.json` concept.

| Site | Vertical key | Design register | Palette / mood cue |
|---|---|---|---|
| `flamengo` | restaurant | warm | terracotta warm (flagship default) |
| `a1-auto` | auto | craft · hard-edge · energetic | graphite-blue ink and crisp light-gray surfaces grounded by a confident burnt safety-orange primary and a deep… |
| `university-city-barbershop` | barber | craft · hard-edge · energetic | navy-charcoal ink and deep navy on warm cream, anchored by a confident barber-red primary with a restrained br… |
| `dekalb-mechanical` | hvac | craft · hard-edge · energetic | A dependable trust-blue primary paired with a warm heat-orange accent over cool clean whites and slate ink, si… |
| `china-house` | chinese | warm | Imperial red and warm gold on ivory cream with deep warm ink, an elegant appetizing take on a classic Chinese … |
| `genoa-animal-hospital` | vet | authority · crisp-edge · calm · hero:split | A calm, caring veterinary palette pairing a trustworthy deep teal with a warm coral accent over clean mint-whi… |
| `realize-athletics` | fitness | craft · hard-edge · energetic | An electrifying high-energy palette pairing a bold athletic orange-red primary with a vivid lime accent over c… |
| `leza-nail-spa` | nails | wellness · mono · editorial · hero:editorial | A serene dusty-rose and rose-gold spa palette layered over creamy blush-whites with warm-gray ink for an elega… |
| `friedrichs-eye` | optometry | authority · crisp-edge · calm · hero:split | Clean clinical-yet-warm palette pairing a confident deep navy with a fresh teal accent over crisp cool-gray an… |
| `woodys-orchard` | farm | craft · hard-edge · energetic | A warm rustic-autumn palette pairing a deep apple-red primary and harvest-gold accent over creamy natural back… |
| `todd-curtis-orthodontist` | orthodontics | authority · crisp-edge · calm · hero:split | A pristine teal-blue primary with bright aqua-mint accents over cool-white backgrounds and slate ink, evoking … |
| `pizza-villa` | pizza | warm · hero:feast | A retro-modern Italian pizzeria palette pairing vibrant tomato red and basil green with a warm gold accent ove… |
| `the-montcler` | italian | editorial · editorial · hero:editorial | A candlelit Italian palette of deep wine and antique gold over warm ivory, evoking refined romance and old-wor… |
| `dearborn-cafe` | breakfast | editorial · editorial · hero:editorial | A warm, sunny breakfast-cafe palette pairing golden honey-amber and tangerine accents with cozy brown ink on c… |
| `lord-stanleys` | pub | warm | A cozy timeless tavern palette pairing deep British racing green and warm brass against aged-cream and dark wa… |
| `mvps-sports-bar` | sportsbar | warm | Game-day energy in a bold navy-and-electric-red palette on crisp steel-white backgrounds, built for high-contr… |
| `lovells-tire` | tire | craft · hard-edge · energetic | Rugged garage-floor industrial palette for Lovells Discount Tire: a near-black charcoal ink reads like tire ru… |
| `beas-wok` | vietnamese | warm · hero:feast | Vibrant fresh Asian street-kitchen palette for Bea's Wok N Roll: a warm chili-red primary for appetite and ene… |
| `wired-nutrition` | nutrition | craft · hard-edge · energetic | Wired Nutrition — an energetic wellness palette for a loaded-tea, shake and supplement bar |
| `bowlrrito` | fastcasual | warm · hero:feast | a bright avocado-lime primary that reads as just-chopped greens, balanced by a warm chipotle-terracotta accent… |
| `my1-hair` | hairsalon | wellness · mono · editorial · hero:editorial | a soft plum/violet primary paired with warm champagne-gold, set against creamy blush-white backgrounds with ge… |
| `tails-humane` | shelter | warm | a friendly coral-red primary that feels caring and energetic, a fresh teal-green accent suggesting renewal and… |
| `johnny-ks` | burger | warm · hero:feast | a juicy cherry-red primary straight off a 1950s neon sign, a retro turquoise accent like a chrome-trimmed dine… |
| `exquisite-skillet` | pancakes | warm | golden maple-syrup amber and caramel pour over creamy buttermilk backgrounds, anchored by cozy warm-brown ink … |
| `chicago-beauty` | beautybar | wellness · mono · editorial · hero:editorial | Soft-glam beauty bar palette for Chicago Beauty in DeKalb, IL |
| `tastee-bite` | custard | warm · hero:arch | a bright turquoise/mint primary evoking vintage 1950s diner tile, a cherry-red accent for sweetness and pop, w… |
| `fattys-pub` | pubgrill | warm · hero:feast | a smoky brick-red primary paired with toasted-amber, set on warm cream backgrounds with deep charcoal-brown in… |
| `cortland-vet` | vet | authority · crisp-edge · calm · hero:split | a calm sage-green primary evokes pasture and gentle care, a warm barn-red accent nods to rural Illinois farmst… |
| `inbodens-meats` | butcher | craft · hard-edge · energetic | Heritage butcher-shop palette evoking a classic, premium meat market: a deep butcher-red/maroon primary anchor… |
| `cast-iron-coffee` | coffeeshop | craft · hard-edge · energetic | Cast Iron Coffee leans into the warm, modern-rustic soul of a third-wave DeKalb roaster: a deep, rich espresso… |
| `paw-lickin-good` | petboutique | craft · hard-edge · energetic | Treats & Tails - a cheerful pet-boutique palette led by a friendly teal/aqua, warmed by a coral accent over cr… |
| `pilates-plus` | pilates | wellness · mono · editorial · hero:editorial | Serene boutique-wellness palette for Pilates Plus Unlimited |
| `mccoy-chiropractic` | chiro | wellness · mono · editorial · hero:editorial | a healing teal/blue-green primary grounded by deep slate ink on soft, clean off-white surfaces, lifted by a wa… |
| `cronauer-law` | law | authority · crisp-edge · calm · hero:split | a deep navy primary conveys trust and established expertise, paired with a refined antique-gold accent for dis… |
| `pardridge-insurance` | insurance | authority · crisp-edge · calm · hero:split | Steel & Amber Assurance - a trustworthy financial-protection palette pairing a confident steel-blue primary wi… |
| `white-oak-tax` | accounting | authority · crisp-edge · calm · hero:split | Grounded, established accounting identity for White Oak Tax Solutions |
| `south-moon-bbq` | bbq | editorial · editorial · hero:editorial | warm cream backgrounds like butcher paper, a deep smoky brick-red primary pulled from seasoned ribs, a charred… |
| `prairie-path-cycles` | bikeshop | craft · hard-edge · energetic | a vivid trail-green primary evokes the wooded Fox River bike paths around Batavia, paired with a high-vis sign… |
| `kiss-the-sky` | recordstore | craft · hard-edge · ink · energetic | a bold electric-purple primary lit by a hot-magenta secondary and a vivid neon-cyan accent, grounded by inky c… |
| `yellow-bird-books` | bookstore | warm · editorial · hero:arch | a calm sage forest-green primary paired with a soft handmade gold accent and warm ochre secondary, set in deep… |
| `mad-batter-bakery` | bakery | warm · hero:collage | Sweet Shop Confectionery - a charming, handmade bakery palette built on creamy vanilla backgrounds, warm cocoa… |
| `geneva-winery` | winery | editorial · editorial · hero:editorial | Candlelit Cellar - an intimate, sophisticated winery palette pairing deep wine burgundy with antique gold over… |
| `celidan-florist` | florist | warm · editorial · hero:arch | Fresh romantic florist palette built on a dusty rose-mauve primary, leafy sage accent, and deep plum ink over … |
| `noon-whistle-brewing` | brewery | craft · hard-edge · ink · energetic | a deep golden-amber primary (the glow of a fresh pour) snaps against warm cream backgrounds and near-black ink… |
| `suburban-music` | musicstore | warm · hero:collage | Concert Hall Classic - a timeless music-shop palette anchored by a rich, trustworthy navy primary and a warm b… |
| `pottery-bayou` | pottery | warm · hero:collage | Pottery Bayou Studio Splash — a cheerful turquoise glaze primary paired with a sunny yellow accent and a coral… |
| `flavor-spice` | spiceshop | warm | a deep paprika-red primary and rich turmeric-gold secondary set against creamy warm backgrounds, grounded by d… |
| `beidelman-furniture` | furniture | warm · editorial · hero:split | a rich walnut-brown primary grounds the brand in handcrafted, timeless furniture, warmed by an antique brass a… |
| `kramer-photography` | photographer | warm · editorial · hero:editorial | Atelier Plum & Champagne - a timeless, gallery-calm palette for Kramer Photographers |
| `victory-mma` | mma | craft · hard-edge · ink · energetic | Fight Night - a gritty, disciplined combat-sport palette |
| `schmaltz-deli` | deli | warm | a hearty deli-red primary paired with pickle-green and mustard-gold accents over warm cream paper and dark cha… |
| `sapphire-tattoo` | tattoo | craft · hard-edge · ink · energetic | a deep sapphire-blue primary cut against crisp off-white paper, with a hot magenta accent for needle-sharp hig… |
| `envision-dance` | dance | warm · hero:collage | Envision Dance pairs a vibrant fuchsia primary with a graceful violet secondary and a soft gold accent, set ag… |
| `costello-jewelry` | jeweler | warm · editorial · hero:editorial | Refined luxury-jeweler palette for Costello Jewelry Company: a deep emerald primary paired with a champagne-go… |
| `all-chocolate-kitchen` | chocolatier | warm · editorial · hero:editorial | a deep berry-bordeaux primary like a dark ganache, warmed by a caramel-gold accent that pops on dark hero imag… |
| `andersons-toyshop` | toystore | warm · hero:collage | a joyful primary-color palette for Anderson's Toyshop |
| `arcada-theater` | theater | editorial · editorial · hero:editorial | a deep velvet-burgundy primary and ornate antique-gold accent set against warm cream and near-black ink, evoki… |
| `elite-boba` | boba | warm · hero:collage | Taro Pop - a playful taro-purple primary with a sweet bubblegum-pink accent, fresh teal secondary, and bright … |
| `nona-jos` | giftshop | warm · editorial · hero:arch | a soft sage primary grounds creamy, candlelit backgrounds, with a warm taupe ink for cozy legibility, a pretty… |
| `growing-place` | garden | warm · calm · hero:arch | The Growing Place — a fresh, welcoming garden-center palette |
| `naperville-running` | running | craft · hard-edge · energetic | Pace Line — an electric-blue speed primary paired with a volt-lime accent, near-black ink, and crisp off-white… |
| `riddlebox-escape` | escaperoom | craft · hard-edge · ink · energetic | a deep arcane purple primary evokes locked vaults and clever puzzles, a bright puzzle-orange accent pops like … |
| `astro-fun-world` | funcenter | warm · hero:collage | a vivid royal-blue primary rockets across bright off-white space, sparked by sunny electric-yellow pops and a … |
| `lindsays-cobbler` | cobbler | warm · calm · hero:split | Heritage leather-craft palette for Lindsay's Leather and Shoe Repair: a rich saddle-brown primary evokes hand-… |
| `lisle-lanes` | bowling | craft · hard-edge · ink · energetic | a bold retro-red primary paired with a vintage teal secondary and a warm neon-gold accent that pops on dark he… |
| `pub-west` | pubgrill | warm · hero:feast | a deep bottle-green primary with an oxblood secondary and aged-brass accent, set on warm cream backgrounds wit… |
| `the-flame` | greek | warm | deep Santorini blue primary with olive secondary and flame-orange accent on a white-washed warm background wit… |
| `tapa-la-luna` | tapas | editorial · editorial · hero:editorial | A midnight-and-moon palette — deep indigo ink and plum over warm candle-cream, lit by a moonlit silver-gold ac… |
| `anderson-auto-body` | autobody | craft · hard-edge · energetic | a gunmetal gray-blue primary that reads like fresh primer coat and stamped steel, sparked by a high-visibility… |
| `la-michoacana` | paleteria | warm · energetic · hero:arch | a watermelon-fresa magenta primary (the color of a fresas con crema paleta), a mango-gold accent, and a lime-l… |
| `hinks-bar-and-grill` | pubgrill | craft · hard-edge · energetic | an aged-copper primary (old tap lines and downtown brick) over smoky parchment with deep charcoal-brown ink, a… |
| `star-34-cafe` | breakfast | warm | butter-yellow sunshine and buttermilk cream grounded by deep denim-blue booths, with a maple-toast secondary —… |
| `delts-electric` | electrician | craft · hard-edge · energetic · hero:split | Graphite industrial palette with a safety-orange primary — high-contrast licensed-trade identity, clean gara… |
| `votaw-plumbing` | plumber | craft · hard-edge · energetic · hero:split | Deep navy primary with a warm copper secondary — residential DeKalb trust on clean light surfaces, service va… |
## 6. Current status & re-shoot guidance (audited 2026-08-23)

**All 74 sites have complete 8-slot kits (592/592 files), every slot ≥ 120KB.**
Verify any time with `cd site && python scripts/check_fleet.py`. Captions and
photos were audited fleet-wide (24 Aug, all 444 gallery slots) and re-aligned
by slot permutation + caption rewrites. The remaining **re-shoot queue** (HQ
generator, same filenames, then `gen_blur.py`) in priority order:

1. **Embedded wrong branding** — votaw-plumbing g6 (baked-in competitor logo
   "ALL CLEAR DRAIN CLEANING") and g2 (visible third-party water-heater brand);
   nona-jos g5 (ghosted stock-photo watermark); lovells-tire g3 (baked-in
   marketing headline).
2. **Surreal/AI-broken content** — andersons-toyshop g6 (melted toy blobs),
   suburban-music g3/g5 (warped instrument clones), growing-place g5,
   pizza-villa g5/g6, sapphire-tattoo g5 (distorted machine), lindsays-cobbler
   g2, prairie-path-cycles g4.
3. **Garbled readable text** — andersons-toyshop g1/g2 (box art),
   yellow-bird-books g1/g4 (spines/covers), riddlebox g5 (countdown digits),
   delts-electric g5 (breaker labels), friedrichs-eye g6 (kids' chart),
   lisle-lanes g3, hinks g5 (songbook), wired-nutrition g6 ("PEANUT BUTER"),
   paw-lickin-good g4 ("YALMON BITES"), kiss-the-sky g5, naperville-running g4,
   mvps-sports-bar g5.
4. **Favorites-item gaps** (no matching photo exists in the kit; the Crowd
   Favorites card shows the item name over a related-but-wrong photo) —
   pizza-villa g1 (Villa Supreme) & g3 (calzone), fattys-pub g3 (ribs),
   elite-boba g3 (mango slush), beas-wok g2 (chicken pho), plus pub-west g5
   (pork tenderloin), lord-stanleys g3 (live music), cast-iron-coffee g1
   (floating portafilter).

**Caption fidelity rule (learned 23 Aug):** before regenerating a "mismatched"
gallery image, view the whole kit — most mismatches were kits generated for a
shuffled caption order, fixable by renaming slots (`g3→g1`, …) and re-running
`gen_blur.py`. Only when no photo in the kit fits should you regenerate, or
rewrite the caption (EN **and** ES) to what the photo shows.

When a slot does get re-shot, match the register it renders in:

| Register | Sites | Shoot for |
|---|---|---|
| **ink (dark pages)** | `kiss-the-sky`, `sapphire-tattoo`, `victory-mma`, `noon-whistle-brewing`, `riddlebox-escape`, `lisle-lanes` | Low-key rider (§3a): subjects lit against darkness, rich shadows — bright white backgrounds glare on near-black pages. |
| **wellness / mono (CSS desaturates to ~70%)** | `leza-nail-spa`, `my1-hair`, `chicago-beauty`, `pilates-plus`, `mccoy-chiropractic` | Shape-and-light first, airy, generous negative space — color-led images lose their punch under the mono filter. |
| **authority split hero (trust-critical)** | `cronauer-law`, `pardridge-insurance`, `white-oak-tax`, `friedrichs-eye`, `todd-curtis-orthodontist`, `genoa-animal-hospital`, `cortland-vet` + flagship `flamengo` | The split hero shows the photo as a large framed panel, so quality is most visible — premium generator only, people/hands over empty rooms. |
| **craft split hero (trades)** | `a1-auto`, `dekalb-mechanical`, `lovells-tire`, `anderson-auto-body`, `delts-electric`, `votaw-plumbing`, `hinks-bar-and-grill` | Hard directional light, high contrast, technician + place; the photo column stretches to copy height, so keep the subject centered. |
| **editorial heroes** | `the-montcler`, `dearborn-cafe`, `south-moon-bbq`, `geneva-winery`, `arcada-theater`, `tapa-la-luna` | Chiaroscuro / candlelit magazine photography. |
| everything else | remaining warm/craft sites | Replace opportunistically, or when a business becomes a live prospect (owner photos first). |

Workflow per batch: generate → drop into `site/public/img/<slug>/` under the
same filenames → `python scripts/gen_blur.py` → `python scripts/check_fleet.py`
→ restart any running dev server → build + spot-check. To redo a single slot
as a Flux draft, delete that file and re-run `gen_images.py` (it only fills
empty slots).
