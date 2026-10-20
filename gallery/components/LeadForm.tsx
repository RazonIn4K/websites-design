"use client";
import { useState } from "react";
import { useLang } from "@/components/LanguageProvider";
import { useHydrated } from "@/lib/use-hydrated";

export function LeadForm() {
  const { lang } = useLang();
  const es = lang === "es";
  const ready = useHydrated();
  const [shown, setShown] = useState(false);

  return (
    <div id="lead" className="demo-action">
      <p>
        {es
          ? "Este panel demuestra una interacción local. No ingrese datos personales: no hay formulario, reserva ni servicio de mensajería."
          : "This panel demonstrates a local interaction. Do not enter personal information: there is no form, booking or messaging service."}
      </p>
      <button type="button" disabled={!ready} className="btn btn-primary mt-5" onClick={() => setShown(true)}>
        {es ? "Probar confirmación de ejemplo" : "Try demo acknowledgment"}
      </button>
      <p role="status" aria-live="polite" className="mt-4">
        {shown
          ? es
            ? "Vista previa completada. No se envió ninguna consulta ni se realizó una reserva."
            : "Preview complete. No inquiry was sent and no booking was made."
          : ""}
      </p>
      <noscript><p>Interactive acknowledgment requires JavaScript; nothing can be submitted.</p></noscript>
    </div>
  );
}
