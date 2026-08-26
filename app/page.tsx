import type { Metadata } from "next";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

import Hero from "@/components/home/Hero";
import FeaturedEvents from "@/components/home/FeaturedEvents";
import HowItWorks from "@/components/home/HowItWorks";
import Features from "@/components/home/Features";
import CTA from "@/components/home/CTA";

import { getTranslations } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getTranslations();
  const { title, description } = dict.home.meta;

  return {
    title,
    description,
    alternates: {
      canonical: "/",
    },
    openGraph: {
      title,
      description,
      images: ["/images/hero.webp"],
    },
  };
}

export default function Home() {
  return (
    <>
      <Navbar />

      <main className="pt-28">
        <Hero />
        <FeaturedEvents />
        <HowItWorks />
        <Features />
        <CTA />
      </main>

      <Footer />
    </>
  );
}