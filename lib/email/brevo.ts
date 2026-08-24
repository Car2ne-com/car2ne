import "server-only";

/*
 * Client email transazionali via Brevo (API v3).
 *
 * USO ESCLUSIVO SERVER-SIDE. Richiede BREVO_API_KEY in env
 * (mai nel frontend).
 */

/*
 * Mittenti verificati su Brevo, uno per tipo di comunicazione
 * (necessario perché Brevo autorizza l'invio solo dai singoli
 * indirizzi verificati sul dominio, non dal dominio intero).
 */
export const EMAIL_SENDERS = {
  noreply: { email: "noreply@car2ne.com", name: "Car2ne" },
  otp: { email: "otp@car2ne.com", name: "Car2ne" },
  privacy: { email: "privacy@car2ne.com", name: "Car2ne" },
  report: { email: "report@car2ne.com", name: "Car2ne" },
} as const;

export type EmailSenderKey = keyof typeof EMAIL_SENDERS;

type SendEmailParams = {
  to: { email: string; name?: string };
  subject: string;
  htmlContent: string;
  sender: EmailSenderKey;
};

/*
 * Nome da usare nel saluto dell'email ("Ciao {name},"). Il nome viene
 * dato in fase di registrazione ed è duplicato in user_metadata, quindi
 * non serve una query separata su profiles. Fallback generico se manca.
 */
export function getUserDisplayName(
  user: { user_metadata?: Record<string, unknown> },
  locale: "it" | "en"
) {
  const name = user.user_metadata?.name;

  if (typeof name === "string" && name.trim()) {
    return name.trim();
  }

  return locale === "en" ? "there" : "utente";
}

export async function sendTransactionalEmail({
  to,
  subject,
  htmlContent,
  sender,
}: SendEmailParams): Promise<boolean> {
  const apiKey = process.env.BREVO_API_KEY;

  if (!apiKey) {
    console.error(
      "BREVO_API_KEY non configurata: email non inviata."
    );
    return false;
  }

  const response = await fetch(
    "https://api.brevo.com/v3/smtp/email",
    {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        sender: EMAIL_SENDERS[sender],
        to: [to],
        subject,
        htmlContent,
      }),
    }
  );

  if (!response.ok) {
    const body = await response.text();

    console.error(
      "Errore invio email Brevo:",
      response.status,
      body
    );

    return false;
  }

  return true;
}

/*
 * Stesso SVG di components/layout/Logo.tsx, codificato in base64:
 * gli email client non caricano asset del sito, va incorporato inline.
 */
const LOGO_DATA_URI =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjggOCA4NCA4NCI+PHBhdGggZD0iTTc0IDI4IEEzMiAzMiAwIDEgMCA3NCA3MiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDU5NjY5IiBzdHJva2Utd2lkdGg9IjE0IiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48Y2lyY2xlIGN4PSI3NCIgY3k9IjUwIiByPSI5IiBmaWxsPSIjMDU5NjY5Ii8+PC9zdmc+";

/*
 * Stesso markup/palette di supabase/functions/notify-email/index.ts,
 * duplicato lì perché le Edge Function Deno non possono importare da lib/.
 */

export function renderEmailHtml({
  heading,
  body,
  ctaLabel,
  ctaHref,
  code,
}: {
  heading: string;
  body: string;
  ctaLabel?: string;
  ctaHref?: string;
  code?: string;
}) {
  const paragraphs = body
    .split("\n\n")
    .map(
      (paragraph) =>
        `<p style="margin:0 0 16px;color:#334155;font-size:15px;line-height:1.6;">${paragraph.replace(/\n/g, "<br/>")}</p>`
    )
    .join("");

  const codeBlock = code
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px auto 24px;"><tr><td style="background:#f0fdf4;border:2px solid #10b981;border-radius:16px;padding:16px 32px;"><span style="font-family:'Manrope',-apple-system,'Segoe UI',Roboto,sans-serif;font-size:32px;font-weight:800;letter-spacing:0.3em;color:#059669;">${code}</span></td></tr></table>`
    : "";

  const cta =
    ctaLabel && ctaHref
      ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px auto 0;"><tr><td style="background:#10b981;border-radius:9999px;"><a href="${ctaHref}" style="display:inline-block;padding:13px 28px;color:#ffffff;font-weight:700;font-size:14px;text-decoration:none;">${ctaLabel}</a></td></tr></table>`
      : "";

  return `<!doctype html>
<html>
  <head>
    <meta name="viewport" content="width=device-width" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@500;700;800&display=swap" rel="stylesheet" />
  </head>
  <body style="margin:0;padding:0;background:#f0fdf4;font-family:'Manrope',-apple-system,'Segoe UI',Roboto,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;padding:40px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:28px;overflow:hidden;">
            <tr>
              <td style="padding:32px 32px 20px;text-align:center;">
                <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
                  <tr>
                    <td style="vertical-align:middle;">
                      <img src="${LOGO_DATA_URI}" width="26" height="26" alt="" style="display:block;width:26px;height:26px;" />
                    </td>
                    <td style="padding-left:4px;vertical-align:middle;">
                      <span style="font-family:'Manrope',-apple-system,'Segoe UI',Roboto,sans-serif;font-size:22px;font-weight:800;color:#0f172a;letter-spacing:-0.02em;">ar2ne</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:4px 32px 32px;">
                <h1 style="margin:0 0 16px;font-family:'Manrope',-apple-system,'Segoe UI',Roboto,sans-serif;font-size:19px;font-weight:700;color:#0f172a;text-align:center;">${heading}</h1>
                ${paragraphs}
                ${codeBlock}
                ${cta}
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;">
                <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.6;">Car2ne &middot; Viaggia insieme, risparmia<br/>Hai ricevuto questa email perch&eacute; hai un account su Car2ne.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
