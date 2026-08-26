import type { Metadata } from "next";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import EventHeader from "@/components/events/EventHeader";
import EventsView from "@/components/events/EventsView";

import { createClient } from "@/lib/supabase/server";
import { getRideCounts } from "@/lib/supabase/getRideCounts";
import { getTranslations } from "@/lib/i18n";

type Props = {
  searchParams: Promise<{
    search?: string;
    from?: string;
    date?: string;
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

export default async function EventsPage({
  searchParams,
}: Props) {
  const params = await searchParams;

  const supabase = await createClient();
  const { locale, dict } = await getTranslations();

  const { data: events, error } = await supabase
    .from("events")
    .select("*, cities(id, name, slug), venues(id, name, slug)")
    .eq("status", "published")
    .gte("event_date", new Date().toISOString())
    .order("event_date", {
      ascending: true,
    })
    /*
     * Tetto di sicurezza, non una vera paginazione server-side: la
     * ricerca/filtro di EventsView restano lato client su questo
     * risultato. Senza un limite la query cresce senza freni con il
     * catalogo eventi (era proprio l'assenza di un .limit() qui dietro
     * al payload da megabyte del form "Offri un passaggio" — vedi
     * audit). 500 è ben oltre il volume attuale (~450 eventi pubblicati
     * futuri): non cambia il comportamento oggi, evita solo che la
     * pagina si aggravi in silenzio man mano che il catalogo cresce.
     */
    .limit(500);

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
          locale={locale}
          dict={dict.events}
        />
      </main>

      <Footer />
    </>
  );
}
