import type { SupabaseClient } from "@supabase/supabase-js";

export type PastEventMetrics = {
  ridesCount: number;
  passengersCount: number;
};

/*
 * Metriche storiche per eventi passati (dashboard admin):
 * passaggi offerti e passeggeri trasportati (prenotazioni
 * confermate). Query batch, non una per evento.
 */
export async function getPastEventMetrics(
  supabase: SupabaseClient,
  eventIds: string[]
): Promise<Record<string, PastEventMetrics>> {
  if (eventIds.length === 0) {
    return {};
  }

  const { data: rides, error: ridesError } = await supabase
    .from("rides")
    .select("id, event_id")
    .in("event_id", eventIds);

  if (ridesError) {
    console.error(
      "Errore caricamento passaggi per metriche storiche:",
      ridesError.message
    );

    return {};
  }

  const rideIds = (rides ?? []).map((ride) => ride.id);

  const { data: bookings, error: bookingsError } =
    rideIds.length > 0
      ? await supabase
          .from("bookings")
          .select("ride_id")
          .in("ride_id", rideIds)
          .eq("status", "confirmed")
      : { data: [], error: null };

  if (bookingsError) {
    console.error(
      "Errore caricamento prenotazioni per metriche storiche:",
      bookingsError.message
    );

    return {};
  }

  const confirmedByRide: Record<string, number> = {};

  for (const booking of bookings ?? []) {
    confirmedByRide[booking.ride_id] =
      (confirmedByRide[booking.ride_id] ?? 0) + 1;
  }

  const metrics: Record<string, PastEventMetrics> = {};

  for (const ride of rides ?? []) {
    const passengers = confirmedByRide[ride.id] ?? 0;

    const current = metrics[ride.event_id] ?? {
      ridesCount: 0,
      passengersCount: 0,
    };

    metrics[ride.event_id] = {
      ridesCount: current.ridesCount + 1,
      passengersCount:
        current.passengersCount + passengers,
    };
  }

  return metrics;
}
