import Link from "next/link";

import { Search, CarFront } from "lucide-react";

import HeroIllustration from "./HeroIllustration";
import SearchBox from "./SearchBox";

export default function Hero() {
  return (
    <section className="relative">

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-24">

      <div className="grid min-h-[80vh] items-center gap-12 lg:grid-cols-[0.95fr_1.05fr]">

        {/* LEFT */}

        <div className="max-w-xl">

          <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-100/80 px-5 py-2 text-sm font-medium text-emerald-700 backdrop-blur">
            🚗 Viaggia insieme. Risparmia. Conosci nuove persone.
          </span>

          <h1 className="mt-8 text-5xl font-black leading-[0.92] tracking-tight text-slate-900 md:text-6xl xl:text-[5.3rem]">
            Trova il tuo
            <br />
            passaggio
            <br />
            per il prossimo
            <br />
            evento.
          </h1>

          <p className="mt-8 text-lg leading-8 text-slate-600">
            Concerti, festival, fiere e molto altro.
            <br />
            Car2ne mette in contatto persone che stanno andando
            allo stesso evento per condividere il viaggio.
          </p>

          {/* CTA */}

          <div className="mt-10 flex flex-wrap gap-5">

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
                transition-all
                hover:bg-emerald-600
                hover:shadow-xl
              "
            >
              <Search className="h-6 w-6" />
              Cerca un evento
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
                transition-all
                hover:border-emerald-200
                hover:bg-emerald-50
                hover:shadow-lg
              "
            >
              <CarFront className="h-6 w-6" />
              Offri un passaggio
            </Link>

          </div>

        </div>

        {/* RIGHT */}

        <HeroIllustration />

      </div>

      {/* SEARCH */}

      <div className="mt-16">
        <SearchBox />
      </div>

      </div>

    </section>
  );
}