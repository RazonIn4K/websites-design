/* Rendered claim-boundary checks for the unapproved Flamingo prospect concept.
 * Usage: node qa/flamingo-boundary-check.mjs (production server required)
 */
import assert from "node:assert/strict";
import { BASE, launch } from "./lib.mjs";

const browser = await launch();
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  reducedMotion: "reduce",
  isMobile: true,
  hasTouch: true,
});
const page = await context.newPage();

try {
  await page.goto(`${BASE}/`, { waitUntil: "networkidle", timeout: 45000 });

  const robots = (await page.locator('meta[name="robots"]').getAttribute("content")) ?? "";
  assert.match(robots, /noindex/i);
  assert.match(robots, /nofollow/i);
  assert.match(await page.title(), /illustrative.+concept/i);
  assert.match(
    (await page.locator('meta[name="description"]').getAttribute("content")) ?? "",
    /not (?:Flamingo's|Flamingo’s) official website/i,
  );
  assert.equal(await page.locator('script[type="application/ld+json"]').count(), 0);
  assert.equal(await page.locator("form#lead").count(), 0);

  const disclosure = page.locator("[data-prospect-disclosure]");
  await assert.doesNotReject(() => disclosure.waitFor({ state: "visible" }));
  assert.match(await disclosure.innerText(), /illustrative prospect concept/i);
  assert.match(await disclosure.innerText(), /not owner-approved/i);
  assert.match(await disclosure.innerText(), /not Flamingo(?:'s|’s) official website/i);
  const disclosureLink = disclosure.locator('a[href="https://flamingorestaurantdekalb.com/"]');
  assert.equal(await disclosureLink.count(), 1);
  const disclosureBox = await disclosure.boundingBox();
  assert.ok(disclosureBox && disclosureBox.y < 100, "disclosure must begin near the top of the first viewport");
  assert.ok(
    await page.evaluate(() => {
      const note = document.querySelector("[data-prospect-disclosure]");
      const hero = document.querySelector("section#top");
      return Boolean(note && hero && (note.compareDocumentPosition(hero) & Node.DOCUMENT_POSITION_FOLLOWING));
    }),
    "disclosure must precede the hero in DOM order",
  );

  const demoInquiry = page.locator("[data-demo-inquiry]");
  assert.equal(await demoInquiry.count(), 1);
  assert.match(await demoInquiry.innerText(), /Reservations and contact requests are not active/i);
  assert.equal(
    await demoInquiry.locator('a[href="https://flamingorestaurantdekalb.com/"]').count(),
    1,
  );

  await page.locator("header button", { hasText: /^ES$/ }).first().click();
  await page.waitForFunction(() => document.documentElement.lang === "es");
  assert.match(await disclosure.innerText(), /concepto ilustrativo para prospección/i);
  assert.match(await demoInquiry.innerText(), /Las reservaciones y solicitudes de contacto no están activas/i);

  // A non-flagship prospect retains the existing schema and demo lead flow.
  await page.goto(`${BASE}/sites/a1-auto`, { waitUntil: "networkidle", timeout: 45000 });
  const otherRobots = (await page.locator('meta[name="robots"]').getAttribute("content")) ?? "";
  assert.doesNotMatch(otherRobots, /noindex|nofollow/i);
  assert.ok(await page.locator('script[type="application/ld+json"]').count());
  assert.equal(await page.locator("form#lead").count(), 1);
  assert.equal(await page.locator("[data-prospect-disclosure]").count(), 0);
  assert.equal(await page.locator("[data-demo-inquiry]").count(), 0);

  await page.goto(`${BASE}/sites`, { waitUntil: "networkidle", timeout: 45000 });
  assert.equal(await page.getByText("View live site →", { exact: true }).count(), 0);
  assert.ok(await page.getByText("View concept →", { exact: true }).count());

  const sitemap = await (await fetch(`${BASE}/sitemap.xml`)).text();
  const paths = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => new URL(match[1]).pathname);
  assert.ok(!paths.includes("/"), "the noindex flagship must be omitted from sitemap.xml");
  assert.ok(paths.includes("/sites"));

  console.log("flamingo boundary: ok");
} finally {
  await context.close();
  await browser.close();
}
