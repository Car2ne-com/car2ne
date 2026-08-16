import type { SupabaseClient } from "@supabase/supabase-js";

import { createAdminClient } from "@/lib/supabase/admin";
import { slugify } from "@/lib/utils/slug";
import { resolveCityVenue } from "@/lib/geo/resolveCityVenue";

import { ticketmasterImporter } from "./ticketmaster";
import { decideDedup } from "./dedup";
import {
  buildTicketmasterEventSlug,
  buildFallbackSlug,
} from "./ticketmasterEventSlug";
import type {
  EventSource,
  ImportResult,
  NormalizedEvent,
} from "./types";

const IMPORTERS: Record<string, EventSource> =
  {
    ticketmaster: ticketmasterImporter,
  };

const IMPORT_WINDOW_MONTHS = 12;

/*
 * Punto unico di importazione: usato sia dal
 * trigger manuale (admin) sia dal cron. Non
 * duplicare questa logica altrove.
 */
export async function runImport(
  sourceKey: string,
  triggeredBy: "manual" | "cron",
  triggeredByUserId: string | null
): Promise<ImportResult> {
  const importer = IMPORTERS[sourceKey];

  if (!importer) {
    throw new Error(
      `Fonte di eventi sconosciuta: ${sourceKey}`
    );
  }

  const supabase = createAdminClient();

  const { data: logRow, error: logError } =
    await supabase
      .from("import_logs")
      .insert({
        source: sourceKey,
        triggered_by: triggeredBy,
        triggered_by_user_id:
          triggeredByUserId,
        status: "running",
      })
      .select("id")
      .single();

  if (logError || !logRow) {
    throw new Error(
      `Impossibile creare il log di importazione: ${logError?.message}`
    );
  }

  const result: ImportResult = {
    source: sourceKey,
    eventsFetched: 0,
    eventsRejected: 0,
    eventsCreated: 0,
    eventsUpdated: 0,
    eventsSkipped: 0,
    eventsFailed: 0,
    errorMessage: null,
  };

  try {
    const now = new Date();

    const endDate = new Date(now);

    endDate.setMonth(
      endDate.getMonth() +
        IMPORT_WINDOW_MONTHS
    );

    const countryCode = "IT";

    const { events: normalizedEvents, rejectedCount } =
      await importer.fetchNormalizedEvents({
        countryCode,
        startDateTime:
          now
            .toISOString()
            .slice(0, 19) + "Z",
        endDateTime:
          endDate
            .toISOString()
            .slice(0, 19) + "Z",
      });

    result.eventsFetched =
      normalizedEvents.length;
    result.eventsRejected = rejectedCount;

    for (const normalized of normalizedEvents) {
      try {
        await upsertEvent(
          supabase,
          normalized,
          countryCode,
          result
        );
      } catch (eventError) {
        result.eventsFailed += 1;

        const errorMessage =
          serializeImportError(eventError);

        console.error(
          "Import evento fallito:",
          normalized.externalId,
          errorMessage
        );

        await logImportFailure(
          supabase,
          logRow.id,
          normalized,
          errorMessage
        );
      }
    }

    await supabase
      .from("import_logs")
      .update({
        status: "success",
        events_fetched:
          result.eventsFetched,
        events_rejected:
          result.eventsRejected,
        events_created:
          result.eventsCreated,
        events_updated:
          result.eventsUpdated,
        events_skipped:
          result.eventsSkipped,
        events_failed:
          result.eventsFailed,
        finished_at:
          new Date().toISOString(),
      })
      .eq("id", logRow.id);
  } catch (error) {
    result.errorMessage =
      error instanceof Error
        ? error.message
        : String(error);

    console.error(
      "Import fallito:",
      result.errorMessage
    );

    await supabase
      .from("import_logs")
      .update({
        status: "failed",
        error_message:
          result.errorMessage,
        events_fetched:
          result.eventsFetched,
        events_rejected:
          result.eventsRejected,
        events_created:
          result.eventsCreated,
        events_updated:
          result.eventsUpdated,
        events_skipped:
          result.eventsSkipped,
        events_failed:
          result.eventsFailed,
        finished_at:
          new Date().toISOString(),
      })
      .eq("id", logRow.id);
  }

  return result;
}

/*
 * Gli errori di Supabase (PostgrestError) sono oggetti semplici, non
 * istanze di Error: `eventError instanceof Error` è falso per loro, e
 * String(oggetto) produce "[object Object]" invece del messaggio
 * reale. Qui si estraggono esplicitamente message/code/details/hint
 * quando presenti (la forma di un PostgrestError), altrimenti si
 * ripiega su Error.message o su una serializzazione JSON leggibile.
 * Non cambia il comportamento dell'import: resta solo una stringa
 * per il log, count e continuazione del ciclo restano identici.
 */
function serializeImportError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (error && typeof error === "object") {
    const e = error as Record<string, unknown>;
    const parts: string[] = [];

    if (typeof e.message === "string" && e.message) {
      parts.push(e.message);
    }

    if (typeof e.code === "string" && e.code) {
      parts.push(`code=${e.code}`);
    }

    if (typeof e.details === "string" && e.details) {
      parts.push(`details=${e.details}`);
    }

    if (typeof e.hint === "string" && e.hint) {
      parts.push(`hint=${e.hint}`);
    }

    if (parts.length > 0) {
      return parts.join(" | ");
    }

    try {
      return JSON.stringify(error);
    } catch {
      return "Errore non serializzabile.";
    }
  }

  return String(error);
}

/*
 * Log persistente di un fallimento per singolo evento. Deliberatamente
 * "a prova di fallimento" a sua volta: se anche questo insert va in
 * errore (es. migration non ancora applicata), non deve interrompere
 * il resto del run — si logga soltanto, come già faceva il chiamante
 * prima di questa funzione.
 */
async function logImportFailure(
  supabase: SupabaseClient,
  importLogId: string,
  normalized: NormalizedEvent,
  errorMessage: string
) {
  const { error } = await supabase
    .from("import_log_failures")
    .insert({
      import_log_id: importLogId,
      source: normalized.source,
      external_id: normalized.externalId,
      title: normalized.title,
      artist: normalized.artist,
      event_date: normalized.eventDate,
      city: normalized.city,
      venue: normalized.venue,
      error_message: errorMessage,
    });

  if (error) {
    console.error(
      "Impossibile salvare il log del fallimento import per evento:",
      normalized.externalId,
      error.message
    );
  }
}

/*
 * Slug univoco per un nuovo evento Ticketmaster. Prima calcola lo
 * slug "base" (titolo+città+external_id completo, vedi
 * ticketmasterEventSlug.ts — già univoco per costruzione dato che
 * external_id lo è). Poi verifica esplicitamente che non sia già
 * assegnato a un evento con un external_id diverso: se lo fosse (rete
 * di sicurezza per il caso residuo, non osservato ma non escludibile
 * per costruzione — es. due external_id che differiscono solo per
 * maiuscole/minuscole, annullate da slugify), usa un fallback
 * deterministico invece di far fallire l'evento. Se lo slug base
 * appartiene già allo STESSO external_id (stesso evento rivisto in
 * un run successivo), va bene così — decideDedup() avrebbe comunque
 * già deciso "update" o "skip" per quel caso, questa funzione viene
 * chiamata solo per "create".
 */
async function resolveEventSlug(
  supabase: SupabaseClient,
  normalized: NormalizedEvent
): Promise<string> {
  const baseSlug = buildTicketmasterEventSlug(
    normalized.title,
    normalized.city,
    normalized.externalId
  );

  const { data: slugOwner, error } = await supabase
    .from("events")
    .select("external_id")
    .eq("slug", baseSlug)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (slugOwner && slugOwner.external_id !== normalized.externalId) {
    return buildFallbackSlug(baseSlug, normalized.externalId);
  }

  return baseSlug;
}

async function upsertEvent(
  supabase: SupabaseClient,
  normalized: NormalizedEvent,
  countryCode: string,
  result: ImportResult
) {
  const decision = await decideDedup(
    supabase,
    normalized
  );

  /*
   * Il collegamento a cities/venues non deve mai far fallire
   * l'import dell'evento: se il resolver va in errore, l'evento
   * viene comunque creato/aggiornato senza city_id/venue_id,
   * esattamente come si comportava la pipeline prima che
   * cities/venues esistessero.
   */
  let cityId: string | null = null;
  let venueId: string | null = null;

  try {
    const resolved = await resolveCityVenue(supabase, {
      cityName: normalized.city,
      venueName: normalized.venue,
      countryCode,
      source: normalized.source,
      venueExternalId: normalized.venueExternalId,
      address: normalized.address,
      latitude: normalized.latitude,
      longitude: normalized.longitude,
    });

    cityId = resolved.cityId;
    venueId = resolved.venueId;
  } catch (geoError) {
    console.error(
      "Risoluzione città/venue fallita:",
      normalized.externalId,
      geoError instanceof Error
        ? geoError.message
        : geoError
    );
  }

  const basePayload = {
    source: normalized.source,
    external_id: normalized.externalId,
    external_url: normalized.externalUrl,
    title: normalized.title,
    artist: normalized.artist,
    artist_slug: slugify(normalized.artist),
    description: normalized.description,
    category: normalized.category,
    city: normalized.city,
    venue: normalized.venue,
    event_date: normalized.eventDate,
    image_url: normalized.imageUrl,
    imported_at: new Date().toISOString(),
    raw_payload: normalized.raw,
  };

  if (decision.action === "create") {
    const slug = await resolveEventSlug(
      supabase,
      normalized
    );

    const status =
      normalized.externalStatus ===
      "cancelled"
        ? "cancelled"
        : "draft";

    const { error } = await supabase
      .from("events")
      .insert({
        ...basePayload,
        city_id: cityId,
        venue_id: venueId,
        slug,
        status,
      });

    if (error) {
      throw error;
    }

    result.eventsCreated += 1;
    return;
  }

  if (decision.action === "update") {
    const updatePayload: Record<
      string,
      unknown
    > = { ...basePayload };

    /*
     * Se il resolver non è riuscito a risolvere città/venue in
     * questo giro (es. errore transitorio), non si tocca un
     * eventuale collegamento già risolto in un import precedente.
     */
    if (cityId) {
      updatePayload.city_id = cityId;
    }

    if (venueId) {
      updatePayload.venue_id = venueId;
    }

    /*
     * Solo transizione automatica ammessa:
     * verso "cancelled". Non riattiviamo mai
     * automaticamente un evento già cancellato,
     * per evitare di sovrascrivere una decisione
     * dell'admin.
     */
    if (
      normalized.externalStatus ===
      "cancelled"
    ) {
      updatePayload.status = "cancelled";
    }

    const { error } = await supabase
      .from("events")
      .update(updatePayload)
      .eq("id", decision.existingId);

    if (error) {
      throw error;
    }

    result.eventsUpdated += 1;
    return;
  }

  result.eventsSkipped += 1;
}
