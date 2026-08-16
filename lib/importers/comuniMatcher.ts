import { normalizeForMatch, stripProvinceSuffix } from "@/lib/geo/normalize";
import { CITY_ALIASES } from "@/lib/geo/cityAliases";

export type Comune = {
  istat_code: string;
  name: string;
  province: string;
  province_code: string;
  region: string;
};

export type MatchStatus =
  | "MATCH_ESATTO"
  | "MATCH_NORMALIZZATO"
  | "MATCH_ALIAS"
  | "AMBIGUO"
  | "NON_TROVATO";

export type MatchResult = {
  status: MatchStatus;
  comune: Comune | null;
  candidates: Comune[];
  provinceHint: string | null;
};

/*
 * Mapping esplicito (priorità 2, prima del matching per nome). Ogni
 * riga qui è una decisione umana verificata, non un'euristica.
 * Chiave: normalizeForMatch(stripProvinceSuffix(nome così com'è
 * salvato oggi in Car2ne o restituito da Ticketmaster)).
 *
 * Due categorie distinte, verificate contro data/comuni-italiani.json:
 *
 * 1) Stessa denominazione ISTAT, solo punteggiatura/dicitura diversa
 *    — correzione a bassa ambiguità:
 *      "Bellaria – Igea Marina" -> ISTAT scrive "Bellaria-Igea Marina" (RN)
 *      "Montecatini Terme"      -> ISTAT scrive "Montecatini-Terme" (PT)
 *      "Reggio Emilia"          -> ISTAT scrive "Reggio nell'Emilia" (RE)
 *      "Nago - Torbole sul Garda" -> ISTAT scrive "Nago-Torbole" (TN),
 *        senza "sul Garda"
 *
 * 2) Frazione/località nota, non è essa stessa un comune — mappata
 *    sul comune capoluogo. APPROVATO ESPLICITAMENTE (non un'euristica
 *    automatica): questa è una lista chiusa di 4 casi verificati uno
 *    per uno, non un meccanismo generico "frazione -> comune". Un
 *    nome non presente in questa mappa e non risolvibile per nome
 *    resta NON_TROVATO, mai indovinato:
 *      "Tindari"          -> frazione del comune di Patti (ME)
 *      "Bibione"          -> frazione del comune di San Michele al
 *                            Tagliamento (VE)
 *      "Castiglioncello"  -> frazione del comune di Rosignano
 *                            Marittimo (LI)
 *      "Lido di Jesolo"   -> frazione/località del comune di Jesolo (VE)
 *
 * Rinominare la riga City al comune amministrativo NON cancella il
 * nome della località/venue originale: events.city/events.venue
 * (testo) e venues.name non vengono mai toccati da questo modulo,
 * solo events.city_id/venue_id e cities.name/slug. "Teatro Greco di
 * Tindari" resta "Teatro Greco di Tindari" anche quando la sua città
 * diventa "Patti".
 */
export const MUNICIPALITY_NAME_OVERRIDES: Record<string, string> = {
  [normalizeForMatch("Bellaria – Igea Marina")]: "Bellaria-Igea Marina",
  [normalizeForMatch("Montecatini Terme")]: "Montecatini-Terme",
  [normalizeForMatch("Reggio Emilia")]: "Reggio nell'Emilia",
  [normalizeForMatch("Nago - Torbole sul Garda")]: "Nago-Torbole",

  // -- frazione/località -> comune capoluogo, approvati --
  [normalizeForMatch("Tindari")]: "Patti",
  [normalizeForMatch("Bibione")]: "San Michele al Tagliamento",
  [normalizeForMatch("Castiglioncello")]: "Rosignano Marittimo",
  [normalizeForMatch("Lido di Jesolo")]: "Jesolo",
};

/*
 * Riconcilia una stringa città (tipicamente proveniente da
 * Ticketmaster, o già presente in public.cities) contro l'anagrafica
 * ufficiale dei comuni italiani (ISTAT). Prudente per design: in
 * caso di ambiguità reale (comuni omonimi in province diverse, es.
 * "Livo" esiste sia in Trentino che in Lombardia) NON indovina,
 * ritorna AMBIGUO con i candidati — mai una scelta a caso.
 *
 * Priorità di matching, come da richiesta:
 * 1. nome esatto (eventualmente dopo alias esplicito)
 * 2. nome normalizzato (case/diacritici)
 * 3. disambiguazione tramite provincia, se il nome è ambiguo a
 *    livello nazionale e il testo originale porta un indizio di
 *    provincia tra parentesi (es. "Cabras (Oristano)")
 * 4. altrimenti AMBIGUO o NON_TROVATO, mai una fusione forzata.
 */
export function matchCityNameToComune(
  rawName: string,
  comuni: Comune[]
): MatchResult {
  const provinceHint = extractProvinceHint(rawName);
  const withoutProvince = stripProvinceSuffix(rawName);
  const normalizedKey = normalizeForMatch(withoutProvince);

  const override = MUNICIPALITY_NAME_OVERRIDES[normalizedKey];
  const alias = override ?? CITY_ALIASES[normalizedKey];
  const usedAlias = !!alias;
  const candidateName = alias ?? withoutProvince;

  const exact = comuni.filter((c) => c.name === candidateName);

  const normalized = comuni.filter(
    (c) =>
      normalizeForMatch(c.name) === normalizeForMatch(candidateName)
  );

  let pool = exact.length > 0 ? exact : normalized;
  const isExactMatch = exact.length > 0;

  if (pool.length > 1 && provinceHint) {
    const disambiguated = pool.filter(
      (c) =>
        normalizeForMatch(c.province) ===
        normalizeForMatch(provinceHint)
    );

    if (disambiguated.length === 1) {
      pool = disambiguated;
    }
  }

  if (pool.length === 1) {
    const status: MatchStatus = usedAlias
      ? "MATCH_ALIAS"
      : isExactMatch
        ? "MATCH_ESATTO"
        : "MATCH_NORMALIZZATO";

    return {
      status,
      comune: pool[0],
      candidates: pool,
      provinceHint,
    };
  }

  if (pool.length > 1) {
    return {
      status: "AMBIGUO",
      comune: null,
      candidates: pool,
      provinceHint,
    };
  }

  return {
    status: "NON_TROVATO",
    comune: null,
    candidates: [],
    provinceHint,
  };
}

function extractProvinceHint(rawName: string): string | null {
  const match = rawName.match(/\(([^)]+)\)\s*$/);
  return match ? match[1].trim() : null;
}
