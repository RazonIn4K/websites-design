import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Providers } from "@/components/Providers";
import { SitePage } from "@/components/SitePage";
import { DemoNotice } from "@/components/DemoNotice";
import { CLIENTS, getClient } from "@/lib/clients";
import { getBlur } from "@/lib/blur";
export const dynamicParams = false;
export function generateStaticParams() { return CLIENTS.map(c => ({slug:c.slug})); }
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata> { const {slug}=await params; const c=getClient(slug); return {title:`${c?.site.business.name ?? "Website"} — Design concept`,description:"Illustrative interactive design concept. No bookings, orders, messages or business affiliation.",robots:{index:false,follow:false}}; }
export default async function Example({params}:{params:Promise<{slug:string}>}) {const {slug}=await params;const c=getClient(slug);if(!c)notFound();return <Providers site={c.site} slug={c.slug} emojis={c.emojis} themeVars={c.themeVars} blur={getBlur(c.slug)} layout={c.layout}><DemoNotice/><SitePage archetype={c.layout?.archetype}/></Providers>;}
