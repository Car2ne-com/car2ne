import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import { Toaster } from "sonner";

import FloatingChat from "@/components/chat/FloatingChat";

import { SITE_URL } from "@/lib/siteConfig";
import { getTranslations } from "@/lib/i18n";

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
};

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getTranslations();

  return {
    metadataBase: SITE_URL,
    title: "Car2ne",
    description: dict.layout.siteDescription,
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { locale } = await getTranslations();

  return (
    <html
      lang={locale}
      className={`${manrope.variable} overflow-x-hidden antialiased`}
    >
      <body className="relative min-h-screen overflow-x-hidden bg-gradient-to-b from-white via-emerald-50 to-white font-sans text-slate-900">
        <div className="pointer-events-none absolute -left-64 top-10 -z-10 hidden h-[700px] w-[700px] rounded-full bg-emerald-200/25 blur-[110px] md:block" />
        <div className="pointer-events-none absolute -right-64 top-0 -z-10 hidden h-[700px] w-[700px] rounded-full bg-emerald-100/30 blur-[110px] md:block" />

        {children}

        <FloatingChat />

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