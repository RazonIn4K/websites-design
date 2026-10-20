# RazonWorks design gallery

This package is the public, static six-concept gallery. The original `site/`
application is preserved separately and is not its deployment source. The
concepts, generated imagery and illustrative content remain disclosed. No real
inquiry, booking, order, operational backend or provider is enabled here.

The current review adds language-matched RazonWorks home/contact links, closes
the phone menu when the viewport becomes desktop-sized, and uses compressed
WebP copies of the original images at the same dimensions. Original JPEGs
remain in `../site/public/img/`; `image-optimization.json` records exact
hashes, dimensions and byte counts. Reduced-motion and no-script behavior stay
part of the verification scope.

From the repository root, use Node 24 and the installed gallery dependencies:

```sh
node --test tests/*.test.mjs
cd gallery
npm run lint
npm run typecheck
npm run build
node scripts/check-export.mjs
```

With Python 3 and the existing Pillow installation, verify retained originals,
dimensions, output hashes and actual exported references from the repository root:

```sh
python3 scripts/optimize-gallery-images.py --check --export-dir gallery/out
```

The navigation regression tests execute the actual component handlers/effects
with controlled fixtures. They verify desktop-breakpoint cleanup and English/
Spanish return destinations. They do not establish native keyboard, focus,
layout or browser behavior. The export check verifies the static safety
boundary, asset references and absence of operational contact content.
Readiness checks additionally use actual React server renders and controlled
client-snapshot fixtures; they do not establish native browser hydration.

Readiness uses a shared server/client snapshot: exported controls remain
disabled until hydration, without setting state synchronously in an effect.
The footer, disclosure and 404 collection links intentionally use native
document navigation to reset page-level language state. Each has a documented
line-level lint exception; the rule remains enabled for the package.

Before publication, review all six demos at phone and desktop widths in both
languages, menu focus/Escape/resize, visible disclosures, category controls,
local acknowledgment and actual RazonWorks return/contact navigation. Check
the compressed imagery visually. Build and source tests alone do not complete
these checks. No production deployment is implied by a commit or push.
