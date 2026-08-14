import type { NormalizedEvent } from "@/lib/importers/types";
import type { RawTicketmasterEvent } from "./client";

const SOURCE = "ticketmaster";

type RawVenue = NonNullable<
  NonNullable<RawTicketmasterEvent["_embedded"]>["venues"]
>[number];

function pickImage(
  images: RawTicketmasterEvent["images"]
): string | null {
  if (!images || images.length === 0) {
    return null;
  }

  const widescreen = images.find(
    (image) => image.ratio === "16_9"
  );

  const best =
    widescreen ??
    images.reduce((largest, image) =>
      image.width > largest.width
        ? image
        : largest
    );

  return best.url;
}

function resolveCategory(
  event: RawTicketmasterEvent
): "Concerto" | "Festival" {
  const names = (
    event.classifications ?? []
  )
    .map((c) =>
      `${c.segment?.name ?? ""} ${c.genre?.name ?? ""}`
    )
    .join(" ")
    .toLowerCase();

  return names.includes("festival")
    ? "Festival"
    : "Concerto";
}

function resolveEventDate(
  event: RawTicketmasterEvent
): string | null {
  const { start } = event.dates;

  if (start.dateTime) {
    return start.dateTime;
  }

  if (start.localDate) {
    const time = start.localTime ?? "20:00:00";
    return `${start.localDate}T${time}`;
  }

  return null;
}

function resolveAddress(
  venue: RawVenue | undefined
): string | null {
  const line = venue?.address?.line1 ?? null;

  if (!line) {
    return null;
  }

  return venue?.postalCode
    ? `${line}, ${venue.postalCode}`
    : line;
}

function parseCoordinate(
  value: string | undefined
): number | null {
  if (!value) {
    return null;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : null;
}

function resolveExternalStatus(
  event: RawTicketmasterEvent
): "active" | "cancelled" {
  const code = (
    event.dates.status?.code ?? ""
  ).toLowerCase();

  return code === "cancelled" ||
    code === "canceled"
    ? "cancelled"
    : "active";
}

/*
 * Converte un evento Ticketmaster grezzo nel
 * modello interno Car2ne. Ritorna null se
 * all'evento mancano dati essenziali (titolo,
 * data, città o venue) — il chiamante lo conta
 * come "saltato" invece di inserire dati incompleti.
 */
export function normalizeTicketmasterEvent(
  event: RawTicketmasterEvent
): NormalizedEvent | null {
  const venue = event._embedded?.venues?.[0];
  const attraction =
    event._embedded?.attractions?.[0];

  const eventDate = resolveEventDate(event);

  if (
    !event.name ||
    !eventDate ||
    !venue?.name ||
    !venue?.city?.name
  ) {
    return null;
  }

  return {
    source: SOURCE,
    externalId: event.id,
    externalUrl: event.url ?? null,

    title: event.name,
    artist: attraction?.name ?? event.name,
    description:
      event.info ?? event.pleaseNote ?? null,
    category: resolveCategory(event),

    city: venue.city.name,
    venue: venue.name,

    venueExternalId: venue.id ?? null,
    address: resolveAddress(venue),
    latitude: parseCoordinate(venue.location?.latitude),
    longitude: parseCoordinate(venue.location?.longitude),

    eventDate,
    imageUrl: pickImage(event.images),

    externalStatus:
      resolveExternalStatus(event),

    raw: event,
  };
}
