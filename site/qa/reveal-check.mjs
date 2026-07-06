/* Real-motion reveal check (the reduced-motion blind spot guard).
 *
 * Runs WITHOUT reducedMotion — the actual user path — wheel-scrolls each page
 * to the bottom, then asserts every .reveal / .reveal-clip element that is
 * actually renderable (not inside a [hidden] menu panel) received .is-visible.
 * Any stuck element means scroll-reveal content is invisible to real users
 * (see the 2026-07 Chromium IO + self-clip deadlock).
 *
 * Usage: node qa/reveal-check.js   (server must be running; QA_BASE_URL to override)
 */
import { launch, forEachSite, urlFor } from "./lib.mjs";

(async () => {
  const browser = await launch();
  const results = await forEachSite(
    browser,
    { viewport: { width: 1440, height: 900 } }, // NO reducedMotion — intentional
    async (slug, page) => {
      await page.goto(urlFor(slug), { waitUntil: "networkidle", timeout: 45000 });
      // real wheel scrolling so IntersectionObservers fire like they do for users
      await page.evaluate(() => window.scrollTo(0, 0));
      // Robust bottom detection: a single no-progress tick is NOT the bottom —
      // under load one hitched frame would abort the scroll mid-page and
      // falsely flag everything below. Require the real document end, or a
      // sustained stall.
      let last = -1;
      let stall = 0;
      for (let step = 0; step < 120; step++) {
        await page.mouse.wheel(0, 600);
        await page.waitForTimeout(80);
        const s = await page.evaluate(() => ({
          y: Math.round(window.scrollY),
          atBottom: Math.ceil(window.scrollY + window.innerHeight) >= document.body.scrollHeight - 2,
        }));
        if (s.atBottom) break;
        if (s.y === last) {
          stall++;
          if (stall >= 6) break;
        } else stall = 0;
        last = s.y;
      }
      await page.waitForTimeout(700);
      const stuck = await page.evaluate(() => {
        const bad = [];
        for (const el of document.querySelectorAll(".reveal, .reveal-clip")) {
          if (el.classList.contains("is-visible")) continue;
          if (el.closest("[hidden]")) continue; // inactive menu tab panels
          if (el.getClientRects().length === 0) continue; // display:none subtree
          const cls = typeof el.className === "string" ? el.className.split(/\s+/).slice(0, 4).join(".") : "";
          bad.push(`${el.tagName.toLowerCase()}.${cls}`);
        }
        return bad.slice(0, 5);
      });
      if (stuck.length) console.log(`FLAG ${slug}: ${stuck.length}+ stuck reveals — ${stuck.join(" | ")}`);
      return { slug, stuck: stuck.length };
    },
  );
  await browser.close();
  const flagged = results.filter((r) => r.error || r.stuck > 0);
  console.log(`\nDONE ${results.length} sites, ${flagged.length} flagged`);
  process.exitCode = flagged.length ? 1 : 0;
})();
