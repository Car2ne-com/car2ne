import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "@/lib/i18n";
import { verifyEmailCode } from "@/lib/email/emailVerification";
import {
  getUserDisplayName,
  renderEmailHtml,
  sendTransactionalEmail,
} from "@/lib/email/brevo";
import { SITE_URL } from "@/lib/siteConfig";

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "unauthenticated" },
      { status: 401 }
    );
  }

  const body = await request.json().catch(() => null);
  const code =
    typeof body?.code === "string" ? body.code.trim() : "";

  if (code.length !== 6 || !/^\d{6}$/.test(code)) {
    return NextResponse.json(
      { error: "invalid" },
      { status: 400 }
    );
  }

  const result = await verifyEmailCode(user.id, code);

  if (!result.ok) {
    return NextResponse.json(
      { error: result.reason },
      { status: 400 }
    );
  }

  if (user.email) {
    const { dict, locale } = await getTranslations();
    const copy = dict.email.welcome;

    sendTransactionalEmail({
      to: { email: user.email },
      subject: copy.subject,
      htmlContent: renderEmailHtml({
        heading: copy.heading,
        body: copy.body.replace(
          "{name}",
          getUserDisplayName(user, locale)
        ),
        ctaLabel: copy.ctaLabel,
        ctaHref: new URL(
          "/dashboard",
          SITE_URL
        ).toString(),
      }),
      sender: "noreply",
    }).catch((error) => {
      console.error(
        "Errore invio email di benvenuto:",
        error
      );
    });
  }

  return NextResponse.json({ verified: true });
}
