import {existsSync,readdirSync,readFileSync} from "node:fs";
import {join} from "node:path";
const locales=["nl","en","es","de","it","fr"];
const strict=process.argv.includes("--strict");
const errors=[];
const walk=dir=>readdirSync(dir,{withFileTypes:true}).flatMap(item=>item.isDirectory()?walk(join(dir,item.name)):[join(dir,item.name)]);
for(const locale of locales){
  const root=join("dist",locale);
  if(!existsSync(root)){errors.push(`Ontbrekende locale-map: ${locale}`);continue;}
  for(const file of walk(root).filter(file=>file.endsWith(".html"))){
    const html=readFileSync(file,"utf8");
    if(!html.includes(`<html lang="${locale}-`) && !(locale==="en"&&html.includes('<html lang="en-GB"'))) errors.push(`${file}: onjuiste html lang`);
    if(!html.includes('rel="canonical"')) errors.push(`${file}: canonical ontbreekt`);
    if((html.match(/hreflang=/g)||[]).length<7) errors.push(`${file}: hreflang-set onvolledig`);
    if(/\b(TODO|TRANSLATION_MISSING|LOREM IPSUM)\b/i.test(html)) errors.push(`${file}: zichtbare placeholder`);
  }
}
if(errors.length){console.error(errors.join("\n"));process.exit(1)}
console.log("Route-, lang-, canonical-, hreflang- en placeholdercontrole geslaagd.");
if(strict){console.error("Strikte publicatiecontrole geblokkeerd: 75 artikelvertalingen en native review van 195 generieke locale-pagina's staan nog open.");process.exit(2)}
