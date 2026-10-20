import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'out');
const slugs = ['flamengo', 'growing-place', 'arcada-theater', 'andersons-toyshop', 'leza-nail-spa', 'a1-auto'];
const razonDestinations = ['https://razonworks.com/', 'https://razonworks.com/contact/', 'https://razonworks.com/es/', 'https://razonworks.com/es/contacto/'];
async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return (await Promise.all(entries.map(e => e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]))).flat();
}
const files = await walk(out);
const assets = [];
let allPayload = '';
for (const file of files) {
  const bytes = await readFile(file);
  assets.push({ path: path.relative(out, file), bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') });
  if (/\.(?:html|js|txt|json)$/.test(file)) allPayload += bytes.toString('utf8');
}
const checks = [];
function check(name, run) {
  try { run(); checks.push({ name, status: 'PASS' }); }
  catch (e) { checks.push({ name, status: 'FAIL', reason: e.message }); }
}
for (const slug of slugs) {
  const html = await readFile(path.join(out, 'gallery', slug, 'index.html'), 'utf8');
  const source = JSON.parse(await readFile(path.join(root, slug === 'flamengo' ? 'content/copy.json' : `content/clients/${slug}/copy.json`), 'utf8'));
  check(`${slug}: no data-entry and only verified RazonWorks navigation`, () => {
    assert.doesNotMatch(html, /<(?:form|input|textarea|iframe)\b/i);
    for (const match of html.matchAll(/href=["']((?:https?:|mailto:|tel:|\/\/)[^"']*)["']/gi)) assert.ok(razonDestinations.includes(match[1]));
    for (const destination of ['https://razonworks.com/','https://razonworks.com/contact/']) assert.ok(html.includes(`href="${destination}"`));
  });
  check(`${slug}: no source phone in any exported payload`, () => {
    for (const phone of [source.business.phone, source.business.phoneHref].filter(Boolean)) assert.ok(!allPayload.includes(phone));
  });
  check(`${slug}: no source testimonial in any exported payload`, () => {
    for (const locale of ['en', 'es']) for (const item of source[locale]?.testimonials?.items ?? []) {
      for (const quote of [item.quote, item.text].filter(Boolean)) assert.ok(!allPayload.includes(quote));
    }
  });
  check(`${slug}: persistent disclosure in SSR`, () => {
    assert.match(html, /CONCEPT/); assert.match(html, /GENERATED IMAGERY/); assert.match(html, /No affiliation, bookings, orders or real inquiries/);
  });
  check(`${slug}: no contact placeholders or empty location`, () => {
    assert.ok(!html.includes('[demo]')); assert.ok(!html.includes(', <!-- -->, '));
  });
}
check('exactly six public image kits', () => {
  assert.deepEqual([...new Set(assets.filter(a => a.path.startsWith('img/')).map(a => a.path.split('/')[1]))].sort(), [...slugs].sort());
});
check('all 48 public photographs use the verified smaller WebP assets', () => {
  const photographs = assets.filter(a => a.path.startsWith('img/'));
  assert.equal(photographs.length, 48);
  assert.ok(photographs.every(a => a.path.endsWith('.webp')));
});
check('no operational/private export paths', () => assert.ok(assets.every(a => !/(?:^|\/)(?:api|managed|operator|\.env|\.data|recon|data)(?:\/|$)/.test(a.path))));
check('robots excludes indexing', () => assert.match(allPayload, /Disallow: \/\n/));
const failed = checks.filter(c => c.status === 'FAIL').length;
console.log(JSON.stringify({ result: failed ? 'FAIL' : 'PASS', sourceRoot: root, scope: 'Static export safety only; no live-provider or browser assertion.', total: checks.length, passed: checks.length - failed, failed, checks, assetCount: assets.length, assetBytes: assets.reduce((n, a) => n + a.bytes, 0), assets }, null, 2));
if (failed) process.exitCode = 1;
