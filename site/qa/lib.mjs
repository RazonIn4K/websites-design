/* Shared helpers for the QA harness. All scripts launch the locally installed
 * Chrome headless via playwright-core (no browser download needed). */
import { chromium } from "playwright-core";
import fs from "node:fs";
import path from "node:path";

export const BASE = process.env.QA_BASE_URL || "http://localhost:3000";

/** All client slugs, parsed from the registry (flamengo included). */
export function slugs() {
  const src = fs.readFileSync(path.join(import.meta.dirname, "..", "lib", "clients.ts"), "utf8");
  const out = [];
  const re = /slug:\s*"([^"]+)"/g;
  let m;
  while ((m = re.exec(src))) if (!out.includes(m[1])) out.push(m[1]);
  return out;
}

/** Site URL for a slug (flamengo is the flagship at "/"). */
export function urlFor(slug) {
  return slug === "flamengo" ? `${BASE}/` : `${BASE}/sites/${slug}`;
}

export function launch() {
  return chromium.launch({ channel: "chrome", headless: true });
}

/** Run `fn(slug, page)` for every slug with N parallel workers.
 *  `freshContext: true` gives every SITE its own browser context — required
 *  when the test mutates storage (e.g. the language toggle writes lbg:lang,
 *  which would leak into the next site's "default lang" assertion). */
export async function forEachSite(browser, contextOptions, fn, { concurrency = 4, freshContext = false } = {}) {
  const all = slugs();
  let i = 0;
  const results = [];
  async function worker() {
    let ctx = freshContext ? null : await browser.newContext(contextOptions);
    let page = ctx ? await ctx.newPage() : null;
    while (i < all.length) {
      const slug = all[i++];
      try {
        if (freshContext) {
          ctx = await browser.newContext(contextOptions);
          page = await ctx.newPage();
        }
        results.push(await fn(slug, page));
      } catch (e) {
        results.push({ slug, error: String(e).slice(0, 200) });
        console.log(`ERR ${slug}: ${String(e).slice(0, 120)}`);
      } finally {
        if (freshContext && ctx) {
          await ctx.close();
          ctx = null;
        }
      }
    }
    if (ctx) await ctx.close();
  }
  await Promise.all(Array.from({ length: concurrency }, worker));
  return results;
}


