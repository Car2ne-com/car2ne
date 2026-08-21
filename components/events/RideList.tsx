import Link from "next/link";

import RideCard from "./RideCard";
import { EmptyState } from "@/components/ui/empty-state";

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
      direction,
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

        direction: ride.direction as "outbound" | "return",

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
        <div className="space-y-12">
          {(
            [
              {
                direction: "outbound" as const,
                title: t.sectionOutbound,
                sectionId: undefined,
              },
              {
                direction: "return" as const,
                title: t.sectionReturn,
                sectionId: "return-section",
              },
            ]
          ).map(({ direction, title, sectionId }) => {
            const rides = formattedRides.filter(
              (ride) => ride.direction === direction
            );

            /*
             * Passata solo alle card di andata: permette al passeggero
             * di richiedere anche il ritorno con un click in più,
             * invece di dover scorrere fino alla sezione qui sotto.
             */
            const matchingReturnRides =
              direction === "outbound"
                ? formattedRides.filter(
                    (ride) => ride.direction === "return"
                  )
                : [];

            return (
              <div key={direction} id={sectionId}>
                <h3 className="mb-5 text-xl font-bold text-foreground">
                  {title}
                </h3>

                {rides.length === 0 ? (
                  <div className="text-center">
                    <EmptyState
                      title={t.emptyTitle}
                      description={t.emptyDescription}
                    />

                    <Link
                      href={`/offer-ride?eventId=${eventId}&direction=${direction}`}
                      className="mt-8 inline-flex rounded-2xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition hover:bg-primary/90"
                    >
                      {t.emptyCta}
                    </Link>
                  </div>
                ) : (
                  <div className="grid gap-8 lg:grid-cols-2">
                    {rides.map((ride) => (
                      <RideCard
                        key={ride.id}
                        ride={ride}
                        dict={t}
                        matchingReturnRides={matchingReturnRides}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}