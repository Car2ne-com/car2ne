/*
 * Ricerca lessicale semplice sulle FAQ, lato client, senza AI.
 * Colma il divario tra le parole degli utenti e quelle delle FAQ con:
 * stopword, uno stemmer minimale IT/EN e alcuni gruppi di sinonimi.
 * Nessuna dipendenza: l'indice si costruisce al volo dalle FAQ già
 * presenti nel dizionario.
 */
export type FaqItem = { q: string; a: string; category: string };

const STOPWORDS = new Set([
  // it
  "il","lo","la","i","gli","le","un","uno","una","di","a","da","in","con","su",
  "per","tra","fra","e","o","ma","se","che","chi","cosa","come","quando","dove",
  "quanto","quale","non","mi","ti","si","ci","vi","è","ho","hai","ha","del","della",
  "dei","delle","al","alla","ai","alle","dal","dalla","nel","nella","posso","devo",
  "voglio","vorrei","fare","essere","questo","questa","miei","mie","mio","mia","tuo","tua",
  // en
  "the","a","an","of","to","from","in","on","with","for","and","or","but","if",
  "what","who","how","when","where","which","not","is","are","do","does","did",
  "my","your","can","should","would","i","me","this","that","it",
]);

const SYNONYMS: string[][] = [
  ["conducente", "autista", "guidatore", "driver"],
  ["passaggio", "viaggio", "ride", "tragitto", "corsa"],
  ["prenotazione", "prenotare", "prenoto", "booking", "book", "prenotato"],
  ["annullare", "annulla", "cancellare", "cancella", "disdire", "cancel", "eliminare", "elimino", "elimina", "delete", "rimuovere", "cancellazione"],
  ["pagamento", "pagare", "pago", "paga", "paypal", "revolut", "satispay", "contanti", "pay", "payment", "costa", "costano"],
  ["recensione", "recensioni", "review", "reviews", "valutazione", "stelle", "feedback"],
  ["verifica", "verificato", "verificare", "badge", "verified", "documenti", "patente"],
  ["account", "profilo", "registrazione", "iscrizione", "registrarmi", "registrare", "iscrivermi", "profile", "signup", "register"],
  ["password", "accesso", "login", "accedere", "entrare", "credenziali"],
  ["evento", "eventi", "concerto", "concerti", "festival", "event"],
  ["contributo", "prezzo", "costo", "costi", "spese", "quota", "contribution", "price", "cost"],
  ["notifica", "notifiche", "avviso", "avvisi", "email", "mail", "notification", "push"],
  ["chat", "messaggio", "messaggi", "scrivere", "contattare", "message", "contact"],
  ["posto", "posti", "seat", "seats"],
  ["2fa", "otp", "autenticazione", "fattori"],
  ["lingua", "lingue", "language", "inglese", "italiano", "english", "italian", "bilingue", "traduzione"],
  ["presentato", "presentata", "presenta", "presentarsi", "presentazione", "mancata", "noshow", "show"],
  ["età", "anni", "maggiorenne", "minorenne", "age", "18"],
];

const SYNONYM_INDEX = new Map<string, string[]>();
for (const group of SYNONYMS) {
  for (const term of group) SYNONYM_INDEX.set(term, group);
}

/*
 * Stemmer minimale: taglia i suffissi flessivi più comuni di italiano e
 * inglese così "prenoto/prenotare/prenotazione" o "cambio/cambia"
 * collassano su una radice comune. Deliberatamente grezzo.
 */
function stem(token: string): string {
  if (token.length <= 4) return token;

  const stemmed = token.replace(
    /(azioni|azione|zione|mente|ando|endo|are|ere|ire|ato|ata|ati|ate|ito|ita|iti|ite|ing|ed|es|er|e|i|o|a)$/,
    ""
  );

  return stemmed.length >= 3 ? stemmed : token;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 1 && !STOPWORDS.has(token));
}

/* Espande in un set: token + radice + sinonimi + radici dei sinonimi. */
function expand(text: string): Set<string> {
  const out = new Set<string>();

  for (const token of tokenize(text)) {
    out.add(token);
    out.add(stem(token));

    const group = SYNONYM_INDEX.get(token);

    if (group) {
      for (const term of group) {
        out.add(term);
        out.add(stem(term));
      }
    }
  }

  return out;
}

type IndexedItem = {
  item: FaqItem;
  question: Set<string>;
  answer: Set<string>;
  category: Set<string>;
};

export function buildIndex(faqItems: FaqItem[]): IndexedItem[] {
  return faqItems.map((item) => ({
    item,
    question: expand(item.q),
    answer: expand(item.a),
    category: expand(item.category),
  }));
}

function scoreItem(queryTokens: Set<string>, entry: IndexedItem): number {
  let score = 0;

  for (const token of queryTokens) {
    if (entry.question.has(token)) score += 3;
    else if (entry.answer.has(token)) score += 1;
    else if (entry.category.has(token)) score += 1;
  }

  return score;
}

export function searchFaq(
  query: string,
  index: IndexedItem[],
  { limit = 3, minScore = 3 }: { limit?: number; minScore?: number } = {}
): FaqItem[] {
  const queryTokens = expand(query);

  if (queryTokens.size === 0) return [];

  const ranked = index
    .map((entry) => ({ item: entry.item, score: scoreItem(queryTokens, entry) }))
    .filter((entry) => entry.score >= minScore)
    .sort((a, b) => b.score - a.score);

  if (ranked.length === 0) return [];

  /* Scarta la coda debole: tieni solo i risultati vicini al migliore. */
  const cutoff = Math.max(minScore, ranked[0].score * 0.5);

  return ranked
    .filter((entry) => entry.score >= cutoff)
    .slice(0, limit)
    .map((entry) => entry.item);
}
