import { notFound } from "next/navigation";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

import EventHero from "@/components/events/EventHero";
import RideList from "@/components/events/RideList";

import { createClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function EventPage({ params }: Props) {
  const { slug } = await params;

  const supabase = await createClient();

  const { data: event, error } = await supabase
    .from("events")
    .select("*, cities(slug), venues(slug)")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error || !event) {
    notFound();
  }

  const { error: viewError } = await supabase.rpc(
    "increment_event_views",
    { event_id: event.id }
  );

  if (viewError) {
    console.error(
      "Errore incremento visualizzazioni evento:",
      viewError.message
    );
  }

  return (
    <>
      <Navbar />

      <main className="pb-24 pt-28">
        <EventHero event={event} />

        <div className="mx-auto mt-14 max-w-7xl px-6">
          <RideList eventId={event.id} />
        </div>
      </main>

      <Footer />
    </>
  );
}