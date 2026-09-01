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
        updatedAt="September 1, 2026"
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
              className="font-semibold text-primary hover:text-primary/80"
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
              <strong>Driver verification data (optional):</strong>{" "}
              if you request driver verification, we
              collect your driving license number,
              vehicle plate, make and model, and a copy
              of your driving license or ID document.
              The document is stored in a private,
              access-restricted archive and is deleted
              once your request has been reviewed, or
              automatically after 14 days if still
              pending; only the outcome of the
              verification (approved/rejected) is kept
              afterwards.
            </li>

            <li>
              <strong>Payment data (optional):</strong>{" "}
              if you choose to publish a payment link
              on your profile (PayPal.me, Revolut.me or
              Satispay), we store it exactly as entered,
              without verifying it. If you book a ride,
              you can also self-declare that you have
              paid and which method you used (PayPal,
              Revolut, Satispay or in person): we record
              this self-declaration, which Car2ne does
              not verify in any way.
            </li>

            <li>
              <strong>Blocked users:</strong> if you
              block another user, we record this
              relationship to prevent further contact
              (chat, new bookings) between the two of
              you.
            </li>

            <li>
              <strong>Missing event suggestions (optional):</strong>{" "}
              if you suggest an event that is not on
              Car2ne, we record the event details you
              provide (title, artist, venue, city, date,
              any link or image) together with your
              identity as the person who submitted it.
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
              <strong>Reports and reliability data:</strong>{" "}
              if you or another user submit a report
              about a ride (including a no-show report),
              we record the ride/booking concerned, the
              report category, any free-text description
              and the identity of the user the report
              concerns — even when that user is not the
              one who submitted it.
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
              <strong>Push notification data:</strong> if
              you enable push notifications, we store
              the subscription your browser generates
              (a delivery endpoint and encryption keys)
              in order to send notifications to your
              device.
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
            review and manage driver verification
            requests; enable communication between users
            via chat; display reviews to other users;
            handle reports between users, including
            no-show reports, to keep the community safe;
            ensure account security (2FA); send you the
            push notifications you have enabled.
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

            <li>
              <strong>Browser push notification services</strong>{" "}
              — if you enable push notifications, the
              notification is relayed through your
              browser vendor&apos;s own push service
              (e.g. Google, Mozilla, Apple), which only
              handles delivery to your device and does
              not have access to your Car2ne account.
            </li>

            <li>
              <strong>Brevo</strong> — sends our
              transactional emails (e.g. the email
              verification code, password reset code,
              and notifications about your account); it
              receives your email address and the
              content of the email sent.
            </li>

            <li>
              <strong>OpenStreetMap</strong> — if you
              view the meeting-point map for a ride,
              your browser requests the map images
              directly from OpenStreetMap Foundation
              servers, which therefore receive your IP
              address.
            </li>
          </ul>
        </LegalSection>

        <LegalSection title="6. Data retention">
          <p>
            Data is retained for the entire duration of
            the account. If you delete your account, we
            do not physically erase your profile row:
            we anonymize it (name, surname, photo, city
            and bio are removed) and permanently lock
            access to it (email and password are
            replaced and the account is disabled). This
            is because rides, bookings, reviews and chat
            messages tied to your account can also
            concern other users (e.g. a review you left
            or received): deleting them entirely would
            also delete data that belongs to those other
            users. Driver verification documents follow
            a shorter, dedicated retention period
            described in Section 2.
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
              className="font-semibold text-primary hover:text-primary/80"
            >
              privacy@car2ne.com
            </a>
            . You also have the right to lodge a
            complaint with the Italian Data Protection
            Authority (Garante per la protezione dei
            dati personali).
          </p>

          <p>
            You can also delete your account yourself
            from your profile settings: see Section 6
            above for what actually happens to your
            data when you do.
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
      updatedAt="1 settembre 2026"
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
            className="font-semibold text-primary hover:text-primary/80"
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
            <strong>Dati di verifica conducente (facoltativi):</strong>{" "}
            se richiedi la verifica come
            conducente, raccogliamo il numero di
            patente, la targa, marca e modello
            del veicolo e una copia della patente
            o di un documento d&apos;identità.
            Il documento è conservato in un
            archivio privato e ad accesso
            limitato e viene cancellato al
            termine della revisione, oppure
            automaticamente dopo 14 giorni se
            resta in attesa; in seguito viene
            conservato solo l&apos;esito della
            verifica (approvata/rifiutata).
          </li>

          <li>
            <strong>Dati di pagamento (facoltativi):</strong>{" "}
            se scegli di pubblicare sul tuo
            profilo un link di pagamento
            (PayPal.me, Revolut.me o Satispay),
            lo memorizziamo così come lo inserisci,
            senza verificarlo. Se prenoti un
            passaggio, puoi inoltre dichiarare tu
            stesso di aver pagato e con quale
            metodo (PayPal, Revolut, Satispay o di
            persona): registriamo questa
            autodichiarazione, che Car2ne non
            verifica in alcun modo.
          </li>

          <li>
            <strong>Utenti bloccati:</strong> se
            blocchi un altro utente, registriamo
            questa relazione per impedire
            ulteriori contatti (chat, nuove
            prenotazioni) tra voi due.
          </li>

          <li>
            <strong>Segnalazioni di eventi mancanti (facoltative):</strong>{" "}
            se segnali un evento non presente su
            Car2ne, registriamo i dati
            dell&apos;evento che inserisci
            (titolo, artista, locale, città, data,
            eventuali link o immagini) insieme
            alla tua identità di chi ha effettuato
            la segnalazione.
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
            <strong>Segnalazioni e dati di affidabilità:</strong>{" "}
            se tu o un altro utente inviate una
            segnalazione relativa a un passaggio
            (inclusa una segnalazione di
            no-show), registriamo il
            passaggio/prenotazione interessati,
            la categoria della segnalazione, un
            eventuale testo descrittivo e
            l&apos;identità dell&apos;utente a
            cui la segnalazione si riferisce —
            anche quando non è lui ad averla
            inviata.
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
            <strong>Dati delle notifiche push:</strong>{" "}
            se attivi le notifiche push,
            memorizziamo la sottoscrizione
            generata dal tuo browser (un
            endpoint di consegna e chiavi di
            cifratura) necessaria per inviarti
            le notifiche sul tuo dispositivo.
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
          passaggio; esaminare e gestire le
          richieste di verifica conducente;
          consentire la comunicazione tra utenti
          tramite la chat; mostrare le recensioni
          ad altri utenti; gestire le
          segnalazioni tra utenti, incluse
          quelle di no-show, per garantire la
          sicurezza della community; garantire la
          sicurezza dell&apos;account (2FA);
          inviarti le notifiche push che hai
          attivato.
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

          <li>
            <strong>Servizi di notifica push del browser</strong>{" "}
            — se attivi le notifiche push, la
            notifica viene trasmessa attraverso
            il servizio push del produttore del
            tuo browser (es. Google, Mozilla,
            Apple), che gestisce solo la consegna
            al dispositivo e non ha accesso al
            tuo account Car2ne.
          </li>

          <li>
            <strong>Brevo</strong> — invia le
            nostre email transazionali (es. il
            codice di verifica email, il codice
            di reset password e le notifiche
            relative al tuo account); riceve il
            tuo indirizzo email e il contenuto
            dell&apos;email inviata.
          </li>

          <li>
            <strong>OpenStreetMap</strong> — se
            visualizzi la mappa del punto di
            incontro di un passaggio, il tuo
            browser richiede le immagini della
            mappa direttamente ai server di
            OpenStreetMap Foundation, che
            ricevono quindi il tuo indirizzo IP.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="6. Conservazione dei dati">
        <p>
          I dati sono conservati per tutta la
          durata dell&apos;account. Se elimini il
          tuo account, non cancelliamo
          fisicamente la tua riga di profilo: la
          anonimizziamo (nome, cognome, foto,
          città e biografia vengono rimossi) e
          blocchiamo permanentemente
          l&apos;accesso (email e password
          vengono sostituite e l&apos;account
          viene disabilitato). Questo perché
          passaggi, prenotazioni, recensioni e
          messaggi di chat legati al tuo account
          possono riguardare anche altri utenti
          (es. una recensione che hai lasciato o
          ricevuto): cancellarli del tutto
          cancellerebbe anche dati che
          appartengono a loro. I documenti di
          verifica conducente seguono invece un
          periodo di conservazione più breve e
          dedicato, descritto al punto 2.
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
            className="font-semibold text-primary hover:text-primary/80"
          >
            privacy@car2ne.com
          </a>
          . Hai inoltre diritto di proporre
          reclamo al Garante per la protezione
          dei dati personali.
        </p>

        <p>
          Puoi inoltre eliminare il tuo account
          in autonomia dalle impostazioni del
          profilo: vedi il punto 6 qui sopra per
          capire cosa succede realmente ai tuoi
          dati quando lo fai.
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
