import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

type EventSuggestionPayload = {
  title: string;
  artist: string;
  venue: string;
  city: string;
  event_date: string;
  external_url: string | null;
  image_url: string | null;
  description: string | null;
};

/*
 * Crea una segnalazione di evento mancante da parte di un utente
 * loggato (es. esclusiva TicketOne/Vivaticket non coperta
 * dall'import Ticketmaster). Chi segnala scrive già i campi
 * dell'evento: l'admin li legge e approva/rifiuta, non li ridigita.
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

  const body = (await request.json().catch(() => null)) as
    | EventSuggestionPayload
    | null;

  if (
    !body?.title ||
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

  const { data: inserted, error } = await supabase
    .from("event_suggestions")
    .insert({
      suggested_by: user.id,
      title: body.title,
      artist: body.artist,
      venue: body.venue,
      city: body.city,
      event_date: body.event_date,
      external_url: body.external_url || null,
      image_url: body.image_url || null,
      description: body.description || null,
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
