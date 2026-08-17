import Link from "next/link";

import LegalPageLayout, {
  LegalSection,
} from "@/components/legal/LegalPageLayout";

export default function CommunityGuidelinesPage() {
  return (
    <LegalPageLayout
      title="Community Guidelines"
      updatedAt="17 agosto 2026"
    >
      <LegalSection title="1. Il nostro obiettivo">
        <p>
          Car2ne esiste per aiutare le persone a
          raggiungere insieme lo stesso evento,
          in modo sicuro, economico e piacevole.
          Queste linee guida spiegano come
          comportarsi sulla piattaforma.
        </p>
      </LegalSection>

      <LegalSection title="2. Rispetto reciproco">
        <p>
          Tratta gli altri utenti con educazione
          e rispetto, in chat, nelle recensioni
          e durante il passaggio condiviso. Non
          sono tollerati linguaggio offensivo,
          discriminazioni, molestie o
          comportamenti intimidatori.
        </p>
      </LegalSection>

      <LegalSection title="3. Onestà nelle informazioni">
        <p>
          Le informazioni che pubblichi (orario,
          posti disponibili, città di partenza,
          contributo spese) devono essere reali
          e aggiornate. Non pubblicare passaggi
          fittizi.
        </p>
      </LegalSection>

      <LegalSection title="4. Sicurezza">
        <p>
          Car2ne mette in contatto le persone,
          ma non è presente fisicamente al
          momento del passaggio: usa buon senso,
          condividi i dettagli del viaggio con
          qualcuno di fiducia e assicurati di
          conoscere i dettagli della persona con
          cui viaggi prima della partenza.
        </p>
      </LegalSection>

      <LegalSection title="5. Comunicazione">
        <p>
          Usa la chat interna per accordarti con
          conducente o passeggeri. Non è
          consentito utilizzare la chat per
          spam, pubblicità non richiesta o
          contenuti illegali.
        </p>
      </LegalSection>

      <LegalSection title="6. Recensioni">
        <p>
          Le recensioni devono riflettere
          onestamente la tua esperienza. Non
          sono ammesse recensioni false,
          offensive o pubblicate per ritorsione.
        </p>
      </LegalSection>

      <LegalSection title="7. Cosa non è consentito">
        <p>
          In particolare non sono ammessi:
          creare account falsi o multipli,
          offrire passaggi che non si intende
          realmente effettuare, comportamenti
          fraudolenti, pubblicità di servizi
          commerciali non legati allo scopo di
          Car2ne, contenuti illegali o lesivi di
          diritti di terzi.
        </p>
      </LegalSection>

      <LegalSection title="8. Conseguenze">
        <p>
          La violazione di queste linee guida o
          dei{" "}
          <Link
            href="/termini"
            className="font-semibold text-emerald-600 hover:text-emerald-700"
          >
            Termini e Condizioni
          </Link>{" "}
          può comportare la sospensione
          dell&apos;account.
        </p>
      </LegalSection>

      <LegalSection title="9. Segnalazioni">
        <p>
          Se assisti a un comportamento scorretto
          o hai un problema con un altro utente,
          usa la pagina{" "}
          <Link
            href="/segnala-un-problema"
            className="font-semibold text-emerald-600 hover:text-emerald-700"
          >
            Segnala un problema
          </Link>{" "}
          per farcelo sapere.
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
