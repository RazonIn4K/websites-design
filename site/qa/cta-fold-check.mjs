/* Mobile CTA fold check.
 * At a 390×844 phone viewport, the hero's primary CTA (`#top a.btn-primary`,
 * falling back to any `#top a.btn`) must be fully visible without scrolling
 * — a below-the-fold CTA is the single biggest conversion leak on a local
 * business site. Runs with reduced motion so hero rise/reveal animations
 * don't skew the measurement. Set CTA_FOLD_VIEWPORT=390x740 to test a
 * shorter phone (Safari with its toolbars ≈ 740–780px tall).
 * Usage: node qa/cta-fold-check.mjs
 */
import { launch, forEachSite, urlFor } from "./lib.mjs";

const [W, H] = (process.env.CTA_FOLD_VIEWPORT || "390x844").split("x").map(Number);

(async () => {
  const browser = await launch();
  let flagged = 0;
  const rows = [];
  const results = await forEachSite(
    browser,
    { viewport: { width: W, height: H }, reducedMotion: "reduce", isMobile: true, hasTouch: true },
    async (slug, page) => {
      await page.goto(urlFor(slug), { waitUntil: "domcontentloaded", timeout: 30000 });
      await page.waitForTimeout(500);
      const r = await page.evaluate(() => {
        const hero = document.querySelector("#top");
        const cta = hero?.querySelector("a.btn-primary") || hero?.querySelector("a.btn");
        if (!cta) return null;
        const b = cta.getBoundingClientRect();
        const heroBottom = hero.getBoundingClientRect().bottom;
        return {
          text: cta.textContent.trim().slice(0, 40),
          top: Math.round(b.top),
          bottom: Math.round(b.bottom),
          heroBottom: Math.round(heroBottom),
        };
      });
      if (!r) {
        flagged++;
        console.log(`FLAG ${slug}: no hero CTA found`);
        return { slug, ok: false };
      }
      const ok = r.bottom <= H;
      if (!ok) {
        flagged++;
        console.log(`FLAG ${slug}: CTA "${r.text}" bottom=${r.bottom}px > fold ${H}px (hero bottom ${r.heroBottom}px)`);
      }
      rows.push({ slug, ...r, ok });
      return { slug, ok, ...r };
    },
  );
  await browser.close();
  rows.sort((a, b) => b.bottom - a.bottom);
  console.log(`\nDeepest CTAs (bottom px @ ${W}x${H}):`);
  for (const r of rows.slice(0, 8)) console.log(`  ${String(r.bottom).padStart(4)}  ${r.slug}  hero→${r.heroBottom}`);
  console.log(`\nDONE ${results.length} sites, ${flagged} flagged`);
  process.exitCode = flagged ? 1 : 0;
})();
