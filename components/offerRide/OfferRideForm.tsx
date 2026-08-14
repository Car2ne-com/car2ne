"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import EventCombobox from "./EventCombobox";

import { Event } from "@/types/event";

const DRAFT_KEY =
  "car2ne_offer_ride_draft";

type RideDraft = {
  eventId: string;
  departureCity: string;
  departureTime: string;
  availableSeats: string;
  contribution: string;
  description: string;
};

export default function OfferRideForm() {
  const router = useRouter();

  const supabase = createClient();

  const [events, setEvents] =
    useState<Event[]>([]);

  const [loadingEvents, setLoadingEvents] =
    useState(true);

  const [loading, setLoading] =
    useState(false);

  const [eventId, setEventId] =
    useState("");

  const [departureCity, setDepartureCity] =
    useState("");

  const [departureTime, setDepartureTime] =
    useState("");

  const [availableSeats, setAvailableSeats] =
    useState("");

  const [contribution, setContribution] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [selectedEvent, setSelectedEvent] =
    useState<Event | null>(null);

  const [alreadyHasRide, setAlreadyHasRide] =
    useState(false);

  const [isLoggedIn, setIsLoggedIn] =
    useState<boolean | null>(null);

  /*
   * ==============================
   * CONTROLLO SESSIONE
   * ==============================
   */

  useEffect(() => {
    supabase.auth
      .getUser()
      .then(({ data }) => {
        setIsLoggedIn(!!data.user);
      });
  }, [supabase]);

  /*
   * ==============================
   * CARICAMENTO EVENTI
   * ==============================
   */

  useEffect(() => {
    async function loadEvents() {
      const {
        data,
        error,
      } = await supabase
        .from("events")
        .select("*")
        .eq("status", "published")
        .order("event_date", {
          ascending: true,
        });

      if (error) {
        console.warn(
          "Errore caricamento eventi:",
          error.message
        );

        setEvents([]);
      } else {
        const loadedEvents =
          data ?? [];

        setEvents(loadedEvents);

        /*
         * Recuperiamo un'eventuale bozza
         * salvata prima del login.
         */

        const savedDraft =
          sessionStorage.getItem(
            DRAFT_KEY
          );

        if (savedDraft) {
          try {
            const draft: RideDraft =
              JSON.parse(savedDraft);

            setEventId(
              draft.eventId
            );

            setDepartureCity(
              draft.departureCity
            );

            setDepartureTime(
              draft.departureTime
            );

            setAvailableSeats(
              draft.availableSeats
            );

            setContribution(
              draft.contribution
            );

            setDescription(
              draft.description
            );

            const event =
              loadedEvents.find(
                (event) =>
                  event.id ===
                  draft.eventId
              );

            setSelectedEvent(
              event ?? null
            );

            sessionStorage.removeItem(
              DRAFT_KEY
            );
          } catch (error) {
            console.warn(
              "Errore recupero bozza:",
              error
            );

            sessionStorage.removeItem(
              DRAFT_KEY
            );
          }
        }
      }

      setLoadingEvents(false);
    }

    void loadEvents();
  }, []);

  /*
   * ==============================
   * CAMBIO EVENTO
   * ==============================
   */

  async function handleEventChange(
    selectedEventId: string
  ) {
    setEventId(
      selectedEventId
    );

    setAlreadyHasRide(false);

    const event =
      events.find(
        (event) =>
          event.id ===
          selectedEventId
      );

    setSelectedEvent(
      event ?? null
    );

    if (!selectedEventId) {
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return;
    }

    /*
     * Controlliamo se l'utente ha già
     * pubblicato una corsa per questo evento.
     */

    const {
      data: existingRide,
      error,
    } = await supabase
      .from("rides")
      .select("id")
      .eq(
        "driver_id",
        user.id
      )
      .eq(
        "event_id",
        selectedEventId
      )
      .eq(
        "status",
        "active"
      )
      .maybeSingle();

    if (error) {
      console.warn(
        "Errore controllo passaggio:",
        error.message
      );

      return;
    }

    setAlreadyHasRide(
      !!existingRide
    );
  }

  /*
   * ==============================
   * SALVA BOZZA
   * ==============================
   */

  function saveDraft() {
    const draft: RideDraft = {
      eventId,
      departureCity,
      departureTime,
      availableSeats,
      contribution,
      description,
    };

    sessionStorage.setItem(
      DRAFT_KEY,
      JSON.stringify(draft)
    );
  }

  /*
   * ==============================
   * SUBMIT
   * ==============================
   */

  async function handleSubmit(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    /*
     * ==============================
     * VALIDAZIONE FRONTEND
     * ==============================
     */

    if (
      !eventId ||
      !departureCity ||
      !departureTime ||
      !availableSeats ||
      !contribution
    ) {
      toast.error(
        "Compila tutti i campi obbligatori."
      );

      return;
    }

    /*
     * ==============================
     * UTENTE
     * ==============================
     */

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      saveDraft();

      router.push(
        "/login?redirect=/offer-ride"
      );

      return;
    }

    /*
     * ==============================
     * EVENTO
     * ==============================
     */

    const event =
      events.find(
        (event) =>
          event.id === eventId
      );

    if (!event) {
      toast.error(
        "Seleziona un evento valido."
      );

      return;
    }

    /*
     * ==============================
     * CONTROLLO PASSAGGIO ESISTENTE
     * ==============================
     */

    const {
      data: existingRide,
      error: checkError,
    } = await supabase
      .from("rides")
      .select("id")
      .eq(
        "driver_id",
        user.id
      )
      .eq(
        "event_id",
        event.id
      )
      .eq(
        "status",
        "active"
      )
      .maybeSingle();

    if (checkError) {
      console.warn(
        "Errore controllo passaggio:",
        checkError.message
      );

      toast.error(
        "Non è stato possibile verificare i tuoi passaggi. Riprova."
      );

      return;
    }

    if (existingRide) {
      setAlreadyHasRide(true);

      return;
    }

    /*
     * ==============================
     * PUBBLICAZIONE
     * ==============================
     */

    setLoading(true);

    /*
     * Data presa dall'evento.
     */

    const eventDate =
      new Date(
        event.event_date
      );

    const year =
      eventDate.getFullYear();

    const month =
      String(
        eventDate.getMonth() + 1
      ).padStart(2, "0");

    const day =
      String(
        eventDate.getDate()
      ).padStart(2, "0");

    const departureDate =
      `${year}-${month}-${day}`;

    /*
     * Destinazione presa dalla venue
     * dell'evento.
     */

    const {
      error,
    } = await supabase
      .from("rides")
      .insert({
        event_id: event.id,

        driver_id: user.id,

        departure_city:
          departureCity,

        destination:
          event.venue,

        departure_date:
          departureDate,

        departure_time:
          departureTime,

        available_seats:
          Number(
            availableSeats
          ),

        contribution:
          Number(
            contribution
          ),

        description:
          description || null,

        status: "active",
      });

    setLoading(false);

    /*
     * ==============================
     * ERRORE PUBBLICAZIONE
     * ==============================
     */

    if (error) {
      /*
       * 23505 = unique violation.
       *
       * È un errore previsto dal database:
       * significa che esiste già una corsa
       * per quello stesso evento.
       *
       * NON usiamo console.error perché
       * in development Next/Turbopack può
       * mostrare il red error overlay.
       */

      if (
        error.code ===
        "23505"
      ) {
        setAlreadyHasRide(true);

        return;
      }

      /*
       * Anche gli altri errori vengono
       * gestiti senza generare il red
       * overlay di sviluppo.
       */

      console.warn(
        "Errore pubblicazione passaggio:",
        error.message
      );

      toast.error(
        error.message ||
          "Non è stato possibile pubblicare il passaggio."
      );

      return;
    }

    /*
     * ==============================
     * SUCCESSO
     * ==============================
     */

    sessionStorage.removeItem(
      DRAFT_KEY
    );

    toast.success(
      "Passaggio pubblicato con successo!"
    );

    router.push(
      `/events/${event.slug}`
    );

    router.refresh();
  }

  /*
   * ==============================
   * RENDER
   * ==============================
   */

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"
    >
      {isLoggedIn === false && (
        <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm leading-6 text-emerald-800">
          Puoi compilare il form liberamente:
          i dati non andranno persi, ti
          chiederemo di accedere solo al
          momento di pubblicare il passaggio.
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">

        {/* Evento */}

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Evento *
          </label>

          <EventCombobox
            events={events}
            value={eventId}
            onChange={handleEventChange}
            loading={loadingEvents}
          />
        </div>

        {/* Avviso passaggio già esistente */}

        {alreadyHasRide && (
          <div className="md:col-span-2 rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <div className="flex gap-4">
              <div className="text-2xl">
                🚗
              </div>

              <div>
                <h3 className="font-bold text-amber-900">
                  Hai già un passaggio attivo
                </h3>

                <p className="mt-1 text-sm leading-6 text-amber-800">
                  Hai già pubblicato un
                  passaggio per questo evento.
                  Puoi modificarlo o eliminarlo
                  dalla sezione I miei passaggi.
                </p>

                <Link
                  href="/dashboard/rides"
                  className="mt-4 inline-flex rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700"
                >
                  Vai ai miei passaggi
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Informazioni evento */}

        {selectedEvent && (
          <div className="md:col-span-2 rounded-2xl bg-emerald-50 p-5">
            <div className="grid gap-3 sm:grid-cols-2">

              <div>
                <p className="text-sm font-semibold text-emerald-700">
                  📍 Destinazione
                </p>

                <p className="mt-1 text-base font-semibold text-slate-900">
                  {selectedEvent.venue}
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-emerald-700">
                  📅 Data evento
                </p>

                <p className="mt-1 text-base font-semibold text-slate-900">
                  {new Intl.DateTimeFormat(
                    "it-IT",
                    {
                      dateStyle:
                        "long",
                    }
                  ).format(
                    new Date(
                      selectedEvent.event_date
                    )
                  )}
                </p>
              </div>

            </div>

            <p className="mt-4 text-sm text-slate-500">
              Destinazione e data sono
              impostate automaticamente
              dall&apos;evento.
            </p>
          </div>
        )}

        {/* Partenza */}

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Città di partenza *
          </label>

          <input
            value={departureCity}
            onChange={(e) =>
              setDepartureCity(
                e.target.value
              )
            }
            placeholder="Milano"
            disabled={
              alreadyHasRide
            }
            className="h-14 w-full rounded-2xl border border-slate-200 px-4 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 disabled:bg-slate-50 disabled:text-slate-400"
          />
        </div>

        {/* Ora */}

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Ora di partenza *
          </label>

          <input
            type="time"
            value={departureTime}
            onChange={(e) =>
              setDepartureTime(
                e.target.value
              )
            }
            disabled={
              alreadyHasRide
            }
            className="h-14 w-full rounded-2xl border border-slate-200 px-4 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 disabled:bg-slate-50 disabled:text-slate-400"
          />

          <p className="mt-2 text-xs text-slate-500">
            Scegli l&apos;orario in cui prevedi
            di partire.
          </p>
        </div>

        {/* Posti */}

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Posti disponibili *
          </label>

          <input
            type="number"
            min="1"
            max="8"
            value={availableSeats}
            onChange={(e) =>
              setAvailableSeats(
                e.target.value
              )
            }
            placeholder="3"
            disabled={
              alreadyHasRide
            }
            className="h-14 w-full rounded-2xl border border-slate-200 px-4 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 disabled:bg-slate-50 disabled:text-slate-400"
          />
        </div>

        {/* Contributo */}

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Contributo (€) *
          </label>

          <input
            type="number"
            min="0"
            step="0.01"
            value={contribution}
            onChange={(e) =>
              setContribution(
                e.target.value
              )
            }
            placeholder="15"
            disabled={
              alreadyHasRide
            }
            className="h-14 w-full rounded-2xl border border-slate-200 px-4 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 disabled:bg-slate-50 disabled:text-slate-400"
          />
        </div>

        {/* Descrizione */}

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Descrizione
          </label>

          <textarea
            rows={5}
            value={description}
            onChange={(e) =>
              setDescription(
                e.target.value
              )
            }
            placeholder="Aggiungi informazioni utili per i passeggeri..."
            disabled={
              alreadyHasRide
            }
            className="w-full rounded-2xl border border-slate-200 px-4 py-4 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 disabled:bg-slate-50 disabled:text-slate-400"
          />
        </div>
      </div>

      {!alreadyHasRide && (
        <div className="mt-8 flex justify-end">
          <Button
            type="submit"
            disabled={
              loading ||
              loadingEvents
            }
            className="h-12 rounded-2xl bg-emerald-500 px-8 text-base hover:bg-emerald-600"
          >
            {loading
              ? "Pubblicazione..."
              : "Pubblica passaggio"}
          </Button>
        </div>
      )}
    </form>
  );
}