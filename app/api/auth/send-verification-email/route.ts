import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "@/lib/i18n";
import {
  getResendCooldownSeconds,
  sendVerificationCode,
} from "@/lib/email/emailVerification";

export async function POST() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return NextResponse.json(
      { error: "unauthenticated" },
      { status: 401 }
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("email_verified_at")
    .eq("id", user.id)
    .single();

  if (profile?.email_verified_at) {
    return NextResponse.json({ alreadyVerified: true });
  }

  const cooldown = await getResendCooldownSeconds(user.id);

  if (cooldown > 0) {
    return NextResponse.json(
      { error: "cooldown", retryAfterSeconds: cooldown },
      { status: 429 }
    );
  }

  const { dict, locale } = await getTranslations();

  await sendVerificationCode({
    userId: user.id,
    email: user.email,
    user,
    locale,
    copy: dict.email.verifyEmail,
  });

  return NextResponse.json({ sent: true });
}
