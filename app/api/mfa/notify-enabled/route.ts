import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "@/lib/i18n";
import {
  getUserDisplayName,
  renderEmailHtml,
  sendTransactionalEmail,
} from "@/lib/email/brevo";
import { SITE_URL } from "@/lib/siteConfig";

/*
 * ==============================
 * NOTIFICA MFA ATTIVATA
 * ==============================
 *
 * Chiamato dal client subito dopo un mfa.verify()
 * riuscito. L'email dell'utente viene sempre presa
 * dalla sessione autenticata, mai dal client.
 */

export async function POST() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return NextResponse.json(
      { error: "Non autenticato." },
      { status: 401 }
    );
  }

  const { dict, locale } = await getTranslations();
  const copy = dict.email.mfaEnabled;
  const name = getUserDisplayName(user, locale);

  await sendTransactionalEmail({
    to: { email: user.email },
    subject: copy.subject,
    htmlContent: renderEmailHtml({
      heading: copy.heading,
      body: copy.body.replace("{name}", name),
      ctaLabel: copy.ctaLabel,
      ctaHref: new URL(
        "/profile",
        SITE_URL
      ).toString(),
    }),
    sender: "noreply",
  });

  return NextResponse.json({ success: true });
}
