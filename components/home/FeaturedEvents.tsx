import EventGrid from "@/components/events/EventGrid";
import { createClient } from "@/lib/supabase/server";
import { getRideCounts } from "@/lib/supabase/getRideCounts";
import { getTranslations } from "@/lib/i18n";

export default async function FeaturedEvents() {
  const supabase = await createClient();
  const { locale, dict } = await getTranslations();
  const t = dict.home.featuredEvents;

  /*
   * "In evidenza" = più viste tra gli eventi futuri, con fallback
   * sulla data più vicina come tie-break (rilevante finché
   * view_count è ancora 0 per la maggior parte degli eventi).
   */
  const { data: events, error } = await supabase
    .from("events")
    .select("*, cities(id, name, slug), venues(id, name, slug)")
    .eq("status", "published")
    .gte("event_date", new Date().toISOString())
    .order("view_count", { ascending: false })
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
            {t.title}
          </h2>

          <p className="mt-3 max-w-2xl text-lg text-slate-600">
            {t.subtitle}
          </p>
        </div>
      </div>

      <EventGrid events={eventsWithRideCount} locale={locale} dict={dict.events.card} />
    </section>
  );
}
