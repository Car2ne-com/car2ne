import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

import Hero from "@/components/home/Hero";
import FeaturedEvents from "@/components/home/FeaturedEvents";
import HowItWorks from "@/components/home/HowItWorks";
import Features from "@/components/home/Features";
import CTA from "@/components/home/CTA";

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