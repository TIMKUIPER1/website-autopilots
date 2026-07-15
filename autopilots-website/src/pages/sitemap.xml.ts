import type { APIRoute } from "astro";
import { products } from "../data/products";
import { niches } from "../data/niches";
import { knowledgeArticles } from "../content/knowledgeArticles";

export const prerender = true;

const staticRoutes = ["/", "/producten/", "/voor-wie/", "/proces/", "/crew/", "/kennisbank/", "/afspraak/", "/contact/", "/bestel-direct/", "/privacy/"];

export const GET: APIRoute = ({ site }) => {
  const origin = site ?? new URL("https://auto-pilots.io");
  const routes = [
    ...staticRoutes,
    ...products.map((product) => `/producten/${product.slug}/`),
    ...niches.map((niche) => `/voor-wie/${niche.slug}/`),
    ...knowledgeArticles.map((article) => `/kennisbank/${article.slug}/`)
  ];
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes.map((route) => `  <url><loc>${new URL(route, origin).toString()}</loc></url>`).join("\n")}\n</urlset>`;
  return new Response(body, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
};
