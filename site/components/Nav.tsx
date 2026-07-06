"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useReducedMotion } from "motion/react";
import { useLang } from "@/components/LanguageProvider";
import { LANGS } from "@/lib/content";
import { A11Y } from "@/lib/a11y";
import { sectionOrder, type SectionKey } from "@/lib/sections";
import { Phone, Menu, Close } from "@/components/icons";

function LangToggle({ scrolled }: { scrolled: boolean }) {
  const { lang, setLang } = useLang();
  return (
    <div
      className={`inline-flex items-center rounded-full border p-0.5 transition-colors ${
        scrolled ? "border-line/80 bg-white/60" : "border-white/40 bg-black/25 backdrop-blur"
      }`}
      role="group"
      aria-label={A11Y[lang].languageSelector}
    >
      {LANGS.map(({ code, label }) => (
        <button
          key={code}
          onClick={() => setLang(code)}
          aria-pressed={lang === code}
          className={`relative rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
            lang === code ? "text-white" : scrolled ? "text-ink-soft hover:text-ink" : "text-white/90 hover:text-white"
          }`}
        >
          {lang === code && (
            <motion.span
              layoutId="langPill"
              className="absolute inset-0 rounded-full bg-primary"
              transition={{ type: "spring", stiffness: 400, damping: 32 }}
            />
          )}
          <span className="relative z-10">{label}</span>
        </button>
      ))}
    </div>
  );
}

export function Nav() {
  const { t, biz, hasPhone, lang, layout } = useLang();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const openBtnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Mobile menu as a modal dialog: scroll-lock, focus-in, Escape, Tab-trap,
  // and return-focus to the trigger on close.
  useEffect(() => {
    if (!open) return;
    const opener = openBtnRef.current;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusables = () =>
      panelRef.current
        ? Array.from(
            panelRef.current.querySelectorAll<HTMLElement>(
              'a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])',
            ),
          )
        : [];
    focusables()[0]?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      } else if (e.key === "Tab") {
        const items = focusables();
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      opener?.focus();
    };
  }, [open]);

  // These heroes open on a LIGHT surface, so the transparent white-on-photo
  // nav would be invisible — force the glass/dark treatment.
  const lightHero = ["split", "editorial", "collage", "arch", "feast"].includes(layout.hero ?? "");
  const solid = scrolled || lightHero;
  const present = new Set<SectionKey>(sectionOrder(layout.archetype));
  const links = (
    [
      { href: "#menu", label: t.nav.menu, key: "menu" },
      { href: "#about", label: t.nav.about, key: "about" },
      { href: "#gallery", label: t.nav.gallery, key: "gallery" },
      { href: "#visit", label: t.nav.visit, key: "visit" },
    ] as { href: string; label: string; key: SectionKey }[]
  ).filter((l) => present.has(l.key) || (l.key === "about" && present.has("story")));

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        solid ? "glass shadow-glass" : "bg-transparent"
      }`}
    >
      <nav className="container-max flex h-16 items-center justify-between gap-4">
        <a href="#top" className="flex items-center gap-2 no-underline">
          <span className="grid h-9 w-9 place-items-center rounded-full gradient-brand font-display text-lg font-black text-white">
            {biz.shortName.charAt(0)}
          </span>
          <span className={`font-display text-xl font-black tracking-tight transition-colors ${solid ? "text-ink" : "text-white"}`}>
            {biz.shortName}
          </span>
        </a>

        <div className="hidden items-center gap-7 lg:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={`link-underline text-sm font-semibold no-underline transition-colors ${
                solid ? "text-ink-soft hover:text-primary" : "text-white/90 hover:text-white"
              }`}
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <LangToggle scrolled={solid} />
          <a
            href={hasPhone ? `tel:${biz.phoneHref}` : "#visit"}
            className="hidden items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white no-underline shadow-card transition-transform hover:-translate-y-0.5 hover:bg-primary-dark sm:inline-flex"
          >
            {hasPhone && <Phone className="h-4 w-4" />}
            {t.nav.order}
          </a>
          <button
            ref={openBtnRef}
            className={`grid h-10 w-10 place-items-center rounded-full border transition-colors lg:hidden ${
              solid ? "border-line bg-white/60 text-ink" : "border-white/40 bg-white/10 text-white"
            }`}
            onClick={() => setOpen(true)}
            aria-label={A11Y[lang].openMenu}
            aria-expanded={open}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </nav>

      {/* Scroll progress hairline */}
      <motion.div
        aria-hidden
        style={{ scaleX: reduce ? 1 : scrollYProgress }}
        className="absolute inset-x-0 bottom-0 h-0.5 origin-left gradient-brand"
      />

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="mobile-menu-title"
              className="glass-dark absolute inset-0 flex flex-col p-6"
            >
              <div className="flex items-center justify-between">
                <span id="mobile-menu-title" className="font-display text-2xl font-black text-white">{biz.shortName}</span>
                <button
                  className="grid h-10 w-10 place-items-center rounded-full border border-white/20 text-white"
                  onClick={() => setOpen(false)}
                  aria-label={A11Y[lang].closeMenu}
                >
                  <Close className="h-5 w-5" />
                </button>
              </div>
              <motion.ul
                className="mt-12 flex flex-col gap-2"
                initial="hidden"
                animate="show"
                variants={{ show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } } }}
              >
                {links.map((l) => (
                  <motion.li
                    key={l.href}
                    variants={{ hidden: { opacity: 0, x: -16 }, show: { opacity: 1, x: 0 } }}
                  >
                    <a
                      href={l.href}
                      onClick={() => setOpen(false)}
                      className="block py-3 font-display text-4xl font-black text-white no-underline"
                    >
                      {l.label}
                    </a>
                  </motion.li>
                ))}
              </motion.ul>
              <a
                href={hasPhone ? `tel:${biz.phoneHref}` : "#visit"}
                onClick={() => setOpen(false)}
                className="btn btn-primary mt-auto justify-center text-base"
              >
                {hasPhone && <Phone className="h-5 w-5" />}
                {hasPhone ? biz.phone : t.nav.order}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
