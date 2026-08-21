export const offerRide = {
  header: {
    badge: "Offri un passaggio",
    title: "Condividi il tuo viaggio",
    subtitle:
      "Hai dei posti liberi in auto? Pubblica il tuo viaggio e permetti ad altri partecipanti di raggiungere l'evento con te, dividendo le spese.",
  },
  loginNotice:
    "Puoi compilare il form liberamente: i dati non andranno persi, ti chiederemo di accedere solo al momento di pubblicare il passaggio.",
  eventLabel: "Evento *",
  eventCombobox: {
    loading: "Caricamento eventi...",
    placeholder: "Seleziona un evento",
    searchPlaceholder: "Cerca per titolo, artista o città...",
    noResults: "Nessun evento trovato.",
    moreResults: "Altri {count} risultati, affina la ricerca.",
  },
  direction: {
    label: "Direzione *",
    outbound: "🚗 Andata",
    outboundHint: "Parti da una città verso l'evento.",
    return: "🔁 Ritorno",
    returnHint: "Parti dall'evento verso una città.",
  },
  alreadyHasRide: {
    title: "Hai già un passaggio attivo",
    description:
      "Hai già pubblicato un passaggio con questa direzione per questo evento. Puoi modificarlo o eliminarlo dalla sezione I miei passaggi.",
    cta: "Vai ai miei passaggi",
  },
  eventInfo: {
    destination: "📍 Destinazione",
    origin: "📍 Partenza",
    eventDate: "📅 Data evento",
    note: "La venue e la data sono impostate automaticamente dall'evento.",
  },
  fields: {
    originCityLabel: "Città di partenza *",
    destinationCityLabel: "Città di destinazione *",
    departureTimeLabel: "Ora di partenza *",
    departureTimeHint: "Scegli l'orario in cui prevedi di partire.",
    seatsLabel: "Posti disponibili *",
    contributionLabel: "Contributo (€) *",
    descriptionLabel: "Descrizione",
    descriptionPlaceholder: "Aggiungi informazioni utili per i passeggeri...",
  },
  submit: {
    publishing: "Pubblicazione...",
    publish: "Pubblica passaggio",
  },
  toasts: {
    selectDepartureCity: "Seleziona una città dai suggerimenti.",
    fillRequiredFields: "Compila tutti i campi obbligatori.",
    selectValidEvent: "Seleziona un evento valido.",
    checkExistingRideFailed:
      "Non è stato possibile verificare i tuoi passaggi. Riprova.",
    publishFailed: "Non è stato possibile pubblicare il passaggio.",
    publishSuccess: "Passaggio pubblicato con successo!",
  },
  cityCombobox: {
    changeCityAriaLabel: "Cambia città",
    searching: "Ricerca in corso...",
    searchFailed: "Ricerca non riuscita. Riprova.",
    noCityFound: "Nessun comune trovato.",
    minCharsHint: "Scrivi almeno {count} caratteri per cercare.",
    selectSuggestion: "Seleziona un comune dai suggerimenti.",
    placeholder: "Cerca un comune...",
  },
  fairPrice: {
    title: "Contributo più alto della media",
    body: "Per una tratta di circa {distance} km il contributo indicativo per condividere le spese è fino a circa {threshold} €. Car2ne è pensato per dividere i costi del viaggio, non per generare profitto: puoi comunque pubblicare, ma valuta di abbassare il contributo.",
  },
};
