import { NextResponse } from "next/server";

import { requireAdminApi } from "@/lib/auth/requireAdmin";
import { createAdminClient } from "@/lib/supabase/admin";

type Props = {
  params: Promise<{ id: string }>;
};

/*
 * "Approvare" qui significa solo "è un evento valido, lo aggiungo
 * io": la segnalazione porta solo un link, non i dati dell'evento,
 * quindi non c'è nulla da inserire automaticamente in events. La
 * creazione vera e propria resta un passo manuale dell'admin da
 * /admin/events/new, consultando il link.
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
    .select("status")
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

  const { error } = await adminClient
    .from("event_suggestions")
    .update({
      status: "approved",
      reviewed_by: auth.user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ id });
}
