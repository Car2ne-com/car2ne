import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { createClient } from "@/lib/supabase/server";
import {
  TRUSTED_DEVICE_COOKIE,
  TRUSTED_DEVICE_DAYS,
  generateDeviceToken,
  hashDeviceToken,
  isDeviceTrusted,
} from "@/lib/utils/trustedDevice";

/*
 * ==============================
 * REGISTRA DISPOSITIVO FIDATO
 * ==============================
 *
 * Chiamato dopo una verifica MFA riuscita,
 * solo se l'utente ha spuntato "non chiedermelo
 * più su questo dispositivo".
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

  const token = generateDeviceToken();

  const tokenHash = await hashDeviceToken(
    token
  );

  const expiresAt = new Date();

  expiresAt.setDate(
    expiresAt.getDate() + TRUSTED_DEVICE_DAYS
  );

  const { error } = await supabase
    .from("mfa_trusted_devices")
    .insert({
      user_id: user.id,
      token_hash: tokenHash,
      expires_at: expiresAt.toISOString(),
    });

  if (error) {
    console.error(
      "Errore salvataggio dispositivo fidato:",
      error
    );

    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  const cookieStore = await cookies();

  cookieStore.set(
    TRUSTED_DEVICE_COOKIE,
    token,
    {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge:
        TRUSTED_DEVICE_DAYS * 24 * 60 * 60,
    }
  );

  return NextResponse.json({ success: true });
}

/*
 * ==============================
 * CONTROLLA DISPOSITIVO FIDATO
 * ==============================
 *
 * Chiamato dal client (che non può leggere
 * un cookie httpOnly) subito dopo il login,
 * per sapere se saltare la richiesta del
 * codice MFA.
 */

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({
      trusted: false,
    });
  }

  const cookieStore = await cookies();

  const token = cookieStore.get(
    TRUSTED_DEVICE_COOKIE
  )?.value;

  const trusted = await isDeviceTrusted(
    supabase,
    user.id,
    token
  );

  return NextResponse.json({ trusted });
}
