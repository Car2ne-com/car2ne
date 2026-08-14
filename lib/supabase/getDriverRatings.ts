import type { SupabaseClient } from "@supabase/supabase-js";

export type DriverRating = {
  average: number;
  count: number;
};

/*
 * Media voti per conducente in un'unica query batch, invece di
 * una query per ride card (evita N+1 nella lista passaggi di un
 * evento).
 */
export async function getDriverRatings(
  supabase: SupabaseClient,
  driverIds: string[]
): Promise<Record<string, DriverRating>> {
  const uniqueIds = Array.from(new Set(driverIds));

  if (uniqueIds.length === 0) {
    return {};
  }

  const { data, error } = await supabase
    .from("ratings")
    .select("ratee_id, rating")
    .in("ratee_id", uniqueIds);

  if (error) {
    console.error(
      "Errore caricamento rating conducenti:",
      error.message
    );

    return {};
  }

  const sums: Record<string, number> = {};
  const counts: Record<string, number> = {};

  for (const row of data ?? []) {
    sums[row.ratee_id] =
      (sums[row.ratee_id] ?? 0) + row.rating;
    counts[row.ratee_id] =
      (counts[row.ratee_id] ?? 0) + 1;
  }

  const result: Record<string, DriverRating> = {};

  for (const driverId of Object.keys(counts)) {
    result[driverId] = {
      average: sums[driverId] / counts[driverId],
      count: counts[driverId],
    };
  }

  return result;
}
