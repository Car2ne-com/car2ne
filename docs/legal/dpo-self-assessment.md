# Autovalutazione obbligo di nomina del DPO (art. 37 GDPR)

Documento interno, non pubblico. Da conservare e rivedere periodicamente (almeno ogni volta che cambiano in modo significativo la base utenti o le funzionalità di trattamento dati). Non sostituisce un parere legale formale.

**Data valutazione:** 20 agosto 2026
**Titolare del trattamento:** Riccardo Di Pasquale, persona fisica

## Criteri di legge (art. 37(1) GDPR)

La nomina di un Responsabile della Protezione dei Dati (DPO) è obbligatoria solo se ricorre almeno una delle seguenti condizioni:

1. il trattamento è effettuato da un'autorità pubblica;
2. le attività **principali** del titolare richiedono il monitoraggio regolare e sistematico degli interessati **su larga scala**;
3. le attività **principali** del titolare consistono nel trattamento **su larga scala** di categorie particolari di dati (art. 9) o di dati relativi a condanne penali/reati (art. 10).

## Valutazione per Car2ne

**Criterio 1 — Ente pubblico:** non applicabile. Car2ne è gestita da un titolare persona fisica, non un ente pubblico.

**Criterio 2 — Monitoraggio regolare e sistematico su larga scala:** non ricorre. Car2ne non effettua profilazione comportamentale, scoring automatico o tracciamento sistematico degli utenti; le funzionalità di reputazione (recensioni, segnalazioni, no-show) sono gestite manualmente caso per caso e non alimentano un sistema di monitoraggio continuativo. La dashboard analytics amministrativa aggrega solo conteggi temporali, senza dati individuali (verificato nel codice: [app/admin/analytics/page.tsx](../../app/admin/analytics/page.tsx)).

**Criterio 3 — Categorie particolari di dati su larga scala come attività principale:**
- I documenti raccolti per la verifica conducente (numero patente, targa, copia patente/documento d'identità — [supabase/migrations/0017_driver_verifications.sql](../../supabase/migrations/0017_driver_verifications.sql)) non costituiscono automaticamente "categorie particolari" ex art. 9: la mera archiviazione di un'immagine di un documento non è dato biometrico, che richiede una elaborazione tecnica specifica finalizzata all'identificazione univoca (es. riconoscimento facciale), non presente nel prodotto.
- Il campo testo libero delle segnalazioni ([supabase/migrations/0018_reports.sql](../../supabase/migrations/0018_reports.sql)) potrebbe occasionalmente contenere dati sensibili scritti da un utente, ma non è l'attività principale della piattaforma né un trattamento sistematico di tali dati.
- La base utenti, allo stato attuale (fase beta), non integra il requisito di "larga scala" secondo i fattori indicati dalle linee guida EDPB (numero di interessati, volume/varietà dei dati, durata, estensione geografica).

**Conclusione:** allo stato attuale (20 agosto 2026), nessuno dei tre criteri dell'art. 37(1) GDPR risulta soddisfatto. La nomina di un DPO non è obbligatoria.

## Obblighi che restano validi anche senza DPO

L'assenza dell'obbligo di nomina del DPO non esonera dai seguenti adempimenti, già in parte implementati:

- **Registro delle attività di trattamento (art. 30):** l'esenzione per organizzazioni con meno di 250 dipendenti non si applica se il trattamento non è occasionale o comporta un rischio per i diritti degli interessati. La verifica conducente (documenti d'identità, ricorrente) rientra in questo caso: si raccomanda di tenere comunque un registro, anche semplificato.
- **Misure di sicurezza adeguate (art. 32):** bucket di storage privato per i documenti di verifica, URL firmati a breve scadenza (60s) per l'accesso admin, cancellazione automatica dei documenti dopo revisione o dopo 14 giorni se in sospeso — già implementato ([app/api/admin/driver-verifications/[id]/document-url/route.ts](../../app/api/admin/driver-verifications/%5Bid%5D/document-url/route.ts)).
- **Valutazione d'impatto (DPIA, art. 35):** da considerare in futuro se il trattamento dei documenti di identificazione dovesse essere ritenuto ad alto rischio (es. crescita significativa del volume, introduzione di elaborazione automatizzata dei documenti).
- **Punto di contatto privacy:** già presente (`privacy@car2ne.com`), utile anche in assenza di un DPO formale come referente per gli interessati e per il Garante.

## Quando rivalutare

Questa autovalutazione va ripetuta se:
- la base utenti cresce in modo sostanziale (superamento di soglie di "larga scala");
- viene introdotta profilazione automatica, scoring di affidabilità calcolato algoritmicamente, o riconoscimento biometrico sui documenti caricati;
- cambia la struttura societaria del titolare (es. costituzione di una società, ingresso di investitori con obblighi di compliance più stringenti).
