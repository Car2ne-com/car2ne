import LegalPageLayout, {
  LegalSection,
} from "@/components/legal/LegalPageLayout";

import { getLocale } from "@/lib/i18n";

export default async function CookiePolicyPage() {
  const locale = await getLocale();

  if (locale === "en") {
    return (
      <LegalPageLayout
        title="Cookie Policy"
        updatedAt="September 1, 2026"
      >
        <LegalSection title="1. What cookies are">
          <p>
            Cookies are small text files that visited
            websites send to the user&apos;s device,
            where they are stored to be sent back to
            the same websites on the next visit.
          </p>
        </LegalSection>

        <LegalSection title="2. Cookies used by Car2ne">
          <p>
            Car2ne uses exclusively technical cookies,
            necessary for the service to function.{" "}
            <strong>
              We do not use profiling, advertising or
              third-party analytics/statistics cookies.
            </strong>
          </p>

          <p>Specifically:</p>

          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong>
                Authentication session cookies
              </strong>{" "}
              (managed by the provider Supabase),
              necessary to keep you logged into your
              account.
            </li>

            <li>
              <strong>car2ne_trusted_device</strong> —
              stored only if you choose to
              &quot;remember this device&quot; during
              two-step verification (2FA); it lasts 14
              days and is used to avoid asking you for
              the verification code again on that
              device.
            </li>

            <li>
              <strong>NEXT_LOCALE</strong> — remembers
              the language you chose (Italian or
              English), so we don&apos;t have to ask
              you again on every visit.
            </li>
          </ul>
        </LegalSection>

        <LegalSection title="3. Legal basis">
          <p>
            Since these are exclusively technical
            cookies, necessary to provide the requested
            service, their use does not require prior
            consent under current regulations.
          </p>
        </LegalSection>

        <LegalSection title="4. Third-party cookies">
          <p>
            Car2ne currently does not use third-party
            cookies for analytics, marketing or
            advertising purposes.
          </p>
        </LegalSection>

        <LegalSection title="5. How to manage cookies">
          <p>
            You can delete or block cookies through
            your browser settings; this may prevent the
            service from working properly (e.g.
            inability to stay logged in).
          </p>
        </LegalSection>

        <LegalSection title="6. Updates">
          <p>
            If Car2ne introduces non-technical cookies
            in the future (e.g. for statistical
            analysis), this page will be updated and
            consent will be requested where required by
            law.
          </p>
        </LegalSection>
      </LegalPageLayout>
    );
  }

  return (
    <LegalPageLayout
      title="Cookie Policy"
      updatedAt="1 settembre 2026"
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

          <li>
            <strong>NEXT_LOCALE</strong> —
            memorizza la lingua che hai scelto
            (italiano o inglese), così non te la
            richiediamo a ogni visita.
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
