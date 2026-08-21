/*
 * Estrae i campi di un evento da UNA SOLA pagina pubblica di
 * ticketone.it, su richiesta esplicita di un admin (mai un crawl
 * automatico/pianificato — vedi bottone "Precompila da URL" in
 * AdminEventForm). Legge il markup schema.org/Event già presente
 * nella pagina per la SEO (JSON-LD), con fallback ai tag OpenGraph.
 * Non salva nulla: l'admin rivede e conferma prima di creare
 * l'evento con il form esistente.
 */

export type PrefillResult = {
  title: string | null;
  artist: string | null;
  venue: string | null;
  city: string | null;
  eventDate: string | null;
  imageUrl: string | null;
  description: string | null;
};

type JsonLdEvent = {
  name?: unknown;
  startDate?: unknown;
  description?: unknown;
  image?: unknown;
  performer?: unknown;
  location?: {
    name?: unknown;
    address?: {
      addressLocality?: unknown;
    };
  };
};

function textOrNull(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : null;
}

function firstImageUrl(image: unknown): string | null {
  if (!image) {
    return null;
  }

  if (typeof image === "string") {
    return textOrNull(image);
  }

  if (Array.isArray(image)) {
    return firstImageUrl(image[0]);
  }

  if (typeof image === "object" && image !== null && "url" in image) {
    return textOrNull((image as { url?: unknown }).url);
  }

  return null;
}

function firstPerformerName(performer: unknown): string | null {
  if (!performer) {
    return null;
  }

  if (Array.isArray(performer)) {
    return firstPerformerName(performer[0]);
  }

  if (typeof performer === "object" && performer !== null && "name" in performer) {
    return textOrNull((performer as { name?: unknown }).name);
  }

  return null;
}

function isEventNode(value: unknown): value is JsonLdEvent {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const type = (value as Record<string, unknown>)["@type"];

  if (typeof type === "string") {
    return type.toLowerCase().includes("event");
  }

  if (Array.isArray(type)) {
    return type.some(
      (entry) => typeof entry === "string" && entry.toLowerCase().includes("event")
    );
  }

  return false;
}

/*
 * Le pagine evento tipiche hanno più blocchi JSON-LD (BreadcrumbList,
 * Organization, ecc.): bisogna scansionarli tutti e prendere quello
 * il cui @type contiene "Event", eventualmente dentro un @graph.
 */
function findJsonLdEvent(html: string): JsonLdEvent | null {
  const scripts = html.matchAll(
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  );

  for (const match of scripts) {
    let parsed: unknown;

    try {
      parsed = JSON.parse(match[1]);
    } catch {
      continue;
    }

    const candidates: unknown[] = Array.isArray(parsed)
      ? parsed
      : typeof parsed === "object" &&
          parsed !== null &&
          "@graph" in (parsed as Record<string, unknown>) &&
          Array.isArray((parsed as { "@graph": unknown })["@graph"])
        ? ((parsed as { "@graph": unknown[] })["@graph"])
        : [parsed];

    for (const candidate of candidates) {
      if (isEventNode(candidate)) {
        return candidate;
      }
    }
  }

  return null;
}

function metaContent(html: string, property: string): string | null {
  const patterns = [
    new RegExp(
      `<meta[^>]*property=["']${property}["'][^>]*content=["']([^"']*)["']`,
      "i"
    ),
    new RegExp(
      `<meta[^>]*content=["']([^"']*)["'][^>]*property=["']${property}["']`,
      "i"
    ),
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);

    if (match) {
      return textOrNull(decodeHtmlEntities(match[1]));
    }
  }

  return null;
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

/*
 * Fallback quando la pagina non ha (o non riconosciamo) markup
 * schema.org/Event: prende solo titolo/immagine/descrizione dai tag
 * OpenGraph, sempre presenti per la condivisione social. Niente
 * data/venue/città in questo caso: l'admin li compila a mano.
 */
function extractFromMetaTags(html: string): PrefillResult {
  return {
    title: metaContent(html, "og:title"),
    artist: null,
    venue: null,
    city: null,
    eventDate: null,
    imageUrl: metaContent(html, "og:image"),
    description: metaContent(html, "og:description"),
  };
}

export function extractEventFromHtml(html: string): PrefillResult {
  const event = findJsonLdEvent(html);

  if (!event) {
    return extractFromMetaTags(html);
  }

  const title = textOrNull(event.name);

  return {
    title,
    artist: firstPerformerName(event.performer) ?? title,
    venue: textOrNull(event.location?.name),
    city: textOrNull(event.location?.address?.addressLocality),
    eventDate: textOrNull(event.startDate),
    imageUrl: firstImageUrl(event.image),
    description: textOrNull(event.description),
  };
}
