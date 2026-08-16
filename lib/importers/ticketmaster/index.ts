import type {
  EventSource,
  FetchEventsParams,
  NormalizedEvent,
  NormalizedEventsBatch,
} from "@/lib/importers/types";

import { fetchAllTicketmasterEvents } from "./client";
import { normalizeTicketmasterEvent } from "./normalizer";

export const ticketmasterImporter: EventSource = {
  key: "ticketmaster",

  async fetchNormalizedEvents(
    params: FetchEventsParams
  ): Promise<NormalizedEventsBatch> {
    const rawEvents =
      await fetchAllTicketmasterEvents(
        params.countryCode,
        params.startDateTime,
        params.endDateTime
      );

    const normalized: NormalizedEvent[] = [];
    let rejectedCount = 0;

    for (const rawEvent of rawEvents) {
      const event =
        normalizeTicketmasterEvent(rawEvent);

      if (event) {
        normalized.push(event);
      } else {
        rejectedCount += 1;

        console.warn(
          "Ticketmaster: evento saltato per dati mancanti",
          rawEvent.id
        );
      }
    }

    return { events: normalized, rejectedCount };
  },
};
