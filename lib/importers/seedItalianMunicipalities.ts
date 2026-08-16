import type { SupabaseClient } from "@supabase/supabase-js";

import { createAdminClient } from "@/lib/supabase/admin";
import { slugify } from "@/lib/utils/slug";
import { matchCityNameToComune, type Comune } from "./comuniMatcher";
import comuniDataset from "@/data/comuni-italiani.json";

const INSERT_CHUNK_SIZE = 500;

/*
 * PostgREST tronca silenziosamente ogni select() non paginata a
 * 1000 righe di default. Con 7894+ comuni questo ha causato un bug
 * reale (query di "città già note" incomplete -> ri-tentativi di
 * insert su righe già presenti -> falsi errori di unique violation,
 * scoperto durante l'esecuzione reale del seed). Ogni lettura
 * dell'intera tabella cities in questo file passa da qui.
 */
async function fetchAllCityRows<
  T extends Record<string, unknown>,
>(
  supabase: SupabaseClient,
  columns: string
): Promise<T[]> {
  const PAGE_SIZE = 1000;
  const rows: T[] = [];
  let from = 0;

  for (;;) {
    const { data, error } = await supabase
      .from("cities")
      .select(columns)
      .range(from, from + PAGE_SIZE - 1);

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      break;
    }

    rows.push(...(data as unknown as T[]));

    if (data.length < PAGE_SIZE) {
      break;
    }

    from += PAGE_SIZE;
  }

  return rows;
}

export type SeedReport = {
  existingCitiesTotal: number;
  existingCitiesAlreadyMapped: number;
  existingCitiesMatched: number;
  existingCitiesAmbiguous: number;
  existingCitiesNotFound: number;
  existingCitiesBlockedByDuplicate: number;
  ambiguousCases: Array<{
    cityId: string;
    name: string;
    candidates: string[];
  }>;
  notFoundCases: Array<{ cityId: string; name: string }>;
  blockedByDuplicateCases: Array<{
    cityId: string;
    name: string;
    istatCode: string;
    officialName: string;
  }>;

  comuniInDataset: number;
  comuniAlreadyPresent: number;
  newComuniInserted: number;
  insertErrors: Array<{ istatCode: string; name: string; error: string }>;
};

/*
 * Trasforma public.cities in anagrafica ufficiale dei comuni
 * italiani (fonte: data/comuni-italiani.json, ISTAT).
 *
 * NON elimina mai una riga. NON tocca events.city_id / venues.city_id
 * / rides — legge e scrive solo su public.cities. Idempotente: una
 * riga già mappata (istat_code non nullo) viene saltata; un comune
 * già presente (istat_code già noto) non viene reinserito.
 *
 * Ambiguità e mancati riconoscimenti NON vengono indovinati: restano
 * con istat_code = null e compaiono nel report per revisione manuale.
 *
 * Richiede che la migration 0010_cities_istat_registry.sql sia già
 * stata eseguita (colonne istat_code/province/province_code
 * presenti) — altrimenti fallisce alla prima query.
 */
export async function seedItalianMunicipalities(): Promise<SeedReport> {
  const supabase = createAdminClient();
  const comuni = comuniDataset.comuni as Comune[];

  const report: SeedReport = {
    existingCitiesTotal: 0,
    existingCitiesAlreadyMapped: 0,
    existingCitiesMatched: 0,
    existingCitiesAmbiguous: 0,
    existingCitiesNotFound: 0,
    existingCitiesBlockedByDuplicate: 0,
    ambiguousCases: [],
    notFoundCases: [],
    blockedByDuplicateCases: [],
    comuniInDataset: comuni.length,
    comuniAlreadyPresent: 0,
    newComuniInserted: 0,
    insertErrors: [],
  };

  /*
   * ==============================
   * 1. RICONCILIA LE RIGHE ESISTENTI
   * ==============================
   * Solo UPDATE su righe già presenti. Mai un INSERT, mai un DELETE
   * in questo blocco.
   */

  const existingCities = await fetchAllCityRows<{
    id: string;
    name: string;
    istat_code: string | null;
  }>(supabase, "id, name, istat_code");

  report.existingCitiesTotal = existingCities.length;

  for (const city of existingCities) {
    if (city.istat_code) {
      report.existingCitiesAlreadyMapped += 1;
      continue;
    }

    const result = matchCityNameToComune(city.name, comuni);

    if (result.status === "AMBIGUO") {
      report.existingCitiesAmbiguous += 1;

      report.ambiguousCases.push({
        cityId: city.id,
        name: city.name,
        candidates: result.candidates.map(
          (c) => `${c.name} (${c.province})`
        ),
      });

      continue;
    }

    if (!result.comune) {
      report.existingCitiesNotFound += 1;

      report.notFoundCases.push({
        cityId: city.id,
        name: city.name,
      });

      continue;
    }

    const { error: updateError } = await supabase
      .from("cities")
      .update({
        istat_code: result.comune.istat_code,
        province: result.comune.province,
        province_code: result.comune.province_code,
        region: result.comune.region,
        /*
         * Rinominiamo alla denominazione ufficiale ISTAT (senza
         * provincia tra parentesi): è il motivo per cui esistono i
         * 16 duplicati che stiamo riconciliando. Lo slug segue.
         */
        name: result.comune.name,
        slug: slugify(result.comune.name),
      })
      .eq("id", city.id);

    if (updateError) {
      /*
       * 23505 = unique violation: succede esattamente quando questa
       * riga è una delle due metà di una coppia duplicata e l'altra
       * metà occupa già lo slug/istat_code ufficiale (è il motivo
       * stesso per cui esistono i 16 duplicati). Non è un errore
       * reale: questa riga resta senza istat_code finché il merge
       * (fase successiva, non eseguita da questo script) non elimina
       * la sua gemella e libera l'identità ufficiale.
       */
      if (updateError.code === "23505") {
        report.existingCitiesBlockedByDuplicate += 1;

        report.blockedByDuplicateCases.push({
          cityId: city.id,
          name: city.name,
          istatCode: result.comune.istat_code,
          officialName: result.comune.name,
        });

        continue;
      }

      throw updateError;
    }

    report.existingCitiesMatched += 1;
  }

  /*
   * ==============================
   * 2. INSERISCE I COMUNI MANCANTI
   * ==============================
   * Solo INSERT di comuni non ancora presenti (per istat_code). Mai
   * un UPDATE, mai un DELETE in questo blocco.
   */

  /*
   * Lettura fresca (paginata) DOPO la fase 1: le ~97 righe appena
   * aggiornate sopra devono contare come "già note" qui, non solo
   * lo snapshot pre-fase-1.
   */
  const currentCityRows = await fetchAllCityRows<{
    istat_code: string | null;
    slug: string;
  }>(supabase, "istat_code, slug");

  const knownCodes = new Set(
    currentCityRows
      .map((row) => row.istat_code)
      .filter((code): code is string => !!code)
  );

  const existingSlugs = new Set(
    currentCityRows.map((row) => row.slug)
  );

  const missing = comuni.filter(
    (comune) => !knownCodes.has(comune.istat_code)
  );

  report.comuniAlreadyPresent = comuni.length - missing.length;

  const slugByIstatCode = buildDisambiguatedSlugs(missing, existingSlugs);

  for (let i = 0; i < missing.length; i += INSERT_CHUNK_SIZE) {
    const chunk = missing.slice(i, i + INSERT_CHUNK_SIZE);

    /*
     * insert semplice, non upsert: `missing` è già filtrato sopra
     * escludendo gli istat_code noti, quindi l'idempotenza è già
     * garantita a monte. Un upsert con onConflict non funzionerebbe
     * comunque qui: l'indice unique su istat_code è parziale (`where
     * istat_code is not null`, necessario per convivere con le righe
     * storiche non ancora mappate) e Postgres non può usare un
     * indice parziale come target di ON CONFLICT senza che la
     * stessa condizione sia specificata nella insert stessa, cosa
     * che il client Supabase non espone.
     */
    const { error: insertError } = await supabase.from("cities").insert(
      chunk.map((comune) => ({
        name: comune.name,
        slug: slugByIstatCode.get(comune.istat_code)!,
        country_code: "IT",
        istat_code: comune.istat_code,
        province: comune.province,
        province_code: comune.province_code,
        region: comune.region,
      }))
    );

    if (insertError) {
      /*
       * Un chunk che fallisce non deve bloccare gli altri: si
       * registra l'errore e si continua, così un singolo comune
       * problematico (es. collisione di slug non prevista) non
       * impedisce l'inserimento degli altri ~7700.
       */
      for (const comune of chunk) {
        report.insertErrors.push({
          istatCode: comune.istat_code,
          name: comune.name,
          error: insertError.message,
        });
      }

      continue;
    }

    report.newComuniInserted += chunk.length;
  }

  return report;
}

/*
 * Alcuni comuni collidono sullo stesso slug pur avendo nomi diversi
 * come stringa: raggruppare per nome esatto non basta. Verificato
 * contro il dataset reale: 6 gruppi si scontrano dopo slugify (es.
 * "Paterno" (Potenza) e "Paternò" (Catania) diventano entrambi
 * "paterno" una volta rimossi gli accenti — non solo i 5 omonimi
 * "esatti" come "Livo"). Si raggruppa quindi per SLUG calcolato, non
 * per nome. Si controllano anche gli slug già presenti in tabella
 * (righe esistenti, comprese quelle appena rinominate in fase 1):
 * un comune mancante il cui slug naive collide con una riga già
 * presente viene comunque disambiguato con la sigla provincia.
 */
function buildDisambiguatedSlugs(
  comuni: Comune[],
  existingSlugs: Set<string>
): Map<string, string> {
  const bySlug = new Map<string, Comune[]>();

  for (const comune of comuni) {
    const naiveSlug = slugify(comune.name);
    const list = bySlug.get(naiveSlug) ?? [];
    list.push(comune);
    bySlug.set(naiveSlug, list);
  }

  const result = new Map<string, string>();

  for (const [naiveSlug, group] of bySlug) {
    const needsDisambiguation =
      group.length > 1 || existingSlugs.has(naiveSlug);

    for (const comune of group) {
      const slug = needsDisambiguation
        ? slugify(`${comune.name}-${comune.province_code}`)
        : naiveSlug;

      result.set(comune.istat_code, slug);
    }
  }

  return result;
}
