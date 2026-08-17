import LegalPageLayout, {
  LegalSection,
} from "@/components/legal/LegalPageLayout";

import { getLocale } from "@/lib/i18n";

export default async function PrivacyPolicyPage() {
  const locale = await getLocale();

  if (locale === "en") {
    return (
      <LegalPageLayout
        title="Privacy Policy"
        updatedAt="August 17, 2026"
      >
        <LegalSection title="1. Data Controller">
          <p>
            The data controller for personal data
            collected through Car2ne is Riccardo Di
            Pasquale, a private individual.
          </p>

          <p>
            For any request regarding the processing
            of your personal data (access,
            rectification, erasure, objection,
            portability) you can write to{" "}
            <a
              href="mailto:privacy@car2ne.com"
              className="font-semibold text-emerald-600 hover:text-emerald-700"
            >
              privacy@car2ne.com
            </a>
            .
          </p>

          <p>
            No Data Protection Officer (DPO) has been
            appointed, as it is not mandatory for the
            activity carried out.
          </p>
        </LegalSection>

        <LegalSection title="2. Data collected">
          <p>
            Depending on the features you use, Car2ne
            collects the following categories of
            personal data:
          </p>

          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong>Registration data:</strong> name,
              surname, email address, password (stored
              encrypted by the authentication provider
              Supabase). If you choose to register via
              Google, we receive your name, email and,
              if available, your profile picture from
              Google.
            </li>

            <li>
              <strong>Date of birth:</strong> requested
              during registration (or, if you register
              via Google, right after your first
              login) solely to verify that you are at
              least 18 years old, the minimum
              requirement to use Car2ne.
            </li>

            <li>
              <strong>Profile data (optional):</strong>{" "}
              city, text bio, profile photo you
              voluntarily upload.
            </li>

            <li>
              <strong>Ride data:</strong> if you offer
              a ride, we record the selected event, the
              departure city, the departure time, the
              available seats, the indicated cost
              contribution and an optional description.
              If you book a ride, we record your
              request and its status (pending,
              confirmed, etc.).
            </li>

            <li>
              <strong>Reviews:</strong> if you leave or
              receive a review after a ride, we record
              the rating (1-5) and any text comment,
              made publicly visible to other users.
            </li>

            <li>
              <strong>Chat messages:</strong> messages
              you exchange with other users via the
              internal chat are stored to enable the
              conversation.
            </li>

            <li>
              <strong>Account security data:</strong> if
              you enable two-factor authentication
              (2FA), we record the status of the
              configured factor; if you choose to
              &quot;remember this device&quot;, we
              store a unique device identifier
              (encrypted) for 14 days.
            </li>

            <li>
              <strong>Technical data:</strong> IP
              address and technical browsing
              information automatically collected by
              the hosting provider (Vercel) and the
              database provider (Supabase) for the
              service to function.
            </li>
          </ul>

          <p>
            Car2ne does not process or manage payments:
            the cost contribution indicated in rides is
            purely informational and any financial
            arrangements take place directly between
            users, outside the platform.
          </p>
        </LegalSection>

        <LegalSection title="3. Purpose of processing">
          <p>
            Your data is processed to: create and
            manage your account; verify that you meet
            the minimum age required to use Car2ne (18
            years); allow you to offer or book a ride;
            enable communication between users via
            chat; display reviews to other users;
            ensure account security (2FA); respond to
            the reports you send us.
          </p>
        </LegalSection>

        <LegalSection title="4. Legal basis">
          <p>
            Processing is based on the performance of a
            contract (the service you request by
            registering and using Car2ne) and, for
            optional data you choose to provide (e.g.
            bio, photo), on your consent.
          </p>
        </LegalSection>

        <LegalSection title="5. Data recipients and third-party providers">
          <p>
            Your data is processed with the help of the
            following providers:
          </p>

          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong>Supabase</strong> —
              authentication, database and image
              storage; infrastructure hosted in the
              Europe (Frankfurt) region.
            </li>

            <li>
              <strong>Vercel</strong> — application
              hosting; infrastructure hosted in the
              Europe (Frankfurt) region.
            </li>

            <li>
              <strong>Google</strong> — only if you
              choose to sign in via Google OAuth.
            </li>
          </ul>
        </LegalSection>

        <LegalSection title="6. Data retention">
          <p>
            Data is retained for the entire duration of
            the account. Upon account deletion, data is
            removed, except as necessary to comply with
            legal obligations.
          </p>
        </LegalSection>

        <LegalSection title="7. Your rights">
          <p>
            You have the right to access, rectify and
            erase your data, to object to processing
            and to request its portability, by writing
            to{" "}
            <a
              href="mailto:privacy@car2ne.com"
              className="font-semibold text-emerald-600 hover:text-emerald-700"
            >
              privacy@car2ne.com
            </a>
            . You also have the right to lodge a
            complaint with the Italian Data Protection
            Authority (Garante per la protezione dei
            dati personali).
          </p>
        </LegalSection>

        <LegalSection title="8. Changes to this policy">
          <p>
            This Privacy Policy may be updated over
            time. The date of the last update is shown
            at the top of the page.
          </p>
        </LegalSection>
      </LegalPageLayout>
    );
  }

  return (
    <LegalPageLayout
      title="Privacy Policy"
      updatedAt="17 agosto 2026"
    >
      <LegalSection title="1. Titolare del trattamento">
        <p>
          Il titolare del trattamento dei dati
          personali raccolti tramite Car2ne è
          Riccardo Di Pasquale, persona fisica.
        </p>

        <p>
          Per qualsiasi richiesta relativa al
          trattamento dei tuoi dati personali
          (accesso, rettifica, cancellazione,
          opposizione, portabilità) puoi
          scrivere a{" "}
          <a
            href="mailto:privacy@car2ne.com"
            className="font-semibold text-emerald-600 hover:text-emerald-700"
          >
            privacy@car2ne.com
          </a>
          .
        </p>

        <p>
          Non è stato nominato un Responsabile
          della Protezione dei Dati (DPO), non
          essendo obbligatorio per l&apos;attività
          svolta.
        </p>
      </LegalSection>

      <LegalSection title="2. Dati raccolti">
        <p>
          In base alle funzionalità che
          utilizzi, Car2ne raccoglie le seguenti
          categorie di dati personali:
        </p>

        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Dati di registrazione:</strong>{" "}
            nome, cognome, indirizzo email,
            password (gestita in forma cifrata
            dal fornitore di autenticazione
            Supabase). Se scegli di registrarti
            tramite Google, riceviamo da Google
            nome, email e, se disponibile,
            l&apos;immagine del profilo.
          </li>

          <li>
            <strong>Data di nascita:</strong>{" "}
            richiesta in fase di registrazione
            (o, se ti registri tramite Google,
            subito dopo il primo accesso) al
            solo scopo di verificare che tu
            abbia almeno 18 anni, requisito
            minimo per usare Car2ne.
          </li>

          <li>
            <strong>Dati di profilo (facoltativi):</strong>{" "}
            città, biografia testuale, foto
            profilo che carichi volontariamente.
          </li>

          <li>
            <strong>Dati relativi ai passaggi:</strong>{" "}
            se offri un passaggio, registriamo
            l&apos;evento selezionato, la città
            di partenza, l&apos;orario di
            partenza, i posti disponibili, il
            contributo spese indicato e una
            descrizione facoltativa. Se prenoti
            un passaggio, registriamo la tua
            richiesta e il relativo stato (in
            attesa, confermata, ecc.).
          </li>

          <li>
            <strong>Recensioni:</strong> se
            lasci o ricevi una recensione al
            termine di un passaggio, registriamo
            il punteggio (1-5) e un eventuale
            commento testuale, resi pubblicamente
            visibili agli altri utenti.
          </li>

          <li>
            <strong>Messaggi di chat:</strong> i
            messaggi che scambi con altri utenti
            tramite la chat interna vengono
            memorizzati per permettere la
            conversazione.
          </li>

          <li>
            <strong>Dati di sicurezza dell&apos;account:</strong>{" "}
            se attivi l&apos;autenticazione a due
            fattori (2FA), registriamo lo stato
            del fattore configurato; se scegli
            di &quot;ricordare questo
            dispositivo&quot;, salviamo un
            identificatore univoco del
            dispositivo (in forma cifrata) per
            14 giorni.
          </li>

          <li>
            <strong>Dati tecnici:</strong>{" "}
            indirizzo IP e informazioni tecniche
            di navigazione raccolte
            automaticamente dal fornitore di
            hosting (Vercel) e dal fornitore del
            database (Supabase) per il
            funzionamento del servizio.
          </li>
        </ul>

        <p>
          Car2ne non elabora né gestisce
          pagamenti: il contributo spese
          indicato nei passaggi è puramente
          informativo ed eventuali accordi
          economici avvengono direttamente tra
          gli utenti, al di fuori della
          piattaforma.
        </p>
      </LegalSection>

      <LegalSection title="3. Finalità del trattamento">
        <p>
          I tuoi dati sono trattati per: creare
          e gestire il tuo account; verificare
          che tu abbia l&apos;età minima
          richiesta per usare Car2ne (18 anni);
          permetterti di offrire o prenotare un
          passaggio; consentire la comunicazione
          tra utenti tramite la chat; mostrare
          le recensioni ad altri utenti;
          garantire la sicurezza
          dell&apos;account (2FA); rispondere
          alle segnalazioni che ci invii.
        </p>
      </LegalSection>

      <LegalSection title="4. Base giuridica">
        <p>
          Il trattamento si basa
          sull&apos;esecuzione del contratto
          (fornitura del servizio che richiedi
          registrandoti e utilizzando Car2ne) e,
          per i dati facoltativi che scegli di
          inserire (es. biografia, foto), sul
          tuo consenso.
        </p>
      </LegalSection>

      <LegalSection title="5. Destinatari dei dati e fornitori terzi">
        <p>
          I tuoi dati sono trattati con
          l&apos;ausilio dei seguenti fornitori:
        </p>

        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Supabase</strong> —
            autenticazione, database e storage
            delle immagini; infrastruttura
            ospitata nella regione Europa
            (Frankfurt).
          </li>

          <li>
            <strong>Vercel</strong> — hosting
            dell&apos;applicazione;
            infrastruttura ospitata nella
            regione Europa (Frankfurt).
          </li>

          <li>
            <strong>Google</strong> — solo se
            scegli l&apos;accesso tramite Google
            OAuth.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="6. Conservazione dei dati">
        <p>
          I dati sono conservati per tutta la
          durata dell&apos;account. Alla
          cancellazione dell&apos;account, i
          dati vengono rimossi, salvo quanto
          necessario per adempiere a obblighi di
          legge.
        </p>
      </LegalSection>

      <LegalSection title="7. I tuoi diritti">
        <p>
          Hai diritto di accedere, rettificare e
          cancellare i tuoi dati, di opporti al
          trattamento e di richiederne la
          portabilità, scrivendo a{" "}
          <a
            href="mailto:privacy@car2ne.com"
            className="font-semibold text-emerald-600 hover:text-emerald-700"
          >
            privacy@car2ne.com
          </a>
          . Hai inoltre diritto di proporre
          reclamo al Garante per la protezione
          dei dati personali.
        </p>
      </LegalSection>

      <LegalSection title="8. Modifiche a questa policy">
        <p>
          Questa Privacy Policy può essere
          aggiornata nel tempo. La data
          dell&apos;ultimo aggiornamento è
          indicata in cima alla pagina.
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
