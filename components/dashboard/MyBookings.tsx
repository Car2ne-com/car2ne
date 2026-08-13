import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  MapPin,
  Ticket,
  User2,
} from "lucide-react";

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
    <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">

      {/* Header */}

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900">
            Le mie prenotazioni
          </h2>

          <p className="mt-2 text-slate-500">
            I passaggi che hai prenotato.
          </p>
        </div>

        <Link
          href="/dashboard/bookings"
          className="text-sm font-semibold text-emerald-600 hover:text-emerald-700"
        >
          Vedi tutte →
        </Link>
      </div>

      {/* Nessuna prenotazione */}

      {formattedBookings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
            <Ticket className="h-7 w-7 text-emerald-600" />
          </div>

          <h3 className="mt-4 text-lg font-bold text-slate-900">
            Nessuna prenotazione
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Non hai ancora prenotato nessun passaggio.
          </p>

          <Link
            href="/events"
            className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600"
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
                className="rounded-2xl border border-slate-200 p-5 transition hover:border-emerald-200 hover:shadow-md"
              >

                {/* Evento + stato */}

                <div className="flex items-start justify-between gap-4">

                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {booking.eventTitle}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {booking.route}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                      isConfirmed
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {isConfirmed
                      ? "Confermato"
                      : "Annullato"}
                  </span>

                </div>

                {/* Info */}

                <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">

                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-emerald-600" />

                    {booking.route}
                  </div>

                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-emerald-600" />

                    {booking.date}
                    {" · "}
                    {booking.time}
                  </div>

                  <div className="flex items-center gap-2">
                    <User2 className="h-4 w-4 text-emerald-600" />

                    {booking.driver}
                  </div>

                  <div className="flex items-center gap-2">
                    <Ticket className="h-4 w-4 text-emerald-600" />

                    €{" "}
                    {booking.contribution.toFixed(2)}
                  </div>

                </div>

                {/* Azione */}

                <div className="mt-5 border-t border-slate-100 pt-4">

                  <Link
                    href="/dashboard/bookings"
                    className="inline-flex items-center gap-2 font-semibold text-emerald-600 hover:text-emerald-700"
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

    </section>
  );
}