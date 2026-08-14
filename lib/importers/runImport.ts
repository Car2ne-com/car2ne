import type { SupabaseClient } from "@supabase/supabase-js";

import { createAdminClient } from "@/lib/supabase/admin";
import { slugify } from "@/lib/utils/slug";

import { ticketmasterImporter } from "./ticketmaster";
import { decideDedup } from "./dedup";
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

    const normalizedEvents =
      await importer.fetchNormalizedEvents({
        countryCode: "IT",
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

    for (const normalized of normalizedEvents) {
      try {
        await upsertEvent(
          supabase,
          normalized,
          result
        );
      } catch (eventError) {
        result.eventsFailed += 1;

        console.error(
          "Import evento fallito:",
          normalized.externalId,
          eventError instanceof Error
            ? eventError.message
            : eventError
        );
      }
    }

    await supabase
      .from("import_logs")
      .update({
        status: "success",
        events_fetched:
          result.eventsFetched,
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

async function upsertEvent(
  supabase: SupabaseClient,
  normalized: NormalizedEvent,
  result: ImportResult
) {
  const decision = await decideDedup(
    supabase,
    normalized
  );

  const basePayload = {
    source: normalized.source,
    external_id: normalized.externalId,
    external_url: normalized.externalUrl,
    title: normalized.title,
    artist: normalized.artist,
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
    const slug = slugify(
      `${normalized.title}-${normalized.city}-${normalized.externalId.slice(0, 8)}`
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
