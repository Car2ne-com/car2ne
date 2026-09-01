import Link from "next/link";
import { redirect } from "next/navigation";

import BookingCard from "@/components/dashboard/BookingCard";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";
import { EmptyState } from "@/components/ui/empty-state";

import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "@/lib/i18n";
import { isPastDateTime } from "@/lib/utils/date";
import { isEventConcluded } from "@/lib/utils/eventStatus";
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
      paid_at,
      payment_method,
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
          name,
          payment_paypal_me,
          payment_revolut_me,
          payment_satispay_link
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
    <main className="mx-auto max-w-7xl px-6 pt-28 pb-24">

        {/* Header */}

        <div className="mb-10">
          <h1 className="mt-5 text-2xl font-semibold text-foreground">
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
              className="mt-8 inline-flex rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground transition hover:bg-primary/90"
            >
              {dict.dashboardBookings.empty.cta}
            </Link>
          </div>
        ) : (
          (() => {
            const cards = bookings
              .flatMap((booking) => {
                const ride = toOne(booking.rides);

                if (!ride) {
                  return [];
                }

                const event = toOne(ride.events);
                const profile = toOne(ride.profiles);

                const eventConcluded = event?.event_date
                  ? isEventConcluded(event.event_date)
                  : false;

                return [{
                  eventConcluded,
                  node: (
                    <BookingCard
                      key={booking.id}
                      dict={dict.dashboardBookings.card}
                      noShowDict={dict.reports.noShow}
                      ratingFormDict={dict.ratings.form}
                      locale={locale}
                      booking={{
                        id: booking.id,

                        status: booking.status,

                        rideId: booking.ride_id,

                        eventTitle:
                          event?.title ??
                          dict.dashboardBookings.card.eventFallback,

                        eventSlug: event?.slug ?? null,

                        eventVenue: event?.venue ?? null,

                        eventCity: event?.city ?? null,

                        departureCity: ride.departure_city,

                        destination: ride.destination,

                        departureDate: ride.departure_date,

                        departureTime: ride.departure_time,

                        contribution: Number(ride.contribution),

                        driverId: ride.driver_id,

                        driverName:
                          profile?.name ??
                          dict.dashboardBookings.card.driverFallback,

                        driverPaypalMe:
                          profile?.payment_paypal_me ?? null,

                        driverRevolutMe:
                          profile?.payment_revolut_me ?? null,

                        driverSatispayLink:
                          profile?.payment_satispay_link ?? null,

                        paidAt: booking.paid_at,

                        paymentMethod: booking.payment_method,

                        rideHasPassed: isPastDateTime(
                          ride.departure_date,
                          ride.departure_time
                        ),

                        eventConcluded,
                      }}
                    />
                  ),
                }];
              });

            const activeCards = cards.filter(
              (card) => !card.eventConcluded
            );

            const concludedCards = cards.filter(
              (card) => card.eventConcluded
            );

            return (
              <DashboardTabs
                tabs={[
                  {
                    id: "active",
                    label: dict.dashboardBookings.page.tabActive,
                    count: activeCards.length,
                    content:
                      activeCards.length === 0 ? (
                        <EmptyState
                          title={dict.dashboardBookings.empty.title}
                          description={
                            dict.dashboardBookings.empty.description
                          }
                        />
                      ) : (
                        <div className="grid gap-6 lg:grid-cols-2">
                          {activeCards.map((card) => card.node)}
                        </div>
                      ),
                  },
                  {
                    id: "concluded",
                    label: dict.dashboardBookings.page.tabConcluded,
                    count: concludedCards.length,
                    content:
                      concludedCards.length === 0 ? (
                        <EmptyState
                          title={
                            dict.dashboardBookings.concludedEmpty.title
                          }
                          description={
                            dict.dashboardBookings.concludedEmpty
                              .description
                          }
                        />
                      ) : (
                        <div className="grid gap-6 lg:grid-cols-2">
                          {concludedCards.map((card) => card.node)}
                        </div>
                      ),
                  },
                ]}
              />
            );
          })()
        )}
    </main>
  );
}
