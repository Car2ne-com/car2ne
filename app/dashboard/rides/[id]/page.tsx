import { notFound, redirect } from "next/navigation";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ManageRideForm from "@/components/dashboard/ManageRideForm";

import { createClient } from "@/lib/supabase/server";
import { isPastDateTime } from "@/lib/utils/date";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ManageRidePage({
  params,
}: Props) {
  const { id } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  /*
   * Recuperiamo il passaggio.
   * Il driver_id viene controllato direttamente
   * nella query: un utente non può gestire
   * il passaggio di qualcun altro.
   */

  const { data: ride, error: rideError } =
    await supabase
      .from("rides")
      .select(`
        id,
        event_id,
        origin_city_id,
        departure_city,
        destination,
        departure_date,
        departure_time,
        available_seats,
        contribution,
        description,
        status
      `)
      .eq("id", id)
      .eq("driver_id", user.id)
      .single();

  if (rideError || !ride) {
    console.error(
      "Errore caricamento passaggio:",
      rideError
    );

    notFound();
  }

  /*
   * Un passaggio non attivo non può essere gestito.
   */

  if (ride.status !== "active") {
    redirect("/dashboard/rides");
  }

  /*
   * Recuperiamo l'evento separatamente.
   */

  const { data: event, error: eventError } =
    await supabase
      .from("events")
      .select(`
        title,
        slug,
        venue,
        city,
        event_date
      `)
      .eq("id", ride.event_id)
      .single();

  if (eventError || !event) {
    console.error(
      "Errore caricamento evento:",
      eventError
    );

    notFound();
  }

  const formattedDate = new Intl.DateTimeFormat(
    "it-IT",
    {
      dateStyle: "long",
    }
  ).format(new Date(event.event_date));

  return (
    <>
      <Navbar />

      <main className="mx-auto max-w-5xl px-6 pt-40 pb-24">

        {/* Header */}

        <div className="mb-10">
          <span className="inline-flex rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
            🚗 Gestisci passaggio
          </span>

          <h1 className="mt-5 text-5xl font-black tracking-tight text-slate-900">
            Modifica il tuo passaggio
          </h1>

          <p className="mt-4 text-lg text-slate-600">
            Aggiorna le informazioni del tuo viaggio.
          </p>
        </div>

        {/* Informazioni evento */}

        <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">

          <p className="text-sm font-semibold text-emerald-600">
            Evento
          </p>

          <h2 className="mt-1 text-2xl font-black text-slate-900">
            {event.title}
          </h2>

          <div className="mt-5 grid gap-5 sm:grid-cols-3">

            {/* Destinazione */}

            <div>
              <p className="text-sm text-slate-500">
                Destinazione
              </p>

              <p className="mt-1 font-semibold text-slate-900">
                {event.venue}
              </p>
            </div>

            {/* Data */}

            <div>
              <p className="text-sm text-slate-500">
                Data evento
              </p>

              <p className="mt-1 font-semibold text-slate-900">
                {formattedDate}
              </p>
            </div>

            {/* Città */}

            <div>
              <p className="text-sm text-slate-500">
                Città
              </p>

              <p className="mt-1 font-semibold text-slate-900">
                {event.city}
              </p>
            </div>

          </div>

          <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
            ℹ️ Evento, destinazione e data sono
            determinati dall&apos;evento e non possono essere
            modificati.
          </div>
        </div>

        {/* Form */}

        <ManageRideForm
          ride={{
            id: ride.id,
            origin_city_id: ride.origin_city_id,
            departure_city: ride.departure_city,
            departure_date: ride.departure_date,
            departure_time: ride.departure_time,
            available_seats: ride.available_seats,
            contribution: Number(
              ride.contribution
            ),
            description: ride.description,
            rideHasPassed:
              isPastDateTime(
                ride.departure_date,
                ride.departure_time
              ),
          }}
        />

      </main>

      <Footer />
    </>
  );
}