"use client";

import { useLang } from "@/components/LanguageProvider";
import { A11Y } from "@/lib/a11y";
import { Reveal } from "@/components/motion";
import { SectionHeader } from "@/components/SectionHeader";
import { LeadForm } from "@/components/LeadForm";
import { MapPin, Clock, Phone, ArrowRight } from "@/components/icons";

export function Visit() {
  const { t, biz, hasPhone, lang } = useLang();
  // Coordinate-mode embed (real OSM lat/lon): shows a clean pin WITHOUT the
  // stock Google place card — whose live star rating (e.g. 2.7★) otherwise
  // sits right next to the testimonials. Name-query only as fallback.
  const mapSrc =
    biz.lat != null && biz.lon != null
      ? `https://www.google.com/maps?q=${biz.lat},${biz.lon}&z=16&output=embed`
      : `https://www.google.com/maps?q=${encodeURIComponent(biz.mapsQuery)}&output=embed`;
  const directionsHref = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(biz.mapsQuery)}`;

  return (
    <section id="visit" className="section bg-surface">
      <div className="container-max">
        <SectionHeader eyebrow={t.nav.visit} heading={t.visit.heading} />

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          {/* Map + info — map stretches so this column bottom-aligns with the
              taller form column instead of leaving dead space under the cards */}
          <div className="flex flex-col gap-5">
            {/* bg-surface-alt shows while the map document streams in, so the
                card reads as a branded panel instead of a stark white void */}
            <Reveal className="flex-1 overflow-hidden rounded-2xl border border-line bg-surface-alt shadow-card">
              {/* map-tint pulls the Google chrome toward the page's neutral
                  register (the one rectangle no tenant palette can touch);
                  pointer interaction restores full color. */}
              <iframe
                src={mapSrc}
                title={A11Y[lang].mapTitle(biz.name)}
                className="map-tint h-full min-h-56 w-full sm:min-h-64"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </Reveal>

            {/* One quiet divided panel instead of two peer shadow cards — the
                map and the form carry the section's visual weight; contact
                facts read as reference material. */}
            <Reveal className="card-flat grid divide-y divide-line p-0 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
              <div className="p-6">
                <div className="flex items-center gap-2 text-primary">
                  <MapPin className="h-5 w-5" />
                  <h3 className="font-display text-lg font-bold text-ink">{t.visit.addressLabel}</h3>
                </div>
                <p className="mt-2 text-ink">
                  {biz.address}
                  <br />
                  {biz.city}, {biz.state} {biz.zip}
                </p>
                <a
                  href={directionsHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary"
                >
                  {t.visit.directions}
                  <ArrowRight className="h-4 w-4" />
                </a>
                {t.visit.neighborhood && (
                  <p className="mt-3 border-t border-line pt-3 text-sm italic text-ink-soft">
                    {t.visit.neighborhood}
                  </p>
                )}
                {hasPhone && (
                  <div className="mt-4 flex items-center gap-2 text-primary">
                    <Phone className="h-5 w-5" />
                    <a href={`tel:${biz.phoneHref}`} className="font-semibold no-underline">
                      {biz.phone}
                    </a>
                  </div>
                )}
              </div>

              <div className="p-6">
                <div className="flex items-center gap-2 text-primary">
                  <Clock className="h-5 w-5" />
                  <h3 className="font-display text-lg font-bold text-ink">{t.visit.hoursLabel}</h3>
                </div>
                <dl className="mt-3 space-y-1.5 text-sm">
                  {t.visit.hours.map((h) => (
                    <div key={h.day} className="flex justify-between gap-3">
                      <dt className="text-ink-soft">{h.day}</dt>
                      {/* nowrap + tabular so "9:00 PM" never orphans its meridiem */}
                      <dd className="whitespace-nowrap font-medium tabular-nums text-ink">{h.time}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </Reveal>
          </div>

          {/* Lead form */}
          <Reveal className="rounded-2xl bg-bg p-6 shadow-card sm:p-8" delay={0.1}>
            <h3 className="text-h3 text-ink">{t.form.heading}</h3>
            <p className="mb-5 mt-1 text-sm text-ink-soft">{t.form.subheading}</p>
            <LeadForm />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
