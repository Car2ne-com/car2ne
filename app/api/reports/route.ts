import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "@/lib/i18n";
import {
  getUserDisplayName,
  renderEmailHtml,
  sendTransactionalEmail,
} from "@/lib/email/brevo";
import { isPastDateTime } from "@/lib/utils/date";
import { toOne } from "@/lib/utils/relations";

const CATEGORIES = [
  "user_behavior",
  "inappropriate_content",
  "technical_issue",
  "safety",
  "no_show",
  "other",
];

/*
 * Crea una segnalazione. Protetta da RLS (reporter_id deve coincidere
 * con l'utente autenticato, vedi 0018_reports.sql), niente service
 * role necessario qui.
 */
export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Non autenticato." },
      { status: 401 }
    );
  }

  const body = await request.json();
  const category = body.category;
  const description =
    typeof body.description === "string" ? body.description.trim() : "";
  const bookingId =
    typeof body.bookingId === "string" ? body.bookingId : null;
  let rideId = typeof body.rideId === "string" ? body.rideId : null;

  if (!CATEGORIES.includes(category)) {
    return NextResponse.json(
      { error: "Categoria non valida." },
      { status: 400 }
    );
  }

  /*
   * La segnalazione "mancata presentazione" è un'accusa verso una
   * persona precisa: reported_user_id non arriva mai dal client, ma
   * viene ricavato qui dalla prenotazione (via RLS, solo le due
   * controparti reali possono leggerla), esattamente come la policy
   * di insert delle ratings verifica la controparte reale.
   */
  let reportedUserId: string | null = null;

  if (category === "no_show") {
    if (!bookingId) {
      return NextResponse.json(
        { error: "Prenotazione mancante." },
        { status: 400 }
      );
    }

    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select(
        `
        id,
        status,
        passenger_id,
        ride_id,
        rides (
          driver_id,
          departure_date,
          departure_time
        )
      `
      )
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: "Prenotazione non trovata." },
        { status: 404 }
      );
    }

    const ride = toOne(booking.rides);

    if (!ride) {
      return NextResponse.json(
        { error: "Passaggio non trovato." },
        { status: 404 }
      );
    }

    const isPassenger = user.id === booking.passenger_id;
    const isDriver = user.id === ride.driver_id;

    if (!isPassenger && !isDriver) {
      return NextResponse.json(
        { error: "Non autorizzato." },
        { status: 403 }
      );
    }

    if (booking.status !== "confirmed") {
      return NextResponse.json(
        {
          error:
            "Puoi segnalare una mancata presentazione solo per una prenotazione confermata.",
        },
        { status: 400 }
      );
    }

    if (!isPastDateTime(ride.departure_date, ride.departure_time)) {
      return NextResponse.json(
        {
          error:
            "Puoi segnalare una mancata presentazione solo dopo la data del passaggio.",
        },
        { status: 400 }
      );
    }

    reportedUserId = isPassenger ? ride.driver_id : booking.passenger_id;
    rideId = booking.ride_id;
  }

  if (!description || description.length > 2000) {
    return NextResponse.json(
      { error: "Descrizione mancante o troppo lunga." },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("reports")
    .insert({
      reporter_id: user.id,
      reported_user_id: reportedUserId,
      category,
      description,
      ride_id: rideId,
      booking_id: bookingId,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "Hai già segnalato questa prenotazione." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  if (user.email) {
    const { dict, locale } = await getTranslations();
    const copy = dict.email.reportReceived;

    sendTransactionalEmail({
      to: { email: user.email },
      subject: copy.subject,
      htmlContent: renderEmailHtml({
        heading: copy.heading,
        body: copy.body.replace(
          "{name}",
          getUserDisplayName(user, locale)
        ),
      }),
      sender: "report",
    }).catch((error) => {
      console.error(
        "Errore invio email conferma segnalazione:",
        error
      );
    });
  }

  return NextResponse.json({ id: data.id });
}
