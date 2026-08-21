import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

/*
 * Crea una segnalazione di evento mancante: solo il link, niente
 * altri campi liberi. Un utente loggato incolla l'URL della pagina
 * dell'evento su qualsiasi circuito; l'admin la revisiona e, se
 * valida, crea l'evento a mano da /admin/events/new consultando
 * quel link nel proprio browser.
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
    | { url?: unknown }
    | null;

  const rawUrl = typeof body?.url === "string" ? body.url.trim() : "";

  if (!rawUrl) {
    return NextResponse.json(
      { error: "URL mancante." },
      { status: 400 }
    );
  }

  let parsed: URL;

  try {
    parsed = new URL(rawUrl);
  } catch {
    return NextResponse.json(
      { error: "URL non valido." },
      { status: 400 }
    );
  }

  if (parsed.protocol !== "https:") {
    return NextResponse.json(
      { error: "Sono supportati solo link https." },
      { status: 400 }
    );
  }

  const { data: inserted, error } = await supabase
    .from("event_suggestions")
    .insert({
      suggested_by: user.id,
      external_url: parsed.toString(),
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
