import { createAdminClient } from "@/lib/supabase/admin";
import { slugify } from "@/lib/utils/slug";

/*
 * Backfill one-shot per eventi creati prima che esistesse
 * artist_slug. Idempotente: aggiorna solo le righe ancora prive
 * di artist_slug.
 */
export async function backfillArtistSlug() {
  const supabase = createAdminClient();

  const { data: events, error } = await supabase
    .from("events")
    .select("id, artist")
    .is("artist_slug", null);

  if (error) {
    throw error;
  }

  let updated = 0;
  let failed = 0;

  for (const event of events ?? []) {
    try {
      const { error: updateError } = await supabase
        .from("events")
        .update({ artist_slug: slugify(event.artist) })
        .eq("id", event.id);

      if (updateError) {
        throw updateError;
      }

      updated += 1;
    } catch (eventError) {
      failed += 1;

      console.error(
        "Backfill artist_slug fallito per evento:",
        event.id,
        eventError instanceof Error
          ? eventError.message
          : eventError
      );
    }
  }

  return {
    eventsFound: events?.length ?? 0,
    eventsUpdated: updated,
    eventsFailed: failed,
  };
}
