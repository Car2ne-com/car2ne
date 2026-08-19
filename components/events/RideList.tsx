import RideCard from "./RideCard";

import { createClient } from "@/lib/supabase/server";
import { getDriverRatings } from "@/lib/supabase/getDriverRatings";
import { toOne } from "@/lib/utils/relations";
import { getTranslations } from "@/lib/i18n";

type Props = {
  eventId: string;
};

export default async function RideList({
  eventId,
}: Props) {
  const supabase = await createClient();
  const { locale, dict } = await getTranslations();
  const t = dict.events.rides;

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
      available_seats,
      contribution,
      profiles (
        name,
        surname,
        avatar_url,
        is_verified_driver
      )
    `)
    .eq("event_id", eventId)
    .eq("status", "active")
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

  const driverRatings = await getDriverRatings(
    supabase,
    (rides ?? []).map((ride) => ride.driver_id)
  );

  const formattedRides =
    rides?.map((ride) => {
      const profile = toOne(ride.profiles);

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
          "Conducente",

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

        date: new Date(
          `${ride.departure_date}T${ride.departure_time}`
        ).toLocaleDateString(
          locale === "en" ? "en-US" : "it-IT"
        ),

        departure:
          ride.departure_time.slice(
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
    }) ?? [];

  return (
    <section>
      <div className="mb-10 flex items-end justify-between">
        <div>
          <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
            {t.badge}
          </span>

          <h2 className="mt-5 text-4xl font-black text-slate-900">
            {t.title}
          </h2>

          <p className="mt-3 text-lg text-slate-600">
            {t.subtitle}
          </p>
        </div>
      </div>

      {formattedRides.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-8 py-16 text-center">
          <h3 className="text-2xl font-bold text-slate-900">
            {t.emptyTitle}
          </h3>

          <p className="mt-3 text-slate-500">
            {t.emptyDescription}
          </p>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-2">
          {formattedRides.map(
            (ride) => (
              <RideCard
                key={ride.id}
                ride={ride}
                dict={t}
              />
            )
          )}
        </div>
      )}
    </section>
  );
}