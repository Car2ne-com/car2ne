/*
 * Normalizzazione testo usata SOLO per il matching
 * (dedup di città/venue), mai per la visualizzazione:
 * lowercase, rimozione diacritici, spazi collassati.
 */
export function normalizeForMatch(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(new RegExp("[\\u0300-\\u036f]", "g"), "")
    .replace(/\s+/g, " ")
    .trim();
}

/*
 * Ticketmaster riporta lo stesso comune a volte come "Segrate" e
 * a volte come "Segrate (Milano)" (provincia tra parentesi per le
 * città meno note), in modo incoerente da evento a evento. In
 * Italia i nomi dei comuni sono sostanzialmente univoci a livello
 * nazionale, quindi rimuovere la provincia è sicuro e necessario
 * per evitare due città duplicate per lo stesso comune.
 */
export function stripProvinceSuffix(name: string): string {
  return name.replace(/\s*\([^)]*\)\s*$/, "").trim();
}
