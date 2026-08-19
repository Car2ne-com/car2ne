import { NextResponse } from "next/server";

import { requireAdminApi } from "@/lib/auth/requireAdmin";
import { createAdminClient } from "@/lib/supabase/admin";

type Props = {
  params: Promise<{ id: string }>;
};

/*
 * Genera una signed URL a scadenza breve per la sola finestra di
 * revisione admin: il bucket "driver-documents" è privato, nessun URL
 * pubblico permanente viene mai creato.
 */
export async function GET(_request: Request, { params }: Props) {
  const auth = await requireAdminApi();

  if (!auth.ok) {
    return auth.response;
  }

  const { id } = await params;
  const adminClient = createAdminClient();

  const { data: verification, error: fetchError } = await adminClient
    .from("driver_verifications")
    .select("document_path")
    .eq("id", id)
    .single();

  if (fetchError || !verification?.document_path) {
    return NextResponse.json(
      { error: "Documento non disponibile." },
      { status: 404 }
    );
  }

  const { data, error } = await adminClient.storage
    .from("driver-documents")
    .createSignedUrl(verification.document_path, 60);

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message ?? "Impossibile generare l'URL." },
      { status: 500 }
    );
  }

  return NextResponse.json({ url: data.signedUrl });
}
