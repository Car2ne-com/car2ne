import { NextResponse } from "next/server";

import { getTranslations } from "@/lib/i18n";
import {
  findUserByEmail,
  getResetCooldownSeconds,
  sendResetCode,
} from "@/lib/email/passwordReset";

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
