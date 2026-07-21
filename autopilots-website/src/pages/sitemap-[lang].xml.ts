import type { APIRoute } from "astro";
import { supportedLocales,type SupportedLocale } from "../i18n/languages";
import { localizedPath,routeFamilies } from "../i18n/routes";
import { isIndexableTranslation } from "../i18n/translationStatus";
import { knowledgeArticles } from "../content/knowledgeArticles";
export const prerender=true;
export function getStaticPaths(){return supportedLocales.map(locale=>({params:{lang:locale.code},props:{locale:locale.code}}))}
export const GET:APIRoute=({site,props})=>{const locale=props.locale as SupportedLocale;const origin=site??new URL("https://auto-pilots.io");const routes=routeFamilies.filter(family=>isIndexableTranslation(family.id,locale));const body=`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${routes.map(family=>`  <url><loc>${new URL(localizedPath(family.id,locale),origin)}</loc>${supportedLocales.map(item=>`<xhtml:link rel="alternate" hreflang="${item.tag}" href="${new URL(localizedPath(family.id,item.code),origin)}"/>`).join("")}<xhtml:link rel="alternate" hreflang="x-default" href="${new URL(localizedPath(family.id,"nl"),origin)}"/>${family.type==="article"?`<lastmod>${knowledgeArticles.find(article=>`article.${article.slug}`===family.id)?.modified??""}</lastmod>`:""}</url>`).join("\n")}\n</urlset>`;return new Response(body,{headers:{"Content-Type":"application/xml; charset=utf-8"}})};
