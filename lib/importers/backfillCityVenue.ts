import { createAdminClient } from "@/lib/supabase/admin";
import { resolveCityVenue } from "@/lib/geo/resolveCityVenue";

/*
 * Backfill one-shot per eventi importati PRIMA che esistessero
 * cities/venues (o mai toccati da un update successivo, quindi
 * mai passati dalla risoluzione in runImport.ts). Usa solo le
 * colonne testuali events.city/events.venue già esistenti: non
 * serve riscaricare nulla da Ticketmaster.
 *
 * Idempotente: rieseguibile senza rischi, aggiorna solo le righe
 * ancora prive di city_id o venue_id.
 */
export async function backfillCityVenue() {
  const supabase = createAdminClient();

  const { data: events, error } = await supabase
    .from("events")
    .select("id, city, venue, source")
    .or("city_id.is.null,venue_id.is.null");

  if (error) {
    throw error;
  }

  let updated = 0;
  let failed = 0;

  for (const event of events ?? []) {
    try {
      const { cityId, venueId } = await resolveCityVenue(
        supabase,
        {
          cityName: event.city,
          venueName: event.venue,
          countryCode: "IT",
          source: event.source ?? "manual",
          venueExternalId: null,
          address: null,
          latitude: null,
          longitude: null,
        }
      );

      const { error: updateError } = await supabase
        .from("events")
        .update({ city_id: cityId, venue_id: venueId })
        .eq("id", event.id);

      if (updateError) {
        throw updateError;
      }

      updated += 1;
    } catch (eventError) {
      failed += 1;

      console.error(
        "Backfill città/venue fallito per evento:",
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
