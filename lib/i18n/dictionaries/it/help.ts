export const help = {
  meta: {
    title: "Aiuto e FAQ | Car2ne",
    description:
      "Come funziona Car2ne, come offrire o prenotare un passaggio e le risposte alle domande più frequenti.",
  },
  hero: {
    title: "Come possiamo aiutarti?",
    subtitle:
      "Come funziona Car2ne e le risposte alle domande più frequenti. Se non trovi quello che cerchi, scrivici.",
  },
  guide: {
    title: "In breve",
    steps: [
      {
        title: "Trova un evento",
        description:
          "Cerca il tuo evento dalla home o dalla pagina Eventi. Se non c'è, segnalacelo con il link della pagina ufficiale.",
      },
      {
        title: "Offri o prenota un passaggio",
        description:
          "Come conducente pubblichi orari, posti e contributo spese. Come passeggero invii una richiesta di andata e ritorno che il conducente deve confermare.",
      },
      {
        title: "Mettetevi d'accordo e partite",
        description:
          "A prenotazione confermata si apre la chat: vi accordate su punto di ritrovo e pagamento del contributo. Dopo l'evento potete lasciarvi una recensione.",
      },
    ],
  },
  faq: {
    title: "Domande frequenti",
    categories: [
      {
        id: "generale",
        title: "Generale",
        items: [
          {
            q: "Car2ne è gratuito?",
            a: "Sì. Non ci sono costi di iscrizione né commissioni. L'unico denaro che gira è il contributo spese che il passeggero versa direttamente al conducente.",
          },
          {
            q: "Car2ne trattiene una percentuale sul viaggio?",
            a: "No. Car2ne non gestisce né elabora alcun pagamento: il denaro passa direttamente tra passeggero e conducente. I link di pagamento nel profilo sono solo una comodità.",
          },
          {
            q: "Chi può usare Car2ne?",
            a: "Chiunque abbia almeno 18 anni. La data di nascita viene chiesta in fase di registrazione solo per verificare questo requisito.",
          },
          {
            q: "In che città è disponibile?",
            a: "Car2ne copre eventi in tutta Italia. Puoi cercare sia per città di partenza sia per città dell'evento.",
          },
          {
            q: "Posso usare Car2ne in inglese?",
            a: "Sì, il sito è bilingue italiano/inglese. Cambia lingua dal selettore in alto: anche le email seguiranno la lingua scelta.",
          },
        ],
      },
      {
        id: "account",
        title: "Account",
        items: [
          {
            q: "Come mi registro?",
            a: "Con email e password oppure con Google. In entrambi i casi devi indicare la data di nascita (18+) e accettare Termini e Privacy Policy.",
          },
          {
            q: "Non ho ricevuto il codice di verifica email.",
            a: "Controlla la cartella spam. Puoi richiedere un nuovo codice dalla pagina di verifica dopo qualche secondo di attesa.",
          },
          {
            q: "Ho dimenticato la password.",
            a: "Vai su \"Password dimenticata\", inserisci la tua email e riceverai un codice per impostarne una nuova.",
          },
          {
            q: "Mi sono registrato con Google, posso avere anche una password?",
            a: "Sì. Dal profilo, sezione Password, puoi impostare una password per l'accesso via email.",
          },
          {
            q: "Posso cambiare nome, cognome o email?",
            a: "Non dalla pagina profilo. Scrivi a report@car2ne.com se hai bisogno di correggerli.",
          },
          {
            q: "Come elimino il mio account?",
            a: "Dal profilo, sezione \"Elimina account\": scrivi ELIMINA per confermare. I tuoi dati personali vengono anonimizzati, mentre passaggi e recensioni restano visibili in forma anonima. L'operazione è irreversibile.",
          },
        ],
      },
      {
        id: "eventi",
        title: "Eventi",
        items: [
          {
            q: "Non trovo il mio evento.",
            a: "Usa \"Segnala un evento\" e incolla il link della pagina ufficiale. Se il team lo approva, l'evento entra nel catalogo. Serve essere registrati.",
          },
          {
            q: "L'evento è passato, posso ancora fare qualcosa?",
            a: "Non puoi più cercare o offrire passaggi, ma puoi lasciare una recensione a chi ha viaggiato con te.",
          },
          {
            q: "Come faccio a sapere se qualcuno pubblica un passaggio per un evento?",
            a: "Apri l'evento e premi \"Avvisami quando c'è un passaggio\". Riceverai una notifica appena viene pubblicato un passaggio. Gli eventi seguiti sono nella dashboard.",
          },
        ],
      },
      {
        id: "offrire",
        title: "Offrire un passaggio",
        items: [
          {
            q: "Devo essere registrato per compilare il form?",
            a: "No, puoi compilarlo liberamente. L'accesso viene chiesto solo al momento di pubblicare e i dati non vengono persi.",
          },
          {
            q: "Quanto posso chiedere di contributo?",
            a: "Una cifra in linea con la divisione delle spese (carburante e pedaggi) per andata e ritorno. Il sistema suggerisce un importo in base alla distanza e blocca la pubblicazione se il contributo diventa un guadagno.",
          },
          {
            q: "Posso pubblicare più passaggi per lo stesso evento?",
            a: "No, uno solo per evento. Puoi modificarlo o eliminarlo da \"I miei passaggi\".",
          },
          {
            q: "Posso modificare un passaggio già pubblicato?",
            a: "Sì: città di partenza, orari, posti, contributo e descrizione. Non puoi cambiare evento, destinazione e data.",
          },
          {
            q: "Devo accettare io i passeggeri?",
            a: "Sì. Ogni richiesta di prenotazione va confermata o rifiutata da te. Ricevi una notifica quando arriva una richiesta.",
          },
          {
            q: "Cosa succede se annullo il passaggio?",
            a: "Serve una doppia conferma. Tutti i passeggeri con richiesta o prenotazione ricevono notifica ed email.",
          },
          {
            q: "Devo essere un \"conducente verificato\" per offrire passaggi?",
            a: "No, la verifica è facoltativa: serve solo a mostrare un badge di fiducia sul profilo e sui passaggi.",
          },
        ],
      },
      {
        id: "prenotare",
        title: "Prenotare un passaggio",
        items: [
          {
            q: "Come prenoto?",
            a: "Apri l'evento, scegli un passaggio e premi \"Richiedi andata e ritorno\". Il conducente deve confermare la tua richiesta.",
          },
          {
            q: "Posso prenotare solo l'andata o solo il ritorno?",
            a: "No, i passaggi su Car2ne sono sempre andata e ritorno.",
          },
          {
            q: "La mia richiesta è stata rifiutata.",
            a: "Puoi inviarne una nuova con \"Richiedi nuovamente\" oppure cercare un altro passaggio.",
          },
          {
            q: "Come pago il conducente?",
            a: "Dalla sezione \"Le mie prenotazioni\", con i pulsanti PayPal / Revolut / Satispay se il conducente li ha impostati, oppure in contanti di persona. Il pagamento è sempre diretto tra te e il conducente.",
          },
          {
            q: "Ho prenotato ma non posso più andare.",
            a: "Annulla la prenotazione da \"Le mie prenotazioni\": il posto torna disponibile per gli altri.",
          },
          {
            q: "Il conducente ha annullato il passaggio.",
            a: "Ricevi notifica ed email. La prenotazione risulta annullata nella tua dashboard e puoi cercare un altro passaggio.",
          },
        ],
      },
      {
        id: "chat-notifiche",
        title: "Chat e notifiche",
        items: [
          {
            q: "Non riesco a scrivere all'altra persona.",
            a: "La chat si attiva solo dopo che la prenotazione è stata confermata. Se era attiva e ora è chiusa, può essere perché la prenotazione è stata annullata, l'evento è passato o c'è stato un blocco tra utenti.",
          },
          {
            q: "Dove trovo le mie conversazioni?",
            a: "Nella pagina \"Chat\" o nel widget di chat flottante presente in ogni pagina.",
          },
          {
            q: "Non ricevo le email.",
            a: "Controlla lo spam. Le email arrivano nella lingua impostata sul sito. Se il problema persiste, segnalalo a report@car2ne.com.",
          },
          {
            q: "Come attivo le notifiche push?",
            a: "Dal profilo o dal prompt dedicato. Se le hai bloccate nel browser, riattivale dalle impostazioni del browser per il sito Car2ne.",
          },
        ],
      },
      {
        id: "sicurezza-privacy",
        title: "Sicurezza e privacy",
        items: [
          {
            q: "Car2ne garantisce chi guida o le condizioni dell'auto?",
            a: "No. Car2ne mette in contatto le persone ma non è presente durante il viaggio. Il badge \"conducente verificato\" attesta solo che i documenti inviati sono stati controllati e risultano coerenti.",
          },
          {
            q: "Ho avuto un problema con un altro utente.",
            a: "Usa \"Segnala un problema\" o scrivi a report@car2ne.com. Puoi anche bloccare l'utente dal suo profilo pubblico.",
          },
          {
            q: "L'altra persona non si è presentata.",
            a: "Usa \"Segnala mancata presentazione\" dal passaggio o dalla prenotazione. Il team esamina la segnalazione.",
          },
          {
            q: "Car2ne usa cookie di tracciamento?",
            a: "No, solo cookie tecnici necessari al funzionamento. Nessuna profilazione, pubblicità o statistica di terze parti.",
          },
          {
            q: "Come esercito i miei diritti sui dati personali?",
            a: "Scrivi a privacy@car2ne.com per accesso, rettifica, cancellazione, opposizione o portabilità dei dati.",
          },
        ],
      },
    ],
  },
  assistant: {
    title: "Assistente Car2ne",
    subtitle:
      "Scrivi la tua domanda: cerchiamo tra le domande frequenti e ti mostriamo le risposte più pertinenti.",
    disclaimer:
      "Questo assistente cerca tra le FAQ qui sopra, non è un'intelligenza artificiale. Per casi specifici sul tuo account scrivi a report@car2ne.com.",
    greeting:
      "Ciao! Scrivi una domanda su Car2ne (passaggi, prenotazioni, pagamenti, recensioni, verifica conducente...) e ti mostro le risposte che corrispondono meglio.",
    inputPlaceholder: "Scrivi la tua domanda...",
    sendLabel: "Cerca",
    resultsIntro: "Ecco cosa ho trovato:",
    noResults:
      "Non ho trovato una risposta a questa domanda. Prova a riformularla con parole diverse, oppure scrivi a report@car2ne.com.",
    suggestionsTitle: "Prova a chiedere:",
    suggestions: [
      "Come prenoto un passaggio?",
      "Quanto posso chiedere di contributo spese?",
      "Come funziona la verifica conducente?",
      "Come elimino il mio account?",
    ],
  },
  contact: {
    title: "Non hai trovato la risposta?",
    description:
      "Scrivici: ti risponderemo il prima possibile e ti aggiorneremo tramite le notifiche.",
    reportCta: "Segnala un problema",
    reportEmailLabel: "Assistenza e segnalazioni",
    reportEmail: "report@car2ne.com",
    privacyEmailLabel: "Privacy e dati personali",
    privacyEmail: "privacy@car2ne.com",
  },
};
