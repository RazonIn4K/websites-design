import flamengo from "@/content/clients/flamengo/blur.json";
import garden from "@/content/clients/growing-place/blur.json";
import theater from "@/content/clients/arcada-theater/blur.json";
import toys from "@/content/clients/andersons-toyshop/blur.json";
import spa from "@/content/clients/leza-nail-spa/blur.json";
import auto from "@/content/clients/a1-auto/blur.json";
const maps:Record<string,Record<string,string>>={flamengo,"growing-place":garden,"arcada-theater":theater,"andersons-toyshop":toys,"leza-nail-spa":spa,"a1-auto":auto};
export const getBlur=(slug:string)=>maps[slug]??{};
