export interface City {
  id: string;

  name: string;
  slug: string;

  country_code: string;
  region: string | null;

  latitude: number | null;
  longitude: number | null;

  created_at: string;
  updated_at: string;
}
