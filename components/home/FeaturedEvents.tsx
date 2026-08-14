import EventGrid from "@/components/events/EventGrid";
import { createClient } from "@/lib/supabase/server";
import { getRideCounts } from "@/lib/supabase/getRideCounts";

export default async function FeaturedEvents() {
  const supabase = await createClient();

  const { data: events, error } = await supabase
    .from("events")
    .select("*")
    .eq("status", "published")
    .order("event_date", { ascending: true })
    .limit(6);

  if (error) {
    console.error(
      "SUPABASE EVENTS ERROR:",
      JSON.stringify(error, Object.getOwnPropertyNames(error), 2)
    );

    console.error("SUPABASE EVENTS ERROR CAUSE:", error.cause);
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
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="mb-12 flex items-end justify-between">
        <div>
          <h2 className="text-4xl font-bold text-slate-900">
            Eventi in evidenza
          </h2>

          <p className="mt-3 max-w-2xl text-lg text-slate-600">
            Scopri gli eventi più interessanti della community.
          </p>
        </div>
      </div>

      <EventGrid events={eventsWithRideCount} />
    </section>
  );
}
