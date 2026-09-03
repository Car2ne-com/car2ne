export const events = {
  meta: {
    index: {
      title: "Eventi | Car2ne",
      description:
        "Concerti, festival, sport e fiere in tutta Italia: trova un passaggio o condividi il tuo viaggio con Car2ne.",
    },
    detail: {
      title: "{title} | Car2ne",
      description:
        "{artist} — {venue}, {city}. Trova un passaggio per raggiungere l'evento o condividi il tuo viaggio con Car2ne.",
    },
  },
  header: {
    badge: "🎫 Tutti gli eventi",
    title: "Trova il tuo prossimo evento",
    subtitle:
      "Concerti, festival, sport, fiere e spettacoli. Trova un passaggio oppure condividi il viaggio con altri partecipanti.",
  },
  search: {
    placeholder: "Cerca un evento, una città o una location...",
  },
  filters: {
    cityAriaLabel: "Filtra per città",
    allCities: "Tutte le città",
    venueAriaLabel: "Filtra per venue",
    allVenues: "Tutti i venue",
    departureBadge: "📍 Partenza cercata",
    departureSearching: "Stai cercando passaggi con partenza da",
    resultsCount: "{count} eventi trovati",
    previous: "Precedente",
    next: "Successivo",
    pageIndicator: "Pagina {page} di {total}",
  },
  card: {
    ridesSingular: "passaggio",
    ridesPlural: "passaggi",
    viewEvent: "Vedi evento",
  },
  empty: {
    title: "Nessun evento trovato",
    description: "Prova a modificare la ricerca.",
    suggestCta: "Non lo trovi? Segnalacelo",
  },
  concluded: {
    badge: "Evento concluso",
    description:
      "Questo evento si è già svolto, quindi non è più possibile cercare o offrire passaggi. Trova il tuo prossimo evento qui sotto.",
    browseEvents: "Sfoglia gli eventi",
    leaveReviewButton: "Lascia una recensione",
  },
  rides: {
    badge: "🚗 Passaggi disponibili",
    title: "Scegli il tuo viaggio",
    subtitle: "Unisciti ad altri partecipanti e condividi andata e ritorno.",
    emptyTitle: "Nessun passaggio disponibile",
    emptyDescription: "Sii il primo a offrirne uno.",
    emptyCta: "Offri un passaggio",
    demandSingular: "{count} persona segue questo evento e aspetta un passaggio",
    demandPlural: "{count} persone seguono questo evento e aspettano un passaggio",
    driverFallback: "Conducente",
    driverLabel: "Conducente",
    driverVerifiedBadge: "Verificato",
    outboundLabel: "🚗 Andata",
    returnLabel: "🔁 Ritorno",
    seatsLabel: "posti disponibili",
    statusPendingBanner: "⏳ Richiesta in attesa di conferma del conducente.",
    statusConfirmedBanner: "✓ Il conducente ha confermato il tuo posto.",
    statusRejectedBanner: "La richiesta precedente è stata rifiutata.",
    buttonSending: "Invio richiesta...",
    buttonYourRide: "Il tuo passaggio",
    buttonRequestSent: "Richiesta inviata",
    buttonConfirmed: "Posto confermato",
    buttonRequestAgain: "Richiedi nuovamente",
    buttonRequestSeat: "Richiedi andata e ritorno",
    errorOwnRide: "Non puoi richiedere un posto sul tuo stesso passaggio.",
    successRequestSent:
      "Richiesta inviata! Il conducente dovrà confermare il tuo posto.",
    mapToggleShow: "Mostra il punto di ritrovo",
    mapToggleHide: "Nascondi la mappa",
    mapOriginLabel: "Punto di ritrovo",
    mapVenueLabel: "Luogo dell'evento",
    safetyNote:
      "Prima di prenotare: concorda un punto d'incontro pubblico e controlla il profilo e le recensioni del conducente.",
    safetyNoteLink: "Consigli di sicurezza",
  },
  share: {
    button: "Condividi",
    message: "{title} — trova un passaggio o offrine uno su Car2ne",
    rideButton: "Condividi il passaggio",
    rideMessage:
      "Guido a {title} e ho posti liberi — prenota il tuo su Car2ne",
  },
  watchlist: {
    notifyMe: "Avvisami quando c'è un passaggio",
    stopNotifying: "Non avvisarmi più",
    watchingBadge: "In attesa di un passaggio",
    toastAdded: "Ti avviseremo appena qualcuno offre un passaggio per questo evento.",
    toastRemoved: "Non riceverai più avvisi per questo evento.",
    toastError: "Non è stato possibile completare l'operazione. Riprova.",
  },
};
