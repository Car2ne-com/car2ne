import type { EventCategory } from "@/types/event";

/*
 * Modello interno Car2ne, indipendente dal formato
 * della fonte esterna. Ogni importer (Ticketmaster,
 * in futuro Bandsintown, ...) deve produrre eventi
 * in questo formato: il resto della pipeline
 * (dedup, persistenza, dashboard admin) non sa nulla
 * della fonte specifica.
 */
export type NormalizedEvent = {
  source: string;
  externalId: string;
  externalUrl: string | null;

  title: string;
  artist: string;
  description: string | null;
  category: EventCategory;

  city: string;
  venue: string;

  /*
   * Dati opzionali per il collegamento a cities/venues.
   * Se assenti (fonte che non li fornisce, o venue senza id
   * stabile), l'evento viene comunque importato: il resolver
   * città/venue farà semplicemente fallback sul solo nome.
   */
  venueExternalId: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;

  eventDate: string;
  imageUrl: string | null;

  /*
   * Stato dell'evento COSÌ COME riportato dalla
   * fonte esterna (es. cancellato da Ticketmaster).
   * Non va confuso con lo status Car2ne
   * (draft/published/cancelled).
   */
  externalStatus: "active" | "cancelled";

  raw: unknown;
};

export type FetchEventsParams = {
  countryCode: string;
  startDateTime: string;
  endDateTime: string;
};

/*
 * Interfaccia comune a tutte le fonti di eventi.
 * Aggiungere una nuova fonte significa implementare
 * questa interfaccia, senza toccare dedup/persistenza/
 * dashboard.
 */
export interface EventSource {
  key: string;

  fetchNormalizedEvents(
    params: FetchEventsParams
  ): Promise<NormalizedEvent[]>;
}

export type ImportResult = {
  source: string;
  eventsFetched: number;
  eventsCreated: number;
  eventsUpdated: number;
  eventsSkipped: number;
  eventsFailed: number;
  errorMessage: string | null;
};
