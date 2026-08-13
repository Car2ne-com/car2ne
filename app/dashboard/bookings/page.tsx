import Link from "next/link";
import { redirect } from "next/navigation";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BookingCard from "@/components/dashboard/BookingCard";

import { createClient } from "@/lib/supabase/server";
import { isPastDateTime } from "@/lib/utils/date";
import { toOne } from "@/lib/utils/relations";

export default async function MyBookingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: bookings, error } = await supabase
    .from("bookings")
    .select(`
      id,
      ride_id,
      status,
      created_at,
      updated_at,
      rides (
        id,
        departure_city,
        destination,
        departure_date,
        departure_time,
        contribution,
        available_seats,
        driver_id,
        profiles (
          id,
          name
        ),
        events (
          title,
          slug,
          venue,
          city,
          event_date
        )
      )
    `)
    .eq("passenger_id", user.id)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error(
      "Errore caricamento prenotazioni:",
      error
    );

    throw new Error(error.message);
  }

  return (
    <>
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 pt-40 pb-24">

        {/* Header */}

        <div className="mb-10">
          <span className="inline-flex rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
            🎟️ Le mie prenotazioni
          </span>

          <h1 className="mt-5 text-5xl font-black tracking-tight text-slate-900">
            Le mie prenotazioni
          </h1>

          <p className="mt-4 text-lg text-slate-600">
            Gestisci i passaggi che hai prenotato su Car2ne.
          </p>
        </div>

        {/* Nessuna prenotazione */}

        {bookings.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-8 py-20 text-center">

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-4xl">
              🎟️
            </div>

            <h2 className="mt-6 text-2xl font-bold text-slate-900">
              Non hai ancora prenotazioni
            </h2>

            <p className="mx-auto mt-3 max-w-lg text-slate-500">
              Quando prenoterai un passaggio, lo troverai
              qui e potrai gestirlo direttamente dal tuo
              account.
            </p>

            <Link
              href="/events"
              className="mt-8 inline-flex rounded-2xl bg-emerald-500 px-6 py-3 font-semibold text-white transition hover:bg-emerald-600"
            >
              Cerca un evento
            </Link>

          </div>
        ) : (

          /* Lista prenotazioni */

          <div className="grid gap-6 lg:grid-cols-2">

            {bookings.map((booking) => {
              const ride = toOne(booking.rides);

              if (!ride) {
                return null;
              }

              const event = toOne(ride.events);
              const profile = toOne(ride.profiles);

              return (
                <BookingCard
                  key={booking.id}
                  booking={{
                    id: booking.id,

                    status: booking.status,

                    rideId: booking.ride_id,

                    eventTitle:
                      event?.title ?? "Evento",

                    eventSlug:
                      event?.slug ?? null,

                    eventVenue:
                      event?.venue ?? null,

                    eventCity:
                      event?.city ?? null,

                    departureCity:
                      ride.departure_city,

                    destination:
                      ride.destination,

                    departureDate:
                      ride.departure_date,

                    departureTime:
                      ride.departure_time,

                    contribution:
                      Number(ride.contribution),

                    driverId: ride.driver_id,

                    driverName:
                      profile?.name ?? "Conducente",

                    rideHasPassed:
                      isPastDateTime(
                        ride.departure_date,
                        ride.departure_time
                      ),
                  }}
                />
              );
            })}

          </div>
        )}
      </main>

      <Footer />
    </>
  );
}