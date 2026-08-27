"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

/*
 * Guscio client della navbar: rende la "pill" flottante e le aggiunge
 * bordo + ombra + sfondo pieno solo dopo che la pagina è stata
 * scrollata. In cima resta quasi trasparente e si fonde con lo sfondo.
 * I contenuti (logo, link, azioni) sono renderizzati lato server e
 * passati come children.
 */
export default function NavbarContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-2 pt-[max(0.5rem,env(safe-area-inset-top))] sm:px-4 sm:pt-[max(1rem,env(safe-area-inset-top))]">
      <div
        className={cn(
          "relative flex h-14 w-full max-w-6xl items-center justify-between gap-3 rounded-full border px-3 backdrop-blur-md transition-[background-color,border-color,box-shadow] duration-300 sm:h-16 sm:px-4",
          scrolled
            ? "border-border bg-background/90 shadow-[0_8px_30px_rgba(15,23,42,0.08)]"
            : "border-transparent bg-background/50 shadow-none"
        )}
      >
        {children}
      </div>
    </header>
  );
}
