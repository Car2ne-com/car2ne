import type { Metadata } from "next";
import { unstable_cache } from "next/cache";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import EventHeader from "@/components/events/EventHeader";
import EventsView from "@/components/events/EventsView";

import { createClient } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";
import { getRideCounts } from "@/lib/supabase/getRideCounts";
import { getTranslations } from "@/lib/i18n";

const PAGE_SIZE = 24;

type Props = {
  searchParams: Promise<{
    search?: string;
    from?: string;
    date?: string;
    city?: string;
    venue?: string;
    page?: string;
  }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getTranslations();
  const { title, description } = dict.events.meta.index;

  return {
    title,
    description,
    alternates: {
      canonical: "/events",
    },
    openGraph: {
      title,
      description,
    },
  };
}

/*
 * PostgREST's `.or()` takes a raw filter-syntax string: virgole e
 * parentesi nell'input utente romperebbero la sintassi (lista di
 * condizioni / raggruppamento), quindi vanno tolte prima di comporla.
 * Non è una questione di SQL injection (PostgREST parametrizza comunque
 * sotto il cofano), solo di non generare un filtro malformato.
 */
function sanitizeForOrFilter(value: string) {
  return value.replace(/[(),]/g, "");
}

/*
 * Opzioni per le select Città/Venue: una query leggera a parte,
 * indipendente dai filtri di ricerca correnti (le opzioni disponibili
 * non devono restringersi insieme ai risultati), che seleziona solo
 * gli id/nomi embedded invece delle righe evento complete. Uguale per
 * ogni visitatore (dato pubblico) e richiamata a ogni caricamento di
 * /events indipendentemente dai filtri: cacheabile, con client
 * pubblico dato che unstable_cache non supporta cookies() al suo
 * interno.
 */
const getAllFilterRows = unstable_cache(
  async () => {
    const supabase = createPublicClient();

    const { data } = await supabase
      .from("events")
      .select("city_id, cities(id, name), venue_id, venues(id, name)")
      .eq("status", "published")
      .gte("event_date", new Date().toISOString());

    return (data ?? []) as unknown as Array<{
      city_id: string | null;
      cities: { id: string; name: string } | null;
      venue_id: string | null;
      venues: { id: string; name: string } | null;
    }>;
  },
  ["events-filter-rows"],
  { revalidate: 60 }
);

async function getFilterOptions(cityId: string) {
  const rows = await getAllFilterRows();

  const cityById = new Map<string, string>();
  const venueById = new Map<string, string>();

  for (const row of rows) {
    if (row.cities) {
      cityById.set(row.cities.id, row.cities.name);
    }

    if (row.venues && (!cityId || row.city_id === cityId)) {
      venueById.set(row.venues.id, row.venues.name);
    }
  }

  const toSortedOptions = (byId: Map<string, string>) =>
    Array.from(byId.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));

  return {
    cityOptions: toSortedOptions(cityById),
    venueOptions: toSortedOptions(venueById),
  };
}

export default async function EventsPage({
  searchParams,
}: Props) {
  const params = await searchParams;

  const supabase = await createClient();
  const { locale, dict } = await getTranslations();

  const search = params.search?.trim() ?? "";
  const cityId = params.city ?? "";
  const venueId = params.venue ?? "";
  const date = params.date ?? "";
  const page = Math.max(1, Number(params.page) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("events")
    .select(
      "*, cities(id, name, slug), venues(id, name, slug)",
      { count: "exact" }
    )
    .eq("status", "published");

  if (date) {
    query = query
      .gte("event_date", `${date}T00:00:00`)
      .lt("event_date", `${date}T23:59:59.999`);
  } else {
    query = query.gte("event_date", new Date().toISOString());
  }

  if (search) {
    const term = sanitizeForOrFilter(search);

    query = query.or(
      `title.ilike.%${term}%,artist.ilike.%${term}%,city.ilike.%${term}%,venue.ilike.%${term}%`
    );
  }

  if (cityId) {
    query = query.eq("city_id", cityId);
  }

  if (venueId) {
    query = query.eq("venue_id", venueId);
  }

  const {
    data: events,
    error,
    count,
  } = await query
    .order("event_date", { ascending: true })
    .range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  const { cityOptions, venueOptions } = await getFilterOptions(cityId);

  const rideCounts = await getRideCounts(
    supabase,
    (events ?? []).map((event) => event.id)
  );

  const eventsWithRideCount = (events ?? []).map(
    (event) => ({
      ...event,
      ride_count: rideCounts[event.id] ?? 0,
    })
  );

  const totalCount = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <>
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 pt-36 pb-24">
        <EventHeader />

        <EventsView
          events={eventsWithRideCount}
          totalCount={totalCount}
          page={page}
          totalPages={totalPages}
          cityOptions={cityOptions}
          venueOptions={venueOptions}
          initialSearch={search}
          initialCity={cityId}
          initialVenue={venueId}
          initialDeparture={params.from ?? ""}
          locale={locale}
          dict={dict.events}
        />
      </main>

      <Footer />
    </>
  );
}
