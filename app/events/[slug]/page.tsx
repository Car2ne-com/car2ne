import type { Metadata } from "next";
import { notFound } from "next/navigation";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

import EventHero from "@/components/events/EventHero";
import EventConcluded from "@/components/events/EventConcluded";
import RideList from "@/components/events/RideList";

import { createClient } from "@/lib/supabase/server";
import { isEventConcluded } from "@/lib/utils/eventStatus";
import { getTranslations } from "@/lib/i18n";
import { SITE_URL } from "@/lib/siteConfig";
import { toOne } from "@/lib/utils/relations";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

type EventRecord = NonNullable<
  Awaited<ReturnType<typeof getEvent>>
>;

function getEventVenue(event: EventRecord) {
  const venue = toOne(event.venues);

  if (!venue?.latitude || !venue?.longitude) {
    return null;
  }

  return {
    lat: venue.latitude,
    lng: venue.longitude,
    name: event.venue,
  };
}

async function getEvent(slug: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("events")
    .select("*, cities(slug), venues(slug, latitude, longitude)")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  return data;
}

/*
 * Schema.org Event: aiuta Google a mostrare rich result (data, luogo,
 * immagine) per le pagine evento, il contenuto a più alto valore SEO
 * del sito.
 */
function buildEventJsonLd(event: EventRecord) {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    startDate: event.event_date,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode:
      "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: event.venue,
      address: event.city,
    },
    performer: {
      "@type": "PerformingGroup",
      name: event.artist,
    },
    ...(event.image_url ? { image: [event.image_url] } : {}),
    ...(event.description
      ? { description: event.description }
      : {}),
    url: new URL(`/events/${event.slug}`, SITE_URL).toString(),
  };
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEvent(slug);

  if (!event) {
    return {};
  }

  const { dict } = await getTranslations();
  const { title: titleTemplate, description: descriptionTemplate } =
    dict.events.meta.detail;

  const title = titleTemplate.replace("{title}", event.title);
  const description = descriptionTemplate
    .replace("{artist}", event.artist)
    .replace("{venue}", event.venue)
    .replace("{city}", event.city);

  return {
    title,
    description,
    alternates: {
      canonical: `/events/${event.slug}`,
    },
    openGraph: {
      title,
      description,
      images: event.image_url ? [event.image_url] : undefined,
    },
  };
}

export default async function EventPage({ params }: Props) {
  const { slug } = await params;

  const supabase = await createClient();
  const { locale, dict } = await getTranslations();

  const event = await getEvent(slug);

  if (!event) {
    notFound();
  }

  const jsonLd = buildEventJsonLd(event);

  if (isEventConcluded(event.event_date)) {
    const reviewHref = await getReviewHref(supabase, event.id);

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <Navbar />

      <main className="pb-24 pt-28">
        <EventHero event={event} locale={locale} />

        <div className="mx-auto mt-14 max-w-7xl px-6">
          <RideList eventId={event.id} venue={getEventVenue(event)} />
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