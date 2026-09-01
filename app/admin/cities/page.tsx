import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getTranslations } from "@/lib/i18n";

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
  const { dict } = await getTranslations();
  const t = dict.admin.citiesPage;

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
        <h1 className="text-2xl font-semibold text-foreground">
          {t.title}
        </h1>

        <p className="mt-2 text-muted-foreground">
          {t.subtitle}
          {totalCities
            ? t.totalMunicipalities.replace(
                "{count}",
                totalCities.toLocaleString("it-IT")
              )
            : ""}
        </p>
      </div>

      <CitiesTable
        cities={(cities ?? []) as CityRow[]}
        venueCountByCity={venueCountByCity}
        eventCountByCity={eventCountByCity}
        currentPage={currentPage}
        totalPages={totalPages}
        dict={dict.admin.citiesTable}
      />

      <div className="mt-10">
        <VenuesTable
          venues={(venues ?? []) as VenueRow[]}
          cityNameById={cityNameById}
          eventCountByVenue={eventCountByVenue}
          dict={dict.admin.venuesTable}
        />
      </div>
    </main>
  );
}

type CitiesTableDict = {
  emptyTitle: string;
  emptyDescription: string;
  colName: string;
  colSlug: string;
  colRegion: string;
  colVenues: string;
  colEvents: string;
  previous: string;
  next: string;
  pageOf: string;
};

function CitiesTable({
  cities,
  venueCountByCity,
  eventCountByCity,
  currentPage,
  totalPages,
  dict,
}: {
  cities: CityRow[];
  venueCountByCity: Map<string, number>;
  eventCountByCity: Map<string, number>;
  currentPage: number;
  totalPages: number;
  dict: CitiesTableDict;
}) {
  if (cities.length === 0) {
    return (
      <EmptyState
        title={dict.emptyTitle}
        description={dict.emptyDescription}
      />
    );
  }

  return (
    <div>
      <Card className="overflow-x-auto p-0">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-6 py-4 text-left">{dict.colName}</th>
              <th className="px-6 py-4 text-left">{dict.colSlug}</th>
              <th className="px-6 py-4 text-left">{dict.colRegion}</th>
              <th className="px-6 py-4 text-left">{dict.colVenues}</th>
              <th className="px-6 py-4 text-left">{dict.colEvents}</th>
            </tr>
          </thead>

          <tbody>
            {cities.map((city) => (
              <tr key={city.id} className="border-t border-border">
                <td className="px-6 py-5 font-semibold">{city.name}</td>
                <td className="px-6 py-5 text-muted-foreground">
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
      </Card>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-4">
          {currentPage > 1 ? (
            <Link
              href={
                currentPage - 1 === 1
                  ? "/admin/cities"
                  : `/admin/cities?page=${currentPage - 1}`
              }
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-auto px-4 py-2"
              )}
            >
              {dict.previous}
            </Link>
          ) : (
            <span className="rounded-full border border-border/60 px-4 py-2 text-sm font-semibold text-muted-foreground/50">
              {dict.previous}
            </span>
          )}

          <span className="text-sm text-muted-foreground">
            {dict.pageOf
              .replace("{current}", String(currentPage))
              .replace("{total}", String(totalPages))}
          </span>

          {currentPage < totalPages ? (
            <Link
              href={`/admin/cities?page=${currentPage + 1}`}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-auto px-4 py-2"
              )}
            >
              {dict.next}
            </Link>
          ) : (
            <span className="rounded-full border border-border/60 px-4 py-2 text-sm font-semibold text-muted-foreground/50">
              {dict.next}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

type VenuesTableDict = {
  title: string;
  emptyTitle: string;
  emptyDescription: string;
  colName: string;
  colCity: string;
  colAddress: string;
  colEvents: string;
};

function VenuesTable({
  venues,
  cityNameById,
  eventCountByVenue,
  dict,
}: {
  venues: VenueRow[];
  cityNameById: Map<string, string>;
  eventCountByVenue: Map<string, number>;
  dict: VenuesTableDict;
}) {
  return (
    <>
      <h2 className="mb-4 text-lg font-semibold text-foreground">{dict.title}</h2>

      {venues.length === 0 ? (
        <EmptyState
          title={dict.emptyTitle}
          description={dict.emptyDescription}
        />
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-4 text-left">{dict.colName}</th>
                <th className="px-6 py-4 text-left">{dict.colCity}</th>
                <th className="px-6 py-4 text-left">{dict.colAddress}</th>
                <th className="px-6 py-4 text-left">{dict.colEvents}</th>
              </tr>
            </thead>

            <tbody>
              {venues.map((venue) => (
                <tr
                  key={venue.id}
                  className="border-t border-border"
                >
                  <td className="px-6 py-5 font-semibold">
                    {venue.name}
                  </td>
                  <td className="px-6 py-5">
                    {cityNameById.get(venue.city_id) ?? "—"}
                  </td>
                  <td className="px-6 py-5 text-muted-foreground">
                    {venue.address ?? "—"}
                  </td>
                  <td className="px-6 py-5">
                    {eventCountByVenue.get(venue.id) ?? 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </>
  );
}
