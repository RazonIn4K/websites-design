import type { SiteContent } from "@/lib/content";
import flamengo from "@/content/copy.json";
import copy1 from "@/content/clients/growing-place/copy.json";
import theme1 from "@/content/clients/growing-place/theme.json";
import copy2 from "@/content/clients/arcada-theater/copy.json";
import theme2 from "@/content/clients/arcada-theater/theme.json";
import copy3 from "@/content/clients/andersons-toyshop/copy.json";
import theme3 from "@/content/clients/andersons-toyshop/theme.json";
import copy4 from "@/content/clients/leza-nail-spa/copy.json";
import theme4 from "@/content/clients/leza-nail-spa/theme.json";
import copy5 from "@/content/clients/a1-auto/copy.json";
import theme5 from "@/content/clients/a1-auto/theme.json";
export interface SiteLayout {archetype?:"editorial"|"authority"|"wellness"|"craft";hero?:"left"|"centered"|"split"|"editorial"|"collage"|"arch"|"feast";menuKind?:"menu"|"services"|"carte"|"shelf";highlights?:"credentials"|"index";gallery?:"horizontal";steps?:"deck";story?:"scrolly";reviews?:"spotlight"|"wall"|"grid";edge?:"hard"|"crisp";surface?:"ink"|"mono";tone?:"calm"|"editorial"|"energetic";}
export interface ClientSite {slug:string;vertical:string;site:SiteContent;themeVars:Record<string,string>;emojis:string[];schemaTypes:string[];layout?:SiteLayout;}
function stripContact<T>(value:T,locale:"en"|"es"="en"):T {
 if(typeof value==="string") {
  const hasContact=/(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}|https?:\/\/[^\s]+|[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/.test(value);
  return (hasContact ? (locale==="es" ? "Contenido ilustrativo de un concepto. No se aceptan reservas, pedidos ni consultas reales." : "Illustrative concept content. No bookings, orders or real inquiries are accepted.") : value) as T;
 }
 if(Array.isArray(value))return value.map(item=>stripContact(item,locale)) as T;
 if(value&&typeof value==="object")return Object.fromEntries(Object.entries(value).map(([key,item])=>[key,stripContact(item,key==="es"?"es":key==="en"?"en":locale)])) as T;
 return value;
}
function concept(original:SiteContent):SiteContent {const source=stripContact(original);return {...source,business:{...source.business,phone:"",phoneHref:"",address:"",city:"",state:"",zip:"",mapsQuery:"",lat:undefined,lon:undefined},en:{...source.en,nav:{...source.en.nav,order:"Try the demo"},hero:{...source.en.hero,ctaSecondary:"Explore the demo",badge:"Illustrative design concept"},cta:{...source.en.cta,button:"Try the demo"},about:{...source.en.about,stats:[]},testimonials:{heading:"",items:[]}},es:{...source.es,nav:{...source.es.nav,order:"Probar el ejemplo"},hero:{...source.es.hero,ctaSecondary:"Explorar el ejemplo",badge:"Concepto de diseño ilustrativo"},cta:{...source.es.cta,button:"Probar el ejemplo"},about:{...source.es.about,stats:[]},testimonials:{heading:"",items:[]}}};}
export const CLIENTS:ClientSite[]=[{slug:"flamengo",vertical:"Restaurant",site:concept(flamengo),themeVars:{...{},"--font-display":"var(--font-bricolage)"},emojis:["✦","◈","✧","◇","✦","◈"],schemaTypes:[],layout:{}},
{slug:"growing-place",vertical:"Garden retail",site:concept(copy1),themeVars:theme1.vars,emojis:["✦","◈","✧","◇","✦","◈"],schemaTypes:[],layout:{"archetype": "editorial", "hero": "arch", "tone": "calm", "menuKind": "shelf", "gallery": "horizontal"}},
{slug:"arcada-theater",vertical:"Arts & events",site:concept(copy2),themeVars:theme2.vars,emojis:["✦","◈","✧","◇","✦","◈"],schemaTypes:[],layout:{"archetype": "editorial", "hero": "editorial", "tone": "editorial", "menuKind": "carte", "highlights": "index", "gallery": "horizontal", "story": "scrolly"}},
{slug:"andersons-toyshop",vertical:"Toy retail",site:concept(copy3),themeVars:{...theme3.vars,"--font-display":"var(--font-bricolage)"},emojis:["✦","◈","✧","◇","✦","◈"],schemaTypes:[],layout:{"menuKind": "shelf", "hero": "collage"}},
{slug:"leza-nail-spa",vertical:"Wellness",site:concept(copy4),themeVars:theme4.vars,emojis:["✦","◈","✧","◇","✦","◈"],schemaTypes:[],layout:{"archetype": "wellness", "hero": "editorial", "tone": "editorial", "surface": "mono", "menuKind": "services", "highlights": "credentials", "steps": "deck"}},
{slug:"a1-auto",vertical:"Automotive services",site:concept(copy5),themeVars:{...theme5.vars,"--font-display":"var(--font-archivo)"},emojis:["✦","◈","✧","◇","✦","◈"],schemaTypes:[],layout:{"archetype": "craft", "hero": "split", "edge": "hard", "tone": "energetic", "highlights": "credentials", "menuKind": "services", "gallery": "horizontal"}}];
export const getClient=(slug:string)=>CLIENTS.find(c=>c.slug===slug);
