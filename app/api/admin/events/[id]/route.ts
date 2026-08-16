import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { resolveCityVenue } from "@/lib/geo/resolveCityVenue";
import { slugify } from "@/lib/utils/slug";

type EventPayload = {
  title: string;
  artist: string;
  venue: string;
  city: string;
  category: string;
  event_date: string;
  description: string | null;
  image_url: string | null;
};

type Props = {
  params: Promise<{ id: string }>;
};

/*
 * Aggiorna un evento da admin. Ri-risolve città/venue SOLO se il
 * testo city/venue è effettivamente cambiato (evita chiamate inutili
 * al resolver su ogni modifica, es. cambio descrizione/immagine).
 * Se il testo cambia ma la risoluzione fallisce, city_id/venue_id
 * vengono azzerati invece di lasciare il vecchio FK: un city_id che
 * punta ancora alla città precedente sarebbe un dato scorretto, non
 * solo mancante.
 */
export async function PATCH(request: Request, { params }: Props) {
  const { id } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Non autenticato." },
      { status: 401 }
    );
  }

  const { data: profile, error: profileError } =
    await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

  if (profileError || profile?.role !== "admin") {
    return NextResponse.json(
      { error: "Accesso non autorizzato." },
      { status: 403 }
    );
  }

  const body = (await request.json()) as EventPayload;

  if (
    !body.title ||
    !body.artist ||
    !body.venue ||
    !body.city ||
    !body.event_date
  ) {
    return NextResponse.json(
      { error: "Campi obbligatori mancanti." },
      { status: 400 }
    );
  }

  const adminClient = createAdminClient();

  const { data: existing, error: existingError } =
    await adminClient
      .from("events")
      .select("city, venue, source")
      .eq("id", id)
      .single();

  if (existingError || !existing) {
    return NextResponse.json(
      { error: "Evento non trovato." },
      { status: 404 }
    );
  }

  const updatePayload: Record<string, unknown> = {
    title: body.title,
    artist: body.artist,
    artist_slug: slugify(body.artist),
    venue: body.venue,
    city: body.city,
    category: body.category,
    event_date: body.event_date,
    description: body.description || null,
    image_url: body.image_url || null,
    slug: slugify(body.title),
  };

  const cityOrVenueChanged =
    existing.city !== body.city || existing.venue !== body.venue;

  if (cityOrVenueChanged) {
    try {
      const resolved = await resolveCityVenue(adminClient, {
        cityName: body.city,
        venueName: body.venue,
        countryCode: "IT",
        source: existing.source ?? "manual",
        venueExternalId: null,
        address: null,
        latitude: null,
        longitude: null,
      });

      updatePayload.city_id = resolved.cityId;
      updatePayload.venue_id = resolved.venueId;
    } catch (geoError) {
      console.error(
        "Risoluzione città/venue fallita (modifica manuale):",
        id,
        geoError instanceof Error ? geoError.message : geoError
      );

      updatePayload.city_id = null;
      updatePayload.venue_id = null;
    }
  }

  const { error } = await adminClient
    .from("events")
    .update(updatePayload)
    .eq("id", id);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ id });
}
