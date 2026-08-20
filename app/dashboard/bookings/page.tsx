import Link from "next/link";
import { redirect } from "next/navigation";

import BookingCard from "@/components/dashboard/BookingCard";
import { EmptyState } from "@/components/ui/empty-state";

import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "@/lib/i18n";
import { isPastDateTime } from "@/lib/utils/date";
import { toOne } from "@/lib/utils/relations";

export default async function MyBookingsPage() {
  const supabase = await createClient();
  const { locale, dict } = await getTranslations();

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
    <main className="mx-auto max-w-7xl px-6 pt-40 pb-24">

        {/* Header */}

        <div className="mb-10">
          <span className="inline-flex rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground">
            {dict.dashboardBookings.page.badge}
          </span>

          <h1 className="mt-5 text-2xl font-bold text-foreground">
            {dict.dashboardBookings.page.title}
          </h1>

          <p className="mt-4 text-lg text-muted-foreground">
            {dict.dashboardBookings.page.subtitle}
          </p>
        </div>

        {/* Nessuna prenotazione */}

        {bookings.length === 0 ? (
          <div className="text-center">
            <EmptyState
              title={dict.dashboardBookings.empty.title}
              description={dict.dashboardBookings.empty.description}
            />

            <Link
              href="/events"
              className="mt-8 inline-flex rounded-2xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition hover:bg-primary/90"
            >
              {dict.dashboardBookings.empty.cta}
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
                  dict={dict.dashboardBookings.card}
                  noShowDict={dict.reports.noShow}
                  locale={locale}
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
                      profile?.name ?? dict.dashboardBookings.card.driverFallback,

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
  );
}
