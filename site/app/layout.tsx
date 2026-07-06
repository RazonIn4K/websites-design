import type { Metadata, Viewport } from "next";
import { Fraunces, Inter, Archivo, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";

// Variable fonts (no `weight` array) — one woff2 with the full weight axis,
// fewer requests, and for Fraunces the `opsz` (optical-size) axis, its signature
// feature: large display type gets the high-contrast display cut automatically
// via `font-optical-sizing: auto`. Default display family (home + most clients),
// preloaded so the hero h1 doesn't FOUT.
const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--font-fraunces",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Industrial display alternative used by auto/HVAC themes (via --font-display).
const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
  preload: false, // only used by some clients via --font-display
});

// Warm, chunky, characterful display (variable: opsz/wdth/wght) — the
// signature face for the flagship + the playful retail cohort, where the
// high-fashion didone read off-register (design-critique pass, 2026-07).
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--font-bricolage",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "Local Business Sites — DeKalb, IL",
    template: "%s",
  },
  description: "Modern bilingual marketing sites generated for local DeKalb businesses.",
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fraunces.variable} ${inter.variable} ${archivo.variable} ${bricolage.variable}`}
    >
      <body className="min-h-dvh antialiased">
        {/* Mark JS as available before paint so scroll-reveal styles engage
            only when they can be driven (progressive enhancement). */}
        <script
          dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }}
        />
        <a
          href="#main"
          className="sr-only z-[100] rounded-full bg-primary px-4 py-2 font-semibold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
