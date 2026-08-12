/* Claim-boundary contract for the generated-site index and Flamingo demo.
 * This check is static and does not require a running server.
 * Usage: node qa/content-integrity-check.mjs
 */
import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";

const siteRoot = new URL("../", import.meta.url);
const repoRoot = new URL("../../", import.meta.url);
const [
  copyText,
  sitesPage,
  flagshipPage,
  sitemap,
  sitePage,
  visit,
  sitesExplorer,
  clientsSource,
  rootReadme,
  siteReadme,
  prospectStatus,
] = await Promise.all([
  readFile(new URL("content/copy.json", siteRoot), "utf8"),
  readFile(new URL("app/sites/page.tsx", siteRoot), "utf8"),
  readFile(new URL("app/page.tsx", siteRoot), "utf8"),
  readFile(new URL("app/sitemap.ts", siteRoot), "utf8"),
  readFile(new URL("components/SitePage.tsx", siteRoot), "utf8"),
  readFile(new URL("components/Visit.tsx", siteRoot), "utf8"),
  readFile(new URL("components/SitesExplorer.tsx", siteRoot), "utf8"),
  readFile(new URL("lib/clients.ts", siteRoot), "utf8"),
  readFile(new URL("README.md", repoRoot), "utf8"),
  readFile(new URL("README.md", siteRoot), "utf8"),
  readFile(new URL("data/prospect-status.md", repoRoot), "utf8"),
]);
const copy = JSON.parse(copyText);

assert.doesNotMatch(
  sitesPage,
  /audited for a missing web presence/,
  "The sites index must not present a stale source tag as current web status",
);
assert.match(sitesPage, /illustrative/i);
assert.match(sitesPage, /does not\s+confirm a current missing web presence/);
assert.match(sitesPage, /client\s+relationship/);
assert.match(sitesPage, /account authority require\s+separate verification/);

for (const [language, wholeSitePattern] of [
  ["en", /entire site is concept content/i],
  ["es", /todo este sitio contiene contenido conceptual/i],
]) {
  const note = copy[language].footer.demoNote;
  assert.match(note, /flamingorestaurantdekalb\.com/i);
  assert.match(note, wholeSitePattern);
}

assert.match(copy.en.footer.demoNote, /prospect/i);
assert.match(copy.en.footer.demoNote, /not owner-approved/i);
assert.match(copy.en.footer.demoNote, /live ordering is external/i);
assert.match(copy.en.footer.rights, /no ownership or affiliation claimed/i);
assert.match(copy.es.footer.demoNote, /prospección/i);
assert.match(copy.es.footer.demoNote, /no aprobado por el propietario/i);
assert.match(copy.es.footer.demoNote, /pedidos reales son externos/i);
assert.match(copy.es.footer.rights, /no se afirma propiedad ni afiliación/i);

// The unapproved flagship concept must not present itself as the business's
// official, indexable website or publish business structured data.
assert.match(flagshipPage, /Illustrative Flamingo Website Concept/i);
assert.match(flagshipPage, /not (?:Flamingo's|Flamingo’s) official website/i);
assert.match(flagshipPage, /robots:\s*\{[\s\S]*?index:\s*false[\s\S]*?follow:\s*false/);
assert.doesNotMatch(flagshipPage, /<StructuredData\b/);
assert.match(flagshipPage, /<SitePage[^>]*\bprospectDemo\b/);
assert.doesNotMatch(sitemap, /\{\s*url:\s*`\$\{BASE\}\/`/);
assert.match(sitePage, /<ProspectDisclosure\s*\/\>/);
assert.match(sitePage, /<Visit\s+leadEnabled=\{!prospectDemo\}\s*\/\>/);
assert.match(visit, /data-demo-inquiry/);
assert.match(visit, /Reservations and contact requests are not active/i);
assert.match(visit, /Las reservaciones y solicitudes de contacto no están activas/i);
assert.match(visit, /flamingorestaurantdekalb\.com/i);

// Portfolio cards link to illustrative routes, not official/live properties.
assert.doesNotMatch(sitesExplorer, /View live site/i);
assert.match(sitesExplorer, /View concept/i);

// Registry-facing counts must be derived from the checked-in source/assets.
const slugs = [...clientsSource.matchAll(/slug:\s*"([^"]+)"/g)].map((match) => match[1]);
const verticals = new Set(
  [...clientsSource.matchAll(/vertical:\s*"([^"]+)"/g)].map((match) => match[1]),
);
const imageDirectories = await readdir(new URL("public/img/", siteRoot), { withFileTypes: true });
let imageCount = 0;
for (const directory of imageDirectories.filter((entry) => entry.isDirectory())) {
  const images = await readdir(new URL(`public/img/${directory.name}/`, siteRoot));
  imageCount += images.filter((name) => /\.jpg$/i.test(name)).length;
}
assert.equal(slugs.length, 72);
assert.equal(verticals.size, 71);
assert.equal(imageCount, 576);
assert.match(rootReadme, /72 illustrative business spec\/demo sites\s+across 71 unique vertical labels/i);
assert.match(rootReadme, /576 images total/i);
assert.match(siteReadme, /\/sites\/<slug>` \(71 concept routes\)/i);
assert.match(prospectStatus, /Flamingo lead form suppressed\/replaced with an inert panel/i);
assert.match(prospectStatus, /no visual redesign, provider, or deployment change/i);
assert.doesNotMatch(prospectStatus, /no visual, form, provider, or deployment change/i);

console.log("content integrity: ok");
