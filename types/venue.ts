export interface Venue {
  id: string;

  city_id: string;

  name: string;
  slug: string;

  address: string | null;
  latitude: number | null;
  longitude: number | null;

  source: string | null;
  external_ids: Record<string, string>;

  created_at: string;
  updated_at: string;
}
