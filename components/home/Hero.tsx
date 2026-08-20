import Link from "next/link";

import { Search, CarFront } from "lucide-react";

import HeroIllustration from "./HeroIllustration";
import SearchBox from "./SearchBox";

import { getTranslations } from "@/lib/i18n";

export default async function Hero() {
  const { dict } = await getTranslations();
  const t = dict.home.hero;
  const searchBoxDict = dict.home.searchBox;

  return (
    <section className="relative">

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-10 lg:py-14">

      <div className="grid items-center gap-12 lg:grid-cols-[0.95fr_1.05fr]">

        {/* LEFT */}

        <div className="max-w-xl">

          <span className="inline-flex rounded-full border border-primary/20 bg-accent/80 px-5 py-2 text-sm font-medium text-accent-foreground backdrop-blur">
            {t.badge}
          </span>

          <h1 className="mt-6 text-5xl font-black leading-[0.92] tracking-tight text-foreground md:text-6xl xl:text-[4.5rem]">
            {t.titleLine1}
            <br />
            {t.titleLine2}
            <br />
            {t.titleLine3}
            <br />
            {t.titleLine4}
          </h1>

          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            {t.description}
          </p>

          {/* CTA */}

          <div className="mt-8 flex flex-wrap gap-5">

            <Link
              href="/events"
              className="
                inline-flex
                h-16
                items-center
                justify-center
                gap-3
                rounded-2xl
                bg-primary
                px-10
                text-lg
                font-semibold
                text-primary-foreground
                shadow-lg
                transition
                hover:bg-primary/90
                hover:shadow-xl
              "
            >
              <Search className="h-6 w-6" />
              {t.searchEvent}
            </Link>

            <Link
              href="/offer-ride"
              className="
                inline-flex
                h-16
                items-center
                justify-center
                gap-3
                rounded-2xl
                border
                border-border
                bg-card
                px-10
                text-lg
                font-semibold
                text-foreground
                shadow-sm
                transition
                hover:border-primary/30
                hover:bg-accent
                hover:shadow-lg
              "
            >
              <CarFront className="h-6 w-6" />
              {t.offerRide}
            </Link>

          </div>

        </div>

        {/* RIGHT */}

        <HeroIllustration />

      </div>

      {/* SEARCH */}

      <div className="mt-8">
        <SearchBox dict={searchBoxDict} />
      </div>

      </div>

    </section>
  );
}
