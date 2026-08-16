/*
 * Verifica READ-ONLY (nessuna scrittura, nessuna dipendenza da
 * Supabase per l'inserimento) del mapping delle 114 città attuali
 * contro l'anagrafica ISTAT in data/comuni-italiani.json.
 *
 * La logica di matching qui sotto è una copia intenzionale di
 * lib/importers/comuniMatcher.ts: quel file usa import "@/..." che
 * il runtime TypeScript nativo di Node non risolve (sono un alias
 * Next.js/tsconfig, non uno standard Node), quindi per uno script
 * eseguibile direttamente con `node` si duplica qui l'algoritmo
 * (stesso approccio già usato per scripts/verify-city-venue.ts).
 * Le due copie vanno tenute allineate a mano.
 *
 *   node scripts/dry-run-municipalities-mapping.ts
 *
 * Usa la SERVICE ROLE KEY in lettura per contare eventi/venue per
 * città (stesso pattern di audit già usato in questa sessione) — non
 * scrive nulla.
 */

import { createClient } from "@supabase/supabase-js";
import { normalizeForMatch, stripProvinceSuffix } from "../lib/geo/normalize.ts";
import { CITY_ALIASES } from "../lib/geo/cityAliases.ts";
import comuniDataset from "../data/comuni-italiani.json" with { type: "json" };

type Comune = {
  istat_code: string;
  name: string;
  province: string;
  province_code: string;
  region: string;
};

type MatchStatus =
  | "MATCH_ESATTO"
  | "MATCH_NORMALIZZATO"
  | "MATCH_ALIAS"
  | "AMBIGUO"
  | "NON_TROVATO";

type MatchResult = {
  status: MatchStatus;
  comune: Comune | null;
  candidates: Comune[];
};

function extractProvinceHint(rawName: string): string | null {
  const match = rawName.match(/\(([^)]+)\)\s*$/);
  return match ? match[1].trim() : null;
}

// Tenuto allineato a mano con lib/importers/comuniMatcher.ts
const MUNICIPALITY_NAME_OVERRIDES: Record<string, string> = {
  [normalizeForMatch("Bellaria – Igea Marina")]: "Bellaria-Igea Marina",
  [normalizeForMatch("Montecatini Terme")]: "Montecatini-Terme",
  [normalizeForMatch("Reggio Emilia")]: "Reggio nell'Emilia",
  [normalizeForMatch("Nago - Torbole sul Garda")]: "Nago-Torbole",
  [normalizeForMatch("Tindari")]: "Patti",
  [normalizeForMatch("Bibione")]: "San Michele al Tagliamento",
  [normalizeForMatch("Castiglioncello")]: "Rosignano Marittimo",
  [normalizeForMatch("Lido di Jesolo")]: "Jesolo",
};

function matchCityNameToComune(
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
    (c) => normalizeForMatch(c.name) === normalizeForMatch(candidateName)
  );

  let pool = exact.length > 0 ? exact : normalized;
  const isExactMatch = exact.length > 0;

  if (pool.length > 1 && provinceHint) {
    const disambiguated = pool.filter(
      (c) => normalizeForMatch(c.province) === normalizeForMatch(provinceHint)
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
    return { status, comune: pool[0], candidates: pool };
  }

  if (pool.length > 1) {
    return { status: "AMBIGUO", comune: null, candidates: pool };
  }

  return { status: "NON_TROVATO", comune: null, candidates: [] };
}

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  const comuni = comuniDataset.comuni as Comune[];

  // PostgREST tronca select() senza range() a 1000 righe: con 7.894+
  // città serve paginazione anche qui.
  const cities: { id: string; name: string; slug: string }[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase
      .from("cities")
      .select("id, name, slug")
      .order("name")
      .range(from, from + 999);
    if (error) throw error;
    if (!data || data.length === 0) break;
    cities.push(...data);
    if (data.length < 1000) break;
  }

  const { data: events } = await supabase.from("events").select("city_id");
  const { data: venues } = await supabase.from("venues").select("id, city_id");

  const eventCount = new Map<string, number>();
  for (const e of events ?? []) {
    if (e.city_id) eventCount.set(e.city_id, (eventCount.get(e.city_id) ?? 0) + 1);
  }
  const venueCount = new Map<string, number>();
  for (const v of venues ?? []) {
    if (v.city_id) venueCount.set(v.city_id, (venueCount.get(v.city_id) ?? 0) + 1);
  }

  const counts: Record<MatchStatus, number> = {
    MATCH_ESATTO: 0,
    MATCH_NORMALIZZATO: 0,
    MATCH_ALIAS: 0,
    AMBIGUO: 0,
    NON_TROVATO: 0,
  };

  const rows: string[] = [];
  const ambiguousDetails: string[] = [];
  const notFoundDetails: string[] = [];

  for (const city of cities ?? []) {
    const result = matchCityNameToComune(city.name, comuni);
    counts[result.status] += 1;

    const events = eventCount.get(city.id) ?? 0;
    const venuesN = venueCount.get(city.id) ?? 0;
    const comuneLabel = result.comune
      ? `${result.comune.name} (${result.comune.istat_code}, ${result.comune.province_code})`
      : "—";

    rows.push(
      `| ${city.id.slice(0, 8)}… | ${city.name} | ${comuneLabel} | ${events} | ${venuesN} | ${result.status} |`
    );

    if (result.status === "AMBIGUO") {
      ambiguousDetails.push(
        `  - "${city.name}" → candidati: ${result.candidates.map((c) => `${c.name} (${c.province})`).join(" / ")}`
      );
    }
    if (result.status === "NON_TROVATO") {
      notFoundDetails.push(`  - "${city.name}"`);
    }
  }

  console.log(`Totale città Car2ne: ${cities?.length}`);
  console.log(`Totale comuni ISTAT: ${comuni.length}`);
  console.log("\nConteggio per stato:");
  console.log(JSON.stringify(counts, null, 2));

  console.log("\nCasi AMBIGUI:");
  console.log(ambiguousDetails.length ? ambiguousDetails.join("\n") : "  (nessuno)");

  console.log("\nCasi NON TROVATI:");
  console.log(notFoundDetails.length ? notFoundDetails.join("\n") : "  (nessuno)");

  console.log("\n\n--- TABELLA COMPLETA (markdown) ---\n");
  console.log("| City ID | Nome attuale | Comune ISTAT | Eventi | Venue | Stato |");
  console.log("|---|---|---|---|---|---|");
  for (const row of rows) console.log(row);

  // Verifica mirata sulle 16 coppie duplicate: devono risolvere allo stesso istat_code
  console.log("\n\n--- VERIFICA COPPIE DUPLICATE NOTE ---\n");
  const knownPairs: [string, string][] = [
    ["Bellaria – Igea Marina", "Bellaria – Igea Marina (Rimini)"],
    ["Cabras", "Cabras (Oristano)"],
    ["Casalecchio di Reno", "Casalecchio di Reno (Bologna)"],
    ["Casella", "Casella (Genova)"],
    ["Cernobbio", "Cernobbio (Como)"],
    ["Chiari", "Chiari (Brescia)"],
    ["Cusano Milanino", "Cusano Milanino (Milano)"],
    ["Gavorrano", "Gavorrano (Grosseto)"],
    ["Giovinazzo", "Giovinazzo (Bari)"],
    ["Molfetta", "Molfetta (Bari)"],
    ["Montesilvano", "Montesilvano (Pescara)"],
    ["Nago - Torbole sul Garda", "Nago - Torbole sul Garda (Trento)"],
    ["Paderno Dugnano", "Paderno Dugnano (Milano)"],
    ["Pozzuoli", "Pozzuoli (Napoli)"],
    ["Sant'Olcese", "Sant'Olcese (Genova)"],
    ["Tindari", "Tindari (Messina)"],
  ];

  let allPairsConverge = true;
  for (const [a, b] of knownPairs) {
    const ra = matchCityNameToComune(a, comuni);
    const rb = matchCityNameToComune(b, comuni);
    const converge = ra.comune?.istat_code && ra.comune.istat_code === rb.comune?.istat_code;
    if (!converge) allPairsConverge = false;
    console.log(
      `${converge ? "OK  " : "FAIL"} "${a}" → ${ra.comune?.istat_code ?? ra.status} | "${b}" → ${rb.comune?.istat_code ?? rb.status}`
    );
  }
  console.log(`\nTutte le 16 coppie convergono sullo stesso istat_code: ${allPairsConverge}`);
}

main();
