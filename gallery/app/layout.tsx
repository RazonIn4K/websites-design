import type { Metadata, Viewport } from "next";
import { Fraunces, Inter, Archivo, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import "./gallery.css";
const fraunces = Fraunces({ subsets: ["latin"], style: ["normal", "italic"], axes: ["opsz"], variable: "--font-fraunces", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const archivo = Archivo({ subsets: ["latin"], variable: "--font-archivo", display: "swap", preload: false });
const bricolage = Bricolage_Grotesque({ subsets: ["latin"], axes: ["opsz"], variable: "--font-bricolage", display: "swap", preload: false });
export const metadata: Metadata = { title: "RazonWorks — Interactive design concepts", description: "Six interactive, illustrative website concepts. Generated imagery; no bookings, orders or inquiries.", robots: { index: false, follow: false } };
export const viewport: Viewport = { width: "device-width", initialScale: 1 };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
 return <html lang="en" suppressHydrationWarning className={`${fraunces.variable} ${inter.variable} ${archivo.variable} ${bricolage.variable}`}><body className="min-h-dvh antialiased"><a href="#main" className="demo-skip">Skip to content</a>{children}</body></html>;
}
