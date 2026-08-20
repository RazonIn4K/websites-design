# Deploying the generated sites

The `site/` app is a standard Next.js 16 (App Router, SSG + image optimization)
project. All 72 business sites are routes in one deployment; nothing per‑client
is built separately.

## 1. Environment variables

Set these in the host (Vercel project settings, or `.env.local` for local prod):

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | **Yes (prod)** | Canonical origin (no trailing slash). Drives `metadataBase`, canonical/OG/Twitter URLs, JSON‑LD `url`/`image`, `sitemap.xml`, and `robots.txt`. If unset it falls back to `http://localhost:3000`, which would bake localhost links into the static export. |
| `LEAD_WEBHOOK_URL` | No | Where `/api/lead` forwards normalized leads (n8n / Cloud Run / FastAPI). If unset, the form runs in **demo mode**: submissions are validated and logged but not forwarded. |
| `LEAD_WEBHOOK_TOKEN` | No | Sent as `Authorization: Bearer <token>` to the webhook. |

The lead payload is already normalized for a deal pipeline:
`{ source, business:{name,city,state}, contact:{name,email,phone}, reservation:{partySize,date}, message, locale, receivedAt, meta }`.

## 2. Deploy to Vercel

```bash
npm i -g vercel          # CLI is not bundled in this environment
cd site
vercel link              # link/create the project
vercel env add NEXT_PUBLIC_SITE_URL production   # e.g. https://your-domain.com
# (optional) vercel env add LEAD_WEBHOOK_URL production
vercel deploy --prod
```

Framework preset auto‑detects Next.js. No custom build command needed
(`next build`). Image optimization (AVIF/WebP) runs on Vercel automatically.

## 3. What's already configured

- **SEO**: per‑route metadata + canonical + OpenGraph + Twitter cards,
  `app/sitemap.ts` (60 URLs), `app/robots.ts`, and `LocalBusiness` JSON‑LD
  (sub‑typed per vertical; `priceRange` gated to commercial verticals only).
- **Security headers** (`next.config.ts`): HSTS, `nosniff`, `X-Frame-Options`,
  `Referrer-Policy`, `Permissions-Policy`.
- **Caching**: immutable long‑cache on `/img/*`; optimizer `minimumCacheTTL`.
- **A11y / resilience**: skip‑link, focus‑trapped mobile dialog, native FAQ
  accordion, keyboard‑reachable galleries, no‑JS/SSR‑safe content, and a
  forced‑reduced‑motion‑safe motion system.

## 4. Known follow‑ups (optional)

- **Content‑Security‑Policy** is intentionally not set. A strict CSP needs a
  per‑request nonce for the inline `js` flag script (`app/layout.tsx`) and for
  Motion's injected styles. Add via middleware when wiring a real domain.
- Drop a client's **real photos** into `public/img/<slug>/` (same filenames) to
  replace the AI‑generated set; regenerate `blur.json` with
  `python scripts/gen_blur.py`.
