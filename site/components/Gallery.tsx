"use client";

import Image from "next/image";
import { useLang } from "@/components/LanguageProvider";
import { Reveal } from "@/components/motion";
import { SectionHeader } from "@/components/SectionHeader";

// Mosaic that fully tiles a 3-row x 6-col grid (18 cells): two tall blocks,
// two squares, two wide landscapes — no empty cells.
const TILES = [
  { img: "g1", span: "sm:col-span-2 sm:row-span-2", size: "(min-width: 640px) 33vw, 50vw" },
  { img: "g2", span: "sm:col-span-2 sm:row-span-2", size: "(min-width: 640px) 33vw, 50vw" },
  { img: "g3", span: "sm:col-span-2", size: "(min-width: 640px) 33vw, 50vw" },
  { img: "g4", span: "sm:col-span-2", size: "(min-width: 640px) 33vw, 50vw" },
  { img: "g5", span: "sm:col-span-3", size: "(min-width: 640px) 50vw, 50vw" },
  { img: "g6", span: "sm:col-span-3", size: "(min-width: 640px) 50vw, 50vw" },
];

const STRIP = ["g1", "g2", "g3", "g4", "g5", "g6"];

export function Gallery() {
  const { t, imgBase, blur, layout } = useLang();
  const captions = t.gallery.captions;

  // ── Horizontal filmstrip (editorial/craft): native snap scroll, no-JS safe ──
  if (layout.gallery === "horizontal") {
    return (
      <section id="gallery" className="section overflow-x-clip">
        <div className="container-max relative">
          {/* Layered ghost type behind the header — outlined display word that
              drifts sideways with scroll (scroll-driven; static elsewhere). */}
          <span
            aria-hidden
            className="ghost-word ghost-scroll absolute -top-10 left-0 text-[clamp(4.5rem,11vw,9.5rem)]"
          >
            {t.hero.titleAccent}
          </span>
          <SectionHeader eyebrow={t.nav.gallery} heading={t.gallery.heading} sub={t.gallery.subheading} />
        </div>
        <div
          tabIndex={0}
          role="group"
          aria-label={t.gallery.heading}
          className="no-scrollbar flex snap-x-mandatory gap-4 overflow-x-auto px-[var(--gutter)] pb-4 [scroll-padding-left:var(--gutter)]"
        >
          {STRIP.map((img, i) => (
            <figure
              key={img}
              className="group relative aspect-[3/4] w-[78vw] shrink-0 snap-start overflow-hidden rounded-2xl shadow-card sm:w-[360px]"
            >
              <Image
                src={`${imgBase}/${img}.jpg`}
                alt=""
                fill
                sizes="(min-width: 640px) 360px, 78vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                {...(blur[img] ? { placeholder: "blur" as const, blurDataURL: blur[img] } : {})}
              />
              <span className="badge-overlay absolute left-3 top-3 rounded-full px-2 py-0.5 text-xs font-semibold text-white">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <figcaption className="absolute inset-x-0 bottom-0 p-4 font-display text-sm font-semibold italic leading-tight text-white">
                {captions[i] ?? ""}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section id="gallery" className="section container-max">
      <SectionHeader eyebrow={t.nav.gallery} heading={t.gallery.heading} sub={t.gallery.subheading} />

      <div className="grid auto-rows-[180px] grid-cols-2 gap-3 sm:auto-rows-[200px] sm:grid-cols-6">
        {TILES.map((tile, i) => (
          <Reveal
            key={tile.img}
            as="figure"
            delay={i * 0.05}
            className={`reveal-clip group hover-lift relative overflow-hidden rounded-2xl shadow-card ${tile.span}`}
          >
            <Image
              src={`${imgBase}/${tile.img}.jpg`}
              alt=""
              fill
              sizes={tile.size}
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              {...(blur[tile.img] ? { placeholder: "blur" as const, blurDataURL: blur[tile.img] } : {})}
            />
            <span className="badge-overlay absolute left-3 top-3 rounded-full px-2 py-0.5 text-xs font-semibold text-white">
              {String(i + 1).padStart(2, "0")}
            </span>
            {/* Always-readable caption on touch; hover deepens on pointer devices */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent transition-colors duration-300 [@media(hover:hover)]:from-black/40 [@media(hover:hover)]:group-hover:from-black/80" />
            <figcaption className="absolute inset-x-0 bottom-0 p-4 font-display text-sm font-semibold italic leading-tight text-white transition duration-300 [@media(hover:hover)]:translate-y-1 [@media(hover:hover)]:opacity-90 [@media(hover:hover)]:group-hover:translate-y-0 [@media(hover:hover)]:group-hover:opacity-100">
              {captions[i] ?? ""}
            </figcaption>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
