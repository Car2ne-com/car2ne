import type {
  EventSource,
  FetchEventsParams,
  NormalizedEvent,
} from "@/lib/importers/types";

import { fetchAllTicketmasterEvents } from "./client";
import { normalizeTicketmasterEvent } from "./normalizer";

export const ticketmasterImporter: EventSource = {
  key: "ticketmaster",

  async fetchNormalizedEvents(
    params: FetchEventsParams
  ): Promise<NormalizedEvent[]> {
    const rawEvents =
      await fetchAllTicketmasterEvents(
        params.countryCode,
        params.startDateTime,
        params.endDateTime
      );

    const normalized: NormalizedEvent[] = [];

    for (const rawEvent of rawEvents) {
      const event =
        normalizeTicketmasterEvent(rawEvent);

      if (event) {
        normalized.push(event);
      } else {
        console.warn(
          "Ticketmaster: evento saltato per dati mancanti",
          rawEvent.id
        );
      }
    }

    return normalized;
  },
};
