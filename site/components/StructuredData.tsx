import type { Business } from "@/lib/content";

// Exact schema.org types that warrant a priceRange (food + retail). Substring
// matching is avoided so "BarberShop" no longer trips a "Bar" match, and
// service/medical/legal/financial/vet/shelter types are correctly excluded.
const COMMERCIAL = new Set([
  "Restaurant",
  "FastFoodRestaurant",
  "BarOrPub",
  "BarBecueRestaurant",
  "CafeOrCoffeeShop",
  "Bakery",
  "Store",
  "GroceryStore",
  "PetStore",
]);

/**
 * LocalBusiness JSON-LD for rich results / local SEO. Rendered server-side.
 * `types` lets each vertical declare a more specific schema.org type.
 * Hand-serialized, so absolute `url`/`image` are threaded in (no metadataBase).
 */
export function StructuredData({
  business,
  description,
  url,
  image,
  types = ["LocalBusiness"],
}: {
  business: Business;
  description: string;
  url?: string;
  image?: string;
  types?: string[];
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": types.length === 1 ? types[0] : types,
    name: business.name,
    url: url || undefined,
    image: image || undefined,
    telephone: business.phone || undefined,
    // Only meaningful for commercial verticals (not the shelter / clinics).
    ...(types.some((t) => COMMERCIAL.has(t)) ? { priceRange: "$$" } : {}),
    address: {
      "@type": "PostalAddress",
      streetAddress: business.address,
      addressLocality: business.city,
      addressRegion: business.state,
      postalCode: business.zip,
      addressCountry: "US",
    },
    // Real OSM coordinates + cuisine tags only — demo hours/ratings are
    // deliberately NOT emitted (structured data must not assert demo content
    // as fact).
    ...(business.lat != null && business.lon != null
      ? { geo: { "@type": "GeoCoordinates", latitude: business.lat, longitude: business.lon } }
      : {}),
    ...(business.cuisine && types.some((t) => t.includes("Restaurant") || t === "CafeOrCoffeeShop" || t === "BarOrPub")
      ? { servesCuisine: business.cuisine }
      : {}),
    hasMap: `https://www.google.com/maps?q=${encodeURIComponent(business.mapsQuery)}`,
    description,
    areaServed: `${business.city}, ${business.state}`,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
