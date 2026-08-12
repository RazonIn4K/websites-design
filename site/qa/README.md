# QA harness

Deterministic fleet-wide checks. The static content-integrity contract runs
without a server; browser checks run against a local production server
(`npm run build && npm run start`). Browser scripts drive the locally installed
Chrome headless via `playwright-core` (devDependency, no browser download) and
exit non-zero on failures. Override the browser target with `QA_BASE_URL`.

| Script | What it verifies | Notes |
| --- | --- | --- |
| `npm run qa:content` | Prospect/demo, owner-approval, website-status, and external-ordering claim boundaries | Static; no server required |
| `npm run qa:flamingo-boundary` | Flagship noindex/nofollow metadata, no Restaurant JSON-LD/form, early EN/ES disclosure, inert inquiry panel, sitemap omission, and unaffected comparison route | Mobile 390; production server required |
| `npm run qa:overflow` | No horizontal page overflow on any site at 390px / 1440px | Overflow expands the mobile layout viewport and shrinks the whole page |
| `npm run qa:es` | `<html lang>` hydrates to `es` and the longer Spanish copy adds no overflow at 390/768/1440 | Forces the language via the `lbg:lang` localStorage key |
| `npm run qa:behavior` | Language toggle, menu tabs, nav dialog (open/Escape/focus return), carousel, lead-form submit → success message | Mobile 390; POSTs demo leads for all concepts except the inert Flamingo flagship |
| `npm run qa:reveal` | Every `.reveal` / `.reveal-clip` element becomes `.is-visible` after real wheel scrolling, **without reduced motion** | Guards the Chromium IO + self-clip deadlock (2026-07): a fully self-clipped element never intersects, so its reveal never fires |
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
