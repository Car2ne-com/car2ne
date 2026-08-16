import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

type CityRow = {
  id: string;
  name: string;
  slug: string;
  region: string | null;
};

type VenueRow = {
  id: string;
  city_id: string;
  name: string;
  slug: string;
  address: string | null;
};

const PAGE_SIZE = 100;

/*
 * public.cities ha 7.894+ righe (anagrafica comuni ISTAT): una
 * select() senza range() verrebbe troncata da PostgREST a 1000
 * righe. La tabella Città è quindi paginata (?page=); venue (155) ed
 * eventi (406) restano su una singola lettura, ancora ampiamente
 * sotto quella soglia — nessuna paginazione aggiunta lì per non
 * introdurla dove non serve.
 *
 * cityNameById serve alla tabella Venue (una venue può appartenere a
 * una qualunque delle 7.894+ città, non solo a quelle nella pagina
 * corrente): letta a parte, paginata, solo id+nome.
 */
async function fetchAllCityNames(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<Map<string, string>> {
  const result = new Map<string, string>();
  let from = 0;

  for (;;) {
    const { data, error } = await supabase
      .from("cities")
      .select("id, name")
      .range(from, from + 999);

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      break;
    }

    for (const row of data) {
      result.set(row.id, row.name);
    }

    if (data.length < 1000) {
      break;
    }

    from += 1000;
  }

  return result;
}

type Props = {
  searchParams: Promise<{ page?: string }>;
};

export default async function AdminCitiesPage({
  searchParams,
}: Props) {
  const params = await searchParams;
  const currentPage = Math.max(1, Number(params.page) || 1);

  const supabase = await createClient();

  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const [
    { data: cities, error: citiesError, count: totalCities },
    { data: venues, error: venuesError },
    { data: events, error: eventsError },
    cityNameById,
  ] = await Promise.all([
    supabase
      .from("cities")
      .select("id, name, slug, region", { count: "exact" })
      .order("name")
      .range(from, to),
    supabase
      .from("venues")
      .select("id, city_id, name, slug, address")
      .order("name"),
    supabase.from("events").select("city_id, venue_id"),
    fetchAllCityNames(supabase),
  ]);

  if (citiesError) throw new Error(citiesError.message);
  if (venuesError) throw new Error(venuesError.message);
  if (eventsError) throw new Error(eventsError.message);

  const eventCountByCity = new Map<string, number>();
  const eventCountByVenue = new Map<string, number>();

  for (const event of events ?? []) {
    if (event.city_id) {
      eventCountByCity.set(
        event.city_id,
        (eventCountByCity.get(event.city_id) ?? 0) + 1
      );
    }

    if (event.venue_id) {
      eventCountByVenue.set(
        event.venue_id,
        (eventCountByVenue.get(event.venue_id) ?? 0) + 1
      );
    }
  }

  const venueCountByCity = new Map<string, number>();

  for (const venue of venues ?? []) {
    venueCountByCity.set(
      venue.city_id,
      (venueCountByCity.get(venue.city_id) ?? 0) + 1
    );
  }

  const totalPages = Math.max(
    1,
    Math.ceil((totalCities ?? 0) / PAGE_SIZE)
  );

  return (
    <main className="mx-auto max-w-7xl p-10">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900">
          Città &amp; venue
        </h1>

        <p className="mt-2 text-slate-500">
          Vista di sola lettura. Città e venue vengono creati
          automaticamente dal resolver durante l&apos;import
          Ticketmaster o il backfill — non da qui.
          {totalCities
            ? ` ${totalCities.toLocaleString("it-IT")} comuni totali.`
            : ""}
        </p>
      </div>

      <CitiesTable
        cities={(cities ?? []) as CityRow[]}
        venueCountByCity={venueCountByCity}
        eventCountByCity={eventCountByCity}
        currentPage={currentPage}
        totalPages={totalPages}
      />

      <div className="mt-10">
        <VenuesTable
          venues={(venues ?? []) as VenueRow[]}
          cityNameById={cityNameById}
          eventCountByVenue={eventCountByVenue}
        />
      </div>
    </main>
  );
}

function CitiesTable({
  cities,
  venueCountByCity,
  eventCountByCity,
  currentPage,
  totalPages,
}: {
  cities: CityRow[];
  venueCountByCity: Map<string, number>;
  eventCountByCity: Map<string, number>;
  currentPage: number;
  totalPages: number;
}) {
  if (cities.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-16 text-center shadow-sm">
        <h2 className="text-2xl font-bold">Nessuna città</h2>

        <p className="mt-2 text-slate-500">
          Le città compaiono qui dopo il primo import Ticketmaster o
          backfill.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-left">Nome</th>
              <th className="px-6 py-4 text-left">Slug</th>
              <th className="px-6 py-4 text-left">Regione</th>
              <th className="px-6 py-4 text-left">Venue</th>
              <th className="px-6 py-4 text-left">Eventi</th>
            </tr>
          </thead>

          <tbody>
            {cities.map((city) => (
              <tr key={city.id} className="border-t border-slate-100">
                <td className="px-6 py-5 font-semibold">{city.name}</td>
                <td className="px-6 py-5 text-slate-500">
                  /citta/{city.slug}
                </td>
                <td className="px-6 py-5">{city.region ?? "—"}</td>
                <td className="px-6 py-5">
                  {venueCountByCity.get(city.id) ?? 0}
                </td>
                <td className="px-6 py-5">
                  {eventCountByCity.get(city.id) ?? 0}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-4">
          {currentPage > 1 ? (
            <Link
              href={
                currentPage - 1 === 1
                  ? "/admin/cities"
                  : `/admin/cities?page=${currentPage - 1}`
              }
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50"
            >
              Precedente
            </Link>
          ) : (
            <span className="rounded-xl border border-slate-100 px-4 py-2 text-sm font-semibold text-slate-300">
              Precedente
            </span>
          )}

          <span className="text-sm text-slate-500">
            Pagina {currentPage} di {totalPages}
          </span>

          {currentPage < totalPages ? (
            <Link
              href={`/admin/cities?page=${currentPage + 1}`}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50"
            >
              Successiva
            </Link>
          ) : (
            <span className="rounded-xl border border-slate-100 px-4 py-2 text-sm font-semibold text-slate-300">
              Successiva
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function VenuesTable({
  venues,
  cityNameById,
  eventCountByVenue,
}: {
  venues: VenueRow[];
  cityNameById: Map<string, string>;
  eventCountByVenue: Map<string, number>;
}) {
  return (
    <>
      <h2 className="mb-4 text-2xl font-bold text-slate-900">Venue</h2>

      {venues.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-16 text-center shadow-sm">
          <h3 className="text-xl font-bold">Nessun venue</h3>

          <p className="mt-2 text-slate-500">
            I venue compaiono qui dopo il primo import Ticketmaster o
            backfill.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left">Nome</th>
                <th className="px-6 py-4 text-left">Città</th>
                <th className="px-6 py-4 text-left">Indirizzo</th>
                <th className="px-6 py-4 text-left">Eventi</th>
              </tr>
            </thead>

            <tbody>
              {venues.map((venue) => (
                <tr
                  key={venue.id}
                  className="border-t border-slate-100"
                >
                  <td className="px-6 py-5 font-semibold">
                    {venue.name}
                  </td>
                  <td className="px-6 py-5">
                    {cityNameById.get(venue.city_id) ?? "—"}
                  </td>
                  <td className="px-6 py-5 text-slate-500">
                    {venue.address ?? "—"}
                  </td>
                  <td className="px-6 py-5">
                    {eventCountByVenue.get(venue.id) ?? 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
