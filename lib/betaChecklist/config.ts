/*
 * Il beta test è una fase temporanea: questa feature (pagina dashboard +
 * sezione admin) non deve esistere in produzione. Un unico flag booleano
 * la spegne ovunque (nav, pagine, redirect) senza dover rimuovere codice
 * sotto pressione a ridosso del lancio — a quel punto va rimossa del tutto.
 */
export const isBetaChecklistEnabled =
  process.env.NEXT_PUBLIC_BETA_CHECKLIST_ENABLED === "true";
