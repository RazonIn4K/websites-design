/* Behavioral test suite (mobile 390) for every site:
 * 1. default language is EN
 * 2. menu tab switching flips aria-pressed
 * 3. testimonial carousel Next advances without error
 * 4. mobile nav dialog opens, Escape closes, focus returns to trigger
 * 5. language toggle switches <html lang> to es
 * 6. lead form submits (ES mode) and shows the success live-region message,
 *    except the unapproved Flamingo concept, which must render an inert panel
 * Usage: node qa/behavior-check.js   (POSTs demo leads to /api/lead)
 */
import { launch, forEachSite, urlFor } from "./lib.mjs";

(async () => {
  const browser = await launch();
  const results = await forEachSite(
    browser,
    { viewport: { width: 390, height: 844 }, reducedMotion: "reduce", isMobile: true, hasTouch: true },
    // freshContext: the ES-toggle test writes lbg:lang to localStorage, which
    // must not leak into the next site's "default lang is EN" assertion
    async (slug, page) => {
      const fails = [];
      await page.goto(urlFor(slug), { waitUntil: "networkidle", timeout: 45000 });

      const lang0 = await page.evaluate(() => document.documentElement.lang);
      if (lang0 !== "en") fails.push(`default lang=${lang0}`);

      const tabs = page.locator('#menu .no-scrollbar button[aria-pressed]');
      if ((await tabs.count()) >= 2) {
        await tabs.nth(1).click();
        await page.waitForTimeout(250);
        const [p0, p1] = await Promise.all([
          tabs.nth(0).getAttribute("aria-pressed"),
          tabs.nth(1).getAttribute("aria-pressed"),
        ]);
        if (p1 !== "true" || p0 !== "false") fails.push(`tab switch p0=${p0} p1=${p1}`);
      }

      const next = page.locator('button[aria-label="Next testimonial"]');
      if (await next.count()) {
        await next.first().scrollIntoViewIfNeeded();
        await next.first().click();
        await page.waitForTimeout(250);
      }

      const burger = page.locator("header button[aria-expanded]");
      if (await burger.count()) {
        await page.evaluate(() => window.scrollTo(0, 0));
        await burger.first().click();
        try {
          await page.waitForSelector('[role="dialog"]', { timeout: 3000 });
          await page.waitForTimeout(250); // let the open transition settle
          await page.keyboard.press("Escape");
          // poll for detachment — a fixed wait loses the AnimatePresence-exit
          // race when the server is under load
          try {
            await page.waitForSelector('[role="dialog"]', { state: "detached", timeout: 4000 });
          } catch {
            fails.push("dialog did not close on Escape");
          }
          await page.waitForTimeout(150);
          const focusOk = await page.evaluate(() => document.activeElement === document.querySelector("header button[aria-expanded]"));
          if (!focusOk) fails.push("focus not returned to menu trigger");
        } catch {
          fails.push("dialog did not open");
        }
      } else fails.push("no hamburger button found");

      const esBtn = page.locator("header button", { hasText: /^ES$/ });
      if (await esBtn.count()) {
        await esBtn.first().click();
        try {
          await page.waitForFunction(() => document.documentElement.lang === "es", { timeout: 4000 });
        } catch {
          fails.push("lang toggle did not set html lang=es");
        }
      } else fails.push("ES toggle button not found");

      const nameField = page.locator('#lead input[name="name"]');
      if (slug === "flamengo") {
        if (await nameField.count()) fails.push("flagship exposes an active lead form");
        if ((await page.locator("[data-demo-inquiry]").count()) !== 1) {
          fails.push("flagship inert inquiry panel not found");
        }
      } else if (await nameField.count()) {
        await nameField.scrollIntoViewIfNeeded();
        await nameField.fill("QA Prueba");
        await page.locator('#lead input[name="email"]').fill("qa@example.com");
        await page.locator('#lead textarea[name="message"]').fill("Comprobación automática.");
        await page.locator('#lead button[type="submit"]').click();
        try {
          await page.waitForSelector('#lead [role="status"] p', { timeout: 8000 });
        } catch {
          fails.push("form success message did not appear");
        }
      } else fails.push("lead form not found");

      if (fails.length) console.log(`FAIL ${slug}: ${fails.join(" | ")}`);
      return { slug, fails };
    },
    { freshContext: true },
  );
  await browser.close();
  const bad = results.filter((r) => r.error || (r.fails && r.fails.length));
  console.log(`\nDONE ${results.length} sites, ${bad.length} with failures`);
  process.exitCode = bad.length ? 1 : 0;
})();
