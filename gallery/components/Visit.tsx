"use client";
import {useLang} from "@/components/LanguageProvider";
import {Reveal} from "@/components/motion";
import {LeadForm} from "@/components/LeadForm";
import {SectionHeader} from "@/components/SectionHeader";
export function Visit(){const{lang}=useLang();const es=lang==="es";return <section id="visit" className="section bg-surface"><div className="container-max"><SectionHeader eyebrow={es?"Interacción de ejemplo":"Example interaction"} heading={es?"Explore. Sin enviar nada.":"Explore. Without sending anything."}/><Reveal className="demo-visit-panel rounded-2xl bg-bg p-6 shadow-card sm:p-8"><h3 className="text-h3 text-ink">{es?"Un espacio para una futura acción":"A space for a future action"}</h3><LeadForm/></Reveal></div></section>;}
