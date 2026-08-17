import LegalPageLayout, {
  LegalSection,
} from "@/components/legal/LegalPageLayout";

export default function PrivacyPolicyPage() {
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
