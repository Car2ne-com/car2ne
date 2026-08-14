import type { Metadata } from "next";
import { notFound } from "next/navigation";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CityHero from "@/components/cities/CityHero";
import CityVenueList from "@/components/cities/CityVenueList";
import EventGrid from "@/components/events/EventGrid";
import EmptyState from "@/components/events/EmptyState";

import { createClient } from "@/lib/supabase/server";
import { getRideCounts } from "@/lib/supabase/getRideCounts";
import type { City } from "@/types/city";
import type { Venue } from "@/types/venue";

type Props = {
  params: Promise<{ slug: string }>;
};

async function getCity(slug: string): Promise<City | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("cities")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { slug } = await params;
  const city = await getCity(slug);

  if (!city) {
    return {};
  }

  const title = `Eventi a ${city.name} | Car2ne`;
  const description = `Scopri i prossimi concerti, festival e spettacoli a ${city.name} e trova un passaggio auto per raggiungerli con Car2ne.`;

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

  const supabase = await createClient();

  const [{ data: events, error: eventsError }, { data: venues, error: venuesError }] =
    await Promise.all([
      supabase
        .from("events")
        .select("*")
        .eq("city_id", city.id)
        .eq("status", "published")
        .order("event_date", { ascending: true }),
      supabase
        .from("venues")
        .select("*")
        .eq("city_id", city.id)
        .order("name", { ascending: true }),
    ]);

  if (eventsError) {
    throw new Error(eventsError.message);
  }

  if (venuesError) {
    throw new Error(venuesError.message);
  }

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

  return (
    <>
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 pt-36 pb-24">
        <CityHero city={city} eventCount={events?.length ?? 0} />

        {eventsWithRideCount.length > 0 ? (
          <EventGrid events={eventsWithRideCount} />
        ) : (
          <EmptyState />
        )}

        <CityVenueList city={city} venues={(venues ?? []) as Venue[]} />
      </main>

      <Footer />
    </>
  );
}
