import { NextResponse } from "next/server";

import { requireAdminApi } from "@/lib/auth/requireAdmin";
import { createAdminClient } from "@/lib/supabase/admin";

type Props = {
  params: Promise<{ id: string }>;
};

/*
 * Approva/rifiuta una richiesta di verifica conducente. Cancella
 * subito il documento dallo storage dopo la decisione (modello
 * "verifica-poi-cancella", vedi 0017_driver_verifications.sql): non
 * conserviamo mai copie permanenti di documenti d'identita'.
 */
export async function POST(request: Request, { params }: Props) {
  const auth = await requireAdminApi();

  if (!auth.ok) {
    return auth.response;
  }

  const { id } = await params;
  const body = await request.json();
  const status = body.status;
  const adminNote =
    typeof body.adminNote === "string" ? body.adminNote.trim() : null;

  if (status !== "approved" && status !== "rejected") {
    return NextResponse.json(
      { error: "Stato non valido." },
      { status: 400 }
    );
  }

  const adminClient = createAdminClient();

  const { data: existing, error: fetchError } = await adminClient
    .from("driver_verifications")
    .select("id, user_id, document_path, status")
    .eq("id", id)
    .single();

  if (fetchError || !existing) {
    return NextResponse.json(
      { error: "Richiesta non trovata." },
      { status: 404 }
    );
  }

  if (existing.status !== "pending") {
    return NextResponse.json(
      { error: "Questa richiesta è già stata gestita." },
      { status: 409 }
    );
  }

  const { error: updateError } = await adminClient
    .from("driver_verifications")
    .update({
      status,
      admin_note: adminNote || null,
      reviewed_by: auth.user.id,
      reviewed_at: new Date().toISOString(),
      document_path: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (updateError) {
    return NextResponse.json(
      { error: updateError.message },
      { status: 500 }
    );
  }

  if (existing.document_path) {
    await adminClient.storage
      .from("driver-documents")
      .remove([existing.document_path]);
  }

  await adminClient.from("notifications").insert({
    user_id: existing.user_id,
    type:
      status === "approved"
        ? "driver_verification_approved"
        : "driver_verification_rejected",
    title:
      status === "approved"
        ? "Verifica approvata"
        : "Verifica rifiutata",
    message:
      status === "approved"
        ? "Sei un conducente verificato! Il badge è ora visibile sul tuo profilo."
        : adminNote
          ? `La tua richiesta di verifica è stata rifiutata: ${adminNote}`
          : "La tua richiesta di verifica è stata rifiutata. Puoi inviarne una nuova.",
    booking_id: null,
    ride_id: null,
    is_read: false,
  });

  return NextResponse.json({ id, status });
}
