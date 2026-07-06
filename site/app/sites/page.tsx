import type { Metadata } from "next";
import { CLIENTS } from "@/lib/clients";
import { getBlur } from "@/lib/blur";
import { SitesExplorer, type SiteCard } from "@/components/SitesExplorer";

export const metadata: Metadata = {
  title: "Generated Local Business Sites — DeKalb, IL",
  description:
    "A portfolio of modern, bilingual marketing sites auto-generated for local DeKalb-area businesses discovered from open data.",
  alternates: { canonical: "/sites" },
};

/** Keyword buckets for the business-type filter (derived, not stored). */
function categorize(vertical: string): string {
  const v = vertical.toLowerCase();
  if (/restaurant|cafe|coffee|bbq|deli|pizza|pub|bar |bar$|bakery|chocolat|boba|custard|brew|winery|burger|hot dog|breakfast|pancake|ice cream|wok|skillet|bites|catering|spice/.test(v))
    return "Food & Drink";
  if (/vet|animal|pet|shelter|dog/.test(v)) return "Pets & Animals";
  if (/salon|spa|nail|hair|barber|beauty|tattoo/.test(v)) return "Beauty & Style";
  if (/chiro|dental|orthodon|eye|clinic|nutrition|pilates/.test(v)) return "Health & Wellness";
  if (/gym|athletic|mma|martial|dance|bowl|escape|fun|theater|arcade|music school|running/.test(v))
    return "Active & Fun";
  if (/law|insurance|tax|account|photo|repair|auto|tire|hvac|mechanical|cobbler|shoe/.test(v))
    return "Services & Trades";
  return "Shops & Retail";
}

/** Design-system label from the layout assignment. */
function designLabel(layout?: { archetype?: string; hero?: string }): string {
  if (layout?.archetype) return layout.archetype[0].toUpperCase() + layout.archetype.slice(1);
  if (layout?.hero === "collage") return "Collage";
  return "Warm";
}

export default function SitesIndex() {
  const items: SiteCard[] = CLIENTS.map((c) => ({
    slug: c.slug,
    href: c.slug === "flamengo" ? "/" : `/sites/${c.slug}`,
    name: c.site.business.name,
    vertical: c.vertical,
    address: c.site.business.address,
    cityState: `${c.site.business.city}, ${c.site.business.state}`,
    category: categorize(c.vertical),
    design: designLabel(c.layout),
    themeVars: c.themeVars,
    blurHero: getBlur(c.slug).hero,
  }));

  return (
    <main id="main" className="min-h-dvh bg-bg">
      {/* Speculation Rules (Chromium): prerender a card's site when the user
          hovers/starts clicking it ("moderate"), so the real document
          navigation that powers the cross-document view transition is
          instant. Non-supporting browsers ignore this script entirely. */}
      <script
        type="speculationrules"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            prerender: [
              {
                where: { or: [{ href_matches: "/sites/*" }, { href_matches: "/" }] },
                eagerness: "moderate",
              },
            ],
          }),
        }}
      />
      <section className="container-max py-20 lg:py-28">
        <header className="mx-auto max-w-2xl text-center">
          <p className="badge badge-primary mx-auto">DeKalb County, IL</p>
          <h1 className="mt-4 font-display text-4xl font-black text-ink sm:text-6xl">
            Generated Business Sites
          </h1>
          <p className="mx-auto mt-4 text-ink-soft">
            {CLIENTS.length} modern, fully bilingual (EN/ES) marketing sites — each
            discovered from open data, audited for a missing web presence, and built
            on one content-driven template with a per-vertical brand theme.
          </p>
        </header>

        <SitesExplorer items={items} />

        <p className="mx-auto mt-12 max-w-2xl text-center text-xs text-ink-soft">
          Spec/demo sites built for a local-business pitch. Business name, address, and
          phone come from public OpenStreetMap data; menus, prices, hours, and reviews
          are illustrative placeholders.
        </p>
      </section>
    </main>
  );
}
