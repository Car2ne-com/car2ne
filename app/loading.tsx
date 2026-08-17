import { getTranslations } from "@/lib/i18n";

/*
 * Suspense boundary a livello di root: senza questo file, ogni
 * pagina dinamica (praticamente tutte, essendo Server Component che
 * leggono da Supabase) mostra schermata vuota/pagina precedente
 * congelata finché la risposta del server non arriva — su rete
 * mobile lenta si percepisce come un blocco. Con questo file, Next
 * mostra subito questo indicatore mentre la pagina reale si carica.
 */
export default async function Loading() {
  const { dict } = await getTranslations();

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div
        className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-500"
        role="status"
        aria-label={dict.layout.loading}
      />
    </div>
  );
}
