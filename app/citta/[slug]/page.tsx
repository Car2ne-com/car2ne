import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { unstable_cache } from "next/cache";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CityHero from "@/components/cities/CityHero";
import CityVenueList from "@/components/cities/CityVenueList";
import EventGrid from "@/components/events/EventGrid";
import { EmptyState } from "@/components/ui/empty-state";

import { getRideCounts } from "@/lib/supabase/getRideCounts";
import { createClient } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";
import { getTranslations } from "@/lib/i18n";
import type { City } from "@/types/city";
import type { Venue } from "@/types/venue";

type Props = {
  params: Promise<{ slug: string }>;
};

/*
 * Città e i suoi eventi/venue pubblicati sono dati pubblici, identici
 * per ogni visitatore: cacheabili con client pubblico (unstable_cache
 * non supporta cookies() al suo interno, quindi non il solito
 * lib/supabase/server.ts). I conteggi passaggi restano fuori dalla
 * cache: cambiano più spesso e sono già una query separata e leggera.
 */
const getCity = unstable_cache(
  async (slug: string): Promise<City | null> => {
    const supabase = createPublicClient();

    const { data, error } = await supabase
      .from("cities")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },
  ["city-by-slug"],
  { revalidate: 60 }
);

const getCityEventsAndVenues = unstable_cache(
  async (cityId: string) => {
    const supabase = createPublicClient();

    const [
      { data: events, error: eventsError },
      { data: venues, error: venuesError },
    ] = await Promise.all([
      supabase
        .from("events")
        .select("*, cities(id, name, slug), venues(id, name, slug)")
        .eq("city_id", cityId)
        .eq("status", "published")
        .gte("event_date", new Date().toISOString())
        .order("event_date", { ascending: true }),
      supabase
        .from("venues")
        .select("*")
        .eq("city_id", cityId)
        .order("name", { ascending: true }),
    ]);

    if (eventsError) {
      throw new Error(eventsError.message);
    }

    if (venuesError) {
      throw new Error(venuesError.message);
    }

    return {
      events: events ?? [],
      venues: (venues ?? []) as Venue[],
    };
  },
  ["city-events-and-venues"],
  { revalidate: 60 }
);

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { slug } = await params;
  const city = await getCity(slug);

  if (!city) {
    return {};
  }

  const { dict } = await getTranslations();
  const title = dict.cities.meta.city.title.replace("{city}", city.name);
  const description = dict.cities.meta.city.description.replace(
    "{city}",
    city.name
  );

  return {
    title,
    description,
    alternates: {
      canonical: `/citta/${city.slug}`,
    },
    openGraph: {
      title,
      description,
    },
  };
}

export default async function CityPage({ params }: Props) {
  const { slug } = await params;
  const city = await getCity(slug);

  if (!city) {
    notFound();
  }

  const { locale, dict } = await getTranslations();

  const { events, venues } = await getCityEventsAndVenues(city.id);

  const supabase = await createClient();

  const rideCounts = await getRideCounts(
    supabase,
    events.map((event) => event.id)
  );

  const eventsWithRideCount = events.map(
    (event) => ({
      ...event,
      ride_count: rideCounts[event.id] ?? 0,
    })
  );

  return (
    <>
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 pt-36 pb-24">
        <CityHero city={city} eventCount={events.length} dict={dict.cities.hero} />

        {eventsWithRideCount.length > 0 ? (
          <EventGrid events={eventsWithRideCount} locale={locale} dict={dict.events.card} />
        ) : (
          <EmptyState title={dict.events.empty.title} description={dict.events.empty.description} />
        )}

        <CityVenueList city={city} venues={venues} dict={dict.cities.venueList} />
      </main>

      <Footer />
    </>
  );
}
