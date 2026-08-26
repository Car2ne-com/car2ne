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
  "rating_received",
  "review_reminder_passenger",
  "review_reminder_driver",
  "ride_available_for_watched_event",
]);

type NotificationType =
  | "booking_confirmed"
  | "booking_rejected"
  | "booking_request"
  | "ride_cancelled"
  | "driver_verification_approved"
  | "driver_verification_rejected"
  | "report_resolved"
  | "report_dismissed"
  | "rating_received"
  | "review_reminder_passenger"
  | "review_reminder_driver"
  | "ride_available_for_watched_event";

type NotificationRecord = {
  id: string;
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
  rating_received: {
    it: {
      title: "Hai ricevuto una recensione",
      body: "Qualcuno ha lasciato una recensione sul passaggio che avete condiviso.",
      href: "/dashboard",
    },
    en: {
      title: "You've received a review",
      body: "Someone left you a review for the ride you shared.",
      href: "/dashboard",
    },
  },
  review_reminder_passenger: {
    it: {
      title: "Com'è andato il viaggio?",
      body: "Lascia una recensione al conducente per aiutare la community.",
      href: "/dashboard/bookings",
    },
    en: {
      title: "How was your trip?",
      body: "Leave a review for the driver to help the community.",
      href: "/dashboard/bookings",
    },
  },
  review_reminder_driver: {
    it: {
      title: "Com'è andato il viaggio?",
      body: "Lascia una recensione al passeggero per aiutare la community.",
      // Fallback statico: sovrascritto a runtime con l'id del
      // passaggio quando disponibile (vedi Deno.serve sotto).
      href: "/dashboard/rides",
    },
    en: {
      title: "How was your trip?",
      body: "Leave a review for the passenger to help the community.",
      href: "/dashboard/rides",
    },
  },
  ride_available_for_watched_event: {
    it: {
      title: "Nuovo passaggio disponibile!",
      body: "Qualcuno ha pubblicato un passaggio per un evento che stai seguendo.",
      // Fallback statico: sovrascritto a runtime con lo slug
      // dell'evento quando disponibile (vedi Deno.serve sotto).
      href: "/dashboard/watchlist",
    },
    en: {
      title: "New ride available!",
      body: "Someone posted a ride for an event you're following.",
      href: "/dashboard/watchlist",
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

  // Difesa in profondità: la funzione è pensata solo per INSERT.
  if (payload.type !== "INSERT") {
    return new Response("Skipped", { status: 200 });
  }

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

  /*
   * Idempotenza consegna: stesso motivo/pattern di notify-email
   * (Database Webhook "at-least-once" - vedi 0034_notification_delivery_idempotency.sql).
   */
  const { data: claimed, error: claimError } = await supabaseAdmin
    .from("notifications")
    .update({ push_sent_at: new Date().toISOString() })
    .eq("id", record.id)
    .is("push_sent_at", null)
    .select("id")
    .maybeSingle();

  if (claimError) {
    console.error("Errore claim invio push:", claimError);
    return new Response("Claim error", { status: 500 });
  }

  if (!claimed) {
    return new Response("Already sent", { status: 200 });
  }

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

  const href = await resolveHref(supabaseAdmin, type, record, copy.href);

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
          url: href,
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

/*
 * review_reminder_driver e ride_available_for_watched_event non hanno
 * un href statico: il primo punta alla gestione del passaggio, il
 * secondo all'evento del passaggio appena pubblicato (lookup via
 * ride_id -> rides.event_id -> events.slug). Fallback all'href
 * statico della copy se il ride/evento non si trova più.
 */
async function resolveHref(
  supabaseAdmin: ReturnType<typeof createClient>,
  type: NotificationType,
  record: NotificationRecord,
  fallbackHref: string
): Promise<string> {
  if (type === "review_reminder_driver" && record.ride_id) {
    return `/dashboard/rides/${record.ride_id}`;
  }

  if (type === "ride_available_for_watched_event" && record.ride_id) {
    const { data: ride } = await supabaseAdmin
      .from("rides")
      .select("events(slug)")
      .eq("id", record.ride_id)
      .single();

    const eventRelation = ride?.events;
    const event = Array.isArray(eventRelation)
      ? eventRelation[0]
      : eventRelation;

    if (event?.slug) {
      return `/events/${event.slug}`;
    }
  }

  return fallbackHref;
}
