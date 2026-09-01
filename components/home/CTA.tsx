import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";

import { getTranslations } from "@/lib/i18n";

export default async function CTA() {
  const { dict } = await getTranslations();
  const t = dict.home.cta;

  return (
    <section className="px-4 py-16 sm:px-6 sm:py-20">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-emerald-950 px-6 py-16 text-center sm:rounded-[2.5rem] sm:px-16 sm:py-20">
        <div className="bg-dotgrid pointer-events-none absolute inset-0 text-white/[0.07]" />

        {/* La linea del percorso arriva a destinazione */}
        <div
          aria-hidden
          className="absolute top-0 left-1/2 h-16 -translate-x-1/2 border-l border-dashed border-white/20"
        />
        <div
          aria-hidden
          className="absolute top-[52px] left-1/2 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-sm"
        >
          <MapPin className="h-4 w-4" />
        </div>

        <div className="relative pt-12">
          <h2 className="font-display text-[1.9rem] font-medium tracking-[-0.02em] text-white sm:text-5xl">
            {t.title}
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-lg text-white/70">
            {t.subtitle}
          </p>

          <div className="mx-auto mt-10 flex max-w-sm flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center sm:gap-4">
            <Link
              href="/events"
              className="inline-flex items-center justify-center rounded-full bg-white px-8 py-4 font-semibold text-emerald-950 transition-all hover:-translate-y-0.5 hover:bg-white/90"
            >
              {t.searchRide}
            </Link>

            <Link
              href="/offer-ride"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 px-8 py-4 font-semibold text-white transition-colors hover:bg-white/10"
            >
              {t.offerRide}
              <ArrowUpRight className="h-[18px] w-[18px]" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
