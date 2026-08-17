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

          <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-100/80 px-5 py-2 text-sm font-medium text-emerald-700 backdrop-blur">
            {t.badge}
          </span>

          <h1 className="mt-6 text-5xl font-black leading-[0.92] tracking-tight text-slate-900 md:text-6xl xl:text-[4.5rem]">
            {t.titleLine1}
            <br />
            {t.titleLine2}
            <br />
            {t.titleLine3}
            <br />
            {t.titleLine4}
          </h1>

          <p className="mt-6 text-lg leading-8 text-slate-600">
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
                bg-emerald-500
                px-10
                text-lg
                font-semibold
                text-white
                shadow-lg
                transition
                hover:bg-emerald-600
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
                border-slate-200
                bg-white
                px-10
                text-lg
                font-semibold
                text-slate-900
                shadow-sm
                transition
                hover:border-emerald-200
                hover:bg-emerald-50
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