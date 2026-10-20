import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
assert.ok(args.length === 0 || (args.length === 2 && args[0] === '--out-dir'), 'Usage: node check-export.mjs [--out-dir <export-directory>]');
const out = args.length ? path.resolve(args[1]) : path.join(root, 'out');
const slugs = ['flamengo', 'growing-place', 'arcada-theater', 'andersons-toyshop', 'leza-nail-spa', 'a1-auto'];
const razonDestinations = ['https://razonworks.com/', 'https://razonworks.com/contact/', 'https://razonworks.com/es/', 'https://razonworks.com/es/contacto/'];
async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return (await Promise.all(entries.map(e => e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]))).flat();
}
const files = await walk(out);
const assets = [];
const htmlDocuments = [];
let allPayload = '';
for (const file of files) {
  const bytes = await readFile(file);
  assets.push({ path: path.relative(out, file), bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') });
  if (/\.(?:html|js|txt|json)$/.test(file)) allPayload += bytes.toString('utf8');
  if (file.endsWith('.html')) htmlDocuments.push({ path: path.relative(out, file).split(path.sep).join('/'), html: bytes.toString('utf8') });
}
const exportedFiles = new Set(assets.map(asset => asset.path.split(path.sep).join('/')));
const imageReferences = [];

function decodeAttribute(value) {
  const named = { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>' };
  return value.replace(/&(#x[\da-f]+|#\d+|amp|quot|apos|lt|gt);/gi, (_, entity) => {
    if (!entity.startsWith('#')) return named[entity.toLowerCase()];
    const point = entity[1].toLowerCase() === 'x' ? parseInt(entity.slice(2), 16) : parseInt(entity.slice(1), 10);
    return point > 0 && point <= 0x10ffff ? String.fromCodePoint(point) : '\ufffd';
  });
}

// Next's unoptimized static images have ordinary quoted attributes. Ignore
// non-rendered payloads; quoted > characters must not end an img tag early.
function imageAttributes(html) {
  const rendered = html.replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<script\b(?:[^"'<>]|"[^"]*"|'[^']*')*>[\s\S]*?<\/script\s*>/gi, '')
    .replace(/<style\b(?:[^"'<>]|"[^"]*"|'[^']*')*>[\s\S]*?<\/style\s*>/gi, '');
  return [...rendered.matchAll(/<img\b(?:[^"'<>]|"[^"]*"|'[^']*')*>/gi)].map(([tag]) => {
    const attributes = new Map();
    // Consume every complete attribute, so text such as src='...' inside an
    // alt value cannot masquerade as a separate source attribute.
    for (const match of tag.slice(4, -1).matchAll(/([^\s"'<>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g)) {
      const key = match[1].toLowerCase();
      if ((key === 'src' || key === 'srcset') && !attributes.has(key)) attributes.set(key, decodeAttribute(match[2] ?? match[3] ?? match[4] ?? ''));
    }
    return attributes;
  });
}

function srcsetURLs(value) {
  const urls = [];
  let remaining = value;
  while ((remaining = remaining.replace(/^[\s,]+/, ''))) {
    const [, token, tail] = /^(\S+)([\s\S]*)$/.exec(remaining);
    const url = token.replace(/,+$/, '');
    if (url) urls.push(url);
    // A URL ending in commas has no descriptor. Otherwise consume its width
    // or density descriptor up to the next candidate separator.
    remaining = token.endsWith(',') ? tail : tail.slice(tail.indexOf(',') < 0 ? tail.length : tail.indexOf(',') + 1);
  }
  return urls;
}

function requireLocalImage(documentPath, attribute, rawURL) {
  assert.ok(rawURL.trim(), `${documentPath}: empty img ${attribute}`);
  const origin = 'https://gallery-export.invalid';
  const url = new URL(rawURL, new URL(documentPath, origin + '/'));
  if (url.origin !== origin) return; // Inline/remote images are not local files; no requests are made.
  const pathname = decodeURIComponent(url.pathname);
  const resolved = path.resolve(out, '.' + pathname);
  const relative = path.relative(out, resolved);
  assert.ok(relative && !relative.startsWith('..' + path.sep) && !path.isAbsolute(relative), `${documentPath}: image escapes export directory: ${rawURL}`);
  const exportedPath = relative.split(path.sep).join('/');
  assert.ok(exportedFiles.has(exportedPath), `${documentPath}: missing img ${attribute} file: ${rawURL} -> ${exportedPath}`);
  imageReferences.push({ document: documentPath, attribute, url: rawURL, file: exportedPath });
}
const checks = [];
function check(name, run) {
  try { run(); checks.push({ name, status: 'PASS' }); }
  catch (e) { checks.push({ name, status: 'FAIL', reason: e.message }); }
}
for (const document of htmlDocuments) {
  check(`${document.path}: rendered local img src/srcset files exist`, () => {
    for (const attributes of imageAttributes(document.html)) {
      assert.ok(attributes.has('src') || attributes.has('srcset'), `${document.path}: rendered img has neither src nor srcset`);
      if (attributes.has('src')) requireLocalImage(document.path, 'src', attributes.get('src'));
      if (attributes.has('srcset')) {
        const urls = srcsetURLs(attributes.get('srcset'));
        assert.ok(urls.length, `${document.path}: empty img srcset`);
        for (const url of urls) requireLocalImage(document.path, 'srcset', url);
      }
    }
  });
}
check('rendered HTML includes local img references', () => assert.ok(imageReferences.length > 0));
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
console.log(JSON.stringify({ result: failed ? 'FAIL' : 'PASS', sourceRoot: root, exportRoot: out, scope: 'Static export safety and rendered local img src/srcset file resolution only; no CSS/JavaScript-created image, live-provider or browser assertion.', total: checks.length, passed: checks.length - failed, failed, checks, htmlDocuments: htmlDocuments.length, localImageReferences: imageReferences.length, imageReferences, assetCount: assets.length, assetBytes: assets.reduce((n, a) => n + a.bytes, 0), assets }, null, 2));
if (failed) process.exitCode = 1;
