import type { MetadataRoute } from "next";

import { createClient } from "@/lib/supabase/server";
import { SITE_URL } from "@/lib/siteConfig";

/*
 * PostgREST tronca silenziosamente ogni select() senza range() a
 * 1000 righe. Con 7.894+ città questo farebbe sparire dalla sitemap
 * la stragrande maggioranza dei comuni (e, in futuro, potenzialmente
 * anche eventi/venue/artisti man mano che crescono) — una regressione
 * SEO silenziosa, difficile da notare. Ogni lettura "tutte le righe"
 * qui passa da questo helper: il chiamante costruisce la query con
 * .range(from, to) inclusa, l'helper si occupa solo del loop.
 */
async function fetchAllRows<T>(
  fetchPage: (
    from: number,
    to: number
  ) => PromiseLike<{
    data: T[] | null;
    error: { message: string } | null;
  }>
): Promise<T[]> {
  const PAGE_SIZE = 1000;
  const rows: T[] = [];
  let from = 0;

  for (;;) {
    const { data, error } = await fetchPage(
      from,
      from + PAGE_SIZE - 1
    );

    if (error) {
      throw new Error(error.message);
    }

    if (!data || data.length === 0) {
      break;
    }

    rows.push(...data);

    if (data.length < PAGE_SIZE) {
      break;
    }

    from += PAGE_SIZE;
  }

  return rows;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  const now = new Date().toISOString();

  const [events, cities, venues, artistEvents] = await Promise.all([
    fetchAllRows<{ slug: string; updated_at: string }>(
      (from, to) =>
        supabase
          .from("events")
          .select("slug, updated_at")
          .eq("status", "published")
          .gte("event_date", now)
          .range(from, to)
    ),
    fetchAllRows<{ slug: string; updated_at: string }>(
      (from, to) =>
        supabase
          .from("cities")
          .select("slug, updated_at")
          .range(from, to)
    ),
    fetchAllRows((from, to) =>
      supabase
        .from("venues")
        .select("slug, updated_at, cities(slug)")
        .range(from, to)
    ),
    fetchAllRows<{ artist_slug: string; updated_at: string }>(
      (from, to) =>
        supabase
          .from("events")
          .select("artist_slug, updated_at")
          .eq("status", "published")
          .gte("event_date", now)
          .not("artist_slug", "is", null)
          .range(from, to)
    ),
  ]);

  const staticEntries: MetadataRoute.Sitemap = [
    { url: new URL("/", SITE_URL).toString(), changeFrequency: "daily", priority: 1 },
    { url: new URL("/events", SITE_URL).toString(), changeFrequency: "daily", priority: 0.9 },
    { url: new URL("/citta", SITE_URL).toString(), changeFrequency: "daily", priority: 0.8 },
  ];

  const eventEntries: MetadataRoute.Sitemap = events.map(
    (event) => ({
      url: new URL(`/events/${event.slug}`, SITE_URL).toString(),
      lastModified: event.updated_at,
      changeFrequency: "weekly",
      priority: 0.7,
    })
  );

  const cityEntries: MetadataRoute.Sitemap = cities.map(
    (city) => ({
      url: new URL(`/citta/${city.slug}`, SITE_URL).toString(),
      lastModified: city.updated_at,
      changeFrequency: "daily",
      priority: 0.8,
    })
  );

  const venueEntries: MetadataRoute.Sitemap = venues
    .filter(
      (venue): venue is typeof venue & { cities: { slug: string } } =>
        !!venue.cities
    )
    .map((venue) => ({
      url: new URL(
        `/citta/${venue.cities.slug}/venue/${venue.slug}`,
        SITE_URL
      ).toString(),
      lastModified: venue.updated_at,
      changeFrequency: "weekly",
      priority: 0.6,
    }));

  const latestByArtistSlug = new Map<string, string>();

  for (const row of artistEvents) {
    if (!row.artist_slug) continue;

    const current = latestByArtistSlug.get(
      row.artist_slug
    );

    if (!current || row.updated_at > current) {
      latestByArtistSlug.set(
        row.artist_slug,
        row.updated_at
      );
    }
  }

  const artistEntries: MetadataRoute.Sitemap = Array.from(
    latestByArtistSlug.entries()
  ).map(([slug, updatedAt]) => ({
    url: new URL(`/artista/${slug}`, SITE_URL).toString(),
    lastModified: updatedAt,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [
    ...staticEntries,
    ...eventEntries,
    ...cityEntries,
    ...venueEntries,
    ...artistEntries,
  ];
}
