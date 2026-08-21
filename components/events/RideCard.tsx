"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  CarFront,
  Clock3,
  MapPin,
} from "lucide-react";

import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";
import RatingStars from "@/components/ratings/RatingStars";
import VerifiedAvatar from "@/components/ui/VerifiedAvatar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type RidesDict = {
  driverFallback: string;
  driverLabel: string;
  driverVerifiedBadge: string;
  directionBadgeOutbound: string;
  directionBadgeReturn: string;
  seatsLabel: string;
  statusPendingBanner: string;
  statusConfirmedBanner: string;
  statusRejectedBanner: string;
  buttonSending: string;
  buttonYourRide: string;
  buttonRequestSent: string;
  buttonConfirmed: string;
  buttonRequestAgain: string;
  buttonRequestSeat: string;
  errorOwnRide: string;
  successRequestSent: string;
  returnTeaserTitle: string;
  returnTeaserCta: string;
  returnTeaserSending: string;
  returnTeaserSent: string;
  returnTeaserConfirmed: string;
  returnTeaserMultipleText: string;
  returnTeaserSeeAll: string;
};

type MatchingReturnRide = {
  id: string;
  driver: string;
  driverSurname?: string | null;
  departure: string;
  price: number;
};

type Props = {
  dict: RidesDict;
  matchingReturnRides?: MatchingReturnRide[];
  ride: {
    id: string;
    eventId: string;
    driverId: string;
    direction: "outbound" | "return";

    driverRating: {
      average: number;
      count: number;
    } | null;

    driver: string;
    driverSurname?: string | null;
    isVerifiedDriver?: boolean;
    avatarUrl: string | null;

    from: string;
    to: string;
    date: string;
    departure: string;
    seats: number;
    price: number;
  };
};

type BookingStatus =
  | "pending"
  | "confirmed"
  | "rejected"
  | "cancelled"
  | null;

export default function RideCard({
  ride,
  dict,
  matchingReturnRides,
}: Props) {
  const router = useRouter();

  const supabase = createClient();

  const [loading, setLoading] =
    useState(false);

  const [bookingStatus, setBookingStatus] =
    useState<BookingStatus>(null);

  const [isLoggedIn, setIsLoggedIn] =
    useState(false);

  const [isDriver, setIsDriver] =
    useState(false);

  /*
   * Ritorno singolo suggerito dopo che il passeggero ha
   * richiesto l'andata: stato di prenotazione tracciato a
   * parte, è un ride diverso da `ride`.
   */

  const singleMatchingReturnRide =
    matchingReturnRides?.length === 1
      ? matchingReturnRides[0]
      : null;

  const [returnBookingStatus, setReturnBookingStatus] =
    useState<BookingStatus>(null);

  const [returnLoading, setReturnLoading] =
    useState(false);

  const driverRating = ride.driverRating;

  useEffect(() => {
    async function loadBookingStatus() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setIsLoggedIn(false);
        return;
      }

      setIsLoggedIn(true);

      if (user.id === ride.driverId) {
        setIsDriver(true);
        return;
      }

      const {
        data,
        error,
      } = await supabase
        .from("bookings")
        .select("status")
        .eq("ride_id", ride.id)
        .eq(
          "passenger_id",
          user.id
        )
        .in("status", [
          "pending",
          "confirmed",
          "rejected",
          "cancelled",
        ])
        .order("created_at", {
          ascending: false,
        })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error(
          "Errore caricamento stato prenotazione:",
          error
        );

        return;
      }

      if (data) {
        setBookingStatus(
          data.status as BookingStatus
        );
      }
    }

    loadBookingStatus();
  }, [
    ride.id,
    ride.driverId,
    supabase,
  ]);

  useEffect(() => {
    async function loadReturnBookingStatus() {
      if (!singleMatchingReturnRide) {
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return;
      }

      const {
        data,
        error,
      } = await supabase
        .from("bookings")
        .select("status")
        .eq(
          "ride_id",
          singleMatchingReturnRide.id
        )
        .eq(
          "passenger_id",
          user.id
        )
        .in("status", [
          "pending",
          "confirmed",
          "rejected",
          "cancelled",
        ])
        .order("created_at", {
          ascending: false,
        })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error(
          "Errore caricamento stato prenotazione ritorno:",
          error
        );

        return;
      }

      if (data) {
        setReturnBookingStatus(
          data.status as BookingStatus
        );
      }
    }

    loadReturnBookingStatus();
  }, [
    singleMatchingReturnRide,
    supabase,
  ]);

  async function handleRequestSeat() {
    if (loading) {
      return;
    }

    if (!isLoggedIn) {
      router.push(
        `/login?redirect=${encodeURIComponent(
          window.location.pathname
        )}`
      );
      return;
    }

    if (isDriver) {
      toast.error(dict.errorOwnRide);

      return;
    }

    setLoading(true);

    const {
      data,
      error,
    } = await supabase.rpc(
      "book_ride",
      {
        p_ride_id: ride.id,
      }
    );

    setLoading(false);

    if (error) {
      console.error(
        "Errore richiesta passaggio:",
        error
      );

      toast.error(error.message);

      return;
    }

    setBookingStatus(
      data?.status ?? "pending"
    );

    toast.success(dict.successRequestSent);
  }

  async function handleRequestReturnSeat() {
    if (
      returnLoading ||
      !singleMatchingReturnRide
    ) {
      return;
    }

    setReturnLoading(true);

    const {
      data,
      error,
    } = await supabase.rpc(
      "book_ride",
      {
        p_ride_id:
          singleMatchingReturnRide.id,
      }
    );

    setReturnLoading(false);

    if (error) {
      console.error(
        "Errore richiesta ritorno:",
        error
      );

      toast.error(error.message);

      return;
    }

    setReturnBookingStatus(
      data?.status ?? "pending"
    );

    toast.success(dict.successRequestSent);
  }

  function getButtonContent() {
    if (loading) {
      return dict.buttonSending;
    }

    if (isDriver) {
      return dict.buttonYourRide;
    }

    if (
      bookingStatus === "pending"
    ) {
      return dict.buttonRequestSent;
    }

    if (
      bookingStatus === "confirmed"
    ) {
      return dict.buttonConfirmed;
    }

    if (
      bookingStatus === "rejected"
    ) {
      return dict.buttonRequestAgain;
    }

    if (
      bookingStatus === "cancelled"
    ) {
      return dict.buttonRequestSeat;
    }

    return dict.buttonRequestSeat;
  }

  const isDisabled =
    loading ||
    isDriver ||
    bookingStatus === "pending" ||
    bookingStatus === "confirmed";

  /*
   * ==============================
   * DRIVER
   * ==============================
   */

  const driverName =
    ride.driver || dict.driverFallback;

  const driverSurname =
    ride.driverSurname ?? "";

  const displayName =
    `${driverName} ${driverSurname}`.trim();

  const initials =
    `${driverName.charAt(0)}${driverSurname.charAt(0)}`
      .toUpperCase();

  return (
    <Card
      className="
        p-6
        shadow-sm
        transition
        duration-300
        hover:-translate-y-1
        hover:border-primary/30
        hover:shadow-xl
      "
    >

      {/* Direzione */}

      <span
        className={cn(
          "mb-4 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
          ride.direction === "outbound"
            ? "bg-accent text-accent-foreground"
            : "bg-muted text-muted-foreground"
        )}
      >
        {ride.direction === "outbound"
          ? dict.directionBadgeOutbound
          : dict.directionBadgeReturn}
      </span>

      {/* Driver */}

      <div className="flex items-center gap-4">

        <VerifiedAvatar
          src={ride.avatarUrl}
          alt={displayName}
          initials={
            initials || driverName.charAt(0).toUpperCase()
          }
          isVerified={!!ride.isVerifiedDriver}
          verifiedLabel={dict.driverVerifiedBadge}
        />

        <div>
          <div className="flex items-center gap-1.5">
            <h3 className="text-lg font-bold text-foreground">
              {displayName}
            </h3>

            {ride.isVerifiedDriver && (
              <span
                title={dict.driverVerifiedBadge}
                className="inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-[11px] font-semibold text-accent-foreground"
              >
                <BadgeCheck className="h-3.5 w-3.5" />
                {dict.driverVerifiedBadge}
              </span>
            )}
          </div>

          <p className="text-sm text-muted-foreground">
            {dict.driverLabel}
          </p>

          {driverRating && (
            <div className="mt-1 flex items-center gap-1.5">
              <RatingStars
                value={driverRating.average}
                size={14}
              />

              <span className="text-xs font-medium text-muted-foreground">
                ({driverRating.count})
              </span>
            </div>
          )}
        </div>

      </div>

      {/* Route */}

      <div className="mt-8 space-y-4">

        <div className="flex items-center gap-3">
          <MapPin className="h-5 w-5 text-primary" />

          <span className="font-medium text-foreground/80">
            {ride.from}
          </span>
        </div>

        <div className="pl-2 text-border">
          │
        </div>

        <div className="flex items-center gap-3">
          <MapPin className="h-5 w-5 text-primary" />

          <span className="font-medium text-foreground/80">
            {ride.to}
          </span>
        </div>

      </div>

      {/* Info */}

      <div className="mt-8 grid grid-cols-2 gap-4">

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock3 className="h-4 w-4 text-primary" />

          {ride.departure}
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarDays className="h-4 w-4 text-primary" />

          {ride.date}
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CarFront className="h-4 w-4 text-primary" />

          {ride.seats} {dict.seatsLabel}
        </div>

        <div className="text-right text-xl font-black text-primary">
          € {ride.price.toFixed(2)}
        </div>

      </div>

      {/* Booking status */}

      {bookingStatus ===
        "pending" && (
        <div className="mt-6 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
          {dict.statusPendingBanner}
        </div>
      )}

      {bookingStatus ===
        "confirmed" && (
        <div className="mt-6 rounded-2xl bg-accent px-4 py-3 text-sm font-medium text-accent-foreground">
          {dict.statusConfirmedBanner}
        </div>
      )}

      {bookingStatus ===
        "rejected" && (
        <div className="mt-6 rounded-2xl bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
          {dict.statusRejectedBanner}
        </div>
      )}

      {/* CTA */}

      <Button
        type="button"
        onClick={handleRequestSeat}
        disabled={isDisabled}
        className={cn(
          "mt-8 h-auto w-full gap-2 rounded-2xl px-5 py-4 text-base font-semibold text-primary-foreground transition duration-300 disabled:opacity-60",
          bookingStatus === "confirmed"
            ? "bg-primary hover:bg-primary"
            : bookingStatus === "pending"
              ? "bg-amber-500 hover:bg-amber-500"
              : "bg-primary hover:bg-primary/90"
        )}
      >
        {getButtonContent()}

        {!isDriver &&
          bookingStatus !== "pending" &&
          bookingStatus !== "confirmed" && (
            <ArrowRight className="h-4 w-4" />
          )}
      </Button>

      {/* Suggerimento ritorno */}

      {!isDriver &&
        (bookingStatus === "pending" ||
          bookingStatus === "confirmed") &&
        ride.direction === "outbound" &&
        matchingReturnRides &&
        matchingReturnRides.length > 0 && (
          <div className="mt-4 rounded-2xl border border-dashed border-border p-4">
            <p className="text-sm font-semibold text-foreground">
              {dict.returnTeaserTitle}
            </p>

            {singleMatchingReturnRide ? (
              <>
                <p className="mt-1 text-sm text-muted-foreground">
                  {singleMatchingReturnRide.driver}{" "}
                  {singleMatchingReturnRide.driverSurname ?? ""}
                  {" · "}
                  {singleMatchingReturnRide.departure}
                  {" · € "}
                  {singleMatchingReturnRide.price.toFixed(2)}
                </p>

                <Button
                  type="button"
                  onClick={handleRequestReturnSeat}
                  disabled={
                    returnLoading ||
                    returnBookingStatus === "pending" ||
                    returnBookingStatus === "confirmed"
                  }
                  variant="outline"
                  className="mt-3 h-auto w-full rounded-2xl px-5 py-3 text-sm font-semibold disabled:opacity-60"
                >
                  {returnLoading
                    ? dict.returnTeaserSending
                    : returnBookingStatus === "confirmed"
                      ? dict.returnTeaserConfirmed
                      : returnBookingStatus === "pending"
                        ? dict.returnTeaserSent
                        : dict.returnTeaserCta}
                </Button>
              </>
            ) : (
              <>
                <p className="mt-1 text-sm text-muted-foreground">
                  {dict.returnTeaserMultipleText.replace(
                    "{count}",
                    String(matchingReturnRides.length)
                  )}
                </p>

                <a
                  href="#return-section"
                  className="mt-3 inline-flex text-sm font-semibold text-primary hover:text-primary/80"
                >
                  {dict.returnTeaserSeeAll}
                </a>
              </>
            )}
          </div>
        )}

    </Card>
  );
}