import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

/*
 * Variante di requireAdmin() per le route API: requireAdmin()
 * chiama redirect(), corretto per una pagina ma sbagliato per una
 * route chiamata via fetch() da un componente client — un redirect
 * seguito automaticamente dal browser restituirebbe l'HTML della
 * pagina di destinazione con status 200, non un errore JSON, e il
 * codice client (che controlla response.ok) leggerebbe un falso
 * successo. Stessa identica verifica, ma restituisce una risposta
 * JSON con lo status corretto invece di reindirizzare.
 */
export async function requireAdminApi(): Promise<
  | {
      ok: true;
      supabase: Awaited<ReturnType<typeof createClient>>;
      user: { id: string };
    }
  | { ok: false; response: NextResponse }
> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Non autenticato." },
        { status: 401 }
      ),
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || profile?.role !== "admin") {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Accesso non autorizzato." },
        { status: 403 }
      ),
    };
  }

  return { ok: true, supabase, user };
}

export async function requireAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    redirect("/");
  }

  if (profile.role !== "admin") {
    redirect("/");
  }

  return {
    supabase,
    user,
    profile,
  };
}