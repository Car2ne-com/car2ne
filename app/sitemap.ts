import type { MetadataRoute } from "next";

import { createClient } from "@/lib/supabase/server";
import { SITE_URL } from "@/lib/siteConfig";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  const now = new Date().toISOString();

  const [
    { data: events },
    { data: cities },
    { data: venues },
    { data: artistEvents },
  ] = await Promise.all([
    supabase
      .from("events")
      .select("slug, updated_at")
      .eq("status", "published")
      .gte("event_date", now),
    supabase.from("cities").select("slug, updated_at"),
    supabase
      .from("venues")
      .select("slug, updated_at, cities(slug)"),
    supabase
      .from("events")
      .select("artist_slug, updated_at")
      .eq("status", "published")
      .gte("event_date", now)
      .not("artist_slug", "is", null),
  ]);

  const staticEntries: MetadataRoute.Sitemap = [
    { url: new URL("/", SITE_URL).toString(), changeFrequency: "daily", priority: 1 },
    { url: new URL("/events", SITE_URL).toString(), changeFrequency: "daily", priority: 0.9 },
  ];

  const eventEntries: MetadataRoute.Sitemap = (events ?? []).map(
    (event) => ({
      url: new URL(`/events/${event.slug}`, SITE_URL).toString(),
      lastModified: event.updated_at,
      changeFrequency: "weekly",
      priority: 0.7,
    })
  );

  const cityEntries: MetadataRoute.Sitemap = (cities ?? []).map(
    (city) => ({
      url: new URL(`/citta/${city.slug}`, SITE_URL).toString(),
      lastModified: city.updated_at,
      changeFrequency: "daily",
      priority: 0.8,
    })
  );

  const venueEntries: MetadataRoute.Sitemap = (venues ?? [])
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

  for (const row of artistEvents ?? []) {
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
