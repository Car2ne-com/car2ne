export type EventCategory =
  | "Concerto"
  | "Festival"
  | "Sport"
  | "Fiera"
  | "Teatro"
  | "Musical"
  | "Altro";

export interface Event {
  id: string;

  title: string;
  artist: string;
  artist_slug: string | null;

  slug: string;

  description: string | null;

  category: EventCategory;

  city: string;
  venue: string;

  event_date: string;

  image_url: string | null;

  status:
    | "draft"
    | "published"
    | "cancelled"
    | "rejected";

  view_count: number;

  created_at: string;
  updated_at: string;

  /*
   * Non è una colonna DB: allegato a runtime dalle pagine di
   * listing (home, /events, /citta/*) con una query batch separata
   * su rides. Assente quando la pagina non lo calcola.
   */
  ride_count?: number;

  /*
   * Non sono colonne dirette: relazioni embedded via
   * `.select("*, cities(id,name,slug), venues(id,name,slug)")`.
   * Presenti solo se la query le richiede esplicitamente e solo se
   * l'evento ha city_id/venue_id risolti (assenti per eventi creati
   * prima del resolver o non ancora collegati).
   */
  cities?: { id: string; name: string; slug: string } | null;
  venues?: { id: string; name: string; slug: string } | null;
}