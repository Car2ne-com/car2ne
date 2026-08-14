import type { SupabaseClient } from "@supabase/supabase-js";

import { slugify } from "@/lib/utils/slug";
import { normalizeForMatch, stripProvinceSuffix } from "./normalize";
import { CITY_ALIASES } from "./cityAliases";

export type VenueGeoInput = {
  cityName: string;
  venueName: string;
  countryCode: string;
  source: string;
  venueExternalId: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
};

export type ResolvedCityVenue = {
  cityId: string;
  venueId: string;
};

/*
 * Get-or-create per città + venue, scoped alla fonte che sta
 * importando. Pensato per essere chiamato per ogni evento durante
 * l'import: NON deve mai far fallire l'evento chiamante — è compito
 * del chiamante avvolgerlo in try/catch e trattare un errore come
 * "city_id/venue_id non risolti", non come import fallito.
 */
export async function resolveCityVenue(
  supabase: SupabaseClient,
  input: VenueGeoInput
): Promise<ResolvedCityVenue> {
  const cityId = await resolveCity(
    supabase,
    input.cityName,
    input.countryCode
  );

  const venueId = await resolveVenue(supabase, cityId, input);

  return { cityId, venueId };
}

async function resolveCity(
  supabase: SupabaseClient,
  rawName: string,
  countryCode: string
): Promise<string> {
  const nameWithoutProvince = stripProvinceSuffix(rawName);
  const alias = CITY_ALIASES[normalizeForMatch(nameWithoutProvince)];
  const canonicalName = alias ?? nameWithoutProvince;
  const slug = slugify(canonicalName);

  const { data: existing, error: selectError } = await supabase
    .from("cities")
    .select("id")
    .eq("country_code", countryCode)
    .eq("slug", slug)
    .maybeSingle();

  if (selectError) {
    throw selectError;
  }

  if (existing) {
    return existing.id as string;
  }

  const { data: inserted, error: insertError } = await supabase
    .from("cities")
    .insert({
      name: canonicalName,
      slug,
      country_code: countryCode,
    })
    .select("id")
    .single();

  if (!insertError) {
    return inserted.id as string;
  }

  /*
   * Conflitto (unique cities_country_slug_key): un'altra
   * importazione concorrente ha creato la città un istante prima.
   * Non è un errore reale, va solo ri-letta.
   */
  const { data: afterConflict, error: refetchError } = await supabase
    .from("cities")
    .select("id")
    .eq("country_code", countryCode)
    .eq("slug", slug)
    .single();

  if (refetchError || !afterConflict) {
    throw insertError;
  }

  return afterConflict.id as string;
}

async function resolveVenue(
  supabase: SupabaseClient,
  cityId: string,
  input: VenueGeoInput
): Promise<string> {
  if (input.venueExternalId) {
    const { data: byExternalId, error: externalIdError } = await supabase
      .from("venues")
      .select("id")
      .eq("city_id", cityId)
      .eq(`external_ids->>${input.source}`, input.venueExternalId)
      .maybeSingle();

    if (externalIdError) {
      throw externalIdError;
    }

    if (byExternalId) {
      return byExternalId.id as string;
    }
  }

  const slug = slugify(input.venueName);

  const { data: existing, error: selectError } = await supabase
    .from("venues")
    .select("id, external_ids")
    .eq("city_id", cityId)
    .eq("slug", slug)
    .maybeSingle();

  if (selectError) {
    throw selectError;
  }

  if (existing) {
    if (
      input.venueExternalId &&
      existing.external_ids?.[input.source] !== input.venueExternalId
    ) {
      await supabase
        .from("venues")
        .update({
          external_ids: {
            ...existing.external_ids,
            [input.source]: input.venueExternalId,
          },
        })
        .eq("id", existing.id);
    }

    return existing.id as string;
  }

  const { data: inserted, error: insertError } = await supabase
    .from("venues")
    .insert({
      city_id: cityId,
      name: input.venueName,
      slug,
      address: input.address,
      latitude: input.latitude,
      longitude: input.longitude,
      source: input.source,
      external_ids: input.venueExternalId
        ? { [input.source]: input.venueExternalId }
        : {},
    })
    .select("id")
    .single();

  if (!insertError) {
    return inserted.id as string;
  }

  const { data: afterConflict, error: refetchError } = await supabase
    .from("venues")
    .select("id")
    .eq("city_id", cityId)
    .eq("slug", slug)
    .single();

  if (refetchError || !afterConflict) {
    throw insertError;
  }

  return afterConflict.id as string;
}
