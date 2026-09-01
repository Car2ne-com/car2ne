import { redirect, notFound } from "next/navigation";

import { ChevronLeft } from "lucide-react";

import Link from "next/link";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ChatWindow from "@/components/chat/ChatWindow";

import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "@/lib/i18n";
import { isEventConcluded } from "@/lib/utils/eventStatus";

type Props = {
  params: Promise<{
    conversationId: string;
  }>;
};

export default async function ConversationPage({
  params,
}: Props) {
  const { conversationId } = await params;

  const supabase = await createClient();
  const { dict } = await getTranslations();

  /*
   * ==============================
   * UTENTE AUTENTICATO
   * ==============================
   */

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  /*
   * ==============================
   * CONVERSAZIONE
   * ==============================
   */

  const {
    data: conversation,
    error: conversationError,
  } = await supabase
    .from("conversations")
    .select(`
      id,
      ride_id,
      driver_id,
      passenger_id,
      created_at,
      updated_at
    `)
    .eq("id", conversationId)
    .maybeSingle();

  if (conversationError) {
    console.error(
      "Errore caricamento conversazione:",
      conversationError
    );
  }

  if (!conversation) {
    notFound();
  }

  /*
   * ==============================
   * SICUREZZA
   * ==============================
   */

  const isParticipant =
    conversation.driver_id === user.id ||
    conversation.passenger_id === user.id;

  if (!isParticipant) {
    notFound();
  }

  /*
   * ==============================
   * ALTRA PERSONA
   * ==============================
   */

  const otherUserId =
    conversation.driver_id === user.id
      ? conversation.passenger_id
      : conversation.driver_id;

  /*
   * ==============================
   * PROFILO
   * ==============================
   */

  const {
    data: otherProfile,
    error: profileError,
  } = await supabase
    .from("profiles")
    .select(`
      id,
      name,
      surname,
      avatar_url
    `)
    .eq("id", otherUserId)
    .maybeSingle();

  if (profileError) {
    console.error(
      "Errore caricamento profilo chat:",
      profileError
    );
  }

  /*
   * ==============================
   * PASSAGGIO
   * ==============================
   */

  const {
    data: ride,
    error: rideError,
  } = await supabase
    .from("rides")
    .select(`
      id,
      event_id,
      departure_city,
      destination,
      departure_date,
      departure_time,
      status
    `)
    .eq("id", conversation.ride_id)
    .maybeSingle();

  if (rideError) {
    console.error(
      "Errore caricamento passaggio chat:",
      rideError
    );
  }

  /*
   * ==============================
   * EVENTO
   * ==============================
   */

  let event = null;

  if (ride?.event_id) {
    const {
      data: eventData,
      error: eventError,
    } = await supabase
      .from("events")
      .select(`
        id,
        title,
        artist,
        venue,
        city,
        event_date
      `)
      .eq("id", ride.event_id)
      .maybeSingle();

    if (eventError) {
      console.error(
        "Errore caricamento evento chat:",
        eventError
      );
    }

    event = eventData;
  }

  /*
   * ==============================
   * EVENTO CONCLUSO
   * ==============================
   *
   * La chat non deve restare visibile oltre il giorno successivo
   * all'evento: stesso cutoff usato per i promemoria recensione
   * (isEventConcluded), coerente con la coppia già rimossa dalla
   * lista in ChatList.
   */

  if (event && isEventConcluded(event.event_date)) {
    notFound();
  }

  /*
   * ==============================
   * MESSAGGI
   * ==============================
   */

  const {
    data: messages,
    error: messagesError,
  } = await supabase
    .from("messages")
    .select(`
      id,
      conversation_id,
      sender_id,
      content,
      created_at,
      delivered_at,
      read_at
    `)
    .eq("conversation_id", conversation.id)
    .order("created_at", {
      ascending: true,
    });

  if (messagesError) {
    console.error(
      "Errore caricamento messaggi:",
      messagesError
    );
  }

  /*
   * ==============================
   * AVATAR
   * ==============================
   */

  let avatarUrl =
    otherProfile?.avatar_url ?? null;

  if (
    avatarUrl &&
    !avatarUrl.startsWith("http://") &&
    !avatarUrl.startsWith("https://")
  ) {
    const {
      data: publicUrlData,
    } = supabase.storage
      .from("avatars")
      .getPublicUrl(avatarUrl);

    avatarUrl = publicUrlData.publicUrl;
  }

  /*
   * ==============================
   * NOME
   * ==============================
   */

  const otherName = otherProfile
    ? `${otherProfile.name ?? ""} ${
        otherProfile.surname ?? ""
      }`.trim()
    : dict.chat.conversationPage.otherUserFallback;

  /*
   * ==============================
   * STATO CHAT
   * ==============================
   *
   * La conversazione viene considerata
   * attiva se esiste una prenotazione
   * confermata per questo passaggio.
   */

  let canSendMessages = false;

  let chatClosedReason: string | null =
    dict.chat.window.closedDefaultReason;

  if (ride) {
    const {
      data: confirmedBooking,
      error: bookingError,
    } = await supabase
      .from("bookings")
      .select("id")
      .eq("ride_id", ride.id)
      .eq(
        "passenger_id",
        conversation.passenger_id
      )
      .eq("status", "confirmed")
      .maybeSingle();

    if (bookingError) {
      console.error(
        "Errore verifica prenotazione chat:",
        bookingError
      );
    }

    if (confirmedBooking) {
      canSendMessages = true;
      chatClosedReason = null;
    } else {
      chatClosedReason =
        dict.chat.conversationPage.bookingInactiveReason;
    }
  }

  /*
   * ==============================
   * BLOCCO UTENTE
   * ==============================
   *
   * Se una delle due parti ha bloccato l'altra, la chat resta
   * chiusa a prescindere dallo stato della prenotazione. Il motivo
   * mostrato resta generico: non riveliamo chi ha bloccato chi.
   */

  if (canSendMessages) {
    const { data: blockRow, error: blockError } = await supabase
      .from("blocked_users")
      .select("id")
      .or(
        `and(blocker_id.eq.${conversation.driver_id},blocked_id.eq.${conversation.passenger_id}),and(blocker_id.eq.${conversation.passenger_id},blocked_id.eq.${conversation.driver_id})`
      )
      .maybeSingle();

    if (blockError) {
      console.error(
        "Errore verifica blocco utente chat:",
        blockError
      );
    }

    if (blockRow) {
      canSendMessages = false;
      chatClosedReason = dict.chat.conversationPage.blockedReason;
    }
  }

  /*
   * ==============================
   * RENDER
   * ==============================
   */

  return (
    <>
      <Navbar />

      <main className="mx-auto max-w-5xl px-6 pb-24 pt-28">
        <Link
          href="/chat"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition hover:text-primary"
        >
          <ChevronLeft className="h-4 w-4" />
          {dict.chat.conversationPage.backLink}
        </Link>

        <ChatWindow
          conversationId={conversation.id}
          currentUserId={user.id}
          otherUserId={otherUserId}
          otherName={otherName}
          avatarUrl={avatarUrl ?? ""}
          ride={ride}
          event={event}
          initialMessages={messages ?? []}
          canSendMessages={canSendMessages}
          chatClosedReason={chatClosedReason}
          dict={dict.chat.window}
        />
      </main>

      <Footer />
    </>
  );
}