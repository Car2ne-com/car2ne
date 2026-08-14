import RideCard from "./RideCard";

import { createClient } from "@/lib/supabase/server";
import { getDriverRatings } from "@/lib/supabase/getDriverRatings";
import { toOne } from "@/lib/utils/relations";

type Props = {
  eventId: string;
};

export default async function RideList({
  eventId,
}: Props) {
  const supabase = await createClient();

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
        avatar_url
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

        avatarUrl,

        from:
          ride.departure_city,

        to:
          ride.destination,

        date: new Date(
          `${ride.departure_date}T${ride.departure_time}`
        ).toLocaleDateString(
          "it-IT"
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
            🚗 Passaggi disponibili
          </span>

          <h2 className="mt-5 text-4xl font-black text-slate-900">
            Scegli il tuo viaggio
          </h2>

          <p className="mt-3 text-lg text-slate-600">
            Unisciti ad altri partecipanti
            e condividi il tragitto.
          </p>
        </div>
      </div>

      {formattedRides.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-8 py-16 text-center">
          <h3 className="text-2xl font-bold text-slate-900">
            Nessun passaggio
            disponibile
          </h3>

          <p className="mt-3 text-slate-500">
            Sii il primo ad offrirne
            uno.
          </p>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-2">
          {formattedRides.map(
            (ride) => (
              <RideCard
                key={ride.id}
                ride={ride}
              />
            )
          )}
        </div>
      )}
    </section>
  );
}