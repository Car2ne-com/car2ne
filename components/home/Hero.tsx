import Link from "next/link";

import { Search, ArrowUpRight } from "lucide-react";

import HeroIllustration from "./HeroIllustration";
import SearchBox from "./SearchBox";

import { getTranslations } from "@/lib/i18n";

export default async function Hero() {
  const { dict } = await getTranslations();
  const t = dict.home.hero;
  const searchBoxDict = dict.home.searchBox;

  return (
    <section className="relative overflow-hidden">
      {/* Texture "carta stampata" appena percettibile dietro l'hero */}
      <div className="bg-dotgrid pointer-events-none absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,black,transparent_92%)]" />

      <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 pt-6 pb-10 lg:grid-cols-[1.08fr_0.92fr] lg:gap-4 lg:pt-12">
        {/* Testo */}
        <div className="max-w-2xl">
          <h1 className="mt-8 font-display text-[clamp(2.85rem,6vw,5rem)] font-medium leading-[1.0] tracking-[-0.025em] text-foreground">
            {t.titleLine1}{" "}
            <span className="italic text-primary">{t.titleLine2}</span>{" "}
            {t.titleLine3} {t.titleLine4}
          </h1>

          <p className="mt-7 max-w-md text-lg leading-8 text-muted-foreground">
            {t.description}
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-4">
            <Link
              href="/events"
              className="inline-flex h-14 items-center justify-center gap-2.5 rounded-full bg-primary px-8 text-base font-semibold text-primary-foreground shadow-brand transition-all hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-brand-lg"
            >
              <Search className="h-5 w-5" />
              {t.searchEvent}
            </Link>

            <Link
              href="/offer-ride"
              className="group inline-flex items-center gap-2 text-base font-semibold text-foreground"
            >
              {t.offerRide}
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card transition-all group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground">
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </Link>
          </div>
        </div>

        {/* Illustrazione */}
        <HeroIllustration />
      </div>

      {/* La ricerca è la porta d'ingresso del prodotto: grande, in overlap */}
      <div className="relative z-10 mx-auto -mb-10 max-w-6xl px-6">
        <SearchBox dict={searchBoxDict} />
      </div>
    </section>
  );
}
