import { NextResponse } from "next/server";

import { requireAdminApi } from "@/lib/auth/requireAdmin";
import { createAdminClient } from "@/lib/supabase/admin";
import { isEventConcluded } from "@/lib/utils/eventStatus";

type Props = {
  params: Promise<{ id: string }>;
};

/*
 * Pubblica/rifiuta un evento. Stessa logica di business già in uso
 * (solo published/rejected sono transizioni ammesse da qui), portata
 * da mutazione diretta client -> Supabase a route server-side.
 * Mutazione su client service-role, come già fanno le route
 * create/update in questo stesso gruppo: evita di dipendere da RLS
 * non verificabili da repo per una scrittura amministrativa che deve
 * poter toccare eventi di chiunque, non solo propri.
 */
export async function POST(request: Request, { params }: Props) {
  const auth = await requireAdminApi();

  if (!auth.ok) {
    return auth.response;
  }

  const { id } = await params;
  const body = await request.json();
  const status = body.status;

  if (status !== "published" && status !== "rejected") {
    return NextResponse.json(
      { error: "Stato non valido." },
      { status: 400 }
    );
  }

  const adminClient = createAdminClient();

  const { data: existing, error: fetchError } = await adminClient
    .from("events")
    .select("event_date")
    .eq("id", id)
    .single();

  if (fetchError || !existing) {
    return NextResponse.json(
      { error: "Evento non trovato." },
      { status: 404 }
    );
  }

  if (isEventConcluded(existing.event_date)) {
    return NextResponse.json(
      {
        error:
          "Questo evento è concluso: non è più gestibile dalla vista operativa.",
      },
      { status: 409 }
    );
  }

  const { error } = await adminClient
    .from("events")
    .update({ status })
    .eq("id", id);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ id, status });
}
