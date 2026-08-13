import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { createClient } from "@/lib/supabase/server";
import {
  TRUSTED_DEVICE_COOKIE,
  isDeviceTrusted,
} from "@/lib/utils/trustedDevice";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);

  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next");

  if (!code) {
    return NextResponse.redirect(
      new URL("/login?error=oauth", requestUrl.origin)
    );
  }

  const supabase = await createClient();

  /*
   * ==============================
   * SCAMBIO CODICE → SESSIONE
   * ==============================
   */

  const { error } =
    await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("Errore callback OAuth:", error);

    return NextResponse.redirect(
      new URL("/login?error=oauth", requestUrl.origin)
    );
  }

  /*
   * ==============================
   * RECUPERO UTENTE
   * ==============================
   */

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error(
      "Errore recupero utente OAuth:",
      userError
    );

    return NextResponse.redirect(
      new URL("/login?error=oauth", requestUrl.origin)
    );
  }

  /*
   * ==============================
   * VERIFICA MFA (AAL2)
   * ==============================
   */

  const { data: aal } =
    await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

  if (
    aal &&
    aal.nextLevel === "aal2" &&
    aal.nextLevel !== aal.currentLevel
  ) {
    const cookieStore = await cookies();

    const trustedToken = cookieStore.get(
      TRUSTED_DEVICE_COOKIE
    )?.value;

    const trusted = await isDeviceTrusted(
      supabase,
      user.id,
      trustedToken
    );

    if (!trusted) {
      const challengeUrl = new URL(
        "/mfa-challenge",
        requestUrl.origin
      );

      if (
        next &&
        next.startsWith("/") &&
        !next.startsWith("//")
      ) {
        challengeUrl.searchParams.set(
          "next",
          next
        );
      }

      return NextResponse.redirect(
        challengeUrl
      );
    }
  }

  /*
   * ==============================
   * RECUPERO RUOLO
   * ==============================
   */

  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError) {
    console.error(
      "Errore recupero profilo OAuth:",
      profileError
    );

    return NextResponse.redirect(
      new URL("/dashboard", requestUrl.origin)
    );
  }

  /*
   * ==============================
   * REDIRECT
   * ==============================
   *
   * Se esiste un redirect valido,
   * torniamo alla pagina richiesta.
   *
   * Altrimenti usiamo il redirect
   * predefinito in base al ruolo.
   */

  if (
    next &&
    next.startsWith("/") &&
    !next.startsWith("//")
  ) {
    return NextResponse.redirect(
      new URL(next, requestUrl.origin)
    );
  }

  if (profile?.role === "admin") {
    return NextResponse.redirect(
      new URL("/admin/events", requestUrl.origin)
    );
  }

  return NextResponse.redirect(
    new URL("/dashboard", requestUrl.origin)
  );
}