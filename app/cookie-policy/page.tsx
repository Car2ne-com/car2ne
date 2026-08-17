import LegalPageLayout, {
  LegalSection,
} from "@/components/legal/LegalPageLayout";

export default function CookiePolicyPage() {
  return (
    <LegalPageLayout
      title="Cookie Policy"
      updatedAt="17 agosto 2026"
    >
      <LegalSection title="1. Cosa sono i cookie">
        <p>
          I cookie sono piccoli file di testo
          che i siti visitati inviano al
          dispositivo dell&apos;utente, dove
          vengono memorizzati per essere poi
          ritrasmessi agli stessi siti alla
          visita successiva.
        </p>
      </LegalSection>

      <LegalSection title="2. Cookie utilizzati da Car2ne">
        <p>
          Car2ne utilizza esclusivamente cookie
          tecnici, necessari al funzionamento
          del servizio.{" "}
          <strong>
            Non utilizziamo cookie di
            profilazione, pubblicitari o di
            analisi/statistica di terze parti.
          </strong>
        </p>

        <p>Nello specifico:</p>

        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>
              Cookie di sessione di
              autenticazione
            </strong>{" "}
            (gestiti dal fornitore Supabase),
            necessari per mantenere
            l&apos;accesso al tuo account.
          </li>

          <li>
            <strong>
              car2ne_trusted_device
            </strong>{" "}
            — memorizzato solo se scegli di
            &quot;ricordare questo
            dispositivo&quot; durante la
            verifica in due passaggi (2FA); ha
            una durata di 14 giorni e serve a
            evitare di richiederti nuovamente il
            codice di verifica su quel
            dispositivo.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Base giuridica">
        <p>
          Trattandosi esclusivamente di cookie
          tecnici, necessari all&apos;erogazione
          del servizio richiesto, il loro
          utilizzo non richiede consenso
          preventivo ai sensi della normativa
          vigente.
        </p>
      </LegalSection>

      <LegalSection title="4. Cookie di terze parti">
        <p>
          Al momento Car2ne non utilizza cookie
          di terze parti per finalità di
          analisi, marketing o pubblicità.
        </p>
      </LegalSection>

      <LegalSection title="5. Come gestire i cookie">
        <p>
          Puoi eliminare o bloccare i cookie
          tramite le impostazioni del tuo
          browser; questo potrebbe impedire il
          corretto funzionamento del servizio
          (es. impossibilità di rimanere
          autenticato).
        </p>
      </LegalSection>

      <LegalSection title="6. Aggiornamenti">
        <p>
          Se in futuro Car2ne dovesse introdurre
          cookie non tecnici (es. per analisi
          statistiche), questa pagina sarà
          aggiornata e verrà richiesto il
          consenso dove previsto dalla legge.
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
