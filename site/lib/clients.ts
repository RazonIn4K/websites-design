import { flamengo, DEFAULT_EMOJIS, type SiteContent } from "@/lib/content";

import a1Copy from "@/content/clients/a1-auto/copy.json";
import a1Theme from "@/content/clients/a1-auto/theme.json";
import barberCopy from "@/content/clients/university-city-barbershop/copy.json";
import barberTheme from "@/content/clients/university-city-barbershop/theme.json";
import hvacCopy from "@/content/clients/dekalb-mechanical/copy.json";
import hvacTheme from "@/content/clients/dekalb-mechanical/theme.json";
import chCopy from "@/content/clients/china-house/copy.json";
import chTheme from "@/content/clients/china-house/theme.json";
import vetCopy from "@/content/clients/genoa-animal-hospital/copy.json";
import vetTheme from "@/content/clients/genoa-animal-hospital/theme.json";
import gymCopy from "@/content/clients/realize-athletics/copy.json";
import gymTheme from "@/content/clients/realize-athletics/theme.json";
import nailCopy from "@/content/clients/leza-nail-spa/copy.json";
import nailTheme from "@/content/clients/leza-nail-spa/theme.json";
import eyeCopy from "@/content/clients/friedrichs-eye/copy.json";
import eyeTheme from "@/content/clients/friedrichs-eye/theme.json";
import farmCopy from "@/content/clients/woodys-orchard/copy.json";
import farmTheme from "@/content/clients/woodys-orchard/theme.json";
import orthoCopy from "@/content/clients/todd-curtis-orthodontist/copy.json";
import orthoTheme from "@/content/clients/todd-curtis-orthodontist/theme.json";
import pizzaCopy from "@/content/clients/pizza-villa/copy.json";
import pizzaTheme from "@/content/clients/pizza-villa/theme.json";
import montCopy from "@/content/clients/the-montcler/copy.json";
import montTheme from "@/content/clients/the-montcler/theme.json";
import cafeCopy from "@/content/clients/dearborn-cafe/copy.json";
import cafeTheme from "@/content/clients/dearborn-cafe/theme.json";
import pubCopy from "@/content/clients/lord-stanleys/copy.json";
import pubTheme from "@/content/clients/lord-stanleys/theme.json";
import mvpCopy from "@/content/clients/mvps-sports-bar/copy.json";
import mvpTheme from "@/content/clients/mvps-sports-bar/theme.json";
import tireCopy from "@/content/clients/lovells-tire/copy.json";
import tireTheme from "@/content/clients/lovells-tire/theme.json";
import beasCopy from "@/content/clients/beas-wok/copy.json";
import beasTheme from "@/content/clients/beas-wok/theme.json";
import nutriCopy from "@/content/clients/wired-nutrition/copy.json";
import nutriTheme from "@/content/clients/wired-nutrition/theme.json";
import bowlCopy from "@/content/clients/bowlrrito/copy.json";
import bowlTheme from "@/content/clients/bowlrrito/theme.json";
import hairCopy from "@/content/clients/my1-hair/copy.json";
import hairTheme from "@/content/clients/my1-hair/theme.json";
import tailsCopy from "@/content/clients/tails-humane/copy.json";
import tailsTheme from "@/content/clients/tails-humane/theme.json";
import johnnyCopy from "@/content/clients/johnny-ks/copy.json";
import johnnyTheme from "@/content/clients/johnny-ks/theme.json";
import skilletCopy from "@/content/clients/exquisite-skillet/copy.json";
import skilletTheme from "@/content/clients/exquisite-skillet/theme.json";
import beautyCopy from "@/content/clients/chicago-beauty/copy.json";
import beautyTheme from "@/content/clients/chicago-beauty/theme.json";
import custardCopy from "@/content/clients/tastee-bite/copy.json";
import custardTheme from "@/content/clients/tastee-bite/theme.json";
import fattyCopy from "@/content/clients/fattys-pub/copy.json";
import fattyTheme from "@/content/clients/fattys-pub/theme.json";
import cvetCopy from "@/content/clients/cortland-vet/copy.json";
import cvetTheme from "@/content/clients/cortland-vet/theme.json";
import meatCopy from "@/content/clients/inbodens-meats/copy.json";
import meatTheme from "@/content/clients/inbodens-meats/theme.json";
import coffeeCopy from "@/content/clients/cast-iron-coffee/copy.json";
import coffeeTheme from "@/content/clients/cast-iron-coffee/theme.json";
import pawCopy from "@/content/clients/paw-lickin-good/copy.json";
import pawTheme from "@/content/clients/paw-lickin-good/theme.json";
import pilatesCopy from "@/content/clients/pilates-plus/copy.json";
import pilatesTheme from "@/content/clients/pilates-plus/theme.json";
import chiroCopy from "@/content/clients/mccoy-chiropractic/copy.json";
import chiroTheme from "@/content/clients/mccoy-chiropractic/theme.json";
import lawCopy from "@/content/clients/cronauer-law/copy.json";
import lawTheme from "@/content/clients/cronauer-law/theme.json";
import insCopy from "@/content/clients/pardridge-insurance/copy.json";
import insTheme from "@/content/clients/pardridge-insurance/theme.json";
import taxCopy from "@/content/clients/white-oak-tax/copy.json";
import taxTheme from "@/content/clients/white-oak-tax/theme.json";
import bbqCopy from "@/content/clients/south-moon-bbq/copy.json";
import bbqTheme from "@/content/clients/south-moon-bbq/theme.json";
import bikeCopy from "@/content/clients/prairie-path-cycles/copy.json";
import bikeTheme from "@/content/clients/prairie-path-cycles/theme.json";
import recordCopy from "@/content/clients/kiss-the-sky/copy.json";
import recordTheme from "@/content/clients/kiss-the-sky/theme.json";
import bookCopy from "@/content/clients/yellow-bird-books/copy.json";
import bookTheme from "@/content/clients/yellow-bird-books/theme.json";
import batterCopy from "@/content/clients/mad-batter-bakery/copy.json";
import batterTheme from "@/content/clients/mad-batter-bakery/theme.json";
import wineCopy from "@/content/clients/geneva-winery/copy.json";
import wineTheme from "@/content/clients/geneva-winery/theme.json";
import floristCopy from "@/content/clients/celidan-florist/copy.json";
import floristTheme from "@/content/clients/celidan-florist/theme.json";
import breweryCopy from "@/content/clients/noon-whistle-brewing/copy.json";
import breweryTheme from "@/content/clients/noon-whistle-brewing/theme.json";
import musicCopy from "@/content/clients/suburban-music/copy.json";
import musicTheme from "@/content/clients/suburban-music/theme.json";
import potteryCopy from "@/content/clients/pottery-bayou/copy.json";
import potteryTheme from "@/content/clients/pottery-bayou/theme.json";
import spiceCopy from "@/content/clients/flavor-spice/copy.json";
import spiceTheme from "@/content/clients/flavor-spice/theme.json";
import furnCopy from "@/content/clients/beidelman-furniture/copy.json";
import furnTheme from "@/content/clients/beidelman-furniture/theme.json";
import photoCopy from "@/content/clients/kramer-photography/copy.json";
import photoTheme from "@/content/clients/kramer-photography/theme.json";
import mmaCopy from "@/content/clients/victory-mma/copy.json";
import mmaTheme from "@/content/clients/victory-mma/theme.json";
import deliCopy from "@/content/clients/schmaltz-deli/copy.json";
import deliTheme from "@/content/clients/schmaltz-deli/theme.json";
import tattooCopy from "@/content/clients/sapphire-tattoo/copy.json";
import tattooTheme from "@/content/clients/sapphire-tattoo/theme.json";
import danceCopy from "@/content/clients/envision-dance/copy.json";
import danceTheme from "@/content/clients/envision-dance/theme.json";
import jewelCopy from "@/content/clients/costello-jewelry/copy.json";
import jewelTheme from "@/content/clients/costello-jewelry/theme.json";
import chocCopy from "@/content/clients/all-chocolate-kitchen/copy.json";
import chocTheme from "@/content/clients/all-chocolate-kitchen/theme.json";
import toyCopy from "@/content/clients/andersons-toyshop/copy.json";
import toyTheme from "@/content/clients/andersons-toyshop/theme.json";
import theaterCopy from "@/content/clients/arcada-theater/copy.json";
import theaterTheme from "@/content/clients/arcada-theater/theme.json";
import bobaCopy from "@/content/clients/elite-boba/copy.json";
import bobaTheme from "@/content/clients/elite-boba/theme.json";
import giftCopy from "@/content/clients/nona-jos/copy.json";
import giftTheme from "@/content/clients/nona-jos/theme.json";
import gardenCopy from "@/content/clients/growing-place/copy.json";
import gardenTheme from "@/content/clients/growing-place/theme.json";
import runCopy from "@/content/clients/naperville-running/copy.json";
import runTheme from "@/content/clients/naperville-running/theme.json";
import escapeCopy from "@/content/clients/riddlebox-escape/copy.json";
import escapeTheme from "@/content/clients/riddlebox-escape/theme.json";
import funCopy from "@/content/clients/astro-fun-world/copy.json";
import funTheme from "@/content/clients/astro-fun-world/theme.json";
import cobblerCopy from "@/content/clients/lindsays-cobbler/copy.json";
import cobblerTheme from "@/content/clients/lindsays-cobbler/theme.json";
import lanesCopy from "@/content/clients/lisle-lanes/copy.json";
import lanesTheme from "@/content/clients/lisle-lanes/theme.json";
import pubWestCopy from "@/content/clients/pub-west/copy.json";
import pubWestTheme from "@/content/clients/pub-west/theme.json";
import flameCopy from "@/content/clients/the-flame/copy.json";
import flameTheme from "@/content/clients/the-flame/theme.json";
import tapaCopy from "@/content/clients/tapa-la-luna/copy.json";
import tapaTheme from "@/content/clients/tapa-la-luna/theme.json";
import autoBodyCopy from "@/content/clients/anderson-auto-body/copy.json";
import autoBodyTheme from "@/content/clients/anderson-auto-body/theme.json";
import michoacanaCopy from "@/content/clients/la-michoacana/copy.json";
import michoacanaTheme from "@/content/clients/la-michoacana/theme.json";
import hinksCopy from "@/content/clients/hinks-bar-and-grill/copy.json";
import hinksTheme from "@/content/clients/hinks-bar-and-grill/theme.json";
import star34Copy from "@/content/clients/star-34-cafe/copy.json";
import star34Theme from "@/content/clients/star-34-cafe/theme.json";

interface ThemeFile {
  concept: string;
  vars: Record<string, string>;
  contrastNotes?: string;
}

const ARCHIVO = "var(--font-archivo), 'Arial Narrow', system-ui, sans-serif";
const BRICOLAGE = "var(--font-bricolage), 'Trebuchet MS', system-ui, sans-serif";

/**
 * Opt-in per-client layout variants. All keys optional — an undefined layout
 * renders the original (food/restaurant) composition, so every existing client
 * is unchanged until explicitly assigned a variant. De-templatizes the fleet.
 */
export interface SiteLayout {
  /**
   * High-level layout archetype. Drives the section ORDER/SELECTION in SitePage
   * (the "bones"). Undefined = the original Warm-Hospitality composition, so
   * unassigned clients are byte-identical.
   */
  archetype?: "editorial" | "authority" | "wellness" | "craft";
  /** Hero composition. Default "left" (copy over full-bleed photo). */
  hero?: "left" | "centered" | "split" | "editorial" | "collage" | "arch" | "feast";
  /** Menu section idiom. Default "menu" (tabs + dotted price leaders). */
  menuKind?: "menu" | "services" | "carte" | "shelf";
  /** Highlights skin. Default "bento" (asymmetric emoji tiles). */
  highlights?: "credentials" | "index";
  /** Gallery layout. Default "mosaic". */
  gallery?: "horizontal";
  /** Process/ritual steps skin. "deck" = sticky-stacking cards. */
  steps?: "deck";
  /** Story skin. "scrolly" = sticky panel crossfades images per chapter. */
  story?: "scrolly";
  /** Cross-cutting CSS scope: corner/shadow language. Default soft. */
  edge?: "hard";
  /** Cross-cutting CSS scope: section surface palette. Default light. */
  surface?: "ink" | "mono";
  /** Cross-cutting CSS scope: spacing/photo/motion register. Default lively. */
  tone?: "calm" | "editorial" | "energetic";
}

export interface ClientSite {
  slug: string;
  /** Short vertical label for the index/cards. */
  vertical: string;
  site: SiteContent;
  /** CSS custom-property overrides applied to the page subtree. */
  themeVars: Record<string, string>;
  /** Decorative emoji set for hero/about/gallery placeholders. */
  emojis: string[];
  /** schema.org type(s) for JSON-LD. */
  schemaTypes: string[];
  /** Optional per-client layout variants (de-templatization). */
  layout?: SiteLayout;
}

function withFont(vars: Record<string, string>, font?: string): Record<string, string> {
  return font ? { ...vars, "--font-display": font } : { ...vars };
}

export const CLIENTS: ClientSite[] = [
  {
    slug: "flamengo",
    vertical: "Mexican Restaurant & Ice Cream",
    site: flamengo,
    // Terracotta palette from globals.css defaults, but the flagship gets its
    // own chunky warm display face so it stops reading "generic upscale"
    // (critique: third dark restaurant on the same didone formula).
    themeVars: withFont({}, BRICOLAGE),
    emojis: DEFAULT_EMOJIS,
    schemaTypes: ["Restaurant"],
  },
  {
    slug: "a1-auto",
    vertical: "Auto Repair",
    site: a1Copy as unknown as SiteContent,
    themeVars: withFont((a1Theme as ThemeFile).vars, ARCHIVO),
    emojis: ["🔧", "🚗", "🛞", "🔩", "⚙️", "🚙"],
    schemaTypes: ["AutoRepair"],
  },
  {
    slug: "university-city-barbershop",
    vertical: "Barbershop",
    site: barberCopy as unknown as SiteContent,
    themeVars: withFont((barberTheme as ThemeFile).vars), // keep Fraunces (vintage)
    emojis: ["💈", "✂️", "🪒", "💇", "🧔", "🪞"],
    schemaTypes: ["HairSalon", "BarberShop"],
  },
  {
    slug: "dekalb-mechanical",
    vertical: "Heating & Cooling (HVAC)",
    site: hvacCopy as unknown as SiteContent,
    themeVars: withFont((hvacTheme as ThemeFile).vars, ARCHIVO),
    emojis: ["❄️", "🔥", "🌡️", "🔧", "🏠", "💨"],
    schemaTypes: ["HVACBusiness"],
  },
  {
    slug: "china-house",
    vertical: "Chinese Restaurant",
    site: chCopy as unknown as SiteContent,
    themeVars: withFont((chTheme as ThemeFile).vars),
    emojis: ["🥡", "🥢", "🍜", "🥟", "🍚", "🍤"],
    schemaTypes: ["Restaurant"],
  },
  {
    slug: "genoa-animal-hospital",
    vertical: "Veterinary Clinic",
    site: vetCopy as unknown as SiteContent,
    themeVars: withFont((vetTheme as ThemeFile).vars),
    emojis: ["🐾", "🐕", "🐈", "🦴", "🩺", "❤️"],
    schemaTypes: ["VeterinaryCare"],
  },
  {
    slug: "realize-athletics",
    vertical: "Gym & Personal Training",
    site: gymCopy as unknown as SiteContent,
    themeVars: withFont((gymTheme as ThemeFile).vars, ARCHIVO),
    emojis: ["💪", "🏋️", "🔥", "⚡", "🏃", "🥇"],
    schemaTypes: ["ExerciseGym", "HealthClub"],
  },
  {
    slug: "leza-nail-spa",
    vertical: "Nail Salon & Spa",
    site: nailCopy as unknown as SiteContent,
    themeVars: withFont((nailTheme as ThemeFile).vars),
    emojis: ["💅", "✨", "💆", "🌸", "💖", "🪞"],
    schemaTypes: ["NailSalon", "BeautySalon"],
  },
  {
    slug: "friedrichs-eye",
    vertical: "Eye Care & Eyewear",
    site: eyeCopy as unknown as SiteContent,
    themeVars: withFont((eyeTheme as ThemeFile).vars, ARCHIVO),
    emojis: ["👓", "👁️", "✨", "🔬", "🕶️", "✅"],
    schemaTypes: ["Optician", "MedicalBusiness"],
  },
  {
    slug: "woodys-orchard",
    vertical: "Orchard & Farm Market",
    site: farmCopy as unknown as SiteContent,
    themeVars: withFont((farmTheme as ThemeFile).vars),
    emojis: ["🍎", "🎃", "🥧", "🍂", "🚜", "🌽"],
    schemaTypes: ["Farm", "GroceryStore"],
  },
  {
    slug: "todd-curtis-orthodontist",
    vertical: "Orthodontics",
    site: orthoCopy as unknown as SiteContent,
    themeVars: withFont((orthoTheme as ThemeFile).vars, ARCHIVO),
    emojis: ["😁", "🦷", "✨", "💙", "🪥", "⭐"],
    schemaTypes: ["Dentist"],
  },
  {
    slug: "pizza-villa",
    vertical: "Pizzeria",
    site: pizzaCopy as unknown as SiteContent,
    themeVars: withFont((pizzaTheme as ThemeFile).vars),
    emojis: ["🍕", "🧄", "🍅", "🧀", "🍝", "🔥"],
    schemaTypes: ["Restaurant"],
  },
  {
    slug: "the-montcler",
    vertical: "Italian Restaurant",
    site: montCopy as unknown as SiteContent,
    themeVars: withFont((montTheme as ThemeFile).vars),
    emojis: ["🍷", "🍝", "🕯️", "🧀", "🍤", "✨"],
    schemaTypes: ["Restaurant"],
  },
  {
    slug: "dearborn-cafe",
    vertical: "Breakfast & Brunch Cafe",
    site: cafeCopy as unknown as SiteContent,
    themeVars: withFont((cafeTheme as ThemeFile).vars),
    emojis: ["🍳", "🥞", "☕", "🥓", "🧇", "🍊"],
    schemaTypes: ["CafeOrCoffeeShop", "Restaurant"],
  },
  {
    slug: "lord-stanleys",
    vertical: "Neighborhood Pub",
    site: pubCopy as unknown as SiteContent,
    themeVars: withFont((pubTheme as ThemeFile).vars),
    emojis: ["🍺", "🍻", "🎯", "🍔", "🎶", "🥨"],
    schemaTypes: ["BarOrPub"],
  },
  {
    slug: "mvps-sports-bar",
    vertical: "Sports Bar & Grill",
    site: mvpCopy as unknown as SiteContent,
    themeVars: withFont((mvpTheme as ThemeFile).vars, ARCHIVO),
    emojis: ["🏈", "🍗", "🍺", "🏀", "📺", "🔥"],
    schemaTypes: ["BarOrPub", "Restaurant"],
  },
  {
    slug: "lovells-tire",
    vertical: "Tire & Wheel Shop",
    site: tireCopy as unknown as SiteContent,
    themeVars: withFont((tireTheme as ThemeFile).vars, ARCHIVO),
    emojis: ["🛞", "🚗", "🔧", "⚙️", "🛠️", "✅"],
    schemaTypes: ["AutoRepair", "Store"],
  },
  {
    slug: "beas-wok",
    vertical: "Vietnamese Restaurant",
    site: beasCopy as unknown as SiteContent,
    themeVars: withFont((beasTheme as ThemeFile).vars),
    emojis: ["🍜", "🥢", "🧋", "🌶️", "🥖", "🍤"],
    schemaTypes: ["Restaurant"],
  },
  {
    slug: "wired-nutrition",
    vertical: "Nutrition & Smoothie Shop",
    site: nutriCopy as unknown as SiteContent,
    themeVars: withFont((nutriTheme as ThemeFile).vars, ARCHIVO),
    emojis: ["🥤", "💪", "🍓", "⚡", "🫐", "🌱"],
    schemaTypes: ["Store"],
  },
  {
    slug: "bowlrrito",
    vertical: "Build-Your-Own Bowls",
    site: bowlCopy as unknown as SiteContent,
    themeVars: withFont((bowlTheme as ThemeFile).vars, ARCHIVO),
    emojis: ["🌯", "🥑", "🥗", "🌶️", "🫑", "🍚"],
    schemaTypes: ["Restaurant"],
  },
  {
    slug: "my1-hair",
    vertical: "Hair Salon",
    site: hairCopy as unknown as SiteContent,
    themeVars: withFont((hairTheme as ThemeFile).vars),
    emojis: ["💇", "✂️", "✨", "💆", "🌸", "💖"],
    schemaTypes: ["HairSalon", "BeautySalon"],
  },
  {
    slug: "tails-humane",
    vertical: "Animal Shelter & Adoption",
    site: tailsCopy as unknown as SiteContent,
    themeVars: withFont((tailsTheme as ThemeFile).vars),
    emojis: ["🐶", "🐱", "🐾", "❤️", "🏠", "🐰"],
    schemaTypes: ["AnimalShelter", "NGO"],
  },
  {
    slug: "johnny-ks",
    vertical: "Burger & Hot Dog Stand",
    site: johnnyCopy as unknown as SiteContent,
    themeVars: withFont((johnnyTheme as ThemeFile).vars, ARCHIVO),
    emojis: ["🍔", "🌭", "🍟", "🥤", "🧅", "🍦"],
    schemaTypes: ["Restaurant", "FastFoodRestaurant"],
  },
  {
    slug: "exquisite-skillet",
    vertical: "Pancake House",
    site: skilletCopy as unknown as SiteContent,
    themeVars: withFont((skilletTheme as ThemeFile).vars),
    emojis: ["🥞", "🍳", "🧇", "☕", "🍓", "🥓"],
    schemaTypes: ["Restaurant", "CafeOrCoffeeShop"],
  },
  {
    slug: "chicago-beauty",
    vertical: "Lash & Brow Beauty Bar",
    site: beautyCopy as unknown as SiteContent,
    themeVars: withFont((beautyTheme as ThemeFile).vars),
    emojis: ["💋", "✨", "👁️", "💅", "🌸", "💖"],
    schemaTypes: ["BeautySalon", "HealthAndBeautyBusiness"],
  },
  {
    slug: "tastee-bite",
    vertical: "Frozen Custard & Treats",
    site: custardCopy as unknown as SiteContent,
    themeVars: withFont((custardTheme as ThemeFile).vars, BRICOLAGE),
    emojis: ["🍦", "🍨", "🥤", "🍒", "🧁", "🍧"],
    schemaTypes: ["FastFoodRestaurant", "Restaurant"],
  },
  {
    slug: "fattys-pub",
    vertical: "Sports Pub & Grille",
    site: fattyCopy as unknown as SiteContent,
    themeVars: withFont((fattyTheme as ThemeFile).vars, ARCHIVO),
    emojis: ["🍗", "🍔", "🍺", "🏈", "🔥", "🍟"],
    schemaTypes: ["BarOrPub", "Restaurant"],
  },
  {
    slug: "cortland-vet",
    vertical: "Country Veterinary Clinic",
    site: cvetCopy as unknown as SiteContent,
    themeVars: withFont((cvetTheme as ThemeFile).vars),
    emojis: ["🐾", "🐕", "🐴", "🐈", "🩺", "❤️"],
    schemaTypes: ["VeterinaryCare"],
  },
  {
    slug: "inbodens-meats",
    vertical: "Butcher & Specialty Foods",
    site: meatCopy as unknown as SiteContent,
    themeVars: withFont((meatTheme as ThemeFile).vars),
    emojis: ["🥩", "🍖", "🧀", "🥓", "🔪", "🌭"],
    schemaTypes: ["GroceryStore", "Store"],
  },
  {
    slug: "cast-iron-coffee",
    vertical: "Coffee Roaster & Espresso Bar",
    site: coffeeCopy as unknown as SiteContent,
    themeVars: withFont((coffeeTheme as ThemeFile).vars, ARCHIVO),
    emojis: ["☕", "🫘", "🥐", "🧁", "🍰", "🤎"],
    schemaTypes: ["CafeOrCoffeeShop", "Restaurant"],
  },
  {
    slug: "paw-lickin-good",
    vertical: "Pet Bakery & Boutique",
    site: pawCopy as unknown as SiteContent,
    themeVars: withFont((pawTheme as ThemeFile).vars),
    emojis: ["🐾", "🦴", "🐕", "🐈", "🍪", "💛"],
    schemaTypes: ["PetStore", "Store"],
  },
  {
    slug: "pilates-plus",
    vertical: "Pilates & Reformer Studio",
    site: pilatesCopy as unknown as SiteContent,
    themeVars: withFont((pilatesTheme as ThemeFile).vars),
    emojis: ["🧘", "🤸", "💪", "🌿", "✨", "🩷"],
    schemaTypes: ["HealthClub", "SportsActivityLocation"],
  },
  {
    slug: "mccoy-chiropractic",
    vertical: "Chiropractic & Wellness",
    site: chiroCopy as unknown as SiteContent,
    themeVars: withFont((chiroTheme as ThemeFile).vars),
    emojis: ["🦴", "💆", "🧘", "➕", "💪", "❤️"],
    schemaTypes: ["Chiropractor", "MedicalBusiness"],
  },
  {
    slug: "cronauer-law",
    vertical: "Law Firm",
    site: lawCopy as unknown as SiteContent,
    themeVars: withFont((lawTheme as ThemeFile).vars),
    emojis: ["⚖️", "📜", "🏛️", "🤝", "📋", "✅"],
    schemaTypes: ["LegalService", "Attorney"],
  },
  {
    slug: "pardridge-insurance",
    vertical: "Insurance Agency",
    site: insCopy as unknown as SiteContent,
    themeVars: withFont((insTheme as ThemeFile).vars, ARCHIVO),
    emojis: ["🛡️", "🏠", "🚗", "☂️", "📊", "🤝"],
    schemaTypes: ["InsuranceAgency", "FinancialService"],
  },
  {
    slug: "white-oak-tax",
    vertical: "Tax & Accounting",
    site: taxCopy as unknown as SiteContent,
    themeVars: withFont((taxTheme as ThemeFile).vars),
    emojis: ["📊", "🧾", "💵", "📈", "🗂️", "✅"],
    schemaTypes: ["AccountingService", "FinancialService"],
  },
  {
    slug: "south-moon-bbq",
    vertical: "BBQ Smokehouse",
    site: bbqCopy as unknown as SiteContent,
    themeVars: withFont((bbqTheme as ThemeFile).vars, ARCHIVO),
    emojis: ["🍖", "🔥", "🐖", "🌽", "🍗", "🥩"],
    schemaTypes: ["BarBecueRestaurant", "Restaurant"],
  },
  {
    slug: "prairie-path-cycles",
    vertical: "Bicycle Shop & Service",
    site: bikeCopy as unknown as SiteContent,
    themeVars: withFont((bikeTheme as ThemeFile).vars, ARCHIVO),
    emojis: ["🚲", "🛞", "🔧", "⛰️", "🦺", "🏁"],
    schemaTypes: ["BicycleStore", "Store"],
  },
  {
    slug: "kiss-the-sky",
    vertical: "Independent Record Store",
    site: recordCopy as unknown as SiteContent,
    themeVars: withFont((recordTheme as ThemeFile).vars, ARCHIVO),
    emojis: ["🎵", "💿", "🎧", "📀", "🎸", "🎶"],
    schemaTypes: ["Store"],
  },
  {
    slug: "yellow-bird-books",
    vertical: "Independent Bookstore",
    site: bookCopy as unknown as SiteContent,
    themeVars: withFont((bookTheme as ThemeFile).vars),
    emojis: ["📚", "📖", "🐤", "✍️", "🔖", "☕"],
    schemaTypes: ["BookStore", "Store"],
  },
  {
    slug: "mad-batter-bakery",
    vertical: "Bakery & Confections",
    site: batterCopy as unknown as SiteContent,
    themeVars: withFont((batterTheme as ThemeFile).vars),
    emojis: ["🧁", "🍰", "🥐", "🍪", "🎂", "☕"],
    schemaTypes: ["Bakery", "Store"],
  },
  {
    slug: "geneva-winery",
    vertical: "Winery & Wine Bar",
    site: wineCopy as unknown as SiteContent,
    themeVars: withFont((wineTheme as ThemeFile).vars),
    emojis: ["🍷", "🍇", "🧀", "☕", "🥂", "🍫"],
    schemaTypes: ["BarOrPub", "Restaurant"],
  },
  {
    slug: "celidan-florist",
    vertical: "Florist & Gift Shop",
    site: floristCopy as unknown as SiteContent,
    themeVars: withFont((floristTheme as ThemeFile).vars),
    emojis: ["💐", "🌸", "🌹", "🌷", "🍃", "🎁"],
    schemaTypes: ["Florist", "Store"],
  },
  {
    slug: "noon-whistle-brewing",
    vertical: "Craft Brewery & Taproom",
    site: breweryCopy as unknown as SiteContent,
    themeVars: withFont((breweryTheme as ThemeFile).vars, ARCHIVO),
    emojis: ["🍺", "🍻", "🌾", "🍴", "🎶", "🛢️"],
    schemaTypes: ["Brewery", "BarOrPub"],
  },
  {
    slug: "suburban-music",
    vertical: "Music Store & Lessons",
    site: musicCopy as unknown as SiteContent,
    themeVars: withFont((musicTheme as ThemeFile).vars),
    emojis: ["🎸", "🎹", "🎻", "🥁", "🎺", "🎵"],
    schemaTypes: ["MusicStore", "Store"],
  },
  {
    slug: "pottery-bayou",
    vertical: "Paint-Your-Own Pottery Studio",
    site: potteryCopy as unknown as SiteContent,
    themeVars: withFont((potteryTheme as ThemeFile).vars),
    emojis: ["🎨", "🏺", "🖌️", "✨", "🎉", "☕"],
    schemaTypes: ["Store", "EntertainmentBusiness"],
  },
  {
    slug: "flavor-spice",
    vertical: "Spice & Seasoning Shop",
    site: spiceCopy as unknown as SiteContent,
    themeVars: withFont((spiceTheme as ThemeFile).vars),
    emojis: ["🌶️", "🧂", "🫙", "🍯", "🌿", "🔥"],
    schemaTypes: ["Store", "GroceryStore"],
  },
  {
    slug: "beidelman-furniture",
    vertical: "Furniture & Home Store",
    site: furnCopy as unknown as SiteContent,
    themeVars: withFont((furnTheme as ThemeFile).vars),
    emojis: ["🛋️", "🪑", "🛏️", "🏠", "✨", "💡"],
    schemaTypes: ["FurnitureStore", "Store"],
  },
  {
    slug: "kramer-photography",
    vertical: "Photography Studio",
    site: photoCopy as unknown as SiteContent,
    themeVars: withFont((photoTheme as ThemeFile).vars),
    emojis: ["📷", "📸", "🖼️", "💍", "✨", "🎞️"],
    schemaTypes: ["ProfessionalService"],
  },
  {
    slug: "victory-mma",
    vertical: "Martial Arts & MMA Gym",
    site: mmaCopy as unknown as SiteContent,
    themeVars: withFont((mmaTheme as ThemeFile).vars, ARCHIVO),
    emojis: ["🥋", "🥊", "🤼", "🏆", "💪", "🔥"],
    schemaTypes: ["SportsActivityLocation", "HealthClub"],
  },
  {
    slug: "schmaltz-deli",
    vertical: "Jewish Deli & Sandwiches",
    site: deliCopy as unknown as SiteContent,
    themeVars: withFont((deliTheme as ThemeFile).vars),
    emojis: ["🥪", "🍲", "🥯", "🥒", "🍪", "☕"],
    schemaTypes: ["Restaurant"],
  },
  {
    slug: "sapphire-tattoo",
    vertical: "Tattoo & Piercing Studio",
    site: tattooCopy as unknown as SiteContent,
    themeVars: withFont((tattooTheme as ThemeFile).vars, ARCHIVO),
    emojis: ["💉", "🎨", "✨", "🖤", "⚡", "💎"],
    schemaTypes: ["TattooParlor"],
  },
  {
    slug: "envision-dance",
    vertical: "Dance Studio & School",
    site: danceCopy as unknown as SiteContent,
    themeVars: withFont((danceTheme as ThemeFile).vars),
    emojis: ["🩰", "💃", "✨", "🎶", "⭐", "👯"],
    schemaTypes: ["DanceGroup", "SportsActivityLocation"],
  },
  {
    slug: "costello-jewelry",
    vertical: "Fine Jewelry Store",
    site: jewelCopy as unknown as SiteContent,
    themeVars: withFont((jewelTheme as ThemeFile).vars),
    emojis: ["💍", "💎", "✨", "⌚", "📿", "🌟"],
    schemaTypes: ["JewelryStore", "Store"],
  },
  {
    slug: "all-chocolate-kitchen",
    vertical: "Artisan Chocolatier",
    site: chocCopy as unknown as SiteContent,
    themeVars: withFont((chocTheme as ThemeFile).vars),
    emojis: ["🍫", "🍬", "🎁", "🍓", "✨", "☕"],
    schemaTypes: ["Store", "CafeOrCoffeeShop"],
  },
  {
    slug: "andersons-toyshop",
    vertical: "Toy Store",
    site: toyCopy as unknown as SiteContent,
    themeVars: withFont((toyTheme as ThemeFile).vars, BRICOLAGE),
    emojis: ["🧸", "🪀", "🎲", "🚂", "🎁", "🦖"],
    schemaTypes: ["ToyStore", "Store"],
  },
  {
    slug: "arcada-theater",
    vertical: "Theater & Live Music Venue",
    site: theaterCopy as unknown as SiteContent,
    themeVars: withFont((theaterTheme as ThemeFile).vars),
    emojis: ["🎭", "🎤", "🎶", "🎬", "🌟", "🎟️"],
    schemaTypes: ["PerformingArtsTheater", "EntertainmentBusiness"],
  },
  {
    slug: "elite-boba",
    vertical: "Bubble Tea Shop",
    site: bobaCopy as unknown as SiteContent,
    themeVars: withFont((bobaTheme as ThemeFile).vars, ARCHIVO),
    emojis: ["🧋", "🧊", "🥤", "🍵", "🍡", "✨"],
    schemaTypes: ["CafeOrCoffeeShop", "Restaurant"],
  },
  {
    slug: "nona-jos",
    vertical: "Home & Gift Boutique",
    site: giftCopy as unknown as SiteContent,
    themeVars: withFont((giftTheme as ThemeFile).vars),
    emojis: ["🎁", "🕯️", "🛍️", "🌸", "✨", "💝"],
    schemaTypes: ["Store"],
  },
  {
    slug: "growing-place",
    vertical: "Garden Center & Nursery",
    site: gardenCopy as unknown as SiteContent,
    themeVars: withFont((gardenTheme as ThemeFile).vars),
    emojis: ["🌿", "🌸", "🪴", "🌱", "🌞", "💧"],
    schemaTypes: ["GardenStore", "Store"],
  },
  {
    slug: "naperville-running",
    vertical: "Running & Footwear Store",
    site: runCopy as unknown as SiteContent,
    themeVars: withFont((runTheme as ThemeFile).vars, ARCHIVO),
    emojis: ["👟", "🏃", "⚡", "🏅", "💪", "🎽"],
    schemaTypes: ["SportingGoodsStore", "Store"],
  },
  {
    slug: "riddlebox-escape",
    vertical: "Escape Room",
    site: escapeCopy as unknown as SiteContent,
    themeVars: withFont((escapeTheme as ThemeFile).vars, ARCHIVO),
    emojis: ["🔓", "🗝️", "🧩", "⏱️", "🔦", "🎭"],
    schemaTypes: ["EntertainmentBusiness"],
  },
  {
    slug: "astro-fun-world",
    vertical: "Family Fun Center & Arcade",
    site: funCopy as unknown as SiteContent,
    themeVars: withFont((funTheme as ThemeFile).vars, BRICOLAGE),
    emojis: ["🎮", "🎟️", "🕹️", "🎯", "🎪", "⭐"],
    schemaTypes: ["AmusementPark", "EntertainmentBusiness"],
  },
  {
    slug: "lindsays-cobbler",
    vertical: "Shoe Repair & Leather Goods",
    site: cobblerCopy as unknown as SiteContent,
    themeVars: withFont((cobblerTheme as ThemeFile).vars),
    emojis: ["👞", "🥾", "🧵", "✨", "👜", "🔨"],
    schemaTypes: ["ProfessionalService"],
  },
  {
    slug: "lisle-lanes",
    vertical: "Bowling Alley",
    site: lanesCopy as unknown as SiteContent,
    themeVars: withFont((lanesTheme as ThemeFile).vars, ARCHIVO),
    emojis: ["🎳", "🏆", "🍺", "🎉", "👟", "⭐"],
    schemaTypes: ["BowlingAlley", "EntertainmentBusiness"],
  },
  // ── Batch 13 ──
  {
    slug: "pub-west",
    vertical: "Grill Pub",
    site: pubWestCopy as unknown as SiteContent,
    themeVars: withFont((pubWestTheme as ThemeFile).vars),
    emojis: ["🍔", "🍺", "🍟", "🥩", "🍻", "⭐"],
    schemaTypes: ["BarOrPub", "Restaurant"],
  },
  {
    slug: "the-flame",
    vertical: "Greek Family Restaurant",
    site: flameCopy as unknown as SiteContent,
    themeVars: withFont((flameTheme as ThemeFile).vars),
    emojis: ["🥙", "🔥", "🍳", "🥗", "🫒", "☕"],
    schemaTypes: ["Restaurant"],
  },
  {
    slug: "tapa-la-luna",
    vertical: "Tapas & Wine Bistro",
    site: tapaCopy as unknown as SiteContent,
    themeVars: withFont((tapaTheme as ThemeFile).vars),
    emojis: ["🍷", "🌙", "🫒", "🧀", "🍤", "🕯️"],
    schemaTypes: ["Restaurant", "BarOrPub"],
  },
  {
    slug: "anderson-auto-body",
    vertical: "Auto Body & Collision",
    site: autoBodyCopy as unknown as SiteContent,
    themeVars: withFont((autoBodyTheme as ThemeFile).vars, ARCHIVO),
    emojis: ["🚗", "🔧", "🎨", "🛠️", "✨", "🧰"],
    schemaTypes: ["AutoBodyShop"],
  },
  {
    slug: "la-michoacana",
    vertical: "Paletería & Ice Cream",
    site: michoacanaCopy as unknown as SiteContent,
    themeVars: withFont((michoacanaTheme as ThemeFile).vars, BRICOLAGE),
    emojis: ["🍦", "🥭", "🍓", "🍉", "🧊", "🍧"],
    schemaTypes: ["IceCreamShop"],
  },
  // ── Batch 14 (verification-first: vetted open + website-less before build) ──
  {
    slug: "hinks-bar-and-grill",
    vertical: "Bar & Grill",
    site: hinksCopy as unknown as SiteContent,
    themeVars: withFont((hinksTheme as ThemeFile).vars, ARCHIVO),
    emojis: ["🍺", "🍔", "🎤", "🏍️", "🍕", "⭐"],
    schemaTypes: ["BarOrPub", "Restaurant"],
  },
  {
    slug: "star-34-cafe",
    vertical: "Breakfast & Brunch Cafe",
    site: star34Copy as unknown as SiteContent,
    themeVars: withFont((star34Theme as ThemeFile).vars),
    emojis: ["🥞", "☕", "🍳", "🥓", "🧇", "⭐"],
    schemaTypes: ["Restaurant", "CafeOrCoffeeShop"],
  },
];

/**
 * Per-client layout assignments (de-templatization). Service verticals use the
 * card-based "services" menu (no dotted price leaders / food-coded favorites);
 * beauty/wellness/medical verticals also use a symmetric centered hero.
 * Everything not listed keeps the default food/restaurant composition.
 */
const LAYOUTS: Record<string, SiteLayout> = {
  // ── Authority / professional — split hero on light, calm, services; SitePage
  //    drops Gallery + Marquee so structure (not photos) carries trust.
  "cronauer-law": { archetype: "authority", hero: "split", tone: "calm", menuKind: "services", highlights: "credentials" },
  "pardridge-insurance": { archetype: "authority", hero: "split", tone: "calm", menuKind: "services", highlights: "credentials" },
  "white-oak-tax": { archetype: "authority", hero: "split", tone: "calm", menuKind: "services", highlights: "credentials" },
  "friedrichs-eye": { archetype: "authority", hero: "split", tone: "calm", menuKind: "services", highlights: "credentials" },
  "todd-curtis-orthodontist": { archetype: "authority", hero: "split", tone: "calm", menuKind: "services", highlights: "credentials" },
  "genoa-animal-hospital": { archetype: "authority", hero: "split", tone: "calm", menuKind: "services", highlights: "credentials" },
  "cortland-vet": { archetype: "authority", hero: "split", tone: "calm", menuKind: "services", highlights: "credentials" },
  // Shelter: keep the warm full-bleed default (retains the adoptable-pet
  // Gallery), with services cards for adopt/foster/volunteer/donate programs.
  "tails-humane": { menuKind: "services" },

  // ── Soft wellness / beauty — editorial split hero, airy tone, monochrome
  //    imagery, services menu.
  // steps:"deck" — the ritual flow stacks as sticky cards (layered wave)
  "leza-nail-spa": { archetype: "wellness", hero: "editorial", tone: "editorial", surface: "mono", menuKind: "services", highlights: "credentials", steps: "deck" },
  "my1-hair": { archetype: "wellness", hero: "editorial", tone: "editorial", surface: "mono", menuKind: "services", highlights: "credentials", steps: "deck" },
  "chicago-beauty": { archetype: "wellness", hero: "editorial", tone: "editorial", surface: "mono", menuKind: "services", highlights: "credentials", steps: "deck" },
  "pilates-plus": { archetype: "wellness", hero: "editorial", tone: "editorial", surface: "mono", menuKind: "services", highlights: "credentials", steps: "deck" },
  "mccoy-chiropractic": { archetype: "wellness", hero: "editorial", tone: "editorial", surface: "mono", menuKind: "services", highlights: "credentials", steps: "deck" },

  // ── Editorial hospitality / fine dining — magazine split hero, generous tone.
  //    story:"scrolly" — the pinned provenance photo crossfades per chapter.
  "the-montcler": { archetype: "editorial", hero: "editorial", tone: "editorial", menuKind: "carte", highlights: "index", gallery: "horizontal", story: "scrolly" },
  "dearborn-cafe": { archetype: "editorial", hero: "editorial", tone: "editorial", menuKind: "carte", highlights: "index", gallery: "horizontal", story: "scrolly" },
  "south-moon-bbq": { archetype: "editorial", hero: "editorial", tone: "editorial", menuKind: "carte", highlights: "index", gallery: "horizontal", story: "scrolly" },

  // ── Bold craft / industrial retail & trades — hard edges, energetic density.
  "a1-auto": { archetype: "craft", edge: "hard", tone: "energetic", menuKind: "services", gallery: "horizontal" },
  "dekalb-mechanical": { archetype: "craft", edge: "hard", tone: "energetic", menuKind: "services", gallery: "horizontal" },
  "lovells-tire": { archetype: "craft", edge: "hard", tone: "energetic", menuKind: "services", gallery: "horizontal" },
  "university-city-barbershop": { archetype: "craft", edge: "hard", tone: "energetic", menuKind: "services", gallery: "horizontal" },
  "realize-athletics": { archetype: "craft", edge: "hard", tone: "energetic", menuKind: "services", gallery: "horizontal" },
  "inbodens-meats": { archetype: "craft", edge: "hard", tone: "energetic", menuKind: "shelf", gallery: "horizontal" },
  "cast-iron-coffee": { archetype: "craft", edge: "hard", tone: "energetic", menuKind: "shelf", gallery: "horizontal" },
  "woodys-orchard": { archetype: "craft", edge: "hard", tone: "energetic", menuKind: "shelf", gallery: "horizontal" },
  "wired-nutrition": { archetype: "craft", edge: "hard", tone: "energetic", menuKind: "shelf", gallery: "horizontal" },
  "paw-lickin-good": { archetype: "craft", edge: "hard", tone: "energetic", menuKind: "shelf", gallery: "horizontal" },

  // ── Batch-8 (Fox Valley corridor) ──
  "prairie-path-cycles": { archetype: "craft", edge: "hard", tone: "energetic", menuKind: "shelf", gallery: "horizontal" },
  "kiss-the-sky": { archetype: "craft", edge: "hard", tone: "energetic", menuKind: "shelf", gallery: "horizontal" },
  "yellow-bird-books": { menuKind: "shelf", tone: "editorial", hero: "arch" }, // cozy literary shelf, arch reading-nook hero
  "geneva-winery": { archetype: "editorial", hero: "editorial", tone: "editorial", menuKind: "carte", highlights: "index", gallery: "horizontal", story: "scrolly" },
  "mad-batter-bakery": { hero: "collage" }, // playful from-scratch bakery — layered polaroid hero

  // ── Batch-9 (corridor toward Chicago) ──
  "celidan-florist": { hero: "arch", tone: "editorial", menuKind: "shelf" }, // soft, colorful — arch conservatory hero
  "noon-whistle-brewing": { archetype: "craft", edge: "hard", tone: "energetic", menuKind: "carte", gallery: "horizontal" }, // tap list as carte
  "suburban-music": { menuKind: "shelf", hero: "collage" }, // warm family music shop
  "pottery-bayou": { menuKind: "services", hero: "collage" }, // playful, paint sessions
  "flavor-spice": { menuKind: "shelf" }, // warm spice shelf

  // ── Batch-10 (corridor toward Chicago) ──
  "beidelman-furniture": { hero: "split", tone: "editorial", menuKind: "shelf" }, // elegant showroom
  "kramer-photography": { hero: "editorial", tone: "editorial", menuKind: "services", gallery: "horizontal" }, // portfolio filmstrip
  "victory-mma": { archetype: "craft", edge: "hard", tone: "energetic", menuKind: "services", gallery: "horizontal" },
  "schmaltz-deli": { menuKind: "carte" }, // classic deli board
  "sapphire-tattoo": { archetype: "craft", edge: "hard", tone: "energetic", menuKind: "services", gallery: "horizontal" },
  "envision-dance": { menuKind: "services", hero: "collage" }, // joyful, class cards

  // ── Batch-11 (corridor toward Chicago) ──
  "costello-jewelry": { hero: "editorial", tone: "editorial", menuKind: "shelf" }, // elegant jeweler
  "all-chocolate-kitchen": { hero: "editorial", tone: "editorial", menuKind: "shelf" }, // luxe chocolatier
  "andersons-toyshop": { menuKind: "shelf", hero: "collage" }, // playful toy store
  "arcada-theater": { archetype: "editorial", hero: "editorial", tone: "editorial", menuKind: "carte", highlights: "index", gallery: "horizontal", story: "scrolly" }, // show lineup carte
  "elite-boba": { hero: "collage" }, // fun boba (phone-less, default menu)
  "nona-jos": { menuKind: "shelf", tone: "editorial", hero: "arch" }, // curated gift shelf, arch boutique hero

  // ── Batch-12 (corridor toward Chicago) ──
  "growing-place": { hero: "arch", tone: "calm", menuKind: "shelf" }, // fresh garden center — greenhouse-arch hero
  "naperville-running": { archetype: "craft", edge: "hard", tone: "energetic", menuKind: "shelf", gallery: "horizontal" },
  "riddlebox-escape": { archetype: "craft", edge: "hard", tone: "energetic", menuKind: "services", gallery: "horizontal" }, // phone-less
  "astro-fun-world": { menuKind: "services", hero: "collage" }, // playful family fun center
  "lindsays-cobbler": { hero: "split", tone: "calm", menuKind: "services" }, // heritage cobbler
  "lisle-lanes": { archetype: "craft", edge: "hard", tone: "energetic", menuKind: "services", gallery: "horizontal" }, // retro bowling

  // ── Design-overhaul wave: de-templatize the warm/casual-food cohort ──
  // feast = type-forward stacked hero (giant display type hanging into a full-
  // width photo band, glass action card on the seam); arch = soft ornamental
  // arch-framed photo. flamengo / lord-stanleys / mvps keep the classic warm
  // full-bleed so that register stays represented.
  "hinks-bar-and-grill": { archetype: "craft", edge: "hard", tone: "energetic", menuKind: "carte", gallery: "horizontal" }, // 100+ beer tap board
  "johnny-ks": { hero: "feast" }, // burger & hot dog stand
  "fattys-pub": { hero: "feast" }, // wings & burgers pub
  "bowlrrito": { hero: "feast" }, // build-your-own bowls
  "beas-wok": { hero: "feast" }, // vietnamese & asian kitchen
  "pizza-villa": { hero: "feast" }, // pizzeria
  "tastee-bite": { hero: "arch" }, // frozen custard stand — soft-serve arch

  // ── Batch 13 — one of each register (the-flame keeps the warm classic default) ──
  "pub-west": { hero: "feast" }, // small-town grill pub
  "tapa-la-luna": { archetype: "editorial", hero: "editorial", tone: "editorial", menuKind: "carte", highlights: "index", gallery: "horizontal", story: "scrolly" },
  "anderson-auto-body": { archetype: "craft", edge: "hard", tone: "energetic", menuKind: "services", gallery: "horizontal" },
  "la-michoacana": { hero: "arch", tone: "energetic" }, // paletería brights
};
for (const c of CLIENTS) {
  if (LAYOUTS[c.slug]) c.layout = LAYOUTS[c.slug];
}

export const getClient = (slug: string): ClientSite | undefined =>
  CLIENTS.find((c) => c.slug === slug);
