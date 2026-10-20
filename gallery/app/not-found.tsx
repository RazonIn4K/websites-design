export default function NotFound() {
  return (
    <main id="main" tabIndex={-1} className="demo-index">
      <h1>Example not found</h1>
      <p>This gallery contains six curated design concepts.</p>
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- Reload the exported document to reset page-level language state; keep native no-script navigation. */}
      <a href="/">Return to the design collection</a>
    </main>
  );
}
