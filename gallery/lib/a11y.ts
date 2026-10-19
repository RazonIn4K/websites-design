import type { Lang } from "@/lib/content";

/**
 * Bilingual aria-labels / sr-only strings that are generic UI chrome (not
 * client-specific business copy), kept here so they localize with the language
 * toggle without duplicating across every client's copy.json.
 */
export const A11Y: Record<Lang, {
  languageSelector: string;
  openMenu: string;
  closeMenu: string;
  prevTestimonial: string;
  nextTestimonial: string;
  goToTestimonial: (n: number) => string;
  ratingStars: string;
  mapTitle: (name: string) => string;
  highlights: string;
  whyUs: string;
  quickActions: string;
  callLabel: string;
}> = {
  en: {
    languageSelector: "Language selector",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    prevTestimonial: "Previous testimonial",
    nextTestimonial: "Next testimonial",
    goToTestimonial: (n) => `Go to testimonial ${n}`,
    ratingStars: "Rated 5 out of 5 stars",
    mapTitle: (name) => `Map to ${name}`,
    highlights: "Why us",
    whyUs: "What sets us apart",
    quickActions: "Quick actions",
    callLabel: "Call",
  },
  es: {
    languageSelector: "Selector de idioma",
    openMenu: "Abrir menú",
    closeMenu: "Cerrar menú",
    prevTestimonial: "Testimonio anterior",
    nextTestimonial: "Siguiente testimonio",
    goToTestimonial: (n) => `Ir al testimonio ${n}`,
    ratingStars: "Calificado 5 de 5 estrellas",
    mapTitle: (name) => `Mapa a ${name}`,
    highlights: "Por qué nosotros",
    whyUs: "Lo que nos distingue",
    quickActions: "Acciones rápidas",
    callLabel: "Llamar",
  },
};
