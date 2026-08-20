# Autonomous Local Business Generator — DeKalb County, IL

End-to-end pipeline that **discovers** local businesses from open data, **audits**
their digital presence, and **generates** modern, bilingual marketing sites for the
best prospects — from one content-driven, multi-tenant template.

> **Fleet status (20 Aug 2026):** **74** live kits, spacing densified, image floor
> cleared (≥110KB every slot). See **[STATUS.md](./STATUS.md)** for what shipped,
> how to verify, and best next steps.

```
recon/  →  data/  →  site/  (one template → many themed client sites)
scan       manifest    Next.js app
```

## 1. Reconnaissance (`recon/`, `data/`)

`recon/overpass_recon.py` queries the **OpenStreetMap Overpass API** (public, ODbL)
across DeKalb County + the corridor toward Chicago, classifies each business by
vertical, audits website/contact presence, scores it as a web-design lead, and
writes a ranked manifest.

- **`data/targets.json`** — full machine-readable manifest (237 businesses).
- **`data/PROSPECTS.md`** — human-readable prospect report + top-20 leads.

**Result:** 237 businesses found, **112 (47%) have no website**. Re-run (stdlib only):

```bash
python recon/overpass_recon.py
```

## 2. Generated sites (`site/`)

One shared component template renders **74 client sites**, each with bilingual
copy, brand palette, display font, and a full **8-photo kit** (hero, about,
g1–g6) — 592 images. Preview locally with `npx next dev -p 3010` in `site/`.

Beyond palette/font, each client opts into a **layout archetype** (`lib/clients.ts`
`SiteLayout`) so the sites differ in their *bones*, not just color: **Warm Hospitality**
(default, full-bleed / feast / collage heroes), **Editorial** (fine dining — magazine
split hero), **Authority** (law/finance/medical — split on light), **Wellness**
(beauty/spa — editorial + mono), and **Craft** (retail/trades/gym — hard-edged,
energetic density). Driven by `archetype` + `edge`/`surface`/`tone` and a
per-archetype section registry.

**Spacing (Aug 2026):** heroes are capped (not forced full-viewport); section
rhythm and about/gallery/menu padding were tightened fleet-wide so pages stop
reading as hollow. Details in `STATUS.md`.

On top of the archetypes sits a scroll-driven **layered wave**: sticky-stacking
process decks, collage heroes, scrollytelling story panels, ghost words, count-up
stats, and progressive-enhancement motion (no-JS/reduced-motion safe). QA harness:
`site/qa/`, `npm run qa:all`.

| Route (`/` or `/sites/<slug>`) | Business | Vertical · City |
|---|---|---|
| `/` (flamengo) | Flamingo Restaurant and Ice Cream | Mexican Restaurant & Ice Cream · DeKalb |
| `a1-auto` | A-1 Auto Repair | Auto Repair · DeKalb |
| `university-city-barbershop` | University City Barbershop | Barbershop · DeKalb |
| `dekalb-mechanical` | DeKalb Mechanical | Heating & Cooling (HVAC) · DeKalb |
| `china-house` | China House | Chinese Restaurant · DeKalb |
| `genoa-animal-hospital` | Genoa Animal Hospital | Veterinary Clinic · Genoa |
| `realize-athletics` | Realize Athletics | Gym & Personal Training · Sycamore |
| `leza-nail-spa` | Leza Nail Spa | Nail Salon & Spa · DeKalb |
| `friedrichs-eye` | Friedrichs Eye Surgery & Optical | Eye Care & Eyewear · Sycamore |
| `woodys-orchard` | Woody's Orchard & Fun Farm | Orchard & Farm Market · Plano |
| `todd-curtis-orthodontist` | Todd Curtis Orthodontist | Orthodontics · Sycamore |
| `pizza-villa` | Pizza Villa | Pizzeria · DeKalb |
| `the-montcler` | The Montcler | Italian Restaurant · Plano |
| `dearborn-cafe` | Dearborn Cafe | Breakfast & Brunch Cafe · Sandwich |
| `lord-stanleys` | Lord Stanley's and Annex | Neighborhood Pub · DeKalb |
| `mvps-sports-bar` | MVPs Sports Bar and Grill | Sports Bar & Grill · Sycamore |
| `lovells-tire` | Lovells Discount Tire | Tire & Wheel Shop · DeKalb |
| `beas-wok` | Bea's Wok N Roll | Vietnamese Restaurant · DeKalb |
| `wired-nutrition` | Wired Nutrition | Nutrition & Smoothie Shop · DeKalb |
| `bowlrrito` | Bowlrrito | Build-Your-Own Bowls · DeKalb |
| `my1-hair` | My 1 Hair Solution | Hair Salon · DeKalb |
| `tails-humane` | Tails Humane Society | Animal Shelter & Adoption · DeKalb |
| `johnny-ks` | Johnny K's | Burger & Hot Dog Stand · Sandwich |
| `exquisite-skillet` | Exquisite Skillet Pancake House | Pancake House · Plano |
| `chicago-beauty` | Chicago Beauty | Lash & Brow Beauty Bar · DeKalb |
| `tastee-bite` | Tastee Bite | Frozen Custard & Treats · Plano |
| `fattys-pub` | Fatty's Pub & Grille | Sports Pub & Grille · DeKalb |
| `cortland-vet` | Cortland Vet | Country Veterinary Clinic · Cortland |
| `inbodens-meats` | Inboden's Gourmet Meats & Specialty Foods | Butcher & Specialty Foods · DeKalb |
| `cast-iron-coffee` | Cast Iron Coffee | Coffee Roaster & Espresso Bar · DeKalb |
| `paw-lickin-good` | Paw Lickin' Good | Pet Bakery & Boutique · Sycamore |
| `pilates-plus` | Pilates Plus Unlimited | Pilates & Reformer Studio · Sycamore |
| `mccoy-chiropractic` | McCoy Chiropractic | Chiropractic & Wellness · Sycamore |
| `cronauer-law` | Cronauer Law | Law Firm · Sycamore |
| `pardridge-insurance` | Pardridge Insurance | Insurance Agency · DeKalb |
| `white-oak-tax` | White Oak Tax Solutions | Tax & Accounting · DeKalb |
| `south-moon-bbq` | South Moon BBQ | BBQ Smokehouse · Hinckley |
| `prairie-path-cycles` | Prairie Path Cycles | Bicycle Shop & Service · Batavia |
| `kiss-the-sky` | Kiss the Sky | Independent Record Store · Batavia |
| `yellow-bird-books` | Yellow Bird Books | Independent Bookstore · Aurora |
| `mad-batter-bakery` | Mad Batter Bakery and Confections | Bakery & Confections · Geneva |
| `geneva-winery` | Geneva Winery & Coffeehouse | Winery & Wine Bar · Geneva |
| `celidan-florist` | Celidan Creations Florist | Florist & Gift Shop · Naperville |
| `noon-whistle-brewing` | Noon Whistle Brewing | Craft Brewery & Taproom · Naperville |
| `suburban-music` | Suburban Music | Music Store & Lessons · Wheaton |
| `pottery-bayou` | Pottery Bayou | Paint-Your-Own Pottery Studio · Naperville |
| `flavor-spice` | 360 Flavor & Spice | Spice & Seasoning Shop · Geneva |
| `beidelman-furniture` | Beidelman Furniture | Furniture & Home Store · Naperville |
| `kramer-photography` | Kramer Photographers | Photography Studio · Naperville |
| `victory-mma` | Victory Mixed Martial Arts | Martial Arts & MMA Gym · Naperville |
| `schmaltz-deli` | Schmaltz Delicatessen | Jewish Deli & Sandwiches · Naperville |
| `sapphire-tattoo` | Sapphire Studios | Tattoo & Piercing Studio · Naperville |
| `envision-dance` | Envision Dance | Dance Studio & School · Naperville |
| `costello-jewelry` | Costello Jewelry Company | Fine Jewelry Store · Naperville |
| `all-chocolate-kitchen` | All Chocolate Kitchen | Artisan Chocolatier · Geneva |
| `andersons-toyshop` | Anderson's Toyshop | Toy Store · Naperville |
| `arcada-theater` | Arcada Theater | Theater & Live Music Venue · St. Charles |
| `elite-boba` | Elite Boba | Bubble Tea Shop · Naperville |
| `nona-jos` | Nona Jo's | Home & Gift Boutique · Naperville |
| `growing-place` | The Growing Place | Garden Center & Nursery · Naperville |
| `naperville-running` | Naperville Running Co. | Running & Footwear Store · Naperville |
| `riddlebox-escape` | Riddlebox Escape Rooms | Escape Room · Naperville |
| `astro-fun-world` | Astro Fun World | Family Fun Center & Arcade · Aurora |
| `lindsays-cobbler` | Lindsay's Leather & Shoe Repair | Shoe Repair & Leather Goods · Naperville |
| `lisle-lanes` | Lisle Lanes | Bowling Alley · Lisle |

- **`/sites`** — portfolio index of all 72 generated sites.

All 72 come from one template; only `content/clients/<slug>/copy.json` (bilingual),
`theme.json` (palette), `public/img/<slug>/*` (photos), and the `lib/clients.ts`
registry entry (emojis, font, schema type) differ per business. Add more by repeating
those steps. Photos are generated by `scripts/gen_images.py` (Flux via Pollinations).

### How the template generalizes
- **Content-driven:** each client is `content/clients/<slug>/copy.json` (bilingual
  EN/ES) + `theme.json` (palette). The registry is `lib/clients.ts`.
- **Per-client theming:** brand colors + display font are CSS variables overridden
  on a wrapper (`components/Providers.tsx`) — Tailwind v4 utilities read the vars,
  so one component tree renders any brand. Glass, shadows, badges, and the hero
  mesh all derive from the theme via `color-mix()`.
- **Vertical-aware:** the "menu" section doubles as a services list; icons, emojis,
  tags, monogram, JSON-LD type, and phone-optional CTAs all adapt per client
  (e.g. barber & HVAC have no phone, so CTAs route to the quote form).

### Stack
- **Next.js 16** (App Router, SSG) · **React 19** · **TypeScript** · **Tailwind CSS v4** · **Motion**
- Bilingual EN⇄ES toggle (localStorage + browser-lang), bento grids, glassmorphism, JSON-LD.

### Animations (progressive enhancement)
Scroll reveals use **CSS + IntersectionObserver** (`components/motion.tsx` +
`.reveal` in `globals.css`): content is visible by default and only hidden once JS
is confirmed (`<html class="js">`), so it can never get stuck invisible under
no-JS, reduced-motion, or a backgrounded tab. Reduced-motion is honored throughout
(reveals, hero parallax, testimonial autoplay).

### Run it
```bash
cd site
npm install            # already installed
npm run dev            # http://localhost:3000
# or production:
npm run build && npm run start
```

Status: `tsc --noEmit` ✅ · `eslint` ✅ 0 errors · `next build` ✅ (72 routes) · runtime + browser verified.

### Lead pipeline
The form posts to `/api/lead`, which forwards a normalized, **per-tenant** payload
(each site sends its own business identity) to your deal pipeline. Configure:

```bash
cp site/.env.local.example site/.env.local
# LEAD_WEBHOOK_URL=https://your-n8n-or-cloudrun-or-fastapi/endpoint
# LEAD_WEBHOOK_TOKEN=optional-bearer-token
```
With no `LEAD_WEBHOOK_URL`, the form runs in **demo mode** (accepts + logs leads).

### Quality
An adversarial multi-agent review (6 dimensions — animation, a11y, i18n, multi-tenant,
responsive, React — with independent verification of high-severity findings) was run
against the codebase; all confirmed findings were fixed, including a multi-tenant
lead-attribution bug, form labelling/contrast, theming leaks, heading order, and
mobile layout. See `recon`/workflow scripts under `.claude/`.

## 3. Adding another client
1. Generate `content/clients/<slug>/copy.json` (bilingual, same shape) + `theme.json` (10 color vars).
2. Add an entry to `CLIENTS` in `lib/clients.ts` (slug, vertical, emojis, display font).
3. `npm run build` — the route `/sites/<slug>` is generated automatically.

## Photography
Hero, gallery, and ambiance images are **AI-generated** per client (Flux via the
Pollinations HTTP API — no API key) and saved locally to `public/img/<slug>/`, so
they are build- and offline-safe. **See `IMAGES.md`** for the full slot spec,
per-register art direction, and prompt recipes for external image AIs
(ChatGPT/GPT-image, Midjourney, …), plus a per-site briefing table. Gallery prompts are derived from each site's own
captions so the image matches the caption. Design follows the modern-restaurant
research: full-bleed hero photography, photo bento gallery, and ambiance collage.

Regenerate (sequential, rate-limit-friendly, skips existing):
```bash
cd site && python scripts/gen_images.py
```
Swap in a client's real photos by dropping files into `public/img/<slug>/` with the
same names (`hero`, `about`, `g1`–`g6`).

## Notes & integrity
- Business **name, address, and phone** come from public OpenStreetMap data.
- **Menus, prices, hours, testimonials, and photos are illustrative demo content**
  (each site states this) — no fabricated specifics (founding years, awards, named
  individuals). Imagery is AI-generated and meant to be replaced with the owner's real photos.
- These are **spec/demo sites** to be shown to each business owner.
