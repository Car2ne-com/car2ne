import Link from "next/link";

import LegalPageLayout, {
  LegalSection,
} from "@/components/legal/LegalPageLayout";

import { getLocale } from "@/lib/i18n";

export default async function TerminiPage() {
  const locale = await getLocale();

  if (locale === "en") {
    return (
      <LegalPageLayout
        title="Terms and Conditions"
        updatedAt="September 1, 2026"
      >
        <LegalSection title="1. Purpose">
          <p>
            Car2ne is a platform that connects people
            attending the same event, so they can
            arrange a shared car ride and split the
            costs.
          </p>
        </LegalSection>

        <LegalSection title="2. Who can register">
          <p>
            You may register and use Car2ne only if you
            are at least 18 years old.
          </p>
        </LegalSection>

        <LegalSection title="3. The service">
          <p>
            Car2ne merely connects drivers and
            passengers. Car2ne is not a party to the
            arrangements made between users, does not
            organize or physically manage
            transportation, and{" "}
            <strong>
              does not manage or process any payment
            </strong>{" "}
            between the parties: any financial
            arrangements regarding the cost
            contribution are concluded directly and
            under the responsibility of the users
            involved.
          </p>
        </LegalSection>

        <LegalSection title="4. Liability">
          <p>
            Car2ne is not responsible for the conduct
            of users, the accuracy of the information
            they provide (e.g. times, available seats),
            or what happens during the shared ride,
            which remains an independent agreement
            between users.
          </p>

          <p>
            Some drivers may optionally request
            verification of their driver&apos;s license
            and vehicle by submitting the relevant documents
            for review. A &quot;verified driver&quot;
            badge only confirms that the submitted
            documents were reviewed and found consistent;
            it is not a guarantee by Car2ne of the
            driver&apos;s conduct, reliability or of the
            actual condition of the vehicle, and does not
            reduce the independence of the agreement
            between users described above.
          </p>

          <p>
            If a driver publishes a payment link on
            their profile (PayPal.me, Revolut.me or
            Satispay), Car2ne merely displays it as
            entered, without verifying it or guaranteeing
            that it is correct or works. Likewise, an
            indication that a booking has been paid is a
            statement made by the user themselves, which
            Car2ne does not verify.
          </p>
        </LegalSection>

        <LegalSection title="5. Account">
          <p>
            You are responsible for the accuracy of the
            data provided during registration and for
            the confidentiality of your login
            credentials.
          </p>
        </LegalSection>

        <LegalSection title="6. User-generated content">
          <p>
            By publishing a ride, a chat message or a
            review, you declare that the content is
            truthful and does not infringe third-party
            rights. See our{" "}
            <Link
              href="/community-guidelines"
              className="font-semibold text-primary hover:text-primary/80"
            >
              Community Guidelines
            </Link>{" "}
            for the rules of conduct on the platform.
          </p>
        </LegalSection>

        <LegalSection title="7. Blocking other users">
          <p>
            You can block another user at any time from
            their profile: from that moment you will no
            longer be able to exchange messages or make
            new bookings with each other. Blocking is
            your own independent choice and does not
            require Car2ne&apos;s intervention.
          </p>
        </LegalSection>

        <LegalSection title="8. Account suspension">
          <p>
            We reserve the right to suspend or restrict
            an account in case of violation of these
            Terms or the Community Guidelines.
          </p>
        </LegalSection>

        <LegalSection title="9. Changes to the service">
          <p>
            Car2ne may modify or discontinue, in whole
            or in part, the features offered.
          </p>
        </LegalSection>

        <LegalSection title="10. Governing law and jurisdiction">
          <p>
            These Terms are governed by Italian law.
            Any dispute shall be subject to the
            jurisdiction of the consumer&apos;s court
            where applicable, in accordance with
            current Italian law.
          </p>
        </LegalSection>

        <LegalSection title="11. Contact">
          <p>
            For any question regarding these Terms you
            can write to{" "}
            <a
              href="mailto:privacy@car2ne.com"
              className="font-semibold text-primary hover:text-primary/80"
            >
              privacy@car2ne.com
            </a>
            .
          </p>
        </LegalSection>
      </LegalPageLayout>
    );
  }

  return (
    <LegalPageLayout
      title="Termini e Condizioni"
      updatedAt="1 settembre 2026"
    >
      <LegalSection title="1. Oggetto">
        <p>
          Car2ne è una piattaforma che mette in
          contatto persone che partecipano allo
          stesso evento, per organizzare un
          passaggio in auto condiviso e
          dividerne le spese.
        </p>
      </LegalSection>

      <LegalSection title="2. Chi può registrarsi">
        <p>
          Puoi registrarti e utilizzare Car2ne
          solo se hai almeno 18 anni.
        </p>
      </LegalSection>

      <LegalSection title="3. Il servizio">
        <p>
          Car2ne si limita a mettere in contatto
          conducenti e passeggeri. Car2ne non è
          parte degli accordi presi tra gli
          utenti, non organizza né gestisce
          materialmente il trasporto, e{" "}
          <strong>
            non gestisce né elabora alcun
            pagamento
          </strong>{" "}
          tra le parti: eventuali accordi
          economici relativi al contributo spese
          sono conclusi direttamente e sotto la
          responsabilità degli utenti coinvolti.
        </p>
      </LegalSection>

      <LegalSection title="4. Responsabilità">
        <p>
          Car2ne non è responsabile della
          condotta degli utenti,
          dell&apos;affidabilità delle
          informazioni da loro inserite (es.
          orari, posti disponibili) né di quanto
          avviene durante il passaggio
          condiviso, che rimane un accordo
          autonomo tra gli utenti.
        </p>

        <p>
          Alcuni conducenti possono richiedere
          facoltativamente la verifica della
          patente e del veicolo, inviando i
          relativi documenti per la revisione. Il
          badge &quot;conducente verificato&quot;
          attesta solo che i documenti inviati
          sono stati esaminati e risultano
          coerenti; non costituisce una garanzia
          di Car2ne sulla condotta o
          l&apos;affidabilità del conducente né
          sulle reali condizioni del veicolo, e
          non riduce l&apos;autonomia
          dell&apos;accordo tra utenti descritta
          sopra.
        </p>

        <p>
          Se un conducente pubblica sul proprio
          profilo un link di pagamento
          (PayPal.me, Revolut.me o Satispay),
          Car2ne si limita a mostrarlo così come
          inserito, senza verificarlo né
          garantirne la correttezza o il
          funzionamento. Allo stesso modo,
          l&apos;indicazione che una prenotazione
          è stata pagata è una dichiarazione
          dell&apos;utente stesso, che Car2ne non
          verifica.
        </p>
      </LegalSection>

      <LegalSection title="5. Account">
        <p>
          Sei responsabile della veridicità dei
          dati forniti in fase di registrazione
          e della riservatezza delle tue
          credenziali di accesso.
        </p>
      </LegalSection>

      <LegalSection title="6. Contenuti generati dagli utenti">
        <p>
          Pubblicando un passaggio, un messaggio
          in chat o una recensione, dichiari che
          il contenuto è veritiero e non lesivo
          di diritti di terzi. Consulta le
          nostre{" "}
          <Link
            href="/community-guidelines"
            className="font-semibold text-primary hover:text-primary/80"
          >
            Community Guidelines
          </Link>{" "}
          per le regole di comportamento sulla
          piattaforma.
        </p>
      </LegalSection>

      <LegalSection title="7. Blocco di altri utenti">
        <p>
          Puoi bloccare in qualsiasi momento un
          altro utente dal suo profilo: da quel
          momento non potrete più scambiarvi
          messaggi né effettuare nuove
          prenotazioni reciproche. Il blocco è
          una tua scelta autonoma e non richiede
          l&apos;intervento di Car2ne.
        </p>
      </LegalSection>

      <LegalSection title="8. Sospensione dell'account">
        <p>
          Ci riserviamo il diritto di sospendere
          o limitare un account in caso di
          violazione dei presenti Termini o
          delle Community Guidelines.
        </p>
      </LegalSection>

      <LegalSection title="9. Modifiche al servizio">
        <p>
          Car2ne può modificare o interrompere,
          in tutto o in parte, le funzionalità
          offerte.
        </p>
      </LegalSection>

      <LegalSection title="10. Legge applicabile e foro competente">
        <p>
          I presenti Termini sono regolati dalla
          legge italiana. Per qualsiasi
          controversia sarà competente il foro
          del consumatore ove applicabile, in
          conformità alla normativa italiana
          vigente.
        </p>
      </LegalSection>

      <LegalSection title="11. Contatti">
        <p>
          Per qualsiasi domanda relativa ai
          presenti Termini puoi scrivere a{" "}
          <a
            href="mailto:privacy@car2ne.com"
            className="font-semibold text-primary hover:text-primary/80"
          >
            privacy@car2ne.com
          </a>
          .
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
