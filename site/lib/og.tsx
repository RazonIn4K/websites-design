import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const OG_SIZE = { width: 1200, height: 630 };

/** Repo-local TTFs (satori can't use woff2) so builds stay hermetic. */
async function fonts() {
  const dir = path.join(process.cwd(), "assets", "fonts");
  const [fraunces, inter] = await Promise.all([
    readFile(path.join(dir, "fraunces-900.ttf")),
    readFile(path.join(dir, "inter-600.ttf")),
  ]);
  return [
    { name: "Fraunces", data: fraunces, weight: 900 as const, style: "normal" as const },
    { name: "Inter", data: inter, weight: 600 as const, style: "normal" as const },
  ];
}

/**
 * Branded social card: brand-gradient type panel + the site's hero photo.
 * Colors come from the client's own theme vars, so every card is on-palette.
 */
export async function ogCard({
  name,
  shortName,
  vertical,
  cityState,
  vars,
  slug,
}: {
  name: string;
  shortName: string;
  vertical: string;
  cityState: string;
  vars: Record<string, string>;
  slug: string;
}) {
  const primary = vars["--color-primary"] ?? "#C13A0F";
  const primaryDark = vars["--color-primary-dark"] ?? "#8B2200";
  const accent = vars["--color-accent"] ?? "#F5A623";
  const hero = await readFile(path.join(process.cwd(), "public", "img", slug, "hero.jpg"));
  const heroSrc = `data:image/jpeg;base64,${hero.toString("base64")}`;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", fontFamily: "Inter" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            flexGrow: 1,
            flexBasis: "58%",
            padding: "56px 60px",
            background: `linear-gradient(135deg, ${primaryDark} 0%, ${primary} 100%)`,
            color: "#fff",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 64,
                height: 64,
                borderRadius: 999,
                background: "rgba(255,255,255,0.16)",
                border: "2px solid rgba(255,255,255,0.35)",
                fontFamily: "Fraunces",
                fontSize: 34,
              }}
            >
              {shortName.charAt(0)}
            </div>
            <div style={{ display: "flex", fontSize: 24, letterSpacing: 3, textTransform: "uppercase", color: accent }}>
              {vertical}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
            <div style={{ display: "flex", fontFamily: "Fraunces", fontSize: name.length > 26 ? 62 : 76, lineHeight: 1.04 }}>
              {name}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <div style={{ display: "flex", fontSize: 27, color: "rgba(255,255,255,0.85)" }}>{cityState}</div>
              <div
                style={{
                  display: "flex",
                  fontSize: 20,
                  padding: "6px 18px",
                  borderRadius: 999,
                  border: "1.5px solid rgba(255,255,255,0.4)",
                  color: "rgba(255,255,255,0.9)",
                }}
              >
                EN · ES
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexGrow: 1, flexBasis: "42%" }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- satori element, not DOM */}
          <img src={heroSrc} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: await fonts() },
  );
}
