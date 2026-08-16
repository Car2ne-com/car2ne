import { NextResponse } from "next/server";

import { requireAdminApi } from "@/lib/auth/requireAdmin";
import { createAdminClient } from "@/lib/supabase/admin";
import { isEventConcluded } from "@/lib/utils/eventStatus";

/*
 * Pubblica/rifiuta più eventi in un colpo solo. La UI non permette
 * mai di selezionare un evento concluso (non è nemmeno nell'array
 * caricato da /admin/events), ma questa route resta l'unico punto
 * che può davvero scrivere sul DB: se arrivasse comunque un id di un
 * evento concluso (chiamata diretta all'API, bypassando la UI), va
 * escluso qui, non solo fidandosi del client.
 */
export async function POST(request: Request) {
  const auth = await requireAdminApi();

  if (!auth.ok) {
    return auth.response;
  }

  const body = await request.json();
  const ids = body.ids;
  const status = body.status;

  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json(
      { error: "Nessun evento selezionato." },
      { status: 400 }
    );
  }

  if (status !== "published" && status !== "rejected") {
    return NextResponse.json(
      { error: "Stato non valido." },
      { status: 400 }
    );
  }

  const adminClient = createAdminClient();

  const { data: existing, error: fetchError } = await adminClient
    .from("events")
    .select("id, event_date")
    .in("id", ids);

  if (fetchError) {
    return NextResponse.json(
      { error: fetchError.message },
      { status: 500 }
    );
  }

  const operationalIds = (existing ?? [])
    .filter((event) => !isEventConcluded(event.event_date))
    .map((event) => event.id);

  const skippedConcluded =
    (existing?.length ?? 0) - operationalIds.length;

  if (operationalIds.length === 0) {
    return NextResponse.json(
      {
        error:
          "Nessuno degli eventi selezionati è ancora gestibile (tutti conclusi).",
      },
      { status: 409 }
    );
  }

  const { error } = await adminClient
    .from("events")
    .update({ status })
    .in("id", operationalIds);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    updated: operationalIds.length,
    skippedConcluded,
  });
}
