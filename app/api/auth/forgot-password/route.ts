import { NextResponse } from "next/server";

import { getTranslations } from "@/lib/i18n";
import {
  findUserByEmail,
  getResetCooldownSeconds,
  sendResetCode,
} from "@/lib/email/passwordReset";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

/*
 * Non riveliamo mai se l'email esiste: se non troviamo un utente
 * rispondiamo comunque { sent: true }, senza inviare nulla.
 */

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email =
    typeof body?.email === "string" ? body.email.trim() : "";

  if (!email) {
    return NextResponse.json(
      { error: "invalid" },
      { status: 400 }
    );
  }

  /*
   * Per IP, non per email: senza questo un attacker può martellare
   * l'endpoint con email diverse (spam di invii/costo email, tentativi
   * di enumerazione) prima ancora di arrivare al cooldown per-utente
   * sotto, che scatta solo se l'email esiste davvero.
   */
  const allowed = await checkRateLimit(
    "forgot-password",
    getClientIp(request),
    { windowSeconds: 15 * 60, maxHits: 8 }
  );

  if (!allowed) {
    return NextResponse.json(
      { error: "rate_limited" },
      { status: 429 }
    );
  }

  const user = await findUserByEmail(email);

  if (!user || !user.email) {
    return NextResponse.json({ sent: true });
  }

  const cooldown = await getResetCooldownSeconds(user.id);

  if (cooldown > 0) {
    return NextResponse.json(
      { error: "cooldown", retryAfterSeconds: cooldown },
      { status: 429 }
    );
  }

  const { dict, locale } = await getTranslations();

  await sendResetCode({
    userId: user.id,
    email: user.email,
    user,
    locale,
    copy: dict.email.passwordReset,
  });

  return NextResponse.json({ sent: true });
}
