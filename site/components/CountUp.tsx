"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "motion/react";

/**
 * Count-up stat value. Renders the FINAL value in server HTML (no-JS and
 * pre-hydration readers always see the real number), then re-runs the count
 * from 0 the first time it scrolls into view. Non-numeric values ("Walk-Ins",
 * "Dogs · Cats") and reduced-motion render static — this is garnish only.
 */
export function CountUp({ value, className }: { value: string; className?: string }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });
  const [text, setText] = useState(value);

  // "Est. 1,250+ sq ft" → prefix "Est. ", number 1250 (grouped, 0 decimals), suffix "+ sq ft"
  const m = /^([^0-9]*)(\d{1,3}(?:,\d{3})*|\d+)(\.\d+)?(.*)$/.exec(value);

  useEffect(() => {
    if (!m || reduce || !inView) return;
    const grouped = m[2].includes(",");
    const decimals = m[3] ? m[3].length - 1 : 0;
    const target = parseFloat(m[2].replace(/,/g, "") + (m[3] ?? ""));
    const fmt = new Intl.NumberFormat("en-US", {
      useGrouping: grouped,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    const controls = animate(0, target, {
      duration: 1.3,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setText(`${m[1]}${fmt.format(v)}${m[4]}`),
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on first view
  }, [inView, reduce]);

  return (
    <span ref={ref} className={className}>
      {text}
    </span>
  );
}
