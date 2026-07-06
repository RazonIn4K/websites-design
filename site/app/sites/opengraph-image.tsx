import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { CLIENTS } from "@/lib/clients";
import { OG_SIZE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";

/** Portfolio card for the /sites explorer itself. */
export default async function OgImage() {
  const dir = path.join(process.cwd(), "assets", "fonts");
  const [fraunces, inter] = await Promise.all([
    readFile(path.join(dir, "fraunces-900.ttf")),
    readFile(path.join(dir, "inter-600.ttf")),
  ]);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "linear-gradient(135deg, #8B2200 0%, #C13A0F 55%, #F5A623 130%)",
          color: "#fff",
          fontFamily: "Inter",
        }}
      >
        <div style={{ display: "flex", fontSize: 26, letterSpacing: 4, textTransform: "uppercase", color: "#FFD9A0" }}>
          DeKalb County · Chicago Corridor · IL
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "flex", fontFamily: "Fraunces", fontSize: 84, lineHeight: 1.02 }}>
            {CLIENTS.length} Generated Business Sites
          </div>
          <div style={{ display: "flex", fontSize: 30, color: "rgba(255,255,255,0.9)" }}>
            Fully bilingual EN·ES — discovered from open data, designed per vertical
          </div>
        </div>
        <div style={{ display: "flex", gap: 14 }}>
          {["Warm", "Editorial", "Authority", "Wellness", "Craft", "Collage"].map((t) => (
            <div
              key={t}
              style={{
                display: "flex",
                fontSize: 22,
                padding: "8px 22px",
                borderRadius: 999,
                border: "1.5px solid rgba(255,255,255,0.4)",
              }}
            >
              {t}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: [
      { name: "Fraunces", data: fraunces, weight: 900, style: "normal" },
      { name: "Inter", data: inter, weight: 600, style: "normal" },
    ] },
  );
}
