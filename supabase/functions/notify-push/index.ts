// Edge Function: invia una push notification (Web Push/VAPID) quando
// viene inserita una notifica "critica" in public.notifications.
// Stesso identico trigger di notify-email (Database Webhook su INSERT
// in public.notifications), Edge Function separata e indipendente
// invece di unirla a notify-email: stesso pattern di isolamento già
// in uso nel progetto (ogni funzione si deploya e fallisce da sola).
//
// Da creare via Dashboard Supabase -> Edge Functions -> Deploy a new
// function (incolla questo file). Nessuna CLI necessaria.
//
// Secrets richiesti (Dashboard -> Edge Functions -> Secrets):
//   VAPID_PUBLIC_KEY             chiave pubblica generata con web-push
//   VAPID_PRIVATE_KEY            chiave privata generata con web-push
//   VAPID_SUBJECT                es. mailto:support@car2ne.com
//   NOTIFICATION_WEBHOOK_SECRET  stessa stringa già usata da notify-email
//
// SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY sono già disponibili di
// default in ogni Edge Function del progetto.
//
// Il payload della push non riusa notification.title/message (salvati
// solo in italiano dalle funzioni SQL come confirm_booking/cancel_ride):
// stessa scelta già fatta da notify-email, con una sua copy bilingue.

import { createClient } from "npm:@supabase/supabase-js@2";
import webpush from "npm:web-push@3";

const PUSH_NOTIFICATION_TYPES = new Set([
  "booking_confirmed",
  "booking_rejected",
  "booking_request",
  "ride_cancelled",
  "driver_verification_approved",
  "driver_verification_rejected",
  "report_resolved",
  "report_dismissed",
]);

type NotificationType =
  | "booking_confirmed"
  | "booking_rejected"
  | "booking_request"
  | "ride_cancelled"
  | "driver_verification_approved"
  | "driver_verification_rejected"
  | "report_resolved"
  | "report_dismissed";

type NotificationRecord = {
  user_id: string;
  type: string;
  booking_id: string | null;
  ride_id: string | null;
};

type Locale = "it" | "en";

type Copy = { title: string; body: string; href: string };

const PUSH_COPY: Record<NotificationType, Record<Locale, Copy>> = {
  booking_confirmed: {
    it: {
      title: "Prenotazione confermata!",
      body: "Il conducente ha confermato la tua richiesta di prenotazione.",
      href: "/dashboard/bookings",
    },
    en: {
      title: "Booking confirmed!",
      body: "The driver has confirmed your booking request.",
      href: "/dashboard/bookings",
    },
  },
  booking_rejected: {
    it: {
      title: "Richiesta rifiutata",
      body: "Il conducente ha rifiutato la tua richiesta di prenotazione.",
      href: "/dashboard/bookings",
    },
    en: {
      title: "Request declined",
      body: "The driver has declined your booking request.",
      href: "/dashboard/bookings",
    },
  },
  booking_request: {
    it: {
      title: "Nuova richiesta di prenotazione",
      body: "Un passeggero ha richiesto un posto nel tuo passaggio.",
      href: "/dashboard/rides",
    },
    en: {
      title: "New booking request",
      body: "A passenger has requested a seat on your ride.",
      href: "/dashboard/rides",
    },
  },
  ride_cancelled: {
    it: {
      title: "Passaggio annullato",
      body: "Il conducente ha annullato il passaggio per cui avevi una richiesta o prenotazione.",
      href: "/dashboard/bookings",
    },
    en: {
      title: "Ride cancelled",
      body: "The driver has cancelled the ride you had a request or booking for.",
      href: "/dashboard/bookings",
    },
  },
  driver_verification_approved: {
    it: {
      title: "Sei un conducente verificato!",
      body: "Il badge \"Conducente verificato\" è ora visibile sul tuo profilo.",
      href: "/dashboard/verification",
    },
    en: {
      title: "You're a verified driver!",
      body: "The \"Verified driver\" badge is now visible on your profile.",
      href: "/dashboard/verification",
    },
  },
  driver_verification_rejected: {
    it: {
      title: "Verifica non approvata",
      body: "Controlla la motivazione e invia una nuova richiesta di verifica.",
      href: "/dashboard/verification",
    },
    en: {
      title: "Verification not approved",
      body: "Check the reason and submit a new verification request.",
      href: "/dashboard/verification",
    },
  },
  report_resolved: {
    it: {
      title: "Segnalazione risolta",
      body: "Abbiamo esaminato la tua segnalazione e l'abbiamo risolta.",
      href: "/segnala-un-problema",
    },
    en: {
      title: "Report resolved",
      body: "We've reviewed your report and marked it as resolved.",
      href: "/segnala-un-problema",
    },
  },
  report_dismissed: {
    it: {
      title: "Segnalazione archiviata",
      body: "Abbiamo esaminato la tua segnalazione e l'abbiamo archiviata.",
      href: "/segnala-un-problema",
    },
    en: {
      title: "Report dismissed",
      body: "We've reviewed your report and dismissed it.",
      href: "/segnala-un-problema",
    },
  },
};

Deno.serve(async (req) => {
  const secret = req.headers.get("x-webhook-secret");

  if (secret !== Deno.env.get("NOTIFICATION_WEBHOOK_SECRET")) {
    return new Response("Unauthorized", { status: 401 });
  }

  const payload = await req.json();
  const record = payload.record as NotificationRecord | undefined;

  if (!record || !PUSH_NOTIFICATION_TYPES.has(record.type)) {
    return new Response("Skipped", { status: 200 });
  }

  const type = record.type as NotificationType;

  const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY");
  const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY");
  const vapidSubject = Deno.env.get("VAPID_SUBJECT");

  if (!vapidPublicKey || !vapidPrivateKey || !vapidSubject) {
    console.error("VAPID_* non configurate.");
    return new Response("VAPID config missing", { status: 200 });
  }

  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const [subscriptionsResult, profileResult] = await Promise.all([
    supabaseAdmin
      .from("push_subscriptions")
      .select("id, endpoint, p256dh, auth")
      .eq("user_id", record.user_id),

    supabaseAdmin
      .from("profiles")
      .select("locale")
      .eq("id", record.user_id)
      .single(),
  ]);

  const subscriptions = subscriptionsResult.data ?? [];

  if (subscriptions.length === 0) {
    return new Response("No subscriptions", { status: 200 });
  }

  const locale: Locale = profileResult.data?.locale === "en" ? "en" : "it";
  const copy = PUSH_COPY[type][locale];

  const results = await Promise.allSettled(
    subscriptions.map((subscription) =>
      webpush.sendNotification(
        {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh,
            auth: subscription.auth,
          },
        },
        JSON.stringify({
          title: copy.title,
          body: copy.body,
          url: copy.href,
        })
      )
    )
  );

  const staleIds: string[] = [];

  results.forEach((result, index) => {
    if (result.status === "rejected") {
      const statusCode = result.reason?.statusCode;

      if (statusCode === 404 || statusCode === 410) {
        staleIds.push(subscriptions[index].id);
      } else {
        console.error("Errore invio push:", result.reason);
      }
    }
  });

  if (staleIds.length > 0) {
    await supabaseAdmin
      .from("push_subscriptions")
      .delete()
      .in("id", staleIds);
  }

  return new Response("OK", { status: 200 });
});
