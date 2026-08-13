"use client";

import { useEffect, useState } from "react";

import {
  ArrowRight,
  CalendarDays,
  CarFront,
  Clock3,
  MapPin,
} from "lucide-react";

import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";
import RatingStars from "@/components/ratings/RatingStars";

type Props = {
  ride: {
    id: string;
    eventId: string;
    driverId: string;

    driver: string;
    driverSurname?: string | null;
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
}: Props) {
  const supabase = createClient();

  const [loading, setLoading] =
    useState(false);

  const [bookingStatus, setBookingStatus] =
    useState<BookingStatus>(null);

  const [isLoggedIn, setIsLoggedIn] =
    useState(false);

  const [isDriver, setIsDriver] =
    useState(false);

  const [driverRating, setDriverRating] =
    useState<{
      average: number;
      count: number;
    } | null>(null);

  useEffect(() => {
    async function loadDriverRating() {
      const { data, error } = await supabase
        .from("ratings")
        .select("rating")
        .eq("ratee_id", ride.driverId);

      if (error || !data || data.length === 0) {
        return;
      }

      const average =
        data.reduce(
          (total, r) => total + r.rating,
          0
        ) / data.length;

      setDriverRating({
        average,
        count: data.length,
      });
    }

    loadDriverRating();
  }, [ride.driverId, supabase]);

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

  async function handleRequestSeat() {
    if (loading) {
      return;
    }

    if (!isLoggedIn) {
      window.location.href = "/login";
      return;
    }

    if (isDriver) {
      toast.error(
        "Non puoi richiedere un posto sul tuo stesso passaggio."
      );

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

    toast.success(
      "Richiesta inviata! Il conducente dovrà confermare il tuo posto."
    );
  }

  function getButtonContent() {
    if (loading) {
      return "Invio richiesta...";
    }

    if (isDriver) {
      return "Il tuo passaggio";
    }

    if (
      bookingStatus === "pending"
    ) {
      return "Richiesta inviata";
    }

    if (
      bookingStatus === "confirmed"
    ) {
      return "Posto confermato";
    }

    if (
      bookingStatus === "rejected"
    ) {
      return "Richiedi nuovamente";
    }

    if (
      bookingStatus === "cancelled"
    ) {
      return "Richiedi posto";
    }

    return "Richiedi posto";
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
    ride.driver || "Conducente";

  const driverSurname =
    ride.driverSurname ?? "";

  const displayName =
    `${driverName} ${driverSurname}`.trim();

  const initials =
    `${driverName.charAt(0)}${driverSurname.charAt(0)}`
      .toUpperCase();

  return (
    <div
      className="
        rounded-3xl
        border
        border-slate-200
        bg-white
        p-6
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-emerald-200
        hover:shadow-xl
      "
    >

      {/* Driver */}

      <div className="flex items-center gap-4">

        {ride.avatarUrl ? (
          <img
            src={ride.avatarUrl}
            alt={displayName}
            className="h-14 w-14 rounded-full object-cover ring-2 ring-emerald-50"
          />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-lg font-bold text-emerald-600">
            {initials ||
              driverName
                .charAt(0)
                .toUpperCase()}
          </div>
        )}

        <div>
          <h3 className="text-lg font-bold text-slate-900">
            {displayName}
          </h3>

          <p className="text-sm text-slate-500">
            Conducente
          </p>

          {driverRating && (
            <div className="mt-1 flex items-center gap-1.5">
              <RatingStars
                value={driverRating.average}
                size={14}
              />

              <span className="text-xs font-medium text-slate-500">
                ({driverRating.count})
              </span>
            </div>
          )}
        </div>

      </div>

      {/* Route */}

      <div className="mt-8 space-y-4">

        <div className="flex items-center gap-3">
          <MapPin className="h-5 w-5 text-emerald-600" />

          <span className="font-medium text-slate-700">
            {ride.from}
          </span>
        </div>

        <div className="pl-2 text-slate-300">
          │
        </div>

        <div className="flex items-center gap-3">
          <MapPin className="h-5 w-5 text-emerald-600" />

          <span className="font-medium text-slate-700">
            {ride.to}
          </span>
        </div>

      </div>

      {/* Info */}

      <div className="mt-8 grid grid-cols-2 gap-4">

        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Clock3 className="h-4 w-4 text-emerald-600" />

          {ride.departure}
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-600">
          <CalendarDays className="h-4 w-4 text-emerald-600" />

          {ride.date}
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-600">
          <CarFront className="h-4 w-4 text-emerald-600" />

          {ride.seats} posti
        </div>

        <div className="text-right text-xl font-black text-emerald-600">
          € {ride.price.toFixed(2)}
        </div>

      </div>

      {/* Booking status */}

      {bookingStatus ===
        "pending" && (
        <div className="mt-6 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
          ⏳ Richiesta in attesa di
          conferma del conducente.
        </div>
      )}

      {bookingStatus ===
        "confirmed" && (
        <div className="mt-6 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          ✓ Il conducente ha
          confermato il tuo posto.
        </div>
      )}

      {bookingStatus ===
        "rejected" && (
        <div className="mt-6 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          La richiesta precedente è
          stata rifiutata.
        </div>
      )}

      {/* CTA */}

      <button
        type="button"
        onClick={handleRequestSeat}
        disabled={isDisabled}
        className={`
          mt-8
          flex
          w-full
          items-center
          justify-center
          gap-2
          rounded-2xl
          px-5
          py-4
          font-semibold
          text-white
          transition-all
          duration-300
          disabled:cursor-not-allowed
          disabled:opacity-60
          ${
            bookingStatus ===
            "confirmed"
              ? "bg-emerald-600"
              : bookingStatus ===
                  "pending"
                ? "bg-amber-500"
                : "bg-emerald-500 hover:bg-emerald-600"
          }
        `}
      >
        {getButtonContent()}

        {!isDriver &&
          bookingStatus !== "pending" &&
          bookingStatus !== "confirmed" && (
            <ArrowRight className="h-4 w-4" />
          )}
      </button>

    </div>
  );
}