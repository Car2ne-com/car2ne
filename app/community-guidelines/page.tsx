import Link from "next/link";

import LegalPageLayout, {
  LegalSection,
} from "@/components/legal/LegalPageLayout";

import { getLocale } from "@/lib/i18n";

export default async function CommunityGuidelinesPage() {
  const locale = await getLocale();

  if (locale === "en") {
    return (
      <LegalPageLayout
        title="Community Guidelines"
        updatedAt="September 1, 2026"
      >
        <LegalSection title="1. Our goal">
          <p>
            Car2ne exists to help people reach the same
            event together, safely, affordably and
            enjoyably. These guidelines explain how to
            behave on the platform.
          </p>
        </LegalSection>

        <LegalSection title="2. Mutual respect">
          <p>
            Treat other users politely and respectfully,
            in chat, in reviews and during the shared
            ride. Offensive language, discrimination,
            harassment or intimidating behavior are not
            tolerated.
          </p>
        </LegalSection>

        <LegalSection title="3. Honesty in information">
          <p>
            The information you publish (time, available
            seats, departure city, cost contribution)
            must be real and up to date. Do not post
            fake rides.
          </p>
        </LegalSection>

        <LegalSection title="4. Safety">
          <p>
            Car2ne connects people, but is not
            physically present during the ride: use
            common sense, share your trip details with
            someone you trust, and make sure you know
            the details of the person you&apos;re
            traveling with before departure.
          </p>
        </LegalSection>

        <LegalSection title="5. Communication">
          <p>
            Use the internal chat to arrange details
            with the driver or passengers. It is not
            allowed to use chat for spam, unsolicited
            advertising or illegal content.
          </p>
        </LegalSection>

        <LegalSection title="6. Reviews">
          <p>
            Reviews must honestly reflect your
            experience. False, offensive or retaliatory
            reviews are not allowed.
          </p>
        </LegalSection>

        <LegalSection title="7. What is not allowed">
          <p>
            In particular, the following are not
            allowed: creating fake or multiple accounts,
            offering rides you don&apos;t actually
            intend to carry out, fraudulent behavior,
            advertising commercial services unrelated to
            Car2ne&apos;s purpose, illegal content or
            content that infringes third-party rights.
          </p>
        </LegalSection>

        <LegalSection title="8. Consequences">
          <p>
            Violating these guidelines or the{" "}
            <Link
              href="/termini"
              className="font-semibold text-primary hover:text-primary/80"
            >
              Terms and Conditions
            </Link>{" "}
            may result in account suspension.
          </p>
        </LegalSection>

        <LegalSection title="9. Reports and blocking">
          <p>
            If you witness inappropriate behavior or
            have a problem with another user, use the{" "}
            <Link
              href="/segnala-un-problema"
              className="font-semibold text-primary hover:text-primary/80"
            >
              Report a problem
            </Link>{" "}
            page to let us know. You can also block a
            user directly from their profile at any
            time, without needing to report them first:
            once blocked, you will no longer be able to
            message each other or make new bookings
            together.
          </p>
        </LegalSection>
      </LegalPageLayout>
    );
  }

  return (
    <LegalPageLayout
      title="Community Guidelines"
      updatedAt="1 settembre 2026"
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
            className="font-semibold text-primary hover:text-primary/80"
          >
            Termini e Condizioni
          </Link>{" "}
          può comportare la sospensione
          dell&apos;account.
        </p>
      </LegalSection>

      <LegalSection title="9. Segnalazioni e blocco utenti">
        <p>
          Se assisti a un comportamento scorretto
          o hai un problema con un altro utente,
          usa la pagina{" "}
          <Link
            href="/segnala-un-problema"
            className="font-semibold text-primary hover:text-primary/80"
          >
            Segnala un problema
          </Link>{" "}
          per farcelo sapere. Puoi anche bloccare
          un utente direttamente dal suo profilo
          in qualsiasi momento, senza dover prima
          segnalarlo: una volta bloccato, non
          potrete più scambiarvi messaggi né
          effettuare nuove prenotazioni insieme.
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
