import { notFound, redirect } from "next/navigation";

import ManageRideForm from "@/components/dashboard/ManageRideForm";
import { Card } from "@/components/ui/card";

import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "@/lib/i18n";
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
  const { locale, dict } = await getTranslations();
  const t = dict.dashboardRides;

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
    locale === "en" ? "en-US" : "it-IT",
    {
      dateStyle: "long",
    }
  ).format(new Date(event.event_date));

  return (
    <main className="mx-auto max-w-5xl px-6 pt-40 pb-24">

        {/* Header */}

        <div className="mb-10">
          <span className="inline-flex rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground">
            {t.managePage.badge}
          </span>

          <h1 className="mt-5 text-2xl font-bold text-foreground">
            {t.managePage.title}
          </h1>

          <p className="mt-4 text-lg text-muted-foreground">
            {t.managePage.subtitle}
          </p>
        </div>

        {/* Informazioni evento */}

        <Card className="mb-8 p-7">

          <p className="text-sm font-semibold text-primary">
            {t.managePage.eventLabel}
          </p>

          <h2 className="mt-1 text-lg font-semibold text-foreground">
            {event.title}
          </h2>

          <div className="mt-5 grid gap-5 sm:grid-cols-3">

            {/* Destinazione */}

            <div>
              <p className="text-sm text-muted-foreground">
                {t.managePage.destinationLabel}
              </p>

              <p className="mt-1 font-semibold text-foreground">
                {event.venue}
              </p>
            </div>

            {/* Data */}

            <div>
              <p className="text-sm text-muted-foreground">
                {t.managePage.eventDateLabel}
              </p>

              <p className="mt-1 font-semibold text-foreground">
                {formattedDate}
              </p>
            </div>

            {/* Città */}

            <div>
              <p className="text-sm text-muted-foreground">
                {t.managePage.cityLabel}
              </p>

              <p className="mt-1 font-semibold text-foreground">
                {event.city}
              </p>
            </div>

          </div>

          <div className="mt-5 rounded-2xl bg-muted p-4 text-sm text-muted-foreground">
            {t.managePage.infoLocked}
          </div>
        </Card>

        {/* Form */}

        <ManageRideForm
          dict={t}
          noShowDict={dict.reports.noShow}
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
  );
}
