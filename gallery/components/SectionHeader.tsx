import { Reveal } from "@/components/motion";

/**
 * Consistent editorial section header: optional running index, a tracked
 * eyebrow with a short rule, an h2, and an optional lead paragraph.
 * One component controls header rhythm across all sites.
 */
export function SectionHeader({
  eyebrow,
  heading,
  sub,
  align = "center",
  index,
  eyebrowColor = "var(--color-primary-dark)",
}: {
  eyebrow: string;
  heading: string;
  sub?: string;
  align?: "center" | "left";
  index?: string;
  eyebrowColor?: string;
}) {
  const center = align === "center";
  // Statement headings (About passes its full lead sentence here) drop a size
  // tier and gain wrap room past ~18 words — step-4 at that length reads as a
  // wall, not a headline.
  const dense = heading.trim().split(/\s+/).length > 18;
  return (
    <Reveal
      className={`mb-[var(--header-gap)] ${center ? `mx-auto ${dense ? "max-w-3xl" : "max-w-2xl"} text-center` : dense ? "max-w-3xl" : "max-w-2xl"}`}
    >
      <div
        className={`flex items-center gap-3 ${center ? "justify-center" : ""}`}
        style={{ color: eyebrowColor }}
      >
        {index && (
          <span className="font-body text-[var(--step--1)] font-semibold tabular-nums text-ink-soft">
            {index}
          </span>
        )}
        <span aria-hidden className="inline-block h-px w-6 bg-current opacity-60" />
        <span className="eyebrow" style={{ color: eyebrowColor }}>{eyebrow}</span>
      </div>
      <h2
        className="text-h2 mt-3 text-ink"
        style={dense ? { fontSize: "var(--step-3)", lineHeight: 1.14 } : undefined}
      >
        {heading}
      </h2>
      {sub && <p className={`text-lead mt-4 ${center ? "mx-auto" : ""}`}>{sub}</p>}
    </Reveal>
  );
}
