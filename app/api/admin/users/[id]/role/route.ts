import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(
  request: Request,
  { params }: RouteContext
) {
  const { id: targetUserId } = await params;

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

  const { data: profile, error: profileError } =
    await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

  if (
    profileError ||
    profile?.role !== "admin"
  ) {
    return NextResponse.json(
      { error: "Accesso non autorizzato." },
      { status: 403 }
    );
  }

  const body = await request.json();
  const role = body.role;

  if (role !== "admin" && role !== "user") {
    return NextResponse.json(
      { error: "Ruolo non valido." },
      { status: 400 }
    );
  }

  /*
   * Un admin non può rimuovere il proprio ruolo da qui: evita di
   * ritrovarsi senza nessun admin in grado di ripristinarlo.
   */
  if (
    targetUserId === user.id &&
    role !== "admin"
  ) {
    return NextResponse.json(
      {
        error:
          "Non puoi rimuovere il ruolo admin dal tuo stesso account.",
      },
      { status: 400 }
    );
  }

  const adminClient = createAdminClient();

  const { error: updateError } = await adminClient
    .from("profiles")
    .update({ role })
    .eq("id", targetUserId);

  if (updateError) {
    return NextResponse.json(
      { error: updateError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
