/* Spanish-mode structural check: forces lang=es via localStorage before load,
 * then verifies <html lang> hydrates to "es" and the longer Spanish copy adds
 * no horizontal overflow at phone/tablet/desktop widths.
 * Usage: node qa/es-check.js
 */
import { launch, forEachSite, urlFor } from "./lib.mjs";

const VIEWPORTS = [
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 900 },
];

(async () => {
  const browser = await launch();
  let flagged = 0;
  let total = 0;
  for (const vp of VIEWPORTS) {
    const ctxOpts = {
      viewport: { width: vp.width, height: vp.height },
      reducedMotion: "reduce",
      isMobile: vp.width < 800,
      hasTouch: vp.width < 800,
    };
    const results = await forEachSite(browser, ctxOpts, async (slug, page) => {
      // context-level init script would be cleaner, but forEachSite shares the
      // context — an init script added before first navigation covers all pages
      if (!page.__esInit) {
        await page.context().addInitScript(() => {
          try { localStorage.setItem("lbg:lang", "es"); } catch {}
        });
        page.__esInit = true;
      }
      await page.goto(urlFor(slug), { waitUntil: "domcontentloaded", timeout: 30000 });
      try {
        await page.waitForFunction(() => document.documentElement.lang === "es", { timeout: 5000 });
      } catch {}
      const d = await page.evaluate(() => ({
        lang: document.documentElement.lang,
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      }));
      if (d.overflow > 1 || d.lang !== "es") {
        flagged++;
        console.log(`FLAG ${slug} ${vp.name}: overflow=${d.overflow}px lang=${d.lang}`);
      }
      return { slug, vp: vp.name, ...d };
    });
    total += results.length;
  }
  await browser.close();
  console.log(`\nDONE ${total} checks, ${flagged} flagged`);
  process.exitCode = flagged ? 1 : 0;
})();
