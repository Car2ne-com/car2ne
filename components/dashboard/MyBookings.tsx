import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  MapPin,
  Ticket,
  User2,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

import { createClient } from "@/lib/supabase/server";
import { toOne } from "@/lib/utils/relations";

export default async function MyBookings() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: bookings, error } = await supabase
    .from("bookings")
    .select(`
      id,
      status,
      created_at,
      rides (
        id,
        departure_city,
        destination,
        departure_date,
        departure_time,
        contribution,
        profiles (
          name
        ),
        events (
          title,
          slug,
          venue,
          city
        )
      )
    `)
    .eq("passenger_id", user.id)
    .order("created_at", {
      ascending: false,
    })
    .limit(3);

  if (error) {
    console.error(
      "Errore caricamento prenotazioni:",
      error
    );
  }

  const formattedBookings =
    bookings
      ?.map((booking) => {
        const ride = toOne(booking.rides);

        if (!ride) {
          return null;
        }

        const event = toOne(ride.events);
        const profile = toOne(ride.profiles);

        const formattedDate =
          new Intl.DateTimeFormat("it-IT", {
            dateStyle: "long",
          }).format(
            new Date(ride.departure_date)
          );

        return {
          id: booking.id,
          status: booking.status,

          eventTitle:
            event?.title ?? "Evento",

          eventSlug:
            event?.slug ?? null,

          route:
            `${ride.departure_city} → ${ride.destination}`,

          date: formattedDate,

          time:
            ride.departure_time.slice(0, 5),

          driver:
            profile?.name ?? "Conducente",

          contribution:
            Number(ride.contribution),
        };
      })
      .filter(
        (
          booking
        ): booking is NonNullable<typeof booking> =>
          booking !== null
      ) ?? [];

  return (
    <Card className="p-8">

      {/* Header */}

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Le mie prenotazioni
          </h2>

          <p className="mt-2 text-muted-foreground">
            I passaggi che hai prenotato.
          </p>
        </div>

        <Link
          href="/dashboard/bookings"
          className="text-sm font-semibold text-primary hover:text-primary/80"
        >
          Vedi tutte →
        </Link>
      </div>

      {/* Nessuna prenotazione */}

      {formattedBookings.length === 0 ? (
        <div className="text-center">
          <EmptyState
            icon={Ticket}
            title="Nessuna prenotazione"
            description="Non hai ancora prenotato nessun passaggio."
            className="rounded-2xl py-10"
          />

          <Link
            href="/events"
            className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            Trova un evento

            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (

        /* Prenotazioni */

        <div className="space-y-5">

          {formattedBookings.map((booking) => {
            const isConfirmed =
              booking.status === "confirmed";

            return (
              <div
                key={booking.id}
                className="rounded-2xl border border-border p-5 transition hover:border-primary/30 hover:shadow-md"
              >

                {/* Evento + stato */}

                <div className="flex items-start justify-between gap-4">

                  <div>
                    <h3 className="text-lg font-bold text-foreground">
                      {booking.eventTitle}
                    </h3>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {booking.route}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                      isConfirmed
                        ? "bg-accent text-accent-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isConfirmed
                      ? "Confermato"
                      : "Annullato"}
                  </span>

                </div>

                {/* Info */}

                <div className="mt-4 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">

                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />

                    {booking.route}
                  </div>

                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-primary" />

                    {booking.date}
                    {" · "}
                    {booking.time}
                  </div>

                  <div className="flex items-center gap-2">
                    <User2 className="h-4 w-4 text-primary" />

                    {booking.driver}
                  </div>

                  <div className="flex items-center gap-2">
                    <Ticket className="h-4 w-4 text-primary" />

                    €{" "}
                    {booking.contribution.toFixed(2)}
                  </div>

                </div>

                {/* Azione */}

                <div className="mt-5 border-t border-border pt-4">

                  <Link
                    href="/dashboard/bookings"
                    className="inline-flex items-center gap-2 font-semibold text-primary hover:text-primary/80"
                  >
                    Gestisci prenotazione

                    <ArrowRight className="h-4 w-4" />
                  </Link>

                </div>

              </div>
            );
          })}

        </div>
      )}

    </Card>
  );
}