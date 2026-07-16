import type { APIRoute } from "astro";
import { supportedLocales } from "../i18n/languages";
export const prerender=true;
export const GET:APIRoute=({site})=>{const origin=site??new URL("https://auto-pilots.io");const body=`<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${supportedLocales.map(locale=>`  <sitemap><loc>${new URL(`/sitemap-${locale.code}.xml`,origin)}</loc></sitemap>`).join("\n")}\n</sitemapindex>`;return new Response(body,{headers:{"Content-Type":"application/xml; charset=utf-8"}})};
