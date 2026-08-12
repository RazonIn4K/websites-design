import { Fragment, type ReactNode } from "react";
import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { Highlights } from "@/components/Highlights";
import { MenuSection } from "@/components/MenuSection";
import { About } from "@/components/About";
import { Gallery } from "@/components/Gallery";
import { Testimonials } from "@/components/Testimonials";
import { Visit } from "@/components/Visit";
import { Marquee } from "@/components/Marquee";
import { Steps } from "@/components/Steps";
import { Faq } from "@/components/Faq";
import { Story } from "@/components/Story";
import { CtaBand, Footer } from "@/components/Footer";
import { MobileBar } from "@/components/MobileBar";
import { ProspectDisclosure } from "@/components/ProspectDisclosure";
import { type Archetype, type SectionKey, sectionOrder } from "@/lib/sections";

/** Full one-page site. Section order is driven by the client's archetype. */
export function SitePage({
  archetype,
  prospectDemo = false,
}: {
  archetype?: Archetype;
  prospectDemo?: boolean;
}) {
  const sections: Record<SectionKey, ReactNode> = {
    hero: <Hero />,
    highlights: <Highlights />,
    menu: <MenuSection />,
    about: <About />,
    gallery: <Gallery />,
    testimonials: <Testimonials />,
    marquee: <Marquee />,
    process: <Steps which="process" />,
    ritual: <Steps which="ritual" />,
    faq: <Faq />,
    story: <Story />,
    visit: <Visit leadEnabled={!prospectDemo} />,
    cta: <CtaBand />,
  };
  const order = sectionOrder(archetype);

  return (
    <>
      <Nav />
      <main id="main">
        {prospectDemo && <ProspectDisclosure />}
        {order.map((key) => (
          <Fragment key={key}>{sections[key]}</Fragment>
        ))}
      </main>
      <Footer />
      <MobileBar />
    </>
  );
}
