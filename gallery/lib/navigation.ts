// Keep this query aligned with Tailwind's lg:hidden menu breakpoint.
export const DESKTOP_MENU_QUERY = "(min-width: 64rem)";

export function closeMenuOnDesktop(
  media: Pick<MediaQueryList, "matches" | "addEventListener" | "removeEventListener">,
  close: () => void,
) {
  const synchronize = () => {
    if (media.matches) close();
  };
  media.addEventListener("change", synchronize);
  synchronize();
  return () => media.removeEventListener("change", synchronize);
}

export function razonWorksLinks(locale: "en" | "es") {
  return locale === "es"
    ? {
        home: "https://razonworks.com/es/",
        contact: "https://razonworks.com/es/contacto/",
      }
    : {
        home: "https://razonworks.com/",
        contact: "https://razonworks.com/contact/",
      };
}
