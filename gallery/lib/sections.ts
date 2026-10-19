// Single source of truth for per-archetype section ORDER/SELECTION, shared by
// SitePage (what to render) and Nav (which anchor links to show).

export type SectionKey =
  | "hero" | "highlights" | "menu" | "about"
  | "gallery" | "testimonials" | "marquee" | "visit" | "cta"
  | "process" | "faq" | "ritual" | "story";

export type Archetype = "default" | "editorial" | "authority" | "wellness" | "craft";

export const SECTION_ORDER: Record<Archetype, SectionKey[]> = {
  default: ["hero", "highlights", "menu", "about", "gallery", "testimonials", "marquee", "visit", "cta"],
  // Fine dining: lead with the carte (no loud ticker); a numbered index + a
  // pinned provenance Story (replaces About) + a horizontal photo filmstrip.
  editorial: ["hero", "menu", "highlights", "story", "gallery", "testimonials", "visit", "cta"],
  // Professional/medical: structure carries trust — credentials + process + FAQ,
  // no Gallery/Marquee.
  authority: ["hero", "highlights", "process", "menu", "about", "testimonials", "faq", "visit", "cta"],
  // Beauty/wellness: booking-led, calm; a guided "ritual" flow, no loud Marquee.
  wellness: ["hero", "highlights", "menu", "ritual", "about", "gallery", "testimonials", "visit", "cta"],
  // Craft/retail/gym: punchy, product-first; Marquee up top, Highlights after menu.
  craft: ["hero", "marquee", "menu", "highlights", "gallery", "about", "testimonials", "visit", "cta"],
};

export function sectionOrder(archetype?: Archetype): SectionKey[] {
  return SECTION_ORDER[archetype ?? "default"] ?? SECTION_ORDER.default;
}
