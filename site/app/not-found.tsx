import Link from "next/link";

/** Branded 404 — keeps lost visitors inside the portfolio. */
export default function NotFound() {
  return (
    <main id="main" className="gradient-mesh grid min-h-dvh place-items-center px-6">
      <div className="max-w-xl text-center">
        <p className="font-display text-[7rem] font-black leading-none text-primary/20 sm:text-[10rem]" aria-hidden>
          404
        </p>
        <h1 className="text-h2 mt-2 text-ink">This page wandered off.</h1>
        <p className="mx-auto mt-4 text-ink-soft">
          The address may have changed, or it never existed. Everything we&apos;ve
          built lives in the portfolio — start there.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/sites" className="btn btn-primary text-base no-underline">
            Browse all sites
          </Link>
          <Link href="/" className="btn btn-ink text-base no-underline">
            Flagship site
          </Link>
        </div>
      </div>
    </main>
  );
}
