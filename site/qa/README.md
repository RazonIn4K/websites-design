# QA harness

Deterministic fleet-wide checks that run against a local production server
(`npm run build && npm run start`). All scripts drive the locally installed
Chrome headless via `playwright-core` (devDependency, no browser download) and
exit non-zero on failures. Override the target with `QA_BASE_URL`.

| Script | What it verifies | Notes |
| --- | --- | --- |
| `npm run qa:overflow` | No horizontal page overflow on any site — plus the `/sites` catalog — at 390px / 1440px | Overflow expands the mobile layout viewport and shrinks the whole page; `/sites` isn't a client slug, so it was a harness blind spot |
| `npm run qa:es` | `<html lang>` hydrates to `es` and the longer Spanish copy adds no overflow at 390/768/1440 | Forces the language via the `lbg:lang` localStorage key |
| `npm run qa:behavior` | Language toggle, menu tabs, nav dialog (open/Escape/focus return), carousel, lead-form submit → success message | Mobile 390; POSTs demo leads to `/api/lead` |
| `npm run qa:reveal` | Every `.reveal` / `.reveal-clip` element becomes `.is-visible` after real wheel scrolling, **without reduced motion** | Guards the Chromium IO + self-clip deadlock (2026-07): a fully self-clipped element never intersects, so its reveal never fires |
| `npm run qa:cta` | The hero's primary CTA (`#top a.btn-primary`) is fully above the fold at 390×844 on every site | Reduced motion so hero rise animations don't skew the box; `CTA_FOLD_VIEWPORT=390x740` tests a shorter phone; `CTA_FOLD_LANG=es` runs it in Spanish (longer copy sits deeper) |
| `npm run qa:all` | All of the above | |

## Hard-won rules for future checks

1. **Always include at least one non-reduced-motion pass.** Reduce-mode disables
   the reveal clips, which masked a fleet-wide "photos never appear" bug.
2. **Google Maps iframes render blank in headless Chrome** — not a defect;
   verify iframe findings in headed Chrome before "fixing".
3. **Fixed-position elements ghost in `fullPage: true` screenshots**
   (scroll-and-stitch) — use viewport screenshots for fixed bars.
4. **Never put `overflow-x` (even `clip`) on `html`** — Chromium stops
   `position: sticky` from pinning, and it masks real per-site overflow.
5. `body { overflow-x: hidden }` propagates to the viewport and does NOT clip
   locally — skip `body`/`html` when walking ancestors for clip checks.
