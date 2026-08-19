import Link from "next/link";
import { redirect } from "next/navigation";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "@/lib/i18n";
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
    <>
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 pt-40 pb-24">

        {/* Header */}

        <div className="mb-10">
          <span className="inline-flex rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
            {t.badge}
          </span>

          <h1 className="mt-5 text-5xl font-black tracking-tight text-slate-900">
            {t.title}
          </h1>

          <p className="mt-4 text-lg text-slate-600">
            {t.subtitle}
          </p>
        </div>

        {/* Nessun passaggio */}

        {rides.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-8 py-20 text-center">

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-4xl">
              🚗
            </div>

            <h2 className="mt-6 text-2xl font-bold text-slate-900">
              {t.emptyTitle}
            </h2>

            <p className="mx-auto mt-3 max-w-lg text-slate-500">
              {t.emptyDescription}
            </p>

            <Link
              href="/offer-ride"
              className="mt-8 inline-flex rounded-2xl bg-emerald-500 px-6 py-3 font-semibold text-white transition hover:bg-emerald-600"
            >
              {t.emptyCta}
            </Link>

          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">

            {rides.map((ride) => {
              const event = toOne(ride.events);

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
                ride.status === "active"
                  ? t.statusActive
                  : ride.status === "cancelled"
                    ? t.statusCancelled
                    : ride.status;

              return (
                <div
                  key={ride.id}
                  className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition hover:border-emerald-200 hover:shadow-lg"
                >

                  {/* Header */}

                  <div className="flex items-start justify-between gap-4">

                    <div>
                      <p className="text-sm font-semibold text-emerald-600">
                        {event?.title ?? t.eventLabel}
                      </p>

                      <h2 className="mt-1 text-2xl font-black text-slate-900">
                        {ride.departure_city}
                        {" → "}
                        {ride.destination}
                      </h2>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                        ride.status === "active"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {statusLabel}
                    </span>

                  </div>

                  {/* Evento */}

                  <div className="mt-6 rounded-2xl bg-slate-50 p-5">

                    <p className="text-sm font-semibold text-slate-700">
                      {t.eventLabel}
                    </p>

                    <p className="mt-1 font-bold text-slate-900">
                      {event?.title ?? t.eventLabel}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {event?.venue ?? ride.destination}

                      {event?.city
                        ? ` · ${event.city}`
                        : ""}
                    </p>

                  </div>

                  {/* Info */}

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">

                    <div>
                      <p className="text-sm text-slate-500">
                        {t.dateLabel}
                      </p>

                      <p className="mt-1 font-semibold text-slate-900">
                        {formattedDate}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-slate-500">
                        {t.departureLabel}
                      </p>

                      <p className="mt-1 font-semibold text-slate-900">
                        {ride.departure_time.slice(0, 5)}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-slate-500">
                        {t.seatsLabel}
                      </p>

                      <p className="mt-1 font-semibold text-slate-900">
                        {ride.available_seats}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-slate-500">
                        {t.contributionLabel}
                      </p>

                      <p className="mt-1 text-xl font-black text-emerald-600">
                        €{" "}
                        {Number(
                          ride.contribution
                        ).toFixed(2)}
                      </p>
                    </div>

                  </div>

                  {/* Descrizione */}

                  {ride.description && (
                    <div className="mt-6 border-t border-slate-100 pt-5">
                      <p className="text-sm leading-6 text-slate-600">
                        {ride.description}
                      </p>
                    </div>
                  )}

                  {/* Azioni */}

                  <div className="mt-6 flex gap-3 border-t border-slate-100 pt-5">

                    {/* Vedi evento */}

                    {event?.slug &&
                      event.event_date &&
                      new Date(event.event_date) >
                        new Date() && (
                      <Link
                        href={`/events/${event.slug}`}
                        className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-center text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                      >
                        {t.viewEvent}
                      </Link>
                    )}

                    {/* Gestisci */}

                    {ride.status === "active" && (
                      <a
                        href={`/dashboard/rides/${ride.id}`}
                        target="_self"
                        className="flex-1 rounded-2xl bg-emerald-500 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-emerald-600"
                      >
                        {t.manage}
                      </a>
                    )}

                  </div>

                </div>
              );
            })}

          </div>
        )}

      </main>

      <Footer />
    </>
  );
}
