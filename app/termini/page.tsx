import Link from "next/link";

import LegalPageLayout, {
  LegalSection,
} from "@/components/legal/LegalPageLayout";

export default function TerminiPage() {
  return (
    <LegalPageLayout
      title="Termini e Condizioni"
      updatedAt="17 agosto 2026"
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
            className="font-semibold text-emerald-600 hover:text-emerald-700"
          >
            Community Guidelines
          </Link>{" "}
          per le regole di comportamento sulla
          piattaforma.
        </p>
      </LegalSection>

      <LegalSection title="7. Sospensione dell'account">
        <p>
          Ci riserviamo il diritto di sospendere
          o limitare un account in caso di
          violazione dei presenti Termini o
          delle Community Guidelines.
        </p>
      </LegalSection>

      <LegalSection title="8. Modifiche al servizio">
        <p>
          Car2ne può modificare o interrompere,
          in tutto o in parte, le funzionalità
          offerte.
        </p>
      </LegalSection>

      <LegalSection title="9. Legge applicabile e foro competente">
        <p>
          I presenti Termini sono regolati dalla
          legge italiana. Per qualsiasi
          controversia sarà competente il foro
          del consumatore ove applicabile, in
          conformità alla normativa italiana
          vigente.
        </p>
      </LegalSection>

      <LegalSection title="10. Contatti">
        <p>
          Per qualsiasi domanda relativa ai
          presenti Termini puoi scrivere a{" "}
          <a
            href="mailto:privacy@car2ne.com"
            className="font-semibold text-emerald-600 hover:text-emerald-700"
          >
            privacy@car2ne.com
          </a>
          .
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
