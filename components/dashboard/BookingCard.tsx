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
  Banknote,
  CalendarDays,
  CarFront,
  CheckCircle2,
  Clock3,
  ExternalLink,
  MapPin,
  MessageCircle,
  User2,
  XCircle,
} from "lucide-react";

import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";
import {
  buildPaypalMeLink,
  buildRevolutMeLink,
} from "@/lib/payments/links";
import RatingForm from "@/components/ratings/RatingForm";
import ReportNoShowButton, {
  type NoShowDict,
} from "@/components/dashboard/ReportNoShowButton";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Dict = {
  statusConfirmed: string;
  statusCancelled: string;
  eventLabel: string;
  driverLabel: string;
  driverFallback: string;
  rideLabel: string;
  viewEvent: string;
  openChat: string;
  cancelButton: string;
  cancelling: string;
  cancelConfirmMessage: string;
  cancelSuccess: string;
  cancelError: string;
  dialogCancelButton: string;
  dialogPleaseWait: string;
  payTitle: string;
  payDisclaimer: string;
  payWithPaypal: string;
  payWithRevolut: string;
  payWithSatispay: string;
  payInPerson: string;
  payInPersonNote: string;
};

type RatingFormDict = {
  starLabel: string;
  selectStar: string;
  submitted: string;
  yourReview: string;
  leaveReviewButton: string;
  reviewPrompt: string;
  commentPlaceholder: string;
  sending: string;
  sendButton: string;
  cancelButton: string;
};

type Props = {
  dict: Dict;
  noShowDict: NoShowDict;
  ratingFormDict: RatingFormDict;
  locale: "it" | "en";
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

    driverPaypalMe: string | null;
    driverRevolutMe: string | null;
    driverSatispayLink: string | null;

    rideHasPassed: boolean;
  };
};

export default function BookingCard({
  dict,
  noShowDict,
  ratingFormDict,
  locale,
  booking,
}: Props) {
  const router = useRouter();

  const supabase = useMemo(
    () => createClient(),
    []
  );

  const [cancelling, setCancelling] =
    useState(false);

  const [cancelDialogOpen, setCancelDialogOpen] =
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

  function handleCancelRequest() {
    if (cancelling) {
      return;
    }

    setCancelDialogOpen(true);
  }

  async function handleCancelConfirm() {
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
        error.message || dict.cancelError
      );

      return;
    }

    setCancelling(false);
    setCancelDialogOpen(false);

    toast.success(dict.cancelSuccess);

    router.refresh();
  }

  const formattedDate =
    new Intl.DateTimeFormat(
      locale === "en" ? "en-US" : "it-IT",
      { dateStyle: "long" }
    ).format(
      new Date(booking.departureDate)
    );

  const formattedTime =
    booking.departureTime.slice(0, 5);

  return (
    <Card
      className={`p-7 transition hover:shadow-lg ${
        isConfirmed
          ? "hover:border-primary/30"
          : "opacity-80"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-primary">
            {booking.eventTitle}
          </p>

          <h2 className="mt-1 text-2xl font-black text-foreground">
            {booking.departureCity}
            {" → "}
            {booking.destination}
          </h2>
        </div>

        {isConfirmed ? (
          <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {dict.statusConfirmed}
          </span>
        ) : (
          <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-semibold text-muted-foreground">
            <XCircle className="h-3.5 w-3.5" />
            {dict.statusCancelled}
          </span>
        )}
      </div>

      <div className="mt-6 rounded-2xl bg-muted p-5">
        <p className="text-sm font-semibold text-foreground">
          {dict.eventLabel}
        </p>

        <p className="mt-1 font-bold text-foreground">
          {booking.eventTitle}
        </p>

        {(booking.eventVenue ||
          booking.eventCity) && (
          <p className="mt-1 text-sm text-muted-foreground">
            {booking.eventVenue}
            {booking.eventCity
              ? ` · ${booking.eventCity}`
              : ""}
          </p>
        )}
      </div>

      <Link
        href={`/profile/${booking.driverId}`}
        className="mt-6 flex items-center gap-3 rounded-2xl transition hover:bg-muted"
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent">
          <User2 className="h-5 w-5 text-accent-foreground" />
        </div>

        <div>
          <p className="text-xs text-muted-foreground">
            {dict.driverLabel}
          </p>

          <p className="font-semibold text-foreground underline-offset-2 hover:underline">
            {booking.driverName}
          </p>
        </div>
      </Link>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarDays className="h-4 w-4 text-primary" />
          {formattedDate}
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock3 className="h-4 w-4 text-primary" />
          {formattedTime}
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CarFront className="h-4 w-4 text-primary" />
          {dict.rideLabel}
        </div>

        <div className="text-right text-xl font-black text-primary">
          € {booking.contribution.toFixed(2)}
        </div>
      </div>

      <div className="mt-6 space-y-3 border-t border-border pt-6">
        <div className="flex items-center gap-3">
          <MapPin className="h-5 w-5 text-primary" />

          <span className="font-medium text-foreground">
            {booking.departureCity}
          </span>
        </div>

        <div className="pl-2 text-muted-foreground">
          │
        </div>

        <div className="flex items-center gap-3">
          <MapPin className="h-5 w-5 text-primary" />

          <span className="font-medium text-foreground">
            {booking.destination}
          </span>
        </div>
      </div>

      {isConfirmed && (
        <div className="mt-6 space-y-3 border-t border-border pt-6">
          <p className="text-sm font-semibold text-foreground">
            {dict.payTitle}
          </p>

          <div className="flex flex-wrap gap-3">
            {booking.driverPaypalMe && (
              <a
                href={buildPaypalMeLink(
                  booking.driverPaypalMe,
                  booking.contribution
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-2xl border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition hover:border-primary/30 hover:bg-accent hover:text-accent-foreground"
              >
                {dict.payWithPaypal}
                <ExternalLink className="h-4 w-4" />
              </a>
            )}

            {booking.driverRevolutMe && (
              <a
                href={buildRevolutMeLink(
                  booking.driverRevolutMe,
                  booking.contribution
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-2xl border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition hover:border-primary/30 hover:bg-accent hover:text-accent-foreground"
              >
                {dict.payWithRevolut}
                <ExternalLink className="h-4 w-4" />
              </a>
            )}

            {booking.driverSatispayLink && (
              <a
                href={booking.driverSatispayLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-2xl border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition hover:border-primary/30 hover:bg-accent hover:text-accent-foreground"
              >
                {dict.payWithSatispay}
                <ExternalLink className="h-4 w-4" />
              </a>
            )}

            <span className="flex items-center gap-2 rounded-2xl bg-muted px-4 py-2.5 text-sm font-semibold text-muted-foreground">
              <Banknote className="h-4 w-4" />
              {dict.payInPerson}
            </span>
          </div>

          <p className="text-xs text-muted-foreground">
            {dict.payInPersonNote}
            {" "}
            {dict.payDisclaimer}
          </p>
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-3 border-t border-border pt-5">
        {booking.eventSlug && !booking.rideHasPassed && (
          <Link
            href={`/events/${booking.eventSlug}`}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-border px-4 py-3 text-sm font-semibold text-foreground transition hover:border-primary/30 hover:bg-accent hover:text-accent-foreground"
          >
            {dict.viewEvent}
            <ArrowRight className="h-4 w-4" />
          </Link>
        )}

        {isConfirmed && conversationId && (
          <Link
            href={`/chat/${conversationId}`}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            <MessageCircle className="h-4 w-4" />
            {dict.openChat}
          </Link>
        )}

        {isConfirmed && !rideHasPassed && (
          <Button
            type="button"
            onClick={handleCancelRequest}
            disabled={cancelling}
            className="h-auto flex-1 rounded-2xl bg-destructive px-4 py-3 text-sm font-semibold text-destructive-foreground hover:bg-destructive/90"
          >
            {cancelling
              ? dict.cancelling
              : dict.cancelButton}
          </Button>
        )}
      </div>

      {isConfirmed && rideHasPassed && (
        <>
          <RatingForm
            dict={ratingFormDict}
            bookingId={booking.id}
            rideId={booking.rideId}
            rateeId={booking.driverId}
            rateeName={booking.driverName}
          />

          <ReportNoShowButton
            dict={noShowDict}
            bookingId={booking.id}
            rideId={booking.rideId}
          />
        </>
      )}

      <ConfirmDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        title={dict.cancelButton}
        description={dict.cancelConfirmMessage}
        confirmLabel={dict.cancelButton}
        cancelLabel={dict.dialogCancelButton}
        pleaseWaitLabel={dict.dialogPleaseWait}
        confirmTone="danger"
        busy={cancelling}
        onConfirm={handleCancelConfirm}
      />
    </Card>
  );
}
