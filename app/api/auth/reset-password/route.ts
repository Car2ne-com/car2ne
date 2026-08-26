import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import {
  findUserByEmail,
  verifyResetCode,
} from "@/lib/email/passwordReset";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

function isStrongPassword(password: string) {
  return (
    password.length >= 8 &&
    /\d/.test(password) &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  const email =
    typeof body?.email === "string" ? body.email.trim() : "";

  const code =
    typeof body?.code === "string" ? body.code.trim() : "";

  const password =
    typeof body?.password === "string" ? body.password : "";

  if (!email || code.length !== 6 || !/^\d{6}$/.test(code)) {
    return NextResponse.json(
      { error: "invalid" },
      { status: 400 }
    );
  }

  if (!isStrongPassword(password)) {
    return NextResponse.json(
      { error: "weak_password" },
      { status: 400 }
    );
  }

  /*
   * Il codice è già limitato a 5 tentativi (vedi verifyResetCode), ma
   * quel contatore si azzera richiedendo un nuovo codice: senza un
   * limite anche per IP, un attacker potrebbe continuare a chiedere
   * codici freschi e provare a indovinarli.
   */
  const allowed = await checkRateLimit(
    "reset-password",
    getClientIp(request),
    { windowSeconds: 15 * 60, maxHits: 15 }
  );

  if (!allowed) {
    return NextResponse.json(
      { error: "rate_limited" },
      { status: 429 }
    );
  }

  const user = await findUserByEmail(email);

  if (!user) {
    return NextResponse.json(
      { error: "not_found" },
      { status: 400 }
    );
  }

  const result = await verifyResetCode(user.id, code);

  if (!result.ok) {
    return NextResponse.json(
      { error: result.reason },
      { status: 400 }
    );
  }

  const { error } = await createAdminClient().auth.admin.updateUserById(
    user.id,
    { password }
  );

  if (error) {
    console.error("Errore aggiornamento password (reset):", error);

    return NextResponse.json(
      { error: "generic" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
