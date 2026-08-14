import type { SupabaseClient } from "@supabase/supabase-js";

/*
 * Conta i passaggi attivi per ciascun evento in un'unica query
 * batch, invece di una query per evento (evita N+1 nelle pagine di
 * listing: home, /events, /citta/*).
 */
export async function getRideCounts(
  supabase: SupabaseClient,
  eventIds: string[]
): Promise<Record<string, number>> {
  if (eventIds.length === 0) {
    return {};
  }

  const { data, error } = await supabase
    .from("rides")
    .select("event_id")
    .eq("status", "active")
    .in("event_id", eventIds);

  if (error) {
    console.error(
      "Errore conteggio passaggi:",
      error.message
    );

    return {};
  }

  const counts: Record<string, number> = {};

  for (const row of data ?? []) {
    counts[row.event_id] =
      (counts[row.event_id] ?? 0) + 1;
  }

  return counts;
}
