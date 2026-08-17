import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CityCard from "@/components/cities/CityCard";

import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "@/lib/i18n";
import type { City } from "@/types/city";

const title = "Città | Car2ne";
const description =
  "Scopri concerti, festival e spettacoli città per città e trova un passaggio auto con Car2ne.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/citta",
  },
  openGraph: {
    title,
    description,
  },
};

const PAGE_SIZE = 60;

type Props = {
  searchParams: Promise<{ page?: string }>;
};

/*
 * public.cities ha 7.894+ righe (anagrafica comuni ISTAT): una
 * select() senza range() verrebbe troncata da PostgREST a 1000
 * righe, e comunque non avrebbe senso scaricare tutto in una pagina.
 * Paginazione server-side via ?page=, URL dedicati per pagina
 * (crawlabili, coerente con l'uso SEO di questa sezione).
 */
export default async function CitiesIndexPage({
  searchParams,
}: Props) {
  const params = await searchParams;
  const currentPage = Math.max(1, Number(params.page) || 1);

  const supabase = await createClient();
  const { locale, dict } = await getTranslations();
  const t = dict.cities.index;

  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const {
    data: cities,
    error: citiesError,
    count: totalCities,
  } = await supabase
    .from("cities")
    .select("*", { count: "exact" })
    .order("name", { ascending: true })
    .range(from, to);

  if (citiesError) {
    throw new Error(citiesError.message);
  }

  const cityIds = (cities ?? []).map((city) => city.id);

  const { data: events, error: eventsError } = await supabase
    .from("events")
    .select("city_id")
    .eq("status", "published")
    .gte("event_date", new Date().toISOString())
    .in("city_id", cityIds);

  if (eventsError) {
    throw new Error(eventsError.message);
  }

  const eventCountByCity = new Map<string, number>();

  for (const event of events ?? []) {
    if (!event.city_id) continue;

    eventCountByCity.set(
      event.city_id,
      (eventCountByCity.get(event.city_id) ?? 0) + 1
    );
  }

  const totalPages = Math.max(
    1,
    Math.ceil((totalCities ?? 0) / PAGE_SIZE)
  );

  return (
    <>
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 pt-36 pb-24">
        <section className="mb-16">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
            {t.badge}
          </span>

          <h1 className="mt-6 text-5xl font-black tracking-tight text-slate-900 md:text-6xl">
            {t.title}
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            {t.subtitle}
          </p>

          {totalCities ? (
            <p className="mt-4 text-sm text-slate-500">
              {t.countSummary
                .replace(
                  "{count}",
                  totalCities.toLocaleString(locale === "en" ? "en-US" : "it-IT")
                )
                .replace("{page}", String(currentPage))
                .replace("{totalPages}", String(totalPages))}
            </p>
          ) : null}
        </section>

        {cities && cities.length > 0 ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(cities as City[]).map((city) => (
                <CityCard
                  key={city.id}
                  city={city}
                  eventCount={eventCountByCity.get(city.id) ?? 0}
                  dict={dict.cities.card}
                />
              ))}
            </div>

            <CityPagination
              currentPage={currentPage}
              totalPages={totalPages}
              dict={t}
            />
          </>
        ) : (
          <p className="text-slate-500">
            {t.noCities}
          </p>
        )}
      </main>

      <Footer />
    </>
  );
}

function CityPagination({
  currentPage,
  totalPages,
  dict,
}: {
  currentPage: number;
  totalPages: number;
  dict: {
    paginationAriaLabel: string;
    previous: string;
    next: string;
    pageOf: string;
  };
}) {
  if (totalPages <= 1) {
    return null;
  }

  const prevPage = currentPage - 1;
  const nextPage = currentPage + 1;

  return (
    <nav
      aria-label={dict.paginationAriaLabel}
      className="mt-12 flex items-center justify-center gap-4"
    >
      {prevPage >= 1 ? (
        <Link
          href={prevPage === 1 ? "/citta" : `/citta?page=${prevPage}`}
          className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50"
        >
          <ChevronLeft className="h-4 w-4" />
          {dict.previous}
        </Link>
      ) : (
        <span className="flex items-center gap-2 rounded-2xl border border-slate-100 px-5 py-3 text-sm font-semibold text-slate-300">
          <ChevronLeft className="h-4 w-4" />
          {dict.previous}
        </span>
      )}

      <span className="text-sm font-medium text-slate-500">
        {dict.pageOf
          .replace("{page}", String(currentPage))
          .replace("{totalPages}", String(totalPages))}
      </span>

      {nextPage <= totalPages ? (
        <Link
          href={`/citta?page=${nextPage}`}
          className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50"
        >
          {dict.next}
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <span className="flex items-center gap-2 rounded-2xl border border-slate-100 px-5 py-3 text-sm font-semibold text-slate-300">
          {dict.next}
          <ChevronRight className="h-4 w-4" />
        </span>
      )}
    </nav>
  );
}
