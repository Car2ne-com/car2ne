// Edge Function: invia un'email transazionale via Brevo quando viene
// inserita una notifica "critica" (conferma/rifiuto prenotazione,
// nuova richiesta, passaggio annullato, promemoria recensione, esito
// segnalazione evento). Innescata da un Database Webhook su INSERT in
// public.notifications.
//
// Da creare via Dashboard Supabase -> Edge Functions -> Deploy a new
// function (incolla questo file). Nessuna CLI necessaria.
//
// Secrets richiesti (Dashboard -> Edge Functions -> Secrets):
//   BREVO_API_KEY            chiave API v3 di Brevo
//   NOTIFICATION_WEBHOOK_SECRET  stringa a caso, condivisa col webhook
//   SITE_URL                  es. https://car2ne.vercel.app
//
// Il mittente è scelto per tipo di notifica tra gli indirizzi
// verificati su Brevo (vedi EMAIL_SENDERS sotto), non da env.
//
// SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY sono già disponibili di
// default in ogni Edge Function del progetto, non vanno impostati.
//
// Il contenuto è bilingue (IT/EN) e personalizzato: usa
// profiles.locale/name del destinatario (la chiamata arriva dal
// database, non da una richiesta utente, quindi non c'è un cookie
// NEXT_LOCALE da leggere) e il nome della controparte (chi ha
// confermato/rifiutato/richiesto/annullato), letto da bookings/rides.

import { createClient } from "npm:@supabase/supabase-js@2";

const EMAIL_NOTIFICATION_TYPES = new Set([
  "booking_confirmed",
  "booking_rejected",
  "booking_request",
  "ride_cancelled",
  "ride_updated",
  "driver_verification_approved",
  "driver_verification_rejected",
  "report_resolved",
  "report_dismissed",
  "review_reminder_passenger",
  "review_reminder_driver",
  "event_suggestion_approved",
  "event_suggestion_rejected",
]);

type NotificationType =
  | "booking_confirmed"
  | "booking_rejected"
  | "booking_request"
  | "ride_cancelled"
  | "ride_updated"
  | "driver_verification_approved"
  | "driver_verification_rejected"
  | "report_resolved"
  | "report_dismissed"
  | "review_reminder_passenger"
  | "review_reminder_driver"
  | "event_suggestion_approved"
  | "event_suggestion_rejected";

type NotificationRecord = {
  user_id: string;
  type: string;
  title: string;
  message: string;
  booking_id: string | null;
  ride_id: string | null;
};

type Locale = "it" | "en";

type Copy = {
  subject: string;
  heading: string;
  body: string;
  ctaLabel: string;
};

const EMAIL_COPY: Record<NotificationType, Record<Locale, Copy>> = {
  booking_confirmed: {
    it: {
      subject: "Prenotazione confermata",
      heading: "Prenotazione confermata!",
      body: "Ciao {name},\n\n{counterpart} ha confermato la tua richiesta di prenotazione. Buon viaggio!",
      ctaLabel: "Vai alle prenotazioni",
    },
    en: {
      subject: "Booking confirmed",
      heading: "Booking confirmed!",
      body: "Hi {name},\n\n{counterpart} has confirmed your booking request. Have a great trip!",
      ctaLabel: "Go to bookings",
    },
  },
  booking_rejected: {
    it: {
      subject: "Richiesta di prenotazione rifiutata",
      heading: "Richiesta rifiutata",
      body: "Ciao {name},\n\n{counterpart} ha rifiutato la tua richiesta di prenotazione.",
      ctaLabel: "Vai alle prenotazioni",
    },
    en: {
      subject: "Booking request declined",
      heading: "Request declined",
      body: "Hi {name},\n\n{counterpart} has declined your booking request.",
      ctaLabel: "Go to bookings",
    },
  },
  booking_request: {
    it: {
      subject: "Nuova richiesta di prenotazione",
      heading: "Nuova richiesta di prenotazione",
      body: "Ciao {name},\n\n{counterpart} ha richiesto un posto nel tuo passaggio. Accedi al pannello di gestione per accettare o rifiutare.",
      ctaLabel: "Gestisci il passaggio",
    },
    en: {
      subject: "New booking request",
      heading: "New booking request",
      body: "Hi {name},\n\n{counterpart} has requested a seat on your ride. Open your ride management to accept or decline.",
      ctaLabel: "Manage your ride",
    },
  },
  ride_cancelled: {
    it: {
      subject: "Passaggio annullato",
      heading: "Passaggio annullato",
      body: "Ciao {name},\n\n{counterpart} ha annullato il passaggio per cui avevi una richiesta o prenotazione.",
      ctaLabel: "Vai alle prenotazioni",
    },
    en: {
      subject: "Ride cancelled",
      heading: "Ride cancelled",
      body: "Hi {name},\n\n{counterpart} has cancelled the ride you had a request or booking for.",
      ctaLabel: "Go to bookings",
    },
  },
  ride_updated: {
    it: {
      subject: "Passaggio modificato",
      heading: "Il passaggio è stato modificato",
      body: "Ciao {name},\n\n{counterpart} ha modificato i dettagli del passaggio per cui avevi una richiesta o prenotazione. Controlla orari, posti e contributo aggiornati.",
      ctaLabel: "Vai alle prenotazioni",
    },
    en: {
      subject: "Ride updated",
      heading: "The ride has been updated",
      body: "Hi {name},\n\n{counterpart} has updated the details of the ride you had a request or booking for. Check the updated time, seats, and contribution.",
      ctaLabel: "Go to bookings",
    },
  },
  driver_verification_approved: {
    it: {
      subject: "Verifica conducente approvata",
      heading: "Sei un conducente verificato!",
      body: "Ciao {name},\n\nAbbiamo verificato i tuoi dati e il tuo veicolo. Il badge \"Conducente verificato\" è ora visibile sul tuo profilo.",
      ctaLabel: "Vai al tuo profilo",
    },
    en: {
      subject: "Driver verification approved",
      heading: "You're a verified driver!",
      body: "Hi {name},\n\nWe've verified your details and vehicle. The \"Verified driver\" badge is now visible on your profile.",
      ctaLabel: "Go to your profile",
    },
  },
  driver_verification_rejected: {
    it: {
      subject: "Verifica conducente rifiutata",
      heading: "Verifica non approvata",
      body: "Ciao {name},\n\nNon siamo riusciti ad approvare la tua richiesta di verifica conducente. Puoi controllare la motivazione e inviare una nuova richiesta.",
      ctaLabel: "Controlla la verifica",
    },
    en: {
      subject: "Driver verification declined",
      heading: "Verification not approved",
      body: "Hi {name},\n\nWe couldn't approve your driver verification request. You can check the reason and submit a new request.",
      ctaLabel: "Check your verification",
    },
  },
  report_resolved: {
    it: {
      subject: "Segnalazione risolta",
      heading: "La tua segnalazione è stata gestita",
      body: "Ciao {name},\n\nAbbiamo esaminato la tua segnalazione e l'abbiamo contrassegnata come risolta.",
      ctaLabel: "Vai alla pagina segnalazioni",
    },
    en: {
      subject: "Report resolved",
      heading: "Your report has been handled",
      body: "Hi {name},\n\nWe've reviewed your report and marked it as resolved.",
      ctaLabel: "Go to reports",
    },
  },
  report_dismissed: {
    it: {
      subject: "Segnalazione archiviata",
      heading: "La tua segnalazione è stata archiviata",
      body: "Ciao {name},\n\nAbbiamo esaminato la tua segnalazione e l'abbiamo archiviata senza ulteriori azioni.",
      ctaLabel: "Vai alla pagina segnalazioni",
    },
    en: {
      subject: "Report dismissed",
      heading: "Your report has been dismissed",
      body: "Hi {name},\n\nWe've reviewed your report and dismissed it with no further action.",
      ctaLabel: "Go to reports",
    },
  },
  review_reminder_passenger: {
    it: {
      subject: "Com'è andato il viaggio?",
      heading: "Com'è andato il viaggio?",
      body: "Ciao {name},\n\nIl tuo passaggio con {counterpart} è terminato ieri. Lascia una recensione per aiutare la community di Car2ne a crescere.",
      ctaLabel: "Lascia una recensione",
    },
    en: {
      subject: "How was your trip?",
      heading: "How was your trip?",
      body: "Hi {name},\n\nYour ride with {counterpart} ended yesterday. Leave a review to help the Car2ne community grow.",
      ctaLabel: "Leave a review",
    },
  },
  review_reminder_driver: {
    it: {
      subject: "Com'è andato il viaggio?",
      heading: "Com'è andato il viaggio?",
      body: "Ciao {name},\n\nIl tuo passaggio con {counterpart} è terminato ieri. Lascia una recensione per aiutare la community di Car2ne a crescere.",
      ctaLabel: "Lascia una recensione",
    },
    en: {
      subject: "How was your trip?",
      heading: "How was your trip?",
      body: "Hi {name},\n\nYour ride with {counterpart} ended yesterday. Leave a review to help the Car2ne community grow.",
      ctaLabel: "Leave a review",
    },
  },
  event_suggestion_approved: {
    it: {
      subject: "Segnalazione evento approvata",
      heading: "Grazie per la segnalazione!",
      body: "Ciao {name},\n\nAbbiamo esaminato l'evento che ci hai segnalato e lo stiamo aggiungendo a Car2ne. Grazie per aver contribuito alla community!",
      ctaLabel: "Vai agli eventi",
    },
    en: {
      subject: "Event suggestion approved",
      heading: "Thanks for the suggestion!",
      body: "Hi {name},\n\nWe've reviewed the event you suggested and we're adding it to Car2ne. Thanks for contributing to the community!",
      ctaLabel: "Go to events",
    },
  },
  event_suggestion_rejected: {
    it: {
      subject: "Segnalazione evento non approvata",
      heading: "Segnalazione non approvata",
      body: "Ciao {name},\n\nAbbiamo esaminato l'evento che ci hai segnalato e per questa volta non lo aggiungeremo a Car2ne. Grazie comunque per il tuo contributo: puoi segnalarci un altro evento quando vuoi.",
      ctaLabel: "Segnala un altro evento",
    },
    en: {
      subject: "Event suggestion not approved",
      heading: "Suggestion not approved",
      body: "Hi {name},\n\nWe've reviewed the event you suggested and we won't be adding it to Car2ne this time. Thanks anyway for your contribution: feel free to suggest another event any time.",
      ctaLabel: "Suggest another event",
    },
  },
};

// Stessi mittenti verificati usati in lib/email/brevo.ts (app Next.js),
// duplicati qui perché le Edge Function Deno non possono importare da lib/.
const EMAIL_SENDERS = {
  noreply: { email: "noreply@car2ne.com", name: "Car2ne" },
  report: { email: "report@car2ne.com", name: "Car2ne" },
} as const;

function getSender(type: NotificationType) {
  if (type === "report_resolved" || type === "report_dismissed") {
    return EMAIL_SENDERS.report;
  }

  return EMAIL_SENDERS.noreply;
}

function getHref(type: string, record: NotificationRecord) {
  if (type === "booking_request") {
    return "/dashboard/rides";
  }

  if (
    type === "driver_verification_approved" ||
    type === "driver_verification_rejected"
  ) {
    return "/dashboard/verification";
  }

  if (type === "report_resolved" || type === "report_dismissed") {
    return "/segnala-un-problema";
  }

  if (type === "review_reminder_driver" && record.ride_id) {
    return `/dashboard/rides/${record.ride_id}`;
  }

  if (type === "review_reminder_passenger") {
    return "/dashboard/bookings";
  }

  if (type === "event_suggestion_approved") {
    return "/eventi";
  }

  if (type === "event_suggestion_rejected") {
    return "/segnala-evento";
  }

  return "/dashboard/bookings";
}

// Stesso SVG di components/layout/Logo.tsx, codificato in base64.
const LOGO_DATA_URI =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjggOCA4NCA4NCI+PHBhdGggZD0iTTc0IDI4IEEzMiAzMiAwIDEgMCA3NCA3MiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDU5NjY5IiBzdHJva2Utd2lkdGg9IjE0IiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48Y2lyY2xlIGN4PSI3NCIgY3k9IjUwIiByPSI5IiBmaWxsPSIjMDU5NjY5Ii8+PC9zdmc+";

function renderEmailHtml(
  heading: string,
  body: string,
  ctaLabel: string,
  ctaHref: string
) {
  const paragraphs = body
    .split("\n\n")
    .map(
      (paragraph) =>
        `<p style="margin:0 0 16px;color:#334155;font-size:15px;line-height:1.6;">${paragraph.replace(/\n/g, "<br/>")}</p>`
    )
    .join("");

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
                <table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px auto 0;"><tr><td style="background:#10b981;border-radius:9999px;"><a href="${ctaHref}" style="display:inline-block;padding:13px 28px;color:#ffffff;font-weight:700;font-size:14px;text-decoration:none;">${ctaLabel}</a></td></tr></table>
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

Deno.serve(async (req) => {
  const secret = req.headers.get("x-webhook-secret");

  if (secret !== Deno.env.get("NOTIFICATION_WEBHOOK_SECRET")) {
    return new Response("Unauthorized", { status: 401 });
  }

  const payload = await req.json();
  const record = payload.record as NotificationRecord | undefined;

  if (
    !record ||
    !EMAIL_NOTIFICATION_TYPES.has(record.type)
  ) {
    return new Response("Skipped", { status: 200 });
  }

  const type = record.type as NotificationType;

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const [authResult, profileResult] = await Promise.all([
    supabaseAdmin.auth.admin.getUserById(record.user_id),
    supabaseAdmin
      .from("profiles")
      .select("name, locale")
      .eq("id", record.user_id)
      .single(),
  ]);

  const recipientEmail = authResult.data.user?.email;

  if (authResult.error || !recipientEmail) {
    console.error(
      "Utente non trovato per notifica email:",
      record.user_id,
      authResult.error
    );

    return new Response("User not found", { status: 200 });
  }

  const locale: Locale =
    profileResult.data?.locale === "en" ? "en" : "it";

  const recipientName =
    profileResult.data?.name?.trim() ||
    (locale === "en" ? "there" : "utente");

  const counterpartName = await getCounterpartName(
    supabaseAdmin,
    type,
    record,
    locale
  );

  const brevoApiKey = Deno.env.get("BREVO_API_KEY");
  const siteUrl =
    Deno.env.get("SITE_URL") ?? "https://car2ne.vercel.app";

  if (!brevoApiKey) {
    console.error("BREVO_API_KEY non configurata.");

    return new Response("Email config missing", { status: 200 });
  }

  const copy = EMAIL_COPY[type][locale];

  const body = copy.body
    .replaceAll("{name}", recipientName)
    .replaceAll("{counterpart}", counterpartName);

  const html = renderEmailHtml(
    copy.heading,
    body,
    copy.ctaLabel,
    `${siteUrl}${getHref(type, record)}`
  );

  const brevoResponse = await fetch(
    "https://api.brevo.com/v3/smtp/email",
    {
      method: "POST",
      headers: {
        "api-key": brevoApiKey,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        sender: getSender(type),
        to: [{ email: recipientEmail }],
        subject: copy.subject,
        htmlContent: html,
      }),
    }
  );

  if (!brevoResponse.ok) {
    const errorBody = await brevoResponse.text();

    console.error(
      "Errore invio email Brevo:",
      brevoResponse.status,
      errorBody
    );

    return new Response("Brevo error", { status: 502 });
  }

  return new Response("OK", { status: 200 });
});

/*
 * Nome di chi ha compiuto l'azione (chi ha confermato/rifiutato/
 * richiesto/annullato), non del destinatario dell'email:
 * - booking_request e review_reminder_driver: il destinatario è
 *   l'autista, la controparte è il passeggero (via booking_id).
 * - negli altri casi con ride_id il destinatario è il passeggero, la
 *   controparte è l'autista del passaggio (via ride_id).
 * - event_suggestion_approved/rejected non hanno controparte: la
 *   copy non usa {counterpart}, si torna subito al fallback.
 */
async function getCounterpartName(
  supabaseAdmin: ReturnType<typeof createClient>,
  type: NotificationType,
  record: NotificationRecord,
  locale: Locale
): Promise<string> {
  const fallback = locale === "en" ? "A user" : "Un utente";

  try {
    if (type === "booking_request" || type === "review_reminder_driver") {
      if (!record.booking_id) return fallback;

      const { data: booking } = await supabaseAdmin
        .from("bookings")
        .select("passenger_id")
        .eq("id", record.booking_id)
        .single();

      if (!booking?.passenger_id) return fallback;

      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("name")
        .eq("id", booking.passenger_id)
        .single();

      return profile?.name?.trim() || fallback;
    }

    if (!record.ride_id) return fallback;

    const { data: ride } = await supabaseAdmin
      .from("rides")
      .select("driver_id")
      .eq("id", record.ride_id)
      .single();

    if (!ride?.driver_id) return fallback;

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("name")
      .eq("id", ride.driver_id)
      .single();

    return profile?.name?.trim() || fallback;
  } catch (error) {
    console.error("Errore lookup nome controparte:", error);
    return fallback;
  }
}
