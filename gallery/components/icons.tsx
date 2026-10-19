import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  // Scope hook, not a class: callers spread their own className after base,
  // which would clobber a class. [data-edge]/[data-tone] CSS re-voices stroke
  // weight/caps through this attribute (see globals.css v3).
  "data-icon": true,
  // Icons are decorative by default; labelled controls supply their own name.
  // A specific usage can re-expose via {...p} (e.g. aria-hidden={false}).
  "aria-hidden": true,
  focusable: false,
};

export const Flame = (p: IconProps) => (
  <svg {...base} {...p}><path d="M12 2c1 3 4 4.5 4 8a4 4 0 1 1-8 0c0-1.2.4-2 1-2.8C9 9 9 7 12 2Z" /><path d="M12 22a6 6 0 0 0 6-6c0-2-1-3.5-2-4.5.2 2.2-1 3.5-2 4 .5-2-.5-3.8-2-5-3 2-4 4-4 5.5A6 6 0 0 0 12 22Z" /></svg>
);

export const Leaf = (p: IconProps) => (
  <svg {...base} {...p}><path d="M11 20A7 7 0 0 1 4 13c0-5 4-9 16-9 0 10-5 14-9 16Z" /><path d="M5 19c4-5 8-7 13-8" /></svg>
);

export const IceCream = (p: IconProps) => (
  <svg {...base} {...p}><path d="M8 11a4 4 0 1 1 8 0" /><path d="M8 11h8l-3.4 8.5a.7.7 0 0 1-1.2 0L8 11Z" /><path d="M9.5 14.5h5M10.5 17.5h3" /></svg>
);

export const Heart = (p: IconProps) => (
  <svg {...base} {...p}><path d="M12 20s-7-4.3-9.3-9C1.3 8 3 4.8 6.2 4.8c2 0 3.2 1.2 3.8 2.3.6-1.1 1.8-2.3 3.8-2.3 3.2 0 4.9 3.2 3.5 6.2C19 15.7 12 20 12 20Z" /></svg>
);

export const Phone = (p: IconProps) => (
  <svg {...base} {...p}><path d="M5 3h3l2 5-2.5 1.5a12 12 0 0 0 6 6L16 13l5 2v3a2 2 0 0 1-2.2 2A17 17 0 0 1 3 5.2 2 2 0 0 1 5 3Z" /></svg>
);

export const MapPin = (p: IconProps) => (
  <svg {...base} {...p}><path d="M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11Z" /><circle cx="12" cy="10" r="2.6" /></svg>
);

export const Clock = (p: IconProps) => (
  <svg {...base} {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></svg>
);

export const ArrowRight = (p: IconProps) => (
  <svg {...base} {...p}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);

export const ChevronDown = (p: IconProps) => (
  <svg {...base} {...p}><path d="m6 9 6 6 6-6" /></svg>
);

export const ChevronLeft = (p: IconProps) => (
  <svg {...base} {...p}><path d="m15 6-6 6 6 6" /></svg>
);

export const Star = (p: IconProps) => (
  <svg {...base} {...p} fill="currentColor" stroke="none"><path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.9 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9L12 2.5Z" /></svg>
);

export const Menu = (p: IconProps) => (
  <svg {...base} {...p}><path d="M4 7h16M4 12h16M4 17h16" /></svg>
);

export const Close = (p: IconProps) => (
  <svg {...base} {...p}><path d="M6 6l12 12M18 6 6 18" /></svg>
);

export const Instagram = (p: IconProps) => (
  <svg {...base} {...p}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="3.6" /><circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" /></svg>
);

export const Facebook = (p: IconProps) => (
  <svg {...base} {...p}><path d="M14 8h2.5V4.5H14c-2.2 0-3.5 1.4-3.5 3.6V10H8v3.5h2.5V21H14v-7.5h2.4l.6-3.5H14V8.5c0-.4.2-.5.6-.5Z" /></svg>
);

export const Sparkle = (p: IconProps) => (
  <svg {...base} {...p}><path d="M12 3c.6 3.6 1.8 4.8 5.4 5.4-3.6.6-4.8 1.8-5.4 5.4-.6-3.6-1.8-4.8-5.4-5.4C10.2 7.8 11.4 6.6 12 3Z" /><path d="M18.5 14c.3 1.8.9 2.4 2.7 2.7-1.8.3-2.4.9-2.7 2.7-.3-1.8-.9-2.4-2.7-2.7 1.8-.3 2.4-.9 2.7-2.7Z" /></svg>
);

export const Wrench = (p: IconProps) => (
  <svg {...base} {...p}><path d="M14.7 6.3a4 4 0 0 1-5.2 5.2L5 16l3 3 4.5-4.5a4 4 0 0 1 5.2-5.2l-2.3 2.3-2-2 2.3-2.3Z" /></svg>
);

export const Car = (p: IconProps) => (
  <svg {...base} {...p}><path d="M3 13l1.8-5A2 2 0 0 1 6.7 6.7h10.6a2 2 0 0 1 1.9 1.3L21 13M5 17h14M3 13h18v4H3z" /><circle cx="7.5" cy="17.5" r="1.6" /><circle cx="16.5" cy="17.5" r="1.6" /></svg>
);

export const Shield = (p: IconProps) => (
  <svg {...base} {...p}><path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3Z" /><path d="m9 12 2 2 4-4" /></svg>
);

export const Gauge = (p: IconProps) => (
  <svg {...base} {...p}><path d="M4 17a8 8 0 1 1 16 0" /><path d="M12 17l4-5" /><circle cx="12" cy="17" r="1.2" fill="currentColor" stroke="none" /></svg>
);

export const Scissors = (p: IconProps) => (
  <svg {...base} {...p}><circle cx="6" cy="6" r="2.4" /><circle cx="6" cy="18" r="2.4" /><path d="M8 7.5 20 18M8 16.5 20 6" /></svg>
);

export const Razor = (p: IconProps) => (
  <svg {...base} {...p}><path d="M14 3l7 7-9 9-3-3 9-9" /><path d="M11 6 4 13l3 3" /></svg>
);

export const Crown = (p: IconProps) => (
  <svg {...base} {...p}><path d="M4 8l3.5 4L12 6l4.5 6L20 8l-1.5 10h-13L4 8Z" /></svg>
);

export const Snowflake = (p: IconProps) => (
  <svg {...base} {...p}><path d="M12 3v18M4.5 7.5l15 9M19.5 7.5l-15 9" /><path d="M12 6.5 9.5 5M12 6.5 14.5 5M12 17.5 9.5 19M12 17.5 14.5 19" /></svg>
);

export const Thermometer = (p: IconProps) => (
  <svg {...base} {...p}><path d="M14 14V5a2 2 0 0 0-4 0v9a4 4 0 1 0 4 0Z" /><path d="M12 14v-4" /></svg>
);

export const Home = (p: IconProps) => (
  <svg {...base} {...p}><path d="M4 11l8-7 8 7" /><path d="M6 10v9h12v-9" /><path d="M10 19v-5h4v5" /></svg>
);

export const Wind = (p: IconProps) => (
  <svg {...base} {...p}><path d="M3 9h10a2.5 2.5 0 1 0-2.5-2.5M3 14h14a2.5 2.5 0 1 1-2.5 2.5M3 12h7" /></svg>
);

export const Check = (p: IconProps) => (
  <svg {...base} {...p}><path d="M5 12.5 10 17l9-10" /></svg>
);

export const Droplet = (p: IconProps) => (
  <svg {...base} {...p}><path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z" /></svg>
);

export const ICONS: Record<string, (p: IconProps) => React.ReactElement> = {
  flame: Flame, leaf: Leaf, icecream: IceCream, heart: Heart,
  wrench: Wrench, car: Car, shield: Shield, clock: Clock, gauge: Gauge,
  scissors: Scissors, razor: Razor, sparkle: Sparkle, star: Star, crown: Crown,
  snowflake: Snowflake, thermometer: Thermometer, home: Home, wind: Wind,
  check: Check, droplet: Droplet,
};
