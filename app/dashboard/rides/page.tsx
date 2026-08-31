import Link from "next/link";
import { redirect } from "next/navigation";

import { Card } from "@/components/ui/card";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";
import { EmptyState } from "@/components/ui/empty-state";

import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "@/lib/i18n";
import { isEventConcluded } from "@/lib/utils/eventStatus";
import { toOne } from "@/lib/utils/relations";

export default async function MyRidesPage() {
  const supabase = await createClient();
  const { locale, dict } = await getTranslations();
  const t = dict.dashboardRides.listPage;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: rides, error } = await supabase
    .from("rides")
    .select(`
      id,
      event_id,
      departure_city,
      destination,
      departure_date,
      departure_time,
      return_date,
      return_time,
      available_seats,
      contribution,
      description,
      status,
      created_at,
      events (
        title,
        slug,
        venue,
        city,
        event_date
      )
    `)
    .eq("driver_id", user.id)
    .order("departure_date", {
      ascending: true,
    })
    .order("departure_time", {
      ascending: true,
    });

  if (error) {
    throw new Error(error.message);
  }

  return (
    <main className="mx-auto max-w-7xl px-6 pt-40 pb-24">

        {/* Header */}

        <div className="mb-10">
          <span className="inline-flex rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground">
            {t.badge}
          </span>

          <h1 className="mt-5 text-2xl font-bold text-foreground">
            {t.title}
          </h1>

          <p className="mt-4 text-lg text-muted-foreground">
            {t.subtitle}
          </p>
        </div>

        {/* Nessun passaggio */}

        {rides.length === 0 ? (
          <div className="text-center">
            <EmptyState
              title={t.emptyTitle}
              description={t.emptyDescription}
            />

            <Link
              href="/offer-ride"
              className="mt-8 inline-flex rounded-2xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition hover:bg-primary/90"
            >
              {t.emptyCta}
            </Link>
          </div>
        ) : (
          (() => {
            const cards = rides.map((ride) => {
              const event = toOne(ride.events);

              const eventConcluded = event?.event_date
                ? isEventConcluded(event.event_date)
                : false;

              const formattedDate =
                new Intl.DateTimeFormat(
                  locale === "en" ? "en-US" : "it-IT",
                  {
                    dateStyle: "long",
                  }
                ).format(
                  new Date(ride.departure_date)
                );

              const statusLabel =
                ride.status === "cancelled"
                  ? t.statusCancelled
                  : eventConcluded
                    ? t.statusConcluded
                    : ride.status === "active"
                      ? t.statusActive
                      : ride.status;

              const node = (
                <Card
                  key={ride.id}
                  className="p-7 transition hover:border-primary/30 hover:shadow-lg"
                >

                  {/* Header */}

                  <div className="flex items-start justify-between gap-4">

                    <div>
                      <p className="text-sm font-semibold text-primary">
                        {event?.title ?? t.eventLabel}
                      </p>

                      <h2 className="mt-1 text-2xl font-black text-foreground">
                        {ride.departure_city}
                        {" → "}
                        {ride.destination}
                      </h2>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                        ride.status === "active" && !eventConcluded
                          ? "bg-accent text-accent-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {statusLabel}
                    </span>

                  </div>

                  {/* Evento */}

                  <div className="mt-6 rounded-2xl bg-muted p-5">

                    <p className="text-sm font-semibold text-foreground">
                      {t.eventLabel}
                    </p>

                    <p className="mt-1 font-bold text-foreground">
                      {event?.title ?? t.eventLabel}
                    </p>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {event?.venue ?? ride.destination}

                      {event?.city
                        ? ` · ${event.city}`
                        : ""}
                    </p>

                  </div>

                  {/* Info */}

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">

                    <div>
                      <p className="text-sm text-muted-foreground">
                        {t.dateLabel}
                      </p>

                      <p className="mt-1 font-semibold text-foreground">
                        {formattedDate}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">
                        {t.departureLabel}
                      </p>

                      <p className="mt-1 font-semibold text-foreground">
                        {ride.departure_time.slice(0, 5)}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">
                        {t.returnLabel}
                      </p>

                      <p className="mt-1 font-semibold text-foreground">
                        {ride.return_time
                          ? ride.return_time.slice(0, 5)
                          : "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">
                        {t.seatsLabel}
                      </p>

                      <p className="mt-1 font-semibold text-foreground">
                        {ride.available_seats}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">
                        {t.contributionLabel}
                      </p>

                      <p className="mt-1 text-xl font-black text-primary">
                        €{" "}
                        {Number(
                          ride.contribution
                        ).toFixed(2)}
                      </p>
                    </div>

                  </div>

                  {/* Descrizione */}

                  {ride.description && (
                    <div className="mt-6 border-t border-border pt-5">
                      <p className="text-sm leading-6 text-muted-foreground">
                        {ride.description}
                      </p>
                    </div>
                  )}

                  {/* Azioni */}

                  <div className="mt-6 flex gap-3 border-t border-border pt-5">

                    {/* Vedi evento */}

                    {event?.slug &&
                      event.event_date &&
                      new Date(event.event_date) >
                        new Date() && (
                      <Link
                        href={`/events/${event.slug}`}
                        className="flex-1 rounded-2xl border border-border px-4 py-3 text-center text-sm font-semibold text-foreground transition hover:border-primary/30 hover:bg-accent hover:text-accent-foreground"
                      >
                        {t.viewEvent}
                      </Link>
                    )}

                    {/* Gestisci */}

                    {ride.status === "active" && (
                      <a
                        href={`/dashboard/rides/${ride.id}`}
                        target="_self"
                        className="flex-1 rounded-2xl bg-primary px-4 py-3 text-center text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                      >
                        {t.manage}
                      </a>
                    )}

                  </div>

                </Card>
              );

              return { eventConcluded, node };
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
                    label: t.tabActive,
                    count: activeCards.length,
                    content:
                      activeCards.length === 0 ? (
                        <EmptyState
                          title={t.emptyTitle}
                          description={t.emptyDescription}
                        />
                      ) : (
                        <div className="grid gap-6 lg:grid-cols-2">
                          {activeCards.map((card) => card.node)}
                        </div>
                      ),
                  },
                  {
                    id: "concluded",
                    label: t.tabConcluded,
                    count: concludedCards.length,
                    content:
                      concludedCards.length === 0 ? (
                        <EmptyState
                          title={t.concludedEmptyTitle}
                          description={t.concludedEmptyDescription}
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
