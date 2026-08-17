import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/*
 * ==============================
 * RIFIUTA ACCOUNT MINORENNE
 * ==============================
 *
 * Chiamato dopo il primo login via Google quando
 * l'utente dichiara una data di nascita che indica
 * un'età inferiore a 18 anni. L'id utente viene
 * sempre ricavato dalla sessione autenticata (mai
 * dal client), così ognuno può eliminare solo il
 * proprio account.
 */

export async function POST() {
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

  const adminClient = createAdminClient();

  const { error } =
    await adminClient.auth.admin.deleteUser(
      user.id
    );

  if (error) {
    console.error(
      "Errore eliminazione account minorenne:",
      error
    );

    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
