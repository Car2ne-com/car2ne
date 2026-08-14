/*
 * Client per la Discovery API v2 di Ticketmaster.
 * https://developer.ticketmaster.com/products-and-docs/apis/discovery-api/v2/
 *
 * Limiti ufficiali: 5000 chiamate/giorno, 5 richieste/secondo,
 * e una singola query non può restituire oltre 1000 risultati
 * (size * page < 1000) — per questo dividiamo l'intervallo di
 * date richiesto in finestre più piccole prima di paginare.
 */

const BASE_URL =
  "https://app.ticketmaster.com/discovery/v2/events.json";

const PAGE_SIZE = 200;
const MAX_RESULTS_PER_QUERY = 1000;
const REQUEST_DELAY_MS = 250;
const WINDOW_DAYS = 30;

export type RawTicketmasterEvent = {
  id: string;
  name: string;
  url?: string;
  dates: {
    start: {
      localDate?: string;
      localTime?: string;
      dateTime?: string;
    };
    status?: {
      code?: string;
    };
  };
  images?: {
    url: string;
    width: number;
    height: number;
    ratio?: string;
  }[];
  classifications?: {
    primary?: boolean;
    segment?: { name?: string };
    genre?: { name?: string };
  }[];
  info?: string;
  pleaseNote?: string;
  _embedded?: {
    venues?: {
      name?: string;
      city?: { name?: string };
      country?: { countryCode?: string };
    }[];
    attractions?: {
      name?: string;
    }[];
  };
};

type TicketmasterResponse = {
  _embedded?: {
    events?: RawTicketmasterEvent[];
  };
  page?: {
    size: number;
    totalElements: number;
    totalPages: number;
    number: number;
  };
};

function sleep(ms: number) {
  return new Promise((resolve) =>
    setTimeout(resolve, ms)
  );
}

async function fetchPage(
  apiKey: string,
  countryCode: string,
  startDateTime: string,
  endDateTime: string,
  page: number
): Promise<TicketmasterResponse> {
  const url = new URL(BASE_URL);

  url.searchParams.set("apikey", apiKey);
  url.searchParams.set(
    "countryCode",
    countryCode
  );
  url.searchParams.set(
    "classificationName",
    "music"
  );
  url.searchParams.set(
    "startDateTime",
    startDateTime
  );
  url.searchParams.set(
    "endDateTime",
    endDateTime
  );
  url.searchParams.set("sort", "date,asc");
  url.searchParams.set(
    "size",
    String(PAGE_SIZE)
  );
  url.searchParams.set("page", String(page));

  const response = await fetch(url.toString());

  if (!response.ok) {
    const body = await response
      .text()
      .catch(() => "");

    throw new Error(
      `Ticketmaster ha risposto ${response.status}: ${body.slice(0, 300)}`
    );
  }

  return response.json();
}

/*
 * Recupera tutti gli eventi musicali di una finestra
 * temporale (max ~1000 risultati per finestra),
 * gestendo la paginazione.
 */
async function fetchWindow(
  apiKey: string,
  countryCode: string,
  startDateTime: string,
  endDateTime: string
): Promise<RawTicketmasterEvent[]> {
  const events: RawTicketmasterEvent[] = [];

  let page = 0;
  let totalPages = 1;

  while (page < totalPages) {
    if (
      page * PAGE_SIZE >=
      MAX_RESULTS_PER_QUERY
    ) {
      console.warn(
        `Ticketmaster: finestra ${startDateTime} → ${endDateTime} ` +
          `ha più di ${MAX_RESULTS_PER_QUERY} risultati, troncata.`
      );

      break;
    }

    const data = await fetchPage(
      apiKey,
      countryCode,
      startDateTime,
      endDateTime,
      page
    );

    const pageEvents =
      data._embedded?.events ?? [];

    events.push(...pageEvents);

    totalPages = data.page?.totalPages ?? 1;
    page += 1;

    if (page < totalPages) {
      await sleep(REQUEST_DELAY_MS);
    }
  }

  return events;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

/*
 * Divide l'intervallo richiesto in finestre di
 * WINDOW_DAYS giorni e recupera tutti gli eventi,
 * deduplicando per id nel caso di sovrapposizioni
 * ai bordi delle finestre.
 */
export async function fetchAllTicketmasterEvents(
  countryCode: string,
  startDateTime: string,
  endDateTime: string
): Promise<RawTicketmasterEvent[]> {
  const apiKey = process.env.TICKETMASTER_API_KEY;

  if (!apiKey) {
    throw new Error(
      "TICKETMASTER_API_KEY non configurata."
    );
  }

  const start = new Date(startDateTime);
  const end = new Date(endDateTime);

  const eventsById = new Map<
    string,
    RawTicketmasterEvent
  >();

  let windowStart = start;

  while (windowStart < end) {
    const windowEnd = new Date(
      Math.min(
        addDays(
          windowStart,
          WINDOW_DAYS
        ).getTime(),
        end.getTime()
      )
    );

    const windowEvents = await fetchWindow(
      apiKey,
      countryCode,
      windowStart.toISOString().slice(0, 19) + "Z",
      windowEnd.toISOString().slice(0, 19) + "Z"
    );

    for (const event of windowEvents) {
      eventsById.set(event.id, event);
    }

    windowStart = windowEnd;

    if (windowStart < end) {
      await sleep(REQUEST_DELAY_MS);
    }
  }

  return Array.from(eventsById.values());
}
