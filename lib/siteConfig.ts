/*
 * NEXT_PUBLIC_SITE_URL va impostata su Vercel con il dominio di
 * produzione (es. https://car2ne.vercel.app o il dominio custom):
 * serve a generateMetadata (canonical URL) e a sitemap.ts per
 * costruire URL assoluti corretti.
 */
export const SITE_URL = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
);
