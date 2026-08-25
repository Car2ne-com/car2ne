import { NextResponse } from "next/server";

import { requireAdminApi } from "@/lib/auth/requireAdmin";
import { createAdminClient } from "@/lib/supabase/admin";

type Props = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, { params }: Props) {
  const auth = await requireAdminApi();

  if (!auth.ok) {
    return auth.response;
  }

  const { id } = await params;

  const adminClient = createAdminClient();

  const { data: suggestion, error: fetchError } = await adminClient
    .from("event_suggestions")
    .select("status, suggested_by")
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
      status: "rejected",
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

  await adminClient.from("notifications").insert({
    user_id: suggestion.suggested_by,
    type: "event_suggestion_rejected",
    title: "Segnalazione non approvata",
    message:
      "Abbiamo esaminato l'evento che ci hai segnalato e per questa volta non lo aggiungeremo a Car2ne.",
    booking_id: null,
    ride_id: null,
    is_read: false,
  });

  return NextResponse.json({ id });
}
