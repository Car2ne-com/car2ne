import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { Toaster } from "sonner";

import FloatingChat from "@/components/chat/FloatingChat";

import { SITE_URL } from "@/lib/siteConfig";

import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: SITE_URL,
  title: "Car2ne",
  description:
    "Trova o offri un passaggio per il tuo prossimo evento.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="it"
      className={`${manrope.variable} overflow-x-hidden antialiased`}
    >
      <body className="relative min-h-screen overflow-x-hidden bg-gradient-to-b from-white via-emerald-50 to-white font-sans text-slate-900">
        <div className="pointer-events-none absolute -left-64 top-10 -z-10 h-[700px] w-[700px] rounded-full bg-emerald-200/25 blur-[110px]" />
        <div className="pointer-events-none absolute -right-64 top-0 -z-10 h-[700px] w-[700px] rounded-full bg-emerald-100/30 blur-[110px]" />

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