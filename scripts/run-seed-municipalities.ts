/*
 * Esegue davvero lib/importers/seedItalianMunicipalities.ts (non una
 * copia) contro il database reale. Richiede che
 * supabase/migrations/0010_cities_istat_registry.sql sia già stata
 * eseguita (colonne istat_code/province/province_code presenti).
 *
 * Scrive: solo UPDATE su righe cities esistenti (backfill
 * istat_code/province/province_code/region/name/slug) e INSERT dei
 * comuni mancanti. Mai un DELETE. Mai una scrittura su
 * events/venues/rides.
 *
 *   node --experimental-loader ./scripts/alias-loader.mjs \
 *     --env-file=.env.local scripts/run-seed-municipalities.ts
 */

import { seedItalianMunicipalities } from "@/lib/importers/seedItalianMunicipalities";

async function main() {
  console.log("Avvio seed anagrafica comuni italiani...\n");

  const report = await seedItalianMunicipalities();

  console.log("=== RIGHE CITIES ESISTENTI ===");
  console.log(`Totale: ${report.existingCitiesTotal}`);
  console.log(`Già mappate (skip, run precedente): ${report.existingCitiesAlreadyMapped}`);
  console.log(`Matchate e aggiornate ora: ${report.existingCitiesMatched}`);
  console.log(`Ambigue (NON toccate): ${report.existingCitiesAmbiguous}`);
  console.log(`Non trovate (NON toccate): ${report.existingCitiesNotFound}`);
  console.log(
    `Bloccate da duplicato (NON toccate, in attesa del merge): ${report.existingCitiesBlockedByDuplicate}`
  );

  if (report.blockedByDuplicateCases.length > 0) {
    console.log("\nCasi BLOCCATI DA DUPLICATO:");
    for (const c of report.blockedByDuplicateCases) {
      console.log(
        `  - "${c.name}" (${c.cityId}) -> ${c.officialName} (${c.istatCode}) già assegnato alla gemella`
      );
    }
  }

  if (report.ambiguousCases.length > 0) {
    console.log("\nCasi AMBIGUI:");
    for (const c of report.ambiguousCases) {
      console.log(`  - "${c.name}" (${c.cityId}) -> candidati: ${c.candidates.join(" / ")}`);
    }
  }

  if (report.notFoundCases.length > 0) {
    console.log("\nCasi NON TROVATI:");
    for (const c of report.notFoundCases) {
      console.log(`  - "${c.name}" (${c.cityId})`);
    }
  }

  console.log("\n=== COMUNI ISTAT ===");
  console.log(`Nel dataset: ${report.comuniInDataset}`);
  console.log(`Già presenti (per istat_code): ${report.comuniAlreadyPresent}`);
  console.log(`Nuovi inseriti ora: ${report.newComuniInserted}`);

  if (report.insertErrors.length > 0) {
    console.log(`\nErrori di inserimento (${report.insertErrors.length}):`);
    for (const e of report.insertErrors.slice(0, 20)) {
      console.log(`  - ${e.name} (${e.istatCode}): ${e.error}`);
    }
    if (report.insertErrors.length > 20) {
      console.log(`  ... e altri ${report.insertErrors.length - 20}`);
    }
  }

  console.log("\nFatto.");
}

main().catch((error) => {
  console.error("Seed fallito:", error);
  process.exit(1);
});
