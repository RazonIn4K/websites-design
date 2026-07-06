"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "motion/react";

/**
 * Pointer-tracking 3D tilt for photo cards. Enhancement-only: renders a plain
 * <figure> on touch devices, under reduced motion, and before hydration, so
 * there is zero behavior change where tilt can't be felt.
 */
export function TiltFigure({ className, children }: { className?: string; children: ReactNode }) {
  const reduce = useReducedMotion();
  const [fine, setFine] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const rx = useSpring(useMotionValue(0), { stiffness: 220, damping: 22 });
  const ry = useSpring(useMotionValue(0), { stiffness: 220, damping: 22 });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- client-only capability sniff after mount (matches LanguageProvider precedent)
    setFine(window.matchMedia("(hover: hover) and (pointer: fine)").matches);
  }, []);

  if (!fine || reduce) return <figure className={className}>{children}</figure>;

  return (
    <motion.figure
      ref={ref}
      className={className}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 900 }}
      onPointerMove={(e) => {
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        const dx = (e.clientX - r.left) / r.width - 0.5;
        const dy = (e.clientY - r.top) / r.height - 0.5;
        rx.set(dy * -7);
        ry.set(dx * 9);
      }}
      onPointerLeave={() => {
        rx.set(0);
        ry.set(0);
      }}
    >
      {children}
    </motion.figure>
  );
}
