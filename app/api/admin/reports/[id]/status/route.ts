import { NextResponse } from "next/server";

import { requireAdminApi } from "@/lib/auth/requireAdmin";
import { createAdminClient } from "@/lib/supabase/admin";

type Props = {
  params: Promise<{ id: string }>;
};

const STATUSES = ["reviewing", "resolved", "dismissed"];

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

  if (!STATUSES.includes(status)) {
    return NextResponse.json(
      { error: "Stato non valido." },
      { status: 400 }
    );
  }

  const adminClient = createAdminClient();

  const { data: existing, error: fetchError } = await adminClient
    .from("reports")
    .select("id, reporter_id")
    .eq("id", id)
    .single();

  if (fetchError || !existing) {
    return NextResponse.json(
      { error: "Segnalazione non trovata." },
      { status: 404 }
    );
  }

  const isTerminal = status === "resolved" || status === "dismissed";

  const { error: updateError } = await adminClient
    .from("reports")
    .update({
      status,
      admin_note: adminNote || null,
      resolved_by: isTerminal ? auth.user.id : null,
      resolved_at: isTerminal ? new Date().toISOString() : null,
    })
    .eq("id", id);

  if (updateError) {
    return NextResponse.json(
      { error: updateError.message },
      { status: 500 }
    );
  }

  if (isTerminal) {
    await adminClient.from("notifications").insert({
      user_id: existing.reporter_id,
      type: status === "resolved" ? "report_resolved" : "report_dismissed",
      title:
        status === "resolved"
          ? "Segnalazione risolta"
          : "Segnalazione archiviata",
      message:
        adminNote ||
        (status === "resolved"
          ? "Abbiamo esaminato la tua segnalazione e l'abbiamo risolta."
          : "Abbiamo esaminato la tua segnalazione e l'abbiamo archiviata."),
      booking_id: null,
      ride_id: null,
      is_read: false,
    });
  }

  return NextResponse.json({ id, status });
}
