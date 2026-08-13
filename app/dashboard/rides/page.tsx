import Link from "next/link";
import { redirect } from "next/navigation";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

import { createClient } from "@/lib/supabase/server";
import { toOne } from "@/lib/utils/relations";

export default async function MyRidesPage() {
  const supabase = await createClient();

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
            🚗 I miei passaggi
          </span>

          <h1 className="mt-5 text-5xl font-black tracking-tight text-slate-900">
            I miei passaggi
          </h1>

          <p className="mt-4 text-lg text-slate-600">
            Gestisci i passaggi che hai pubblicato su Car2ne.
          </p>
        </div>

        {/* Nessun passaggio */}

        {rides.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-8 py-20 text-center">

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-4xl">
              🚗
            </div>

            <h2 className="mt-6 text-2xl font-bold text-slate-900">
              Non hai ancora pubblicato passaggi
            </h2>

            <p className="mx-auto mt-3 max-w-lg text-slate-500">
              Quando offrirai un passaggio, lo troverai
              qui e potrai gestirlo direttamente dal tuo
              account.
            </p>

            <Link
              href="/offer-ride"
              className="mt-8 inline-flex rounded-2xl bg-emerald-500 px-6 py-3 font-semibold text-white transition hover:bg-emerald-600"
            >
              Offri un passaggio
            </Link>

          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">

            {rides.map((ride) => {
              const event = toOne(ride.events);

              const formattedDate =
                new Intl.DateTimeFormat(
                  "it-IT",
                  {
                    dateStyle: "long",
                  }
                ).format(
                  new Date(ride.departure_date)
                );

              const statusLabel =
                ride.status === "active"
                  ? "Attivo"
                  : ride.status === "cancelled"
                    ? "Annullato"
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
                        {event?.title ?? "Evento"}
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
                      Evento
                    </p>

                    <p className="mt-1 font-bold text-slate-900">
                      {event?.title ?? "Evento"}
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
                        Data
                      </p>

                      <p className="mt-1 font-semibold text-slate-900">
                        {formattedDate}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-slate-500">
                        Partenza
                      </p>

                      <p className="mt-1 font-semibold text-slate-900">
                        {ride.departure_time.slice(0, 5)}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-slate-500">
                        Posti disponibili
                      </p>

                      <p className="mt-1 font-semibold text-slate-900">
                        {ride.available_seats}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-slate-500">
                        Contributo
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

                    {event?.slug && (
                      <Link
                        href={`/events/${event.slug}`}
                        className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-center text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                      >
                        Vedi evento
                      </Link>
                    )}

                    {/* Gestisci */}

                    {ride.status === "active" && (
                      <a
                        href={`/dashboard/rides/${ride.id}`}
                        target="_self"
                        className="flex-1 rounded-2xl bg-emerald-500 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-emerald-600"
                      >
                        Gestisci
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