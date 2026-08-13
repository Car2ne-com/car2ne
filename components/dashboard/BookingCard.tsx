"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  ArrowRight,
  CalendarDays,
  CarFront,
  CheckCircle2,
  Clock3,
  MapPin,
  MessageCircle,
  User2,
  XCircle,
} from "lucide-react";

import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";
import RatingForm from "@/components/ratings/RatingForm";

type Props = {
  booking: {
    id: string;
    status: string;
    rideId: string;

    eventTitle: string;
    eventSlug: string | null;
    eventVenue: string | null;
    eventCity: string | null;

    departureCity: string;
    destination: string;

    departureDate: string;
    departureTime: string;

    contribution: number;

    driverId: string;
    driverName: string;

    rideHasPassed: boolean;
  };
};

export default function BookingCard({
  booking,
}: Props) {
  const router = useRouter();

  const supabase = useMemo(
    () => createClient(),
    []
  );

  const [cancelling, setCancelling] =
    useState(false);

  const [conversationId, setConversationId] =
    useState<string | null>(null);

  const isConfirmed =
    booking.status === "confirmed";

  const rideHasPassed = booking.rideHasPassed;

  useEffect(() => {
    async function loadConversation() {
      if (!isConfirmed) {
        setConversationId(null);
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return;
      }

      const {
        data: conversation,
        error,
      } = await supabase
        .from("conversations")
        .select("id")
        .eq("ride_id", booking.rideId)
        .eq("passenger_id", user.id)
        .maybeSingle();

      if (error) {
        console.error(
          "Errore caricamento chat prenotazione:",
          error
        );

        return;
      }

      setConversationId(conversation?.id ?? null);
    }

    void loadConversation();
  }, [
    booking.rideId,
    isConfirmed,
    supabase,
  ]);

  async function handleCancel() {
    if (cancelling) {
      return;
    }

    const confirmed = window.confirm(
      "Sei sicuro di voler annullare questa prenotazione?\n\nIl posto tornerà disponibile per gli altri utenti."
    );

    if (!confirmed) {
      return;
    }

    setCancelling(true);

    const { error } = await supabase.rpc(
      "cancel_booking",
      {
        p_booking_id: booking.id,
      }
    );

    if (error) {
      console.error(
        "Errore annullamento prenotazione:",
        error
      );

      setCancelling(false);

      toast.error(
        error.message ||
          "Impossibile annullare la prenotazione."
      );

      return;
    }

    setCancelling(false);

    toast.success(
      "Prenotazione annullata con successo."
    );

    router.refresh();
  }

  const formattedDate =
    new Intl.DateTimeFormat("it-IT", {
      dateStyle: "long",
    }).format(
      new Date(booking.departureDate)
    );

  const formattedTime =
    booking.departureTime.slice(0, 5);

  return (
    <div
      className={`rounded-3xl border bg-white p-7 shadow-sm transition hover:shadow-lg ${
        isConfirmed
          ? "border-slate-200 hover:border-emerald-200"
          : "border-slate-200 opacity-80"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-emerald-600">
            {booking.eventTitle}
          </p>

          <h2 className="mt-1 text-2xl font-black text-slate-900">
            {booking.departureCity}
            {" → "}
            {booking.destination}
          </h2>
        </div>

        {isConfirmed ? (
          <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Confermata
          </span>
        ) : (
          <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
            <XCircle className="h-3.5 w-3.5" />
            Annullata
          </span>
        )}
      </div>

      <div className="mt-6 rounded-2xl bg-slate-50 p-5">
        <p className="text-sm font-semibold text-slate-700">
          Evento
        </p>

        <p className="mt-1 font-bold text-slate-900">
          {booking.eventTitle}
        </p>

        {(booking.eventVenue ||
          booking.eventCity) && (
          <p className="mt-1 text-sm text-slate-500">
            {booking.eventVenue}
            {booking.eventCity
              ? ` · ${booking.eventCity}`
              : ""}
          </p>
        )}
      </div>

      <Link
        href={`/profile/${booking.driverId}`}
        className="mt-6 flex items-center gap-3 rounded-2xl transition hover:bg-slate-50"
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100">
          <User2 className="h-5 w-5 text-emerald-600" />
        </div>

        <div>
          <p className="text-xs text-slate-500">
            Conducente
          </p>

          <p className="font-semibold text-slate-900 underline-offset-2 hover:underline">
            {booking.driverName}
          </p>
        </div>
      </Link>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <CalendarDays className="h-4 w-4 text-emerald-600" />
          {formattedDate}
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Clock3 className="h-4 w-4 text-emerald-600" />
          {formattedTime}
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-600">
          <CarFront className="h-4 w-4 text-emerald-600" />
          Passaggio prenotato
        </div>

        <div className="text-right text-xl font-black text-emerald-600">
          € {booking.contribution.toFixed(2)}
        </div>
      </div>

      <div className="mt-6 space-y-3 border-t border-slate-100 pt-6">
        <div className="flex items-center gap-3">
          <MapPin className="h-5 w-5 text-emerald-600" />

          <span className="font-medium text-slate-700">
            {booking.departureCity}
          </span>
        </div>

        <div className="pl-2 text-slate-300">
          │
        </div>

        <div className="flex items-center gap-3">
          <MapPin className="h-5 w-5 text-emerald-600" />

          <span className="font-medium text-slate-700">
            {booking.destination}
          </span>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-100 pt-5">
        {booking.eventSlug && (
          <Link
            href={`/events/${booking.eventSlug}`}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
          >
            Vedi evento
            <ArrowRight className="h-4 w-4" />
          </Link>
        )}

        {isConfirmed && conversationId && (
          <Link
            href={`/chat/${conversationId}`}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600"
          >
            <MessageCircle className="h-4 w-4" />
            Apri chat
          </Link>
        )}

        {isConfirmed && !rideHasPassed && (
          <button
            type="button"
            onClick={handleCancel}
            disabled={cancelling}
            className="flex-1 rounded-2xl bg-red-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {cancelling
              ? "Annullamento..."
              : "Annulla prenotazione"}
          </button>
        )}
      </div>

      {isConfirmed && rideHasPassed && (
        <RatingForm
          bookingId={booking.id}
          rideId={booking.rideId}
          rateeId={booking.driverId}
          rateeName={booking.driverName}
        />
      )}
    </div>
  );
}