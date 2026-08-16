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

/*
 * Crea un evento manuale da admin. Passa sempre dal resolver
 * città/venue (stesso resolveCityVenue usato dall'import
 * Ticketmaster e dal backfill), cosi' city_id/venue_id non restano
 * mai un secondo percorso scollegato dal testo city/venue.
 */
export async function POST(request: Request) {
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

  let cityId: string | null = null;
  let venueId: string | null = null;

  try {
    const resolved = await resolveCityVenue(adminClient, {
      cityName: body.city,
      venueName: body.venue,
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
      "Risoluzione città/venue fallita (creazione manuale):",
      geoError instanceof Error ? geoError.message : geoError
    );
  }

  const { data: inserted, error } = await adminClient
    .from("events")
    .insert({
      title: body.title,
      artist: body.artist,
      artist_slug: slugify(body.artist),
      venue: body.venue,
      city: body.city,
      city_id: cityId,
      venue_id: venueId,
      category: body.category,
      event_date: body.event_date,
      description: body.description || null,
      image_url: body.image_url || null,
      slug: slugify(body.title),
      status: "published",
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ id: inserted.id });
}
