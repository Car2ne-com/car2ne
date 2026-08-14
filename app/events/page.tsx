import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import EventHeader from "@/components/events/EventHeader";
import EventsView from "@/components/events/EventsView";

import { createClient } from "@/lib/supabase/server";
import { getRideCounts } from "@/lib/supabase/getRideCounts";

type Props = {
  searchParams: Promise<{
    search?: string;
    from?: string;
    date?: string;
  }>;
};

export default async function EventsPage({
  searchParams,
}: Props) {
  const params = await searchParams;

  const supabase = await createClient();

  const { data: events, error } = await supabase
    .from("events")
    .select("*")
    .eq("status", "published")
    .gte("event_date", new Date().toISOString())
    .order("event_date", {
      ascending: true,
    });

  if (error) {
    throw new Error(error.message);
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
        <EventHeader />

        <EventsView
          events={eventsWithRideCount}
          initialSearch={params.search ?? ""}
          initialDate={params.date ?? ""}
          initialDeparture={params.from ?? ""}
        />
      </main>

      <Footer />
    </>
  );
}
