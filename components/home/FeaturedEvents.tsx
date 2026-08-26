import { unstable_cache } from "next/cache";

import EventGrid from "@/components/events/EventGrid";
import { createClient } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";
import { getRideCounts } from "@/lib/supabase/getRideCounts";
import { getTranslations } from "@/lib/i18n";

/*
 * "In evidenza" = più viste tra gli eventi futuri, con fallback
 * sulla data più vicina come tie-break (rilevante finché view_count
 * è ancora 0 per la maggior parte degli eventi). Stesso identico
 * risultato per ogni visitatore (dato pubblico, non filtrato per
 * utente), quindi cacheabile: evita di rifare questa query a ogni
 * singolo caricamento della home. unstable_cache non supporta l'uso
 * di cookies() al suo interno, da qui il client pubblico invece del
 * solito lib/supabase/server.ts.
 */
const getFeaturedEvents = unstable_cache(
  async () => {
    const supabase = createPublicClient();

    const { data, error } = await supabase
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

      return [];
    }

    return data ?? [];
  },
  ["featured-events"],
  { revalidate: 60 }
);

export default async function FeaturedEvents() {
  const supabase = await createClient();
  const { locale, dict } = await getTranslations();
  const t = dict.home.featuredEvents;

  const events = await getFeaturedEvents();

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
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="mb-12 flex items-end justify-between">
        <div>
          <h2 className="text-4xl font-bold text-foreground">
            {t.title}
          </h2>

          <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
            {t.subtitle}
          </p>
        </div>
      </div>

      <EventGrid events={eventsWithRideCount} locale={locale} dict={dict.events.card} />
    </section>
  );
}
