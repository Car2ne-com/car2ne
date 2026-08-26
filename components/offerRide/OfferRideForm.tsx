"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import EventCombobox from "./EventCombobox";
import CityCombobox from "@/components/cities/CityCombobox";

import { OfferRideEventOption } from "@/types/event";
import type { Locale } from "@/lib/i18n/locales";
import { haversineKm } from "@/lib/utils/distance";

/*
 * Soglia indicativa di prezzo equo, in stile BlaBlaCar: un
 * contributo pensato per dividere le spese reali del viaggio
 * (carburante, pedaggi), non per generare profitto. Sotto i
 * MIN_DISTANCE_FOR_CAP_KM il calcolo per km è poco significativo
 * (es. costi fissi come il parcheggio), quindi usiamo comunque
 * quella distanza minima come base del calcolo.
 */
const FAIR_PRICE_PER_KM = 0.15;
const MIN_DISTANCE_FOR_CAP_KM = 15;

const DRAFT_KEY =
  "car2ne_offer_ride_draft";

type RideDraft = {
  eventId: string;
  originCityId: string;
  departureCity: string;
  departureTime: string;
  returnTime: string;
  availableSeats: string;
  contribution: string;
  description: string;
};

type OfferRideDict = {
  loginNotice: string;
  eventLabel: string;
  eventCombobox: {
    loading: string;
    placeholder: string;
    searchPlaceholder: string;
    noResults: string;
    moreResults: string;
  };
  alreadyHasRide: {
    title: string;
    description: string;
    cta: string;
  };
  eventInfo: {
    destination: string;
    eventDate: string;
    note: string;
  };
  fields: {
    originCityLabel: string;
    departureTimeLabel: string;
    departureTimeHint: string;
    returnTimeLabel: string;
    returnTimeHint: string;
    seatsLabel: string;
    contributionLabel: string;
    descriptionLabel: string;
    descriptionPlaceholder: string;
  };
  submit: {
    publishing: string;
    publish: string;
  };
  toasts: {
    selectDepartureCity: string;
    fillRequiredFields: string;
    selectValidEvent: string;
    checkExistingRideFailed: string;
    loadEventsFailed: string;
    publishFailed: string;
    publishSuccess: string;
  };
  cityCombobox: {
    changeCityAriaLabel: string;
    searching: string;
    searchFailed: string;
    noCityFound: string;
    minCharsHint: string;
    selectSuggestion: string;
    placeholder: string;
  };
  fairPrice: {
    title: string;
    body: string;
  };
};

type Props = {
  locale: Locale;
  dict: OfferRideDict;
  initialEventId?: string;
};

export default function OfferRideForm({
  locale,
  dict,
  initialEventId,
}: Props) {
  const router = useRouter();

  const supabase = createClient();

  const [events, setEvents] =
    useState<OfferRideEventOption[]>([]);

  const [loadingEvents, setLoadingEvents] =
    useState(true);

  const [loading, setLoading] =
    useState(false);

  const [eventId, setEventId] =
    useState("");

  const [originCityId, setOriginCityId] =
    useState("");

  const [departureCity, setDepartureCity] =
    useState("");

  const [originCoords, setOriginCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  function handleOriginCityChange(
    cityId: string,
    cityName: string
  ) {
    setOriginCityId(cityId);
    setDepartureCity(cityName);

    if (!cityId) {
      setOriginCoords(null);
    }
  }

  /*
   * ==============================
   * COORDINATE CITTÀ DI PARTENZA
   * ==============================
   *
   * Servono solo per la soglia di prezzo equo (avviso non
   * bloccante): se manca la selezione o le coordinate non
   * sono disponibili, semplicemente non mostriamo l'avviso.
   * Lo svuotamento della selezione è gestito direttamente in
   * handleOriginCityChange, non qui: un setState sincrono nel
   * corpo dell'effect andrebbe evitato.
   */

  useEffect(() => {
    if (!originCityId) {
      return;
    }

    let cancelled = false;

    supabase
      .from("cities")
      .select("latitude, longitude")
      .eq("id", originCityId)
      .single()
      .then(({ data }) => {
        if (cancelled) {
          return;
        }

        if (
          data?.latitude != null &&
          data?.longitude != null
        ) {
          setOriginCoords({
            latitude: data.latitude,
            longitude: data.longitude,
          });
        } else {
          setOriginCoords(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [originCityId, supabase]);

  const [departureTime, setDepartureTime] =
    useState("");

  const [returnTime, setReturnTime] =
    useState("");

  const [availableSeats, setAvailableSeats] =
    useState("");

  const [contribution, setContribution] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [selectedEvent, setSelectedEvent] =
    useState<OfferRideEventOption | null>(null);

  const [alreadyHasRide, setAlreadyHasRide] =
    useState(false);

  const [isLoggedIn, setIsLoggedIn] =
    useState<boolean | null>(null);

  /*
   * ==============================
   * SOGLIA PREZZO EQUO
   * ==============================
   *
   * Preferiamo le coordinate della venue (più precise), con
   * fallback su quelle della città evento. Se nessuna delle due
   * è disponibile (evento non ancora risolto da città/venue),
   * niente avviso: non blocchiamo mai la pubblicazione per un
   * dato mancante.
   */

  const destinationCoords = useMemo(() => {
    const venue = selectedEvent?.venues;
    const city = selectedEvent?.cities;

    if (venue?.latitude != null && venue?.longitude != null) {
      return {
        latitude: venue.latitude,
        longitude: venue.longitude,
      };
    }

    if (city?.latitude != null && city?.longitude != null) {
      return {
        latitude: city.latitude,
        longitude: city.longitude,
      };
    }

    return null;
  }, [selectedEvent]);

  const distanceKm = useMemo(() => {
    if (!originCoords || !destinationCoords) {
      return null;
    }

    return haversineKm(
      originCoords.latitude,
      originCoords.longitude,
      destinationCoords.latitude,
      destinationCoords.longitude
    );
  }, [originCoords, destinationCoords]);

  const fairPriceThreshold = useMemo(() => {
    if (distanceKm === null) {
      return null;
    }

    return (
      Math.max(distanceKm, MIN_DISTANCE_FOR_CAP_KM) *
      FAIR_PRICE_PER_KM
    );
  }, [distanceKm]);

  const contributionAboveFairPrice =
    fairPriceThreshold !== null &&
    Number(contribution) > fairPriceThreshold;

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
    let cancelled = false;

    /*
     * Timeout difensivo: se la query dovesse restare appesa (visto in
     * produzione — vedi audit), sblocchiamo comunque la UI invece di
     * lasciare il combobox su "Caricamento eventi..." per sempre.
     */
    async function loadEvents() {
      const timedOut = Symbol("timeout");

      try {
        const result = await Promise.race([
          supabase
            .from("events")
            .select(
              /*
               * Solo i campi usati da questo form (combobox + coordinate
               * + redirect finale via slug): niente description/image_url,
               * che sui ~400 eventi pubblicati gonfiavano la risposta a
               * diversi MB.
               */
              "id, title, artist, city, venue, slug, event_date, cities(id,name,slug,latitude,longitude), venues(id,name,slug,latitude,longitude)"
            )
            .eq("status", "published")
            .gte(
              "event_date",
              new Date().toISOString()
            )
            .order("event_date", {
              ascending: true,
            }),
          new Promise<typeof timedOut>((resolve) =>
            setTimeout(() => resolve(timedOut), 15000)
          ),
        ]);

        if (cancelled) {
          return;
        }

        if (result === timedOut) {
          console.warn(
            "Timeout caricamento eventi"
          );

          toast.error(dict.toasts.loadEventsFailed);
          setEvents([]);

          return;
        }

        const { data, error } = result;

        if (error) {
          console.warn(
            "Errore caricamento eventi:",
            error.message
          );

          toast.error(dict.toasts.loadEventsFailed);
          setEvents([]);
        } else {
          /*
           * Senza uno schema Database tipizzato, supabase-js non può
           * sapere che cities/venues sono relazioni to-one (FK singola):
           * le inferisce come array. A runtime sono sempre oggetti
           * singoli (o null), come dichiarato in OfferRideEventOption.
           */
          const loadedEvents = (
            data ?? []
          ) as unknown as OfferRideEventOption[];

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

            setOriginCityId(
              draft.originCityId
            );

            setDepartureCity(
              draft.departureCity
            );

            setDepartureTime(
              draft.departureTime
            );

            setReturnTime(
              draft.returnTime ?? ""
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
        } else if (initialEventId) {
          /*
           * Evento preselezionato da query string
           * (es. link "Offri un passaggio" da una
           * pagina evento senza passaggi disponibili).
           */

          const event =
            loadedEvents.find(
              (event) =>
                event.id ===
                initialEventId
            );

          if (event) {
            setEventId(event.id);
            setSelectedEvent(event);
          }
        }
        }
      } catch (error) {
        if (!cancelled) {
          console.warn(
            "Errore imprevisto caricamento eventi:",
            error
          );

          toast.error(dict.toasts.loadEventsFailed);
          setEvents([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingEvents(false);
        }
      }
    }

    void loadEvents();

    return () => {
      cancelled = true;
    };
    // supabase è un client singleton (createBrowserClient di @supabase/ssr
    // restituisce sempre la stessa istanza lato client), quindi includerlo
    // qui non cambia quando l'effect viene eseguito rispetto a `[]`.
    // initialEventId va usato solo per la preselezione al primo
    // caricamento: va letto una volta sola, non deve far ripartire il
    // fetch degli eventi se cambiasse (non cambia, è un prop da server).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase, dict.toasts.loadEventsFailed]);

  /*
   * ==============================
   * CAMBIO EVENTO
   * ==============================
   *
   * Un conducente può avere un solo passaggio attivo per
   * evento (copre sempre sia andata che ritorno), quindi il
   * controllo va rifatto al cambio evento.
   */

  async function checkAlreadyHasRide(
    selectedEventId: string
  ) {
    if (!selectedEventId) {
      setAlreadyHasRide(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setAlreadyHasRide(false);
      return;
    }

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

  async function handleEventChange(
    selectedEventId: string
  ) {
    setEventId(
      selectedEventId
    );

    const event =
      events.find(
        (event) =>
          event.id ===
          selectedEventId
      );

    setSelectedEvent(
      event ?? null
    );

    await checkAlreadyHasRide(
      selectedEventId
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
      originCityId,
      departureCity,
      departureTime,
      returnTime,
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

    const missingOnlyCity =
      eventId &&
      !originCityId &&
      departureTime &&
      availableSeats &&
      contribution;

    if (
      !eventId ||
      !originCityId ||
      !departureTime ||
      !returnTime ||
      !availableSeats ||
      !contribution
    ) {
      toast.error(
        missingOnlyCity
          ? dict.toasts.selectDepartureCity
          : dict.toasts.fillRequiredFields
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
      toast.error(dict.toasts.selectValidEvent);

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

      toast.error(dict.toasts.checkExistingRideFailed);

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
     * Il ritorno è normalmente lo stesso giorno
     * dell'andata. Se l'orario di ritorno è precedente a
     * quello di andata assumiamo che l'evento finisca dopo
     * mezzanotte, quindi il ritorno cade il giorno dopo.
     */

    const returnDate =
      returnTime < departureTime
        ? new Date(
            eventDate.getTime() +
              24 * 60 * 60 * 1000
          )
            .toISOString()
            .slice(0, 10)
        : departureDate;

    /*
     * Destinazione presa dalla venue dell'evento: per
     * l'andata l'origine è la città scelta dal conducente e
     * la destinazione è la venue, per il ritorno vale il
     * contrario (stessa città, stesso conducente).
     */

    const {
      error,
    } = await supabase
      .from("rides")
      .insert({
        event_id: event.id,

        driver_id: user.id,

        origin_city_id:
          originCityId,

        departure_city:
          departureCity,

        destination:
          event.venue,

        departure_date:
          departureDate,

        departure_time:
          departureTime,

        return_date:
          returnDate,

        return_time:
          returnTime,

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
        error.message || dict.toasts.publishFailed
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

    toast.success(dict.toasts.publishSuccess);

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
    <Card className="p-8">
      <form onSubmit={handleSubmit}>
      {isLoggedIn === false && (
        <div className="mb-6 rounded-2xl bg-accent p-5 text-sm leading-6 text-accent-foreground">
          {dict.loginNotice}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

        {/* Evento */}

        <div className="md:col-span-2">
          <Label>{dict.eventLabel}</Label>

          <EventCombobox
            events={events}
            value={eventId}
            onChange={handleEventChange}
            loading={loadingEvents}
            dict={dict.eventCombobox}
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
                  {dict.alreadyHasRide.title}
                </h3>

                <p className="mt-1 text-sm leading-6 text-amber-800">
                  {dict.alreadyHasRide.description}
                </p>

                <Link
                  href="/dashboard/rides"
                  className={buttonVariants({
                    size: "sm",
                    className: "mt-4 h-auto rounded-xl bg-amber-600 px-4 py-2 text-sm hover:bg-amber-700",
                  })}
                >
                  {dict.alreadyHasRide.cta}
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Informazioni evento */}

        {selectedEvent && (
          <div className="md:col-span-2 rounded-2xl bg-accent p-5">
            <div className="grid gap-3 sm:grid-cols-2">

              <div>
                <p className="text-sm font-semibold text-accent-foreground">
                  {dict.eventInfo.destination}
                </p>

                <p className="mt-1 text-base font-semibold text-foreground">
                  {selectedEvent.venue}
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-accent-foreground">
                  {dict.eventInfo.eventDate}
                </p>

                <p className="mt-1 text-base font-semibold text-foreground">
                  {new Intl.DateTimeFormat(
                    locale === "en" ? "en-US" : "it-IT",
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

            <p className="mt-4 text-sm text-muted-foreground">
              {dict.eventInfo.note}
            </p>
          </div>
        )}

        {/* Città (partenza per l'andata, destinazione per il ritorno) */}

        <div className="md:col-span-2">
          <Label>
            {dict.fields.originCityLabel}
          </Label>

          <CityCombobox
            value={originCityId}
            onChange={handleOriginCityChange}
            initialLabel={departureCity}
            disabled={alreadyHasRide}
            dict={dict.cityCombobox}
          />
        </div>

        {/* Orario di andata */}

        <div>
          <Label htmlFor="offer-ride-departure-time">{dict.fields.departureTimeLabel}</Label>

          <Input
            id="offer-ride-departure-time"
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
            className="h-14 rounded-2xl"
          />

          <p className="mt-2 text-xs text-muted-foreground">
            {dict.fields.departureTimeHint}
          </p>
        </div>

        {/* Orario di ritorno */}

        <div>
          <Label htmlFor="offer-ride-return-time">{dict.fields.returnTimeLabel}</Label>

          <Input
            id="offer-ride-return-time"
            type="time"
            value={returnTime}
            onChange={(e) =>
              setReturnTime(
                e.target.value
              )
            }
            disabled={
              alreadyHasRide
            }
            className="h-14 rounded-2xl"
          />

          <p className="mt-2 text-xs text-muted-foreground">
            {dict.fields.returnTimeHint}
          </p>
        </div>

        {/* Posti */}

        <div>
          <Label htmlFor="offer-ride-seats">{dict.fields.seatsLabel}</Label>

          <Input
            id="offer-ride-seats"
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
            className="h-14 rounded-2xl"
          />
        </div>

        {/* Contributo */}

        <div>
          <Label htmlFor="offer-ride-contribution">{dict.fields.contributionLabel}</Label>

          <Input
            id="offer-ride-contribution"
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
            className="h-14 rounded-2xl"
          />
        </div>

        {/* Avviso prezzo equo (non bloccante) */}

        {contributionAboveFairPrice &&
          distanceKm !== null &&
          fairPriceThreshold !== null && (
            <div className="md:col-span-2 rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <h4 className="font-bold text-amber-900">
                {dict.fairPrice.title}
              </h4>

              <p className="mt-1 text-sm leading-6 text-amber-800">
                {dict.fairPrice.body
                  .replace(
                    "{distance}",
                    String(Math.round(distanceKm))
                  )
                  .replace(
                    "{threshold}",
                    fairPriceThreshold.toFixed(2)
                  )}
              </p>
            </div>
          )}

        {/* Descrizione */}

        <div className="md:col-span-2">
          <Label htmlFor="offer-ride-description">{dict.fields.descriptionLabel}</Label>

          <Textarea
            id="offer-ride-description"
            rows={5}
            value={description}
            onChange={(e) =>
              setDescription(
                e.target.value
              )
            }
            placeholder={dict.fields.descriptionPlaceholder}
            disabled={
              alreadyHasRide
            }
            className="rounded-2xl py-4"
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
            className="h-12 rounded-2xl px-8 text-base"
          >
            {loading
              ? dict.submit.publishing
              : dict.submit.publish}
          </Button>
        </div>
      )}
      </form>
    </Card>
  );
}