/*
 * Alias -> nome canonico città, per fonti esterne che
 * riportano nomi in inglese o varianti (Ticketmaster IT
 * di norma restituisce nomi italiani, ma non è garantito;
 * utile anche per fonti future in altre lingue).
 *
 * Chiavi già passate da normalizeForMatch (lowercase, senza
 * diacritici). Estendere qui, a mano, quando si scopre un
 * nuovo alias: nessuna euristica automatica, per evitare
 * di unire per errore città diverse.
 */
export const CITY_ALIASES: Record<string, string> = {
  milan: "Milano",
  rome: "Roma",
  turin: "Torino",
  florence: "Firenze",
  venice: "Venezia",
  naples: "Napoli",
  genoa: "Genova",
  padua: "Padova",
};
