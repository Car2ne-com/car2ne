import type { Metadata } from "next";
import { notFound } from "next/navigation";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import VenueHero from "@/components/venues/VenueHero";
import EventGrid from "@/components/events/EventGrid";
import { EmptyState } from "@/components/ui/empty-state";

import { createClient } from "@/lib/supabase/server";
import { getRideCounts } from "@/lib/supabase/getRideCounts";
import { getTranslations } from "@/lib/i18n";
import type { City } from "@/types/city";
import type { Venue } from "@/types/venue";

type Props = {
  params: Promise<{ slug: string; venueSlug: string }>;
};

async function getCityAndVenue(
  citySlug: string,
  venueSlug: string
): Promise<{ city: City; venue: Venue } | null> {
  const supabase = await createClient();

  const { data: city, error: cityError } = await supabase
    .from("cities")
    .select("*")
    .eq("slug", citySlug)
    .maybeSingle();

  if (cityError) {
    throw new Error(cityError.message);
  }

  if (!city) {
    return null;
  }

  const { data: venue, error: venueError } = await supabase
    .from("venues")
    .select("*")
    .eq("city_id", city.id)
    .eq("slug", venueSlug)
    .maybeSingle();

  if (venueError) {
    throw new Error(venueError.message);
  }

  if (!venue) {
    return null;
  }

  return { city, venue };
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { slug, venueSlug } = await params;
  const result = await getCityAndVenue(slug, venueSlug);

  if (!result) {
    return {};
  }

  const { city, venue } = result;

  const { dict } = await getTranslations();
  const title = dict.cities.meta.venue.title
    .replace("{venue}", venue.name)
    .replace("{city}", city.name);
  const description = dict.cities.meta.venue.description
    .replace("{venue}", venue.name)
    .replace("{city}", city.name);

  return {
    title,
    description,
    alternates: {
      canonical: `/citta/${city.slug}/venue/${venue.slug}`,
    },
    openGraph: {
      title,
      description,
    },
  };
}

export default async function VenuePage({ params }: Props) {
  const { slug, venueSlug } = await params;
  const result = await getCityAndVenue(slug, venueSlug);

  if (!result) {
    notFound();
  }

  const { city, venue } = result;

  const supabase = await createClient();
  const { locale, dict } = await getTranslations();

  const { data: events, error: eventsError } = await supabase
    .from("events")
    .select("*, cities(id, name, slug), venues(id, name, slug)")
    .eq("venue_id", venue.id)
    .eq("status", "published")
    .gte("event_date", new Date().toISOString())
    .order("event_date", { ascending: true });

  if (eventsError) {
    throw new Error(eventsError.message);
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
        <VenueHero city={city} venue={venue} eventCount={events?.length ?? 0} dict={dict.cities.venueHero} />

        {eventsWithRideCount.length > 0 ? (
          <EventGrid events={eventsWithRideCount} locale={locale} dict={dict.events.card} />
        ) : (
          <EmptyState title={dict.events.empty.title} description={dict.events.empty.description} />
        )}
      </main>

      <Footer />
    </>
  );
}
