/*
 * Test isolato/dry-run del nuovo resolveCity() (lib/geo/resolveCityVenue.ts)
 * contro il DATABASE REALE — in sola lettura. Chiama la funzione VERA
 * esportata dall'app (non una riscrittura), tramite l'alias-loader già
 * usato per il seed. Non tocca mai `venues` (resolveVenue non viene
 * mai invocata da questo script) e non può toccare `cities`: la nuova
 * resolveCity() non contiene più alcuna .insert() — verificabile
 * anche solo leggendo il file, non solo eseguendolo.
 *
 *   node --experimental-loader ./scripts/alias-loader.mjs \
 *     --env-file=.env.local scripts/test-resolver-dry-run.ts
 */

import { createClient } from "@supabase/supabase-js";
import { resolveCity } from "@/lib/geo/resolveCityVenue";

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  const { count: citiesBefore } = await supabase
    .from("cities")
    .select("*", { count: "exact", head: true });

  const cases: Array<{ input: string; expectedComune: string; expectedIstat?: string }> = [
    { input: "Milano", expectedComune: "Milano" },
    { input: "Milan", expectedComune: "Milano" },
    { input: "Milano (Milano)", expectedComune: "Milano" },
    { input: "Cusano Milanino", expectedComune: "Cusano Milanino" },
    { input: "Cusano Milanino (Milano)", expectedComune: "Cusano Milanino" },
    { input: "Chiari", expectedComune: "Chiari" },
    { input: "Chiari (Brescia)", expectedComune: "Chiari" },
    { input: "Molfetta", expectedComune: "Molfetta" },
    { input: "Molfetta (Bari)", expectedComune: "Molfetta" },
    { input: "Paderno Dugnano", expectedComune: "Paderno Dugnano" },
    { input: "Paderno Dugnano (Milano)", expectedComune: "Paderno Dugnano" },
    { input: "Casalecchio di Reno", expectedComune: "Casalecchio di Reno" },
    { input: "Casalecchio di Reno (Bologna)", expectedComune: "Casalecchio di Reno" },
    { input: "Nago - Torbole sul Garda", expectedComune: "Nago-Torbole", expectedIstat: "022124" },
    { input: "Nago-Torbole", expectedComune: "Nago-Torbole", expectedIstat: "022124" },
    { input: "Tindari", expectedComune: "Patti", expectedIstat: "083066" },
    { input: "Bibione", expectedComune: "San Michele al Tagliamento" },
    { input: "Castiglioncello", expectedComune: "Rosignano Marittimo" },
    { input: "Lido di Jesolo", expectedComune: "Jesolo" },
    { input: "Xyzqwertyville", expectedComune: "__NON_TROVATO__" },
  ];

  const results: Array<{ input: string; expected: string; cityId: string | null; comuneName: string | null; ok: boolean }> = [];

  for (const testCase of cases) {
    const cityId = await resolveCity(supabase, {
      cityName: testCase.input,
      venueName: "N/A (test città)",
      countryCode: "IT",
      source: "dry-run-test",
      venueExternalId: null,
      address: null,
      latitude: null,
      longitude: null,
    });

    let comuneName: string | null = null;
    if (cityId) {
      const { data } = await supabase
        .from("cities")
        .select("name, istat_code")
        .eq("id", cityId)
        .single();
      comuneName = data ? `${data.name} (${data.istat_code})` : null;
    }

    const ok =
      testCase.expectedComune === "__NON_TROVATO__"
        ? cityId === null
        : cityId !== null && comuneName?.startsWith(testCase.expectedComune) === true &&
          (!testCase.expectedIstat || comuneName?.includes(testCase.expectedIstat));

    results.push({
      input: testCase.input,
      expected: testCase.expectedComune,
      cityId,
      comuneName,
      ok,
    });
  }

  console.log("\n| Input | Atteso | Risultato | OK |");
  console.log("|---|---|---|---|");
  for (const r of results) {
    console.log(
      `| ${r.input} | ${r.expected === "__NON_TROVATO__" ? "nessuno" : r.expected} | ${r.comuneName ?? "null (non risolto)"} | ${r.ok ? "✅" : "❌ FAIL"} |`
    );
  }

  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} test passati.`);
  if (failed.length > 0) {
    console.log("FALLITI:", JSON.stringify(failed, null, 2));
  }

  // Verifica esplicita: nessuna nuova città creata durante i test
  const { count: citiesAfter } = await supabase
    .from("cities")
    .select("*", { count: "exact", head: true });

  console.log(`\ncities prima: ${citiesBefore}, cities dopo: ${citiesAfter}, invariato: ${citiesBefore === citiesAfter}`);

  // Verifica: due varianti diverse dello stesso comune devono dare lo stesso city_id (non duplicati)
  const milano1 = results.find((r) => r.input === "Milano")!.cityId;
  const milano2 = results.find((r) => r.input === "Milan")!.cityId;
  const milano3 = results.find((r) => r.input === "Milano (Milano)")!.cityId;
  console.log(
    `\nStesso city_id per Milano/Milan/Milano(Milano): ${milano1 === milano2 && milano2 === milano3} (${milano1})`
  );

  const nago1 = results.find((r) => r.input === "Nago - Torbole sul Garda")!.cityId;
  const nago2 = results.find((r) => r.input === "Nago-Torbole")!.cityId;
  console.log(`Stesso city_id per Nago-Torbole (due varianti): ${nago1 === nago2} (${nago1})`);

  if (failed.length > 0 || citiesBefore !== citiesAfter) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Test fallito con eccezione:", error);
  process.exit(1);
});
