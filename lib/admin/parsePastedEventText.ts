/*
 * Prova a riconoscere titolo e data da un blocco di testo che
 * l'admin ha copiato a mano dalla pagina di un evento (TicketOne,
 * Vivaticket, ecc.) nel proprio browser. Pura elaborazione di
 * stringhe: nessuna richiesta verso terzi. Best-effort, non un
 * parser affidabile al 100% per ogni sito — l'admin rivede e
 * corregge i campi prima di salvare, esattamente come per il resto
 * del form.
 */

const MONTHS: Record<string, string> = {
  gennaio: "01",
  febbraio: "02",
  marzo: "03",
  aprile: "04",
  maggio: "05",
  giugno: "06",
  luglio: "07",
  agosto: "08",
  settembre: "09",
  ottobre: "10",
  novembre: "11",
  dicembre: "12",
};

const DEFAULT_TIME = "20:00";

export type ParsedEventText = {
  title: string | null;
  eventDate: string | null;
  description: string | null;
};

function pad(value: string): string {
  return value.padStart(2, "0");
}

/*
 * Prova, in ordine: "15 novembre 2026[, ore 21:00]", "15/11/2026
 * [21:00]", "2026-11-15[T21:00]". Ritorna il primo match trovato nel
 * testo, formattato come richiede l'input datetime-local del form
 * ("YYYY-MM-DDTHH:mm").
 */
function findEventDate(text: string): string | null {
  const monthNames = Object.keys(MONTHS).join("|");

  const italianDate = new RegExp(
    `\\b(\\d{1,2})\\s+(${monthNames})\\s+(\\d{4})(?:[^\\d]{0,10}?(\\d{1,2})[:.](\\d{2}))?`,
    "i"
  );

  const italianMatch = text.match(italianDate);

  if (italianMatch) {
    const [, day, monthName, year, hour, minute] = italianMatch;
    const month = MONTHS[monthName.toLowerCase()];

    const time =
      hour && minute ? `${pad(hour)}:${pad(minute)}` : DEFAULT_TIME;

    return `${year}-${month}-${pad(day)}T${time}`;
  }

  const numericDate = text.match(
    /\b(\d{1,2})[/\-](\d{1,2})[/\-](\d{4})(?:[^\d]{0,10}?(\d{1,2})[:.](\d{2}))?/
  );

  if (numericDate) {
    const [, day, month, year, hour, minute] = numericDate;

    const time =
      hour && minute ? `${pad(hour)}:${pad(minute)}` : DEFAULT_TIME;

    return `${year}-${pad(month)}-${pad(day)}T${time}`;
  }

  const isoDate = text.match(
    /\b(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?/
  );

  if (isoDate) {
    const [, year, month, day, hour, minute] = isoDate;

    const time = hour && minute ? `${hour}:${minute}` : DEFAULT_TIME;

    return `${year}-${month}-${day}T${time}`;
  }

  return null;
}

/*
 * Titolo: prima riga non vuota del testo incollato, che in genere
 * corrisponde all'intestazione principale della pagina copiata.
 */
function findTitle(lines: string[]): string | null {
  const first = lines.find((line) => line.trim().length > 0);

  return first ? first.trim() : null;
}

export function parsePastedEventText(raw: string): ParsedEventText {
  const lines = raw.split("\n");

  return {
    title: findTitle(lines),
    eventDate: findEventDate(raw),
    description: raw.trim() || null,
  };
}
