"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  CheckCircle2,
  Clock3,
  MessageCircle,
  User2,
  XCircle,
} from "lucide-react";

import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";
import RatingForm from "@/components/ratings/RatingForm";
import ReportNoShowButton, {
  type NoShowDict,
} from "@/components/dashboard/ReportNoShowButton";
import CityCombobox from "@/components/cities/CityCombobox";
import { toOne } from "@/lib/utils/relations";

type Dict = {
  requests: {
    badge: string;
    title: string;
    subtitle: string;
    seatsAvailable: string;
    loading: string;
    emptyTitle: string;
    emptyDescription: string;
    requestFrom: string;
    passengerFallback: string;
    pendingBadge: string;
    cancel: string;
    reject: string;
    rejectConfirm: string;
    accept: string;
    processing: string;
    noSeatsWarning: string;
    confirmSuccess: string;
    rejectSuccess: string;
  };
  confirmedPassengers: {
    badge: string;
    title: string;
    subtitle: string;
    passengerLabel: string;
    openChat: string;
  };
  form: {
    originCityLabel: string;
    departureTimeLabel: string;
    seatsLabel: string;
    contributionLabel: string;
    descriptionLabel: string;
    descriptionPlaceholder: string;
    save: string;
    saving: string;
    missingCity: string;
    missingFields: string;
    updateSuccess: string;
  };
  cancelRide: {
    title: string;
    descriptionWithPassengersSingular: string;
    descriptionWithPassengersPlural: string;
    descriptionNoPassengers: string;
    confirmQuestion: string;
    button: string;
    buttonConfirm: string;
    cancelling: string;
    goBack: string;
    successWithPassengersSingular: string;
    successWithPassengersPlural: string;
    successNoPassengers: string;
  };
};

type NoShowDictProp = NoShowDict;

type Props = {
  dict: Dict;
  noShowDict?: NoShowDictProp;
  ride: {
    id: string;
    origin_city_id: string | null;
    departure_city: string;
    departure_date: string;
    departure_time: string;
    available_seats: number;
    contribution: number;
    description: string | null;
    rideHasPassed: boolean;
  };
};

type BookingRequest = {
  id: string;
  status: string;
  created_at: string;
  passengerId: string;
  passenger: {
    name: string;
  } | null;
};

type ConfirmedPassenger = {
  id: string;
  passengerId: string;
  passengerName: string;
  conversationId: string | null;
};

export default function ManageRideForm({
  dict,
  noShowDict,
  ride,
}: Props) {
  const router = useRouter();

  const supabase = useMemo(
    () => createClient(),
    []
  );

  const [originCityId, setOriginCityId] = useState(
    ride.origin_city_id ?? ""
  );

  const [departureCity, setDepartureCity] = useState(
    ride.departure_city
  );

  function handleOriginCityChange(
    cityId: string,
    cityName: string
  ) {
    setOriginCityId(cityId);
    setDepartureCity(cityName);
  }

  const [departureTime, setDepartureTime] = useState(
    ride.departure_time.slice(0, 5)
  );

  const [availableSeats, setAvailableSeats] = useState(
    String(ride.available_seats)
  );

  const [contribution, setContribution] = useState(
    String(ride.contribution)
  );

  const [description, setDescription] = useState(
    ride.description ?? ""
  );

  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [requests, setRequests] = useState<
    BookingRequest[]
  >([]);

  const [
    confirmedPassengers,
    setConfirmedPassengers,
  ] = useState<ConfirmedPassenger[]>([]);

  const [loadingRequests, setLoadingRequests] =
    useState(true);

  const [processingRequest, setProcessingRequest] =
    useState<string | null>(null);

  const [confirmingRejectId, setConfirmingRejectId] =
    useState<string | null>(null);

  const [confirmingDelete, setConfirmingDelete] =
    useState(false);

  const rideHasPassed = ride.rideHasPassed;

  const affectedPassengerCount =
    requests.length + confirmedPassengers.length;

  async function loadRequests() {
    setLoadingRequests(true);

    const [
      pendingResult,
      confirmedResult,
      conversationsResult,
    ] = await Promise.all([
      supabase
        .from("bookings")
        .select(`
          id,
          status,
          created_at,
          passenger_id,
          profiles:passenger_id (
            name
          )
        `)
        .eq("ride_id", ride.id)
        .eq("status", "pending")
        .order("created_at", {
          ascending: true,
        }),

      supabase
        .from("bookings")
        .select(`
          id,
          passenger_id,
          profiles:passenger_id (
            name
          )
        `)
        .eq("ride_id", ride.id)
        .eq("status", "confirmed"),

      supabase
        .from("conversations")
        .select(`
          id,
          passenger_id
        `)
        .eq("ride_id", ride.id),
    ]);

    if (pendingResult.error) {
      console.error(
        "Errore caricamento richieste:",
        pendingResult.error
      );

      setRequests([]);
    } else {
      const formattedRequests =
        pendingResult.data?.map((request) => {
          const profile = toOne(
            request.profiles
          );

          return {
            id: request.id,
            status: request.status,
            created_at: request.created_at,
            passengerId: request.passenger_id,
            passenger: profile
              ? {
                  name:
                    profile.name ??
                    dict.requests.passengerFallback,
                }
              : null,
          };
        }) ?? [];

      setRequests(formattedRequests);
    }

    if (confirmedResult.error) {
      console.error(
        "Errore caricamento passeggeri confermati:",
        confirmedResult.error
      );

      setConfirmedPassengers([]);
    } else {
      const conversationByPassenger =
        new Map<string, string>();

      for (const conversation of conversationsResult.data ??
        []) {
        conversationByPassenger.set(
          conversation.passenger_id,
          conversation.id
        );
      }

      const formattedPassengers =
        confirmedResult.data?.map((booking) => {
          const profile = toOne(
            booking.profiles
          );

          return {
            id: booking.id,
            passengerId: booking.passenger_id,
            passengerName:
              profile?.name ??
              dict.requests.passengerFallback,
            conversationId:
              conversationByPassenger.get(
                booking.passenger_id
              ) ?? null,
          };
        }) ?? [];

      setConfirmedPassengers(formattedPassengers);
    }

    if (conversationsResult.error) {
      console.error(
        "Errore caricamento chat passeggeri:",
        conversationsResult.error
      );
    }

    setLoadingRequests(false);
  }

  useEffect(() => {
    void loadRequests();
  }, [ride.id]);

  async function handleConfirm(
    bookingId: string
  ) {
    if (processingRequest) {
      return;
    }

    setProcessingRequest(bookingId);

    const { error } = await supabase.rpc(
      "confirm_booking",
      {
        p_booking_id: bookingId,
      }
    );

    setProcessingRequest(null);

    if (error) {
      console.error(
        "Errore conferma prenotazione:",
        error
      );

      toast.error(error.message);
      return;
    }

    toast.success(dict.requests.confirmSuccess);

    await loadRequests();
    router.refresh();
  }

  async function handleReject(
    bookingId: string
  ) {
    if (processingRequest) {
      return;
    }

    if (confirmingRejectId !== bookingId) {
      setConfirmingRejectId(bookingId);
      return;
    }

    setConfirmingRejectId(null);
    setProcessingRequest(bookingId);

    const { error } = await supabase.rpc(
      "reject_booking",
      {
        p_booking_id: bookingId,
      }
    );

    setProcessingRequest(null);

    if (error) {
      console.error(
        "Errore rifiuto prenotazione:",
        error
      );

      toast.error(error.message);
      return;
    }

    toast.success(dict.requests.rejectSuccess);

    await loadRequests();
    router.refresh();
  }

  async function handleUpdate(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const missingOnlyCity =
      !originCityId &&
      departureTime &&
      availableSeats &&
      contribution;

    if (
      !originCityId ||
      !departureTime ||
      !availableSeats ||
      !contribution
    ) {
      toast.error(
        missingOnlyCity
          ? dict.form.missingCity
          : dict.form.missingFields
      );
      return;
    }

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      router.push("/login");
      return;
    }

    const { error } = await supabase
      .from("rides")
      .update({
        origin_city_id: originCityId,
        departure_city: departureCity,
        departure_time: departureTime,
        available_seats: Number(availableSeats),
        contribution: Number(contribution),
        description: description || null,
      })
      .eq("id", ride.id)
      .eq("driver_id", user.id);

    setLoading(false);

    if (error) {
      console.error(error);
      toast.error(error.message);
      return;
    }

    toast.success(dict.form.updateSuccess);

    router.push("/dashboard/rides");
    router.refresh();
  }

  async function handleDelete() {
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      return;
    }

    setDeleting(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setDeleting(false);
      router.push("/login");
      return;
    }

    /*
     * cancel_ride (RPC, security definer) invece di una DELETE
     * diretta: marca il passaggio come cancelled senza cancellare
     * la riga, e avvisa con una notifica ogni passeggero con una
     * richiesta pending o confermata su questo passaggio.
     */

    const { error } = await supabase.rpc(
      "cancel_ride",
      { p_ride_id: ride.id }
    );

    setDeleting(false);

    if (error) {
      console.error(error);
      toast.error(error.message);
      return;
    }

    const c = dict.cancelRide;

    toast.success(
      affectedPassengerCount > 0
        ? (affectedPassengerCount === 1
            ? c.successWithPassengersSingular
            : c.successWithPassengersPlural
          ).replace(
            "{count}",
            String(affectedPassengerCount)
          )
        : c.successNoPassengers
    );

    router.push("/dashboard/rides");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="inline-flex rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-700">
              {dict.requests.badge}
            </span>

            <h2 className="mt-4 text-2xl font-black text-slate-900">
              {dict.requests.title}
            </h2>

            <p className="mt-2 text-slate-500">
              {dict.requests.subtitle}
            </p>
          </div>

          <div className="shrink-0 rounded-2xl bg-emerald-50 px-4 py-3 text-center">
            <p className="text-xs font-semibold text-emerald-600">
              {dict.requests.seatsAvailable}
            </p>

            <p className="mt-1 text-2xl font-black text-emerald-700">
              {ride.available_seats}
            </p>
          </div>
        </div>

        {loadingRequests ? (
          <div className="mt-8 rounded-2xl bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
            {dict.requests.loading}
          </div>
        ) : requests.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
              <Clock3 className="h-7 w-7 text-slate-400" />
            </div>

            <h3 className="mt-4 text-lg font-bold text-slate-900">
              {dict.requests.emptyTitle}
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              {dict.requests.emptyDescription}
            </p>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {requests.map((request) => {
              const processing =
                processingRequest === request.id;

              const confirmingReject =
                confirmingRejectId === request.id;

              return (
                <div
                  key={request.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                >
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                        <User2 className="h-6 w-6 text-emerald-600" />
                      </div>

                      <div>
                        <p className="text-xs font-medium text-slate-500">
                          {dict.requests.requestFrom}
                        </p>

                        <Link
                          href={`/profile/${request.passengerId}`}
                          className="text-lg font-bold text-slate-900 underline-offset-2 hover:underline"
                        >
                          {request.passenger?.name ??
                            dict.requests.passengerFallback}
                        </Link>

                        <p className="mt-1 flex items-center gap-1.5 text-xs text-amber-600">
                          <Clock3 className="h-3.5 w-3.5" />
                          {dict.requests.pendingBadge}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      {confirmingReject && (
                        <button
                          type="button"
                          onClick={() =>
                            setConfirmingRejectId(null)
                          }
                          disabled={processing}
                          className="flex-1 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
                        >
                          {dict.requests.cancel}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          handleReject(request.id)
                        }
                        disabled={processing}
                        className="flex-1 rounded-2xl border border-red-200 bg-white px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
                      >
                        <span className="flex items-center justify-center gap-2">
                          <XCircle className="h-4 w-4" />
                          {processing
                            ? dict.requests.processing
                            : confirmingReject
                              ? dict.requests.rejectConfirm
                              : dict.requests.reject}
                        </span>
                      </button>

                      {!confirmingReject && (
                        <button
                          type="button"
                          onClick={() =>
                            handleConfirm(request.id)
                          }
                          disabled={
                            processing ||
                            ride.available_seats <= 0
                          }
                          className="flex-1 rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
                        >
                          <span className="flex items-center justify-center gap-2">
                            <CheckCircle2 className="h-4 w-4" />
                            {processing
                              ? dict.requests.processing
                              : dict.requests.accept}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>

                  {ride.available_seats <= 0 && (
                    <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
                      {dict.requests.noSeatsWarning}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {confirmedPassengers.length > 0 && (
        <section className="rounded-3xl border border-emerald-100 bg-white p-8 shadow-sm">
          <span className="inline-flex rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
            {dict.confirmedPassengers.badge}
          </span>

          <h2 className="mt-4 text-2xl font-black text-slate-900">
            {dict.confirmedPassengers.title}
          </h2>

          <p className="mt-2 text-slate-500">
            {dict.confirmedPassengers.subtitle}
          </p>

          <div className="mt-6 space-y-3">
            {confirmedPassengers.map((passenger) => (
              <div
                key={passenger.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                      <User2 className="h-6 w-6 text-emerald-600" />
                    </div>

                    <div>
                      <p className="text-xs font-medium text-slate-500">
                        {dict.confirmedPassengers.passengerLabel}
                      </p>

                      <Link
                        href={`/profile/${passenger.passengerId}`}
                        className="text-lg font-bold text-slate-900 underline-offset-2 hover:underline"
                      >
                        {passenger.passengerName}
                      </Link>
                    </div>
                  </div>

                  {passenger.conversationId && (
                    <Link
                      href={`/chat/${passenger.conversationId}`}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600"
                    >
                      <MessageCircle className="h-4 w-4" />
                      {dict.confirmedPassengers.openChat}
                    </Link>
                  )}
                </div>

                {rideHasPassed && (
                  <>
                    <RatingForm
                      bookingId={passenger.id}
                      rideId={ride.id}
                      rateeId={passenger.passengerId}
                      rateeName={
                        passenger.passengerName
                      }
                    />

                    {noShowDict && (
                      <ReportNoShowButton
                        dict={noShowDict}
                        bookingId={passenger.id}
                        rideId={ride.id}
                      />
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      <form
        onSubmit={handleUpdate}
        className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              {dict.form.originCityLabel}
            </label>

            <CityCombobox
              value={originCityId}
              onChange={handleOriginCityChange}
              initialLabel={ride.departure_city}
              disabled={loading || deleting}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              {dict.form.departureTimeLabel}
            </label>

            <input
              type="time"
              value={departureTime}
              onChange={(event) =>
                setDepartureTime(event.target.value)
              }
              disabled={loading || deleting}
              className="h-14 w-full rounded-2xl border border-slate-200 px-4 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-50"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              {dict.form.seatsLabel}
            </label>

            <input
              type="number"
              min="1"
              max="8"
              value={availableSeats}
              onChange={(event) =>
                setAvailableSeats(event.target.value)
              }
              disabled={loading || deleting}
              className="h-14 w-full rounded-2xl border border-slate-200 px-4 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-50"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              {dict.form.contributionLabel}
            </label>

            <input
              type="number"
              min="0"
              step="0.01"
              value={contribution}
              onChange={(event) =>
                setContribution(event.target.value)
              }
              disabled={loading || deleting}
              className="h-14 w-full rounded-2xl border border-slate-200 px-4 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-50"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              {dict.form.descriptionLabel}
            </label>

            <textarea
              rows={5}
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              disabled={loading || deleting}
              placeholder={dict.form.descriptionPlaceholder}
              className="w-full rounded-2xl border border-slate-200 px-4 py-4 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-50"
            />
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            type="submit"
            disabled={loading || deleting}
            className="rounded-2xl bg-emerald-500 px-7 py-3 font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? dict.form.saving
              : dict.form.save}
          </button>
        </div>
      </form>

      <div className="rounded-3xl border border-red-200 bg-red-50 p-6">
        <h2 className="text-lg font-bold text-red-900">
          {dict.cancelRide.title}
        </h2>

        <p className="mt-2 text-sm leading-6 text-red-700">
          {affectedPassengerCount > 0
            ? (affectedPassengerCount === 1
                ? dict.cancelRide.descriptionWithPassengersSingular
                : dict.cancelRide.descriptionWithPassengersPlural
              ).replace(
                "{count}",
                String(affectedPassengerCount)
              )
            : dict.cancelRide.descriptionNoPassengers}
        </p>

        {confirmingDelete && (
          <p className="mt-4 text-sm font-bold text-red-900">
            {dict.cancelRide.confirmQuestion}
          </p>
        )}

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading || deleting}
            className="rounded-2xl bg-red-500 px-6 py-3 font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deleting
              ? dict.cancelRide.cancelling
              : confirmingDelete
                ? dict.cancelRide.buttonConfirm
                : dict.cancelRide.button}
          </button>

          {confirmingDelete && (
            <button
              type="button"
              onClick={() => setConfirmingDelete(false)}
              disabled={deleting}
              className="rounded-2xl border border-red-200 bg-white px-6 py-3 font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {dict.cancelRide.goBack}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
