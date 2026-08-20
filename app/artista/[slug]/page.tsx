import type { Metadata } from "next";
import { notFound } from "next/navigation";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ArtistHero from "@/components/artists/ArtistHero";
import EventGrid from "@/components/events/EventGrid";
import { EmptyState } from "@/components/ui/empty-state";

import { createClient } from "@/lib/supabase/server";
import { getRideCounts } from "@/lib/supabase/getRideCounts";
import { getTranslations } from "@/lib/i18n";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: sample } = await supabase
    .from("events")
    .select("artist")
    .eq("artist_slug", slug)
    .eq("status", "published")
    .gte("event_date", new Date().toISOString())
    .limit(1)
    .maybeSingle();

  if (!sample) {
    return {};
  }

  const { dict } = await getTranslations();
  const title = dict.cities.meta.artist.title.replace("{artist}", sample.artist);
  const description = dict.cities.meta.artist.description.replace(
    "{artist}",
    sample.artist
  );

  return {
    title,
    description,
    alternates: {
      canonical: `/artista/${slug}`,
    },
    openGraph: {
      title,
      description,
    },
  };
}

export default async function ArtistPage({
  params,
}: Props) {
  const { slug } = await params;

  const supabase = await createClient();
  const { locale, dict } = await getTranslations();

  const { data: events, error } = await supabase
    .from("events")
    .select("*, cities(id, name, slug), venues(id, name, slug)")
    .eq("artist_slug", slug)
    .eq("status", "published")
    .gte("event_date", new Date().toISOString())
    .order("event_date", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  if (!events || events.length === 0) {
    notFound();
  }

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
        <ArtistHero
          artistName={events[0].artist}
          eventCount={events.length}
          dict={dict.cities.artistHero}
        />

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
