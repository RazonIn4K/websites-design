"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode, type ElementType } from "react";

type RevealTag = "div" | "section" | "article" | "li" | "ul" | "figure";

/**
 * Reveal — fades/raises content into view the first time it scrolls onscreen,
 * using IntersectionObserver + CSS (see `.reveal` in globals.css).
 *
 * Progressive enhancement: content is visible by default and only hidden once
 * <html> has the `js` class, so it can never get stuck invisible (no-JS,
 * reduced-motion, or a hidden tab all render it visible).
 */
export function Reveal({
  children,
  className = "",
  delay = 0,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: RevealTag;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || el.classList.contains("is-visible")) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            el.classList.add("is-visible");
            io.disconnect();
          }
        }
      },
      /* Trigger a bit earlier so sections feel alive while still scrolling in */
      { rootMargin: "0px 0px -4% 0px", threshold: 0.06 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const style = delay
    ? ({ "--reveal-delay": `${Math.round(delay * 1000)}ms` } as CSSProperties)
    : undefined;

  const Comp = as as ElementType;
  return (
    <Comp ref={ref} className={`reveal ${className}`.trim()} style={style}>
      {children}
    </Comp>
  );
}
