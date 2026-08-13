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

  slug: string;

  description: string | null;

  category: EventCategory;

  city: string;
  venue: string;

  event_date: string;

  image_url: string | null;

  status: "draft" | "published" | "cancelled";

  created_at: string;
  updated_at: string;
}