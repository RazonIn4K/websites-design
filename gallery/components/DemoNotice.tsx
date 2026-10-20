"use client";
import { useLang } from "@/components/LanguageProvider";
import { razonWorksLinks } from "@/lib/navigation";
export function DemoNotice() {
  const { lang } = useLang();
  const es = lang === "es";
  const links = razonWorksLinks(lang);

  return (
    <aside
      className="demo-notice"
      aria-label={es ? "Aviso del concepto" : "Concept disclosure"}
    >
      <div className="demo-disclosure">
        <strong>
          {es ? "CONCEPTO · IMÁGENES GENERADAS" : "CONCEPT · GENERATED IMAGERY"}
        </strong>
        <span>
          {es
            ? "Sin afiliación, reservas, pedidos ni consultas reales."
            : "No affiliation, bookings, orders or real inquiries."}
        </span>
      </div>
      <nav
        className="demo-links"
        aria-label={
          es ? "RazonWorks y colección de diseños" : "RazonWorks and design collection"
        }
      >
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- Native export navigation deliberately avoids router prefetch. */}
        <a href="/">{es ? "Todos los diseños" : "All designs"}</a>
        <a className="demo-brand" href={links.home}>RazonWorks</a>
        <a href={links.contact}>
          {es ? "Contactar RazonWorks" : "Contact RazonWorks"}
        </a>
      </nav>
    </aside>
  );
}
