/*
 * NEXT_PUBLIC_SITE_URL va impostata su Vercel con il dominio di
 * produzione (es. https://car2ne.vercel.app o il dominio custom):
 * serve a generateMetadata (canonical URL) e a sitemap.ts per
 * costruire URL assoluti corretti.
 *
 * Se mancasse in un build di produzione, il fallback a localhost
 * finirebbe silenziosamente in canonical/OG/sitemap reali: meglio
 * far fallire il build che scoprirlo da Google Search Console mesi
 * dopo.
 */
if (
  process.env.NODE_ENV === "production" &&
  !process.env.NEXT_PUBLIC_SITE_URL
) {
  throw new Error(
    "NEXT_PUBLIC_SITE_URL non impostata: obbligatoria in produzione " +
      "(usata da canonical URL, Open Graph e sitemap.xml). Impostala " +
      "nelle variabili d'ambiente del progetto su Vercel."
  );
}

export const SITE_URL = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
);
