import { NextResponse } from "next/server";

import { requireAdminApi } from "@/lib/auth/requireAdmin";
import { createAdminClient } from "@/lib/supabase/admin";
import { resolveCityVenue } from "@/lib/geo/resolveCityVenue";
import { slugify } from "@/lib/utils/slug";

type Props = {
  params: Promise<{ id: string }>;
};

/*
 * Approva una segnalazione: crea l'evento COSì COM'È stato
 * segnalato (nessun re-inserimento manuale), poi marca la
 * segnalazione come approved collegandola all'evento creato. Stesso
 * resolver città/venue e stessa logica slug della creazione manuale
 * in app/api/admin/events/route.ts.
 */
export async function POST(_request: Request, { params }: Props) {
  const auth = await requireAdminApi();

  if (!auth.ok) {
    return auth.response;
  }

  const { id } = await params;

  const adminClient = createAdminClient();

  const { data: suggestion, error: fetchError } = await adminClient
    .from("event_suggestions")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !suggestion) {
    return NextResponse.json(
      { error: "Segnalazione non trovata." },
      { status: 404 }
    );
  }

  if (suggestion.status !== "pending") {
    return NextResponse.json(
      { error: "Questa segnalazione è già stata gestita." },
      { status: 409 }
    );
  }

  let cityId: string | null = null;
  let venueId: string | null = null;

  try {
    const resolved = await resolveCityVenue(adminClient, {
      cityName: suggestion.city,
      venueName: suggestion.venue,
      countryCode: "IT",
      source: "manual",
      venueExternalId: null,
      address: null,
      latitude: null,
      longitude: null,
    });

    cityId = resolved.cityId;
    venueId = resolved.venueId;
  } catch (geoError) {
    console.error(
      "Risoluzione città/venue fallita (approvazione segnalazione):",
      id,
      geoError instanceof Error ? geoError.message : geoError
    );
  }

  const { data: insertedEvent, error: insertError } = await adminClient
    .from("events")
    .insert({
      title: suggestion.title,
      artist: suggestion.artist,
      artist_slug: slugify(suggestion.artist),
      venue: suggestion.venue,
      city: suggestion.city,
      city_id: cityId,
      venue_id: venueId,
      category: "Concerto",
      event_date: suggestion.event_date,
      description: suggestion.description,
      image_url: suggestion.image_url,
      external_url: suggestion.external_url,
      slug: slugify(suggestion.title),
      status: "published",
    })
    .select("id")
    .single();

  if (insertError || !insertedEvent) {
    return NextResponse.json(
      { error: insertError?.message ?? "Creazione evento fallita." },
      { status: 500 }
    );
  }

  const { error: updateError } = await adminClient
    .from("event_suggestions")
    .update({
      status: "approved",
      created_event_id: insertedEvent.id,
      reviewed_by: auth.user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (updateError) {
    console.error(
      "Evento creato ma aggiornamento segnalazione fallito:",
      id,
      updateError.message
    );
  }

  return NextResponse.json({ eventId: insertedEvent.id });
}
