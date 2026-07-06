# Prospect status ledger — verified July 2026

Findings from the locale/business research pass (10 web-research agents, every
claim source-checked). The generated sites still render the original manifest
data; nothing below was silently changed. Use this to prioritize/clean the
pitch list.

## Closed or gone (no longer prospects as-is)

| Site | Finding | Source |
| --- | --- | --- |
| dearborn-cafe (Sandwich) | Closed Oct 31, 2025 (owners retired); "Little Belle's" taking the space | WSPY News, whatnow.com |
| bowlrrito (DeKalb) | Permanently closed | Yelp (May 2026) |
| beidelman-furniture (Naperville) | Final closing April 29, 2026 — 165-year business, DuPage County's oldest; 1928 building is Naperville's first commercial landmark | ABC7, naperville.com, Naperville Preservation |
| elite-boba (Naperville) | Replaced by "Uni Uni" bubble tea (~mid-2025) at the same address | Downtown Naperville Alliance, 42Fifty |
| all-chocolate-kitchen (Geneva) | Sold June 2025 after the Robys retired; renamed "Coffee, Cones & Cabernet" | Shaw Local (Nov 2025) |
| mccoy-chiropractic (Sycamore) | Closed at listed address; Dr. McCoy now practices as Lifestyle Family Chiropractic, 1101 DeKalb Ave | Yelp, drmatt.net |
| todd-curtis-orthodontist (Sycamore) | Practice succeeded by "Sycamore Orthodontics & Pediatric Dentistry" (new doctors); Dr. Curtis no longer listed | sycamoreorthopedo.com |
| flavor-spice (Geneva) | Possibly closed — Yelp marks CLOSED; official site still up | Yelp vs 360flavorandspice.com |

## Relocated (site address is the historic location)

| Site | Finding |
| --- | --- |
| schmaltz-deli | Moved to 3011 Ogden Ave, **Lisle** in 2022 (own building, drive-thru) — schmaltzdeli.com/our-story |
| lindsays-cobbler | Now at 2035 S Washington St Ste 115, Naperville ("Lindsay's custom leather design"), same phone |
| realize-athletics | Possibly moved 432 N Main St → 303 E State St, Sycamore (official site unreachable) |

## Identity / manifest-data corrections

| Site | Finding | Status |
| --- | --- | --- |
| flamengo (flagship) | Real business is spelled **"Flamingo"** Restaurant & Ice Cream (flamingorestaurantdekalb.com) — OSM tag carried the misspelling | ✅ APPLIED (display name + all copy; slug unchanged) |
| the-montcler | Actually The Montcler **Hotel & Conference Center** (official: Sandwich, IL 60548) with on-site dining — not a standalone restaurant | open (concept reframe = your call) |
| tastee-bite | Real business is a Chicago-style hot dog / ice-cream stand, not a frozen-custard stand | open (demo concept, disclaimed) |
| china-house | Currently described as buffet/hibachi/sushi, not wok carryout | open (demo menu, disclaimed) |
| victory-mma | One of several Victory MMA Academy locations — "independent/locally owned" framing was wrong | ✅ APPLIED (copy reframed truthfully, EN+ES) |
| cortland-vet | Real clinic is "Cortland Animal Hospital", 13669 State Route 38, DeKalb 60115 | ✅ APPLIED (name + address + mapsQuery + copy) |
| mad-batter-bakery | Real address 320 W Main St, **St. Charles** 60174; manifest city "Geneva" was wrong | ✅ APPLIED (address/city/zip + full copy scrub) |
| schmaltz-deli | Relocated 2022 → 3011 Ogden Ave, Lisle 60532 | ✅ APPLIED (address + fresh OSM coords + copy) |
| lindsays-cobbler | Relocated → 2035 S Washington St Ste 115, Naperville 60565 | ✅ APPLIED (address + coords + neighborhood) |
| fattys-pub | Real address 1312 W Lincoln Hwy (manifest 1213 transposed) | ✅ APPLIED (verified at fattysniu.com) |
| mvps-sports-bar | Official name "MVP Sports Bar", 124 S California St | ✅ APPLIED (name + address, verified) |
| pub-west | Official site lists NO phone (email/WhatsApp only); third-party listings conflict (…3637 vs …3736) | ⚠ held — needs human confirmation before changing |
| astro-fun-world | (630) 206-0267 unanimous across third parties but absent from the official site; manifest number appears nowhere | ⚠ held — confirm via call/GBP before changing |
| anderson-auto-body | Official phone (815) 784-5006 (andersonautobodyil.com) — OSM lacked it | ✅ APPLIED (site now renders call CTAs) |
| pardridge-insurance | Official address 2580 DeKalb Ave, Sycamore (same Route 23 corridor; road name changes at the line) | open (equivalent address; low priority) |
| lovells-tire | Still open, but now part of Suburban Tire and Auto Repair | open (framing = your call) |
| realize-athletics | Possible move to 303 E State St (official site unreachable) | ⚠ held — unverifiable |

## Real hours imported from official sources (demo disclaimer retained)

mvps-sports-bar, pub-west, inbodens-meats, cast-iron-coffee, south-moon-bbq
(Hinckley), tails-humane — each from the business's own site. Skipped where no
official source posts hours: a1-auto, beas-wok, the-flame.

## Batch-14 candidate vetting (July 2026)

First slate: **1 of 10 qualified** — the manifest carries pre-2020 closures.

| Candidate | Verdict |
| --- | --- |
| Hink's Bar and Grill (Sycamore) | ✅ QUALIFIED — open (Jun 2026), Facebook-only, full data → **built** |
| Ollie's Frozen Custard | has own site (open, iconic, seasonal) |
| The Confectionary (DeKalb) | has own site (with e-commerce) |
| Yen Ching (DeKalb) | has own site; owners announced Dec 31, 2026 closure |
| Forge Brewhouse | CLOSED (Dec 2022) |
| Twins Tavern | CLOSED |
| Eduardo's Mexican | CLOSED since Dec 2019 (manifest never caught it) |
| Pour House Pub (Kingston) | CLOSED — and its manifest record carries Five Points Pub's address (105 Main St), a different, open, website-less bar |
| 21 Nail Spa (Sycamore) | superseded by Kayla Nail Spa (same address/phone, has own site) |
| Teased & Tangled (Sandwich) | unverifiable — one stale directory entry, no reviews/social |

Second slate: **1 of 12 qualified.**

| Candidate | Verdict |
| --- | --- |
| Star 34 Cafè (Sandwich) | ✅ QUALIFIED — reopened under new name/ownership, Facebook-only → **built** |
| Five Points Pub, The Lincoln Inn (now inside Faranda's), VP Nails, Molly's, Happy Wok (BeyondMenu domain), Angie's Sugar Buzz, Just the Details, BullMoose | open but have their own websites |
| The Huddle (2021), Panda House (2025, now Zhao's Express), Brenda's Custard (successor closed Mar 2026) | CLOSED |

**Lesson for future slates:** the manifest's "no website" flags are ~2 years
stale — 8 of 12 candidates have since built sites. Pre-screen with a live
website check + Facebook "website" field before including, and skip records
lacking phone/address (correlated with closures). Missing verticals worth
targeting deliberately: auto detailing, additional trades, tattoo/piercing.

## Confidence notes

- kramer-photography history (LaRoi Studios 1965 / Kramer 1971 / merged 1991)
  rests on directories carrying the studio's own text — phrased conservatively
  in copy; official site was unreachable.
- All other in-copy history claims trace to the business's own official site
  or 2+ independent reputable sources (per-agent citations in the research
  transcripts).
