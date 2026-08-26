import Link from "next/link";

import RideCard from "./RideCard";
import WatchlistToggleButton from "./WatchlistToggleButton";
import { EmptyState } from "@/components/ui/empty-state";

import { createClient } from "@/lib/supabase/server";
import { getDriverRatings } from "@/lib/supabase/getDriverRatings";
import { toOne } from "@/lib/utils/relations";
import { getTranslations } from "@/lib/i18n";

type Props = {
  eventId: string;
  venue?: {
    lat: number;
    lng: number;
    name: string;
  } | null;
};

export default async function RideList({
  eventId,
  venue,
}: Props) {
  const supabase = await createClient();
  const { locale, dict } = await getTranslations();
  const t = dict.events.rides;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let initiallyWatching = false;

  if (user) {
    const { data: watchRow } = await supabase
      .from("event_watchlist")
      .select("id")
      .eq("user_id", user.id)
      .eq("event_id", eventId)
      .maybeSingle();

    initiallyWatching = !!watchRow;
  }

  let blockedCounterpartIds: string[] = [];

  if (user) {
    const { data: blockRows, error: blockError } = await supabase
      .from("blocked_users")
      .select("blocker_id, blocked_id")
      .or(`blocker_id.eq.${user.id},blocked_id.eq.${user.id}`);

    if (blockError) {
      console.error(
        "Errore caricamento utenti bloccati:",
        blockError
      );
    }

    blockedCounterpartIds = (blockRows ?? []).map((row) =>
      row.blocker_id === user.id ? row.blocked_id : row.blocker_id
    );
  }

  const { data: rides, error } = await supabase
    .from("rides")
    .select(`
      id,
      event_id,
      driver_id,
      departure_city,
      destination,
      departure_date,
      departure_time,
      return_date,
      return_time,
      available_seats,
      contribution,
      cities:origin_city_id (
        latitude,
        longitude,
        name
      ),
      profiles (
        name,
        surname,
        avatar_url,
        is_verified_driver
      )
    `)
    .eq("event_id", eventId)
    .eq("status", "active")
    /*
     * return_date/return_time sono obbligatori solo per i nuovi
     * passaggi (CHECK NOT VALID in migration 0026): righe create
     * prima del modello andata+ritorno possono averli nulli. Non
     * sono passaggi completi, quindi non li mostriamo qui.
     */
    .not("return_date", "is", null)
    .not("return_time", "is", null)
    .order("departure_date", {
      ascending: true,
    })
    .order("departure_time", {
      ascending: true,
    });

  if (error) {
    console.error(
      "Errore caricamento passaggi:",
      error
    );
  }

  const visibleRides = (rides ?? []).filter(
    (ride) => !blockedCounterpartIds.includes(ride.driver_id)
  );

  const driverRatings = await getDriverRatings(
    supabase,
    visibleRides.map((ride) => ride.driver_id)
  );

  const dateFormatter = new Intl.DateTimeFormat(
    locale === "en" ? "en-US" : "it-IT",
    {
      dateStyle: "medium",
    }
  );

  const formattedRides =
    visibleRides.map((ride) => {
      const profile = toOne(ride.profiles);
      const originCity = toOne(ride.cities);

      let avatarUrl: string | null = null;

      if (profile?.avatar_url) {
        if (
          profile.avatar_url.startsWith(
            "http://"
          ) ||
          profile.avatar_url.startsWith(
            "https://"
          )
        ) {
          avatarUrl = profile.avatar_url;
        } else {
          const {
            data: publicUrlData,
          } = supabase.storage
            .from("avatars")
            .getPublicUrl(
              profile.avatar_url
            );

          avatarUrl =
            publicUrlData.publicUrl;
        }
      }

      return {
        id: ride.id,

        eventId: ride.event_id,

        driverId: ride.driver_id,

        driverRating:
          driverRatings[ride.driver_id] ?? null,

        driver:
          profile?.name ??
          "",

        driverSurname:
          profile?.surname ??
          "",

        isVerifiedDriver:
          profile?.is_verified_driver ?? false,

        avatarUrl,

        from:
          ride.departure_city,

        to:
          ride.destination,

        originLat:
          originCity?.latitude ?? null,

        originLng:
          originCity?.longitude ?? null,

        venue: venue ?? null,

        date: dateFormatter.format(
          new Date(
            `${ride.departure_date}T${ride.departure_time}`
          )
        ),

        departure:
          ride.departure_time.slice(
            0,
            5
          ),

        returnDate: dateFormatter.format(
          new Date(
            `${ride.return_date}T${ride.return_time}`
          )
        ),

        returnTime:
          ride.return_time.slice(
            0,
            5
          ),

        seats:
          ride.available_seats,

        price:
          Number(
            ride.contribution
          ),
      };
    });

  return (
    <section>
      <div className="mb-10 flex items-end justify-between">
        <div>
          <span className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground">
            {t.badge}
          </span>

          <h2 className="mt-5 text-4xl font-black text-foreground">
            {t.title}
          </h2>

          <p className="mt-3 text-lg text-muted-foreground">
            {t.subtitle}
          </p>
        </div>

        <WatchlistToggleButton
          eventId={eventId}
          initiallyWatching={initiallyWatching}
          dict={dict.events.watchlist}
        />
      </div>

      {formattedRides.length === 0 ? (
        <div className="text-center">
          <EmptyState title={t.emptyTitle} description={t.emptyDescription} />

          <Link
            href={`/offer-ride?eventId=${eventId}`}
            className="mt-8 inline-flex rounded-2xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            {t.emptyCta}
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-2">
          {formattedRides.map((ride) => (
            <RideCard
              key={ride.id}
              ride={ride}
              dict={t}
            />
          ))}
        </div>
      )}
    </section>
  );
}
