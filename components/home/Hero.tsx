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

      <div className="mx-auto max-w-7xl px-6 pt-4 pb-12 lg:pt-10 lg:pb-16">
        <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
          {/* Testo */}
          <div className="max-w-xl">
            <h1 className="font-display text-[clamp(2.35rem,5.4vw,4.5rem)] font-medium leading-[1.05] tracking-[-0.02em] text-foreground">
              {t.titleLine1}{" "}
              <span className="italic text-primary">{t.titleLine2}</span>{" "}
              {t.titleLine3} {t.titleLine4}
            </h1>

            <p className="mt-6 max-w-md text-lg leading-8 text-muted-foreground">
              {t.description}
            </p>

            <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-5">
              <Link
                href="/events"
                className="inline-flex h-14 items-center justify-center gap-2.5 rounded-full bg-primary px-8 text-base font-semibold text-primary-foreground shadow-brand transition-all hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-brand-lg"
              >
                <Search className="h-5 w-5" />
                {t.searchEvent}
              </Link>

              <Link
                href="/offer-ride"
                className="group inline-flex h-14 items-center justify-center gap-2 rounded-full border border-border bg-card px-6 text-base font-semibold text-foreground transition-colors hover:border-primary/30 hover:bg-accent sm:h-auto sm:border-0 sm:bg-transparent sm:px-0 sm:hover:bg-transparent sm:hover:text-primary"
              >
                {t.offerRide}
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>
          </div>

          {/* Composizione prodotto */}
          <HeroIllustration dict={dict.home.showcase} />
        </div>

        {/* La ricerca è la porta d'ingresso del prodotto */}
        <div className="mt-10 lg:mt-8">
          <SearchBox dict={searchBoxDict} />
        </div>
      </div>
    </section>
  );
}
