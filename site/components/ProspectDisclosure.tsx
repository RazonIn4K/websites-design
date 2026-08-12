"use client";

import { useLang } from "@/components/LanguageProvider";

const ORDERING_URL = "https://flamingorestaurantdekalb.com/";

const disclosure = {
  en: {
    label: "Illustrative prospect concept",
    text: "This is not Flamingo’s official website and is not owner-approved. Menu, hours, photos, reviews, reservations, and all other content are examples.",
    link: "Use the live external ordering site for current ordering",
  },
  es: {
    label: "Concepto ilustrativo para prospección",
    text: "Este no es el sitio web oficial de Flamingo y no está aprobado por el propietario. El menú, los horarios, las fotos, las reseñas, las reservaciones y todo el contenido restante son ejemplos.",
    link: "Use el sitio externo de pedidos reales para información actual",
  },
} as const;

export function ProspectDisclosure() {
  const { lang } = useLang();
  const note = disclosure[lang];

  return (
    <aside
      data-prospect-disclosure
      role="note"
      className="mt-16 border-y border-primary/30 bg-primary/10 text-ink"
    >
      <div className="container-max py-4 sm:flex sm:items-center sm:justify-between sm:gap-6">
        <p className="text-sm leading-relaxed">
          <strong className="font-bold">{note.label}.</strong> {note.text}
        </p>
        <a
          href={ORDERING_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="link-underline mt-2 inline-flex shrink-0 text-sm font-semibold text-primary sm:mt-0"
        >
          {note.link} →
        </a>
      </div>
    </aside>
  );
}
