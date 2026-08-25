import { notFound } from "next/navigation";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

import EventHero from "@/components/events/EventHero";
import EventConcluded from "@/components/events/EventConcluded";
import RideList from "@/components/events/RideList";

import { createClient } from "@/lib/supabase/server";
import { isEventConcluded } from "@/lib/utils/eventStatus";
import { getTranslations } from "@/lib/i18n";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function EventPage({ params }: Props) {
  const { slug } = await params;

  const supabase = await createClient();
  const { locale, dict } = await getTranslations();

  const { data: event, error } = await supabase
    .from("events")
    .select("*, cities(slug), venues(slug)")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error || !event) {
    notFound();
  }

  if (isEventConcluded(event.event_date)) {
    const reviewHref = await getReviewHref(supabase, event.id);

    return (
      <>
        <Navbar />

        <main className="pt-28">
          <EventConcluded
            event={event}
            locale={locale}
            dict={dict.events.concluded}
            reviewHref={reviewHref}
          />
        </main>

        <Footer />
      </>
    );
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
        <EventHero event={event} locale={locale} />

        <div className="mx-auto mt-14 max-w-7xl px-6">
          <RideList eventId={event.id} />
        </div>
      </main>

      <Footer />
    </>
  );
}

/*
 * Link al punto in cui l'utente può lasciare una recensione per
 * questo evento, solo se ha partecipato: conducente di un passaggio
 * legato all'evento (-> gestione del passaggio) oppure passeggero con
 * una prenotazione confermata (-> le sue prenotazioni). null se non
 * ha partecipato o non è loggato.
 */
async function getReviewHref(
  supabase: Awaited<ReturnType<typeof createClient>>,
  eventId: string
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: driverRide } = await supabase
    .from("rides")
    .select("id")
    .eq("event_id", eventId)
    .eq("driver_id", user.id)
    .limit(1)
    .maybeSingle();

  if (driverRide) {
    return `/dashboard/rides/${driverRide.id}`;
  }

  const { data: passengerBooking } = await supabase
    .from("bookings")
    .select("id, rides!inner(event_id)")
    .eq("status", "confirmed")
    .eq("rides.event_id", eventId)
    .eq("passenger_id", user.id)
    .limit(1)
    .maybeSingle();

  if (passengerBooking) {
    return "/dashboard/bookings";
  }

  return null;
}