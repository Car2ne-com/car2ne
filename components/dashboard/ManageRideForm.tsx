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
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
    returnTimeLabel: string;
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
  noShowDict?: NoShowDictProp;
  ratingFormDict: RatingFormDict;
  ride: {
    id: string;
    origin_city_id: string | null;
    departure_city: string;
    destination: string;
    departure_date: string;
    departure_time: string;
    return_date: string | null;
    return_time: string | null;
    available_seats: number;
    contribution: number;
    description: string | null;
    rideHasPassed: boolean;
    eventConcluded: boolean;
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
  ratingFormDict,
  ride,
}: Props) {
  const router = useRouter();

  const supabase = useMemo(
    () => createClient(),
    []
  );

  /*
   * "originCityId"/"departureCity" sono la città scelta dal
   * conducente: l'altro capo del viaggio è sempre la venue,
   * fissata dall'evento, per entrambe le tratte.
   */

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

  const [returnTime, setReturnTime] = useState(
    ride.return_time
      ? ride.return_time.slice(0, 5)
      : ""
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
    // Caricamento richieste/passeggeri al mount e quando cambia la ride:
    // sync legittima coi dati remoti. loadRequests è async e chiama
    // setLoadingRequests(true) in modo sincrono prima del primo await,
    // il che fa scattare la regola anche se il pattern è corretto.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadRequests();
    // loadRequests viene ricreata a ogni render: la si omette
    // volutamente dalle dipendenze, l'effect deve rieseguire solo al
    // cambio di ride.id, non ad ogni render (comportamento invariato).
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      returnTime &&
      availableSeats &&
      contribution;

    if (
      !originCityId ||
      !departureTime ||
      !returnTime ||
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

    /*
     * Il ritorno è normalmente lo stesso giorno dell'andata. Se
     * l'orario di ritorno è precedente a quello di andata
     * assumiamo che l'evento finisca dopo mezzanotte, quindi il
     * ritorno cade il giorno dopo.
     */

    const returnDate =
      returnTime < departureTime
        ? new Date(
            new Date(
              `${ride.departure_date}T00:00:00`
            ).getTime() +
              24 * 60 * 60 * 1000
          )
            .toISOString()
            .slice(0, 10)
        : ride.departure_date;

    const { error } = await supabase.rpc("update_ride", {
      p_ride_id: ride.id,
      p_origin_city_id: originCityId,
      p_departure_city: departureCity,
      p_departure_time: departureTime,
      p_return_date: returnDate,
      p_return_time: returnTime,
      p_available_seats: Number(availableSeats),
      p_contribution: Number(contribution),
      p_description: description || null,
    });

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
      <Card className="p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="inline-flex rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-700">
              {dict.requests.badge}
            </span>

            <h2 className="mt-4 text-lg font-semibold text-foreground">
              {dict.requests.title}
            </h2>

            <p className="mt-2 text-muted-foreground">
              {dict.requests.subtitle}
            </p>
          </div>

          <div className="shrink-0 rounded-2xl bg-accent px-4 py-3 text-center">
            <p className="text-xs font-semibold text-accent-foreground">
              {dict.requests.seatsAvailable}
            </p>

            <p className="mt-1 text-2xl font-black text-accent-foreground">
              {ride.available_seats}
            </p>
          </div>
        </div>

        {loadingRequests ? (
          <div className="mt-8 rounded-2xl bg-muted px-6 py-10 text-center text-sm text-muted-foreground">
            {dict.requests.loading}
          </div>
        ) : requests.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-border bg-muted px-6 py-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted-foreground/10">
              <Clock3 className="h-7 w-7 text-muted-foreground" />
            </div>

            <h3 className="text-lg font-bold text-foreground">
              {dict.requests.emptyTitle}
            </h3>

            <p className="mt-2 text-sm text-muted-foreground">
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
                  className="rounded-2xl border border-border bg-muted p-5"
                >
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent">
                        <User2 className="h-6 w-6 text-accent-foreground" />
                      </div>

                      <div>
                        <p className="text-xs font-medium text-muted-foreground">
                          {dict.requests.requestFrom}
                        </p>

                        <Link
                          href={`/profile/${request.passengerId}`}
                          className="text-lg font-bold text-foreground underline-offset-2 hover:underline"
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
                        <Button
                          type="button"
                          onClick={() =>
                            setConfirmingRejectId(null)
                          }
                          disabled={processing}
                          variant="outline"
                          className="h-auto flex-1 bg-card px-5 py-3 text-sm font-semibold sm:flex-none"
                        >
                          {dict.requests.cancel}
                        </Button>
                      )}

                      <Button
                        type="button"
                        onClick={() =>
                          handleReject(request.id)
                        }
                        disabled={processing}
                        className="h-auto flex-1 border border-destructive/20 bg-card px-5 py-3 text-sm font-semibold text-destructive hover:bg-destructive/10 sm:flex-none"
                      >
                        <span className="flex items-center justify-center gap-2">
                          <XCircle className="h-4 w-4" />
                          {processing
                            ? dict.requests.processing
                            : confirmingReject
                              ? dict.requests.rejectConfirm
                              : dict.requests.reject}
                        </span>
                      </Button>

                      {!confirmingReject && (
                        <Button
                          type="button"
                          onClick={() =>
                            handleConfirm(request.id)
                          }
                          disabled={
                            processing ||
                            ride.available_seats <= 0
                          }
                          className="h-auto flex-1 bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 sm:flex-none"
                        >
                          <span className="flex items-center justify-center gap-2">
                            <CheckCircle2 className="h-4 w-4" />
                            {processing
                              ? dict.requests.processing
                              : dict.requests.accept}
                          </span>
                        </Button>
                      )}
                    </div>
                  </div>

                  {ride.available_seats <= 0 && (
                    <div className="mt-4 rounded-xl bg-destructive/10 px-4 py-3 text-xs font-medium text-destructive">
                      {dict.requests.noSeatsWarning}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {confirmedPassengers.length > 0 && (
        <Card className="border-primary/20 p-8">
          <h2 className="mt-4 text-lg font-semibold text-foreground">
            {dict.confirmedPassengers.title}
          </h2>

          <p className="mt-2 text-muted-foreground">
            {dict.confirmedPassengers.subtitle}
          </p>

          <div className="mt-6 space-y-3">
            {confirmedPassengers.map((passenger) => (
              <div
                key={passenger.id}
                className="rounded-2xl border border-border bg-muted p-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent">
                      <User2 className="h-6 w-6 text-accent-foreground" />
                    </div>

                    <div>
                      <p className="text-xs font-medium text-muted-foreground">
                        {dict.confirmedPassengers.passengerLabel}
                      </p>

                      <Link
                        href={`/profile/${passenger.passengerId}`}
                        className="text-lg font-bold text-foreground underline-offset-2 hover:underline"
                      >
                        {passenger.passengerName}
                      </Link>
                    </div>
                  </div>

                  {passenger.conversationId && !ride.eventConcluded && (
                    <Link
                      href={`/chat/${passenger.conversationId}`}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                    >
                      <MessageCircle className="h-4 w-4" />
                      {dict.confirmedPassengers.openChat}
                    </Link>
                  )}
                </div>

                {rideHasPassed && (
                  <>
                    <RatingForm
                      dict={ratingFormDict}
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
        </Card>
      )}

      <form
        onSubmit={handleUpdate}
        className="rounded-3xl border border-border bg-card p-8 shadow-sm"
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="md:col-span-2">
            <Label>
              {dict.form.originCityLabel}
            </Label>

            <CityCombobox
              value={originCityId}
              onChange={handleOriginCityChange}
              initialLabel={departureCity}
              disabled={loading || deleting}
            />
          </div>

          <div>
            <Label htmlFor="departure-time">
              {dict.form.departureTimeLabel}
            </Label>

            <Input
              id="departure-time"
              type="time"
              value={departureTime}
              onChange={(event) =>
                setDepartureTime(event.target.value)
              }
              disabled={loading || deleting}
              className="h-14 rounded-2xl"
            />
          </div>

          <div>
            <Label htmlFor="return-time">
              {dict.form.returnTimeLabel}
            </Label>

            <Input
              id="return-time"
              type="time"
              value={returnTime}
              onChange={(event) =>
                setReturnTime(event.target.value)
              }
              disabled={loading || deleting}
              className="h-14 rounded-2xl"
            />
          </div>

          <div>
            <Label htmlFor="available-seats">
              {dict.form.seatsLabel}
            </Label>

            <Input
              id="available-seats"
              type="number"
              min="1"
              max="8"
              value={availableSeats}
              onChange={(event) =>
                setAvailableSeats(event.target.value)
              }
              disabled={loading || deleting}
              className="h-14 rounded-2xl"
            />
          </div>

          <div>
            <Label htmlFor="contribution">
              {dict.form.contributionLabel}
            </Label>

            <Input
              id="contribution"
              type="number"
              min="0"
              step="0.01"
              value={contribution}
              onChange={(event) =>
                setContribution(event.target.value)
              }
              disabled={loading || deleting}
              className="h-14 rounded-2xl"
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="ride-description">
              {dict.form.descriptionLabel}
            </Label>

            <Textarea
              id="ride-description"
              rows={5}
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              disabled={loading || deleting}
              placeholder={dict.form.descriptionPlaceholder}
              className="rounded-2xl py-4"
            />
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <Button
            type="submit"
            disabled={loading || deleting}
            className="h-auto bg-primary px-7 py-3 font-semibold text-primary-foreground hover:bg-primary/90"
          >
            {loading
              ? dict.form.saving
              : dict.form.save}
          </Button>
        </div>
      </form>

      <Card className="border-destructive/20 bg-destructive/5 p-6">
        <h2 className="text-lg font-semibold text-destructive">
          {dict.cancelRide.title}
        </h2>

        <p className="mt-2 text-sm leading-6 text-destructive/90">
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
          <p className="mt-4 text-sm font-bold text-destructive">
            {dict.cancelRide.confirmQuestion}
          </p>
        )}

        <div className="mt-5 flex gap-3">
          <Button
            type="button"
            onClick={handleDelete}
            disabled={loading || deleting}
            className="h-auto bg-destructive px-6 py-3 font-semibold text-destructive-foreground hover:bg-destructive/90"
          >
            {deleting
              ? dict.cancelRide.cancelling
              : confirmingDelete
                ? dict.cancelRide.buttonConfirm
                : dict.cancelRide.button}
          </Button>

          {confirmingDelete && (
            <Button
              type="button"
              onClick={() => setConfirmingDelete(false)}
              disabled={deleting}
              variant="outline"
              className="h-auto border-destructive/20 bg-card px-6 py-3 font-semibold text-destructive hover:bg-destructive/10"
            >
              {dict.cancelRide.goBack}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
