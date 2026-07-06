/* Horizontal-overflow check (EN) at phone + desktop widths.
 * Any scrollWidth > clientWidth means stray page overflow — on real phones
 * that expands the layout viewport and shrinks the whole site.
 * Usage: node qa/overflow-check.js
 */
import { launch, forEachSite, urlFor } from "./lib.mjs";

const VIEWPORTS = [
  { name: "mobile", width: 390, height: 844 },
  { name: "desktop", width: 1440, height: 900 },
];

(async () => {
  const browser = await launch();
  let flagged = 0;
  let total = 0;
  for (const vp of VIEWPORTS) {
    const results = await forEachSite(
      browser,
      { viewport: { width: vp.width, height: vp.height }, reducedMotion: "reduce", isMobile: vp.width < 800, hasTouch: vp.width < 800 },
      async (slug, page) => {
        await page.goto(urlFor(slug), { waitUntil: "domcontentloaded", timeout: 30000 });
        await page.waitForTimeout(400);
        const o = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        if (o > 1) {
          flagged++;
          console.log(`FLAG ${slug} ${vp.name}: overflow=${o}px`);
        }
        return { slug, vp: vp.name, overflow: o };
      },
    );
    total += results.length;
  }
  await browser.close();
  console.log(`\nDONE ${total} checks, ${flagged} flagged`);
  process.exitCode = flagged ? 1 : 0;
})();
