import type { SupabaseClient } from "@supabase/supabase-js";

import type { NormalizedEvent } from "./types";

export type DedupDecision =
  | { action: "create" }
  | {
      action: "update";
      existingId: string;
    }
  | {
      action: "skip";
      existingId: string;
    };

type ExistingEventRow = {
  id: string;
  title: string;
  artist: string;
  description: string | null;
  category: string;
  city: string;
  venue: string;
  event_date: string;
  image_url: string | null;
  external_url: string | null;
  status: string;
};

/*
 * Chiave di dedup primaria: source + external_id
 * (vincolo unique a livello database). Se l'evento
 * esiste già, confrontiamo i campi per capire se è
 * un vero aggiornamento o se possiamo saltarlo.
 *
 * Non facciamo dedup "fuzzy" (artista+data+città) tra
 * fonti diverse: rischierebbe di unire eventi distinti.
 */
export async function decideDedup(
  supabase: SupabaseClient,
  normalized: NormalizedEvent
): Promise<DedupDecision> {
  const { data: existing, error } = await supabase
    .from("events")
    .select(
      "id, title, artist, description, category, city, venue, event_date, image_url, external_url, status"
    )
    .eq("source", normalized.source)
    .eq("external_id", normalized.externalId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!existing) {
    return { action: "create" };
  }

  const row = existing as ExistingEventRow;

  const shouldBeCancelled =
    normalized.externalStatus === "cancelled";

  const contentChanged =
    row.title !== normalized.title ||
    row.artist !== normalized.artist ||
    row.description !==
      normalized.description ||
    row.category !== normalized.category ||
    row.city !== normalized.city ||
    row.venue !== normalized.venue ||
    new Date(row.event_date).getTime() !==
      new Date(
        normalized.eventDate
      ).getTime() ||
    row.image_url !== normalized.imageUrl ||
    row.external_url !==
      normalized.externalUrl;

  const statusNeedsUpdate =
    shouldBeCancelled &&
    row.status !== "cancelled";

  if (contentChanged || statusNeedsUpdate) {
    return {
      action: "update",
      existingId: row.id,
    };
  }

  return {
    action: "skip",
    existingId: row.id,
  };
}
