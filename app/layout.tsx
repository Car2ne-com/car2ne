import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import { Toaster } from "sonner";

import FloatingChat from "@/components/chat/FloatingChat";

import { SITE_URL } from "@/lib/siteConfig";
import { getTranslations } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/server";

import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#059669",
};

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getTranslations();

  return {
    metadataBase: SITE_URL,
    title: "Car2ne",
    description: dict.layout.siteDescription,
    /*
     * Applica a ogni pagina che non definisce il proprio blocco
     * `twitter`: Twitter/X ripiega comunque sui tag og:title/
     * og:description/og:image di quella pagina se non sovrascritti,
     * quindi basta dichiarare il tipo di card qui una sola volta.
     */
    twitter: {
      card: "summary_large_image",
    },
  };
}

/*
 * Profili social ufficiali di Car2ne. Referenziati in tre punti dei
 * metadati di sito: `sameAs` del JSON-LD Organization (Google /
 * Knowledge Panel), `<link rel="me">` (standard IndieWeb sito↔account,
 * usato anche dalla verifica Mastodon) e `<meta property="og:see_also">`
 * (Open Graph, link correlati).
 */
const SOCIAL_PROFILE_URLS = [
  "https://www.instagram.com/car2ne_official",
  "https://www.tiktok.com/@car2ne_official",
];

/*
 * Schema.org Organization a livello di sito: dà a Google l'entità
 * "Car2ne" con logo e profili social ufficiali (`sameAs`), utile per
 * il Knowledge Panel e per collegare il brand ai suoi account.
 */
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Car2ne",
  url: SITE_URL.origin,
  logo: new URL("/icon-512.png", SITE_URL).href,
  sameAs: SOCIAL_PROFILE_URLS,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { locale, dict } = await getTranslations();

  /*
   * FloatingChat non mostra nulla per un visitatore anonimo (ritorna
   * null dopo aver verificato di non avere una sessione), ma verrebbe
   * comunque spedito e idratato su ogni pagina del sito, compresa la
   * home e le pagine marketing. Il check qui è server-side.
   */
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html
      lang={locale}
      className={`${manrope.variable} overflow-x-hidden antialiased`}
    >
      <body className="relative min-h-screen overflow-x-hidden bg-gradient-to-b from-background via-accent to-background font-sans text-foreground">
        {/*
         * React 19 solleva automaticamente <meta>/<link> nel <head>.
         * L'API Metadata di Next non tipizza né `rel="me"` né
         * `og:see_also`, quindi li rendiamo qui come tag grezzi.
         */}
        {SOCIAL_PROFILE_URLS.map((profileUrl) => (
          <link key={`me-${profileUrl}`} rel="me" href={profileUrl} />
        ))}

        {SOCIAL_PROFILE_URLS.map((profileUrl) => (
          <meta
            key={`see-also-${profileUrl}`}
            property="og:see_also"
            content={profileUrl}
          />
        ))}

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd).replace(
              /</g,
              "\\u003c"
            ),
          }}
        />

        <div className="pointer-events-none absolute -left-64 top-10 -z-10 hidden h-[700px] w-[700px] rounded-full bg-primary/20 blur-[110px] md:block" />
        <div className="pointer-events-none absolute -right-64 top-0 -z-10 hidden h-[700px] w-[700px] rounded-full bg-primary/15 blur-[110px] md:block" />

        {children}

        {user && <FloatingChat dict={dict.chat.floating} />}

        <Toaster
          position="bottom-right"
          richColors
          closeButton
          duration={3000}
        />
      </body>
    </html>
  );
}