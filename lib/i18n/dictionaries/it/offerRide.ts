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
  alreadyHasRide: {
    title: "Hai già un passaggio attivo",
    description:
      "Hai già pubblicato un passaggio per questo evento. Puoi modificarlo o eliminarlo dalla sezione I miei passaggi.",
    cta: "Vai ai miei passaggi",
  },
  eventInfo: {
    destination: "📍 Destinazione",
    eventDate: "📅 Data evento",
    note: "La venue e la data sono impostate automaticamente dall'evento.",
  },
  fields: {
    originCityLabel: "Città di partenza e di ritorno *",
    departureTimeLabel: "Ora di andata *",
    departureTimeHint: "Scegli l'orario in cui prevedi di partire verso l'evento.",
    returnTimeLabel: "Ora di ritorno *",
    returnTimeHint: "Scegli l'orario in cui prevedi di ripartire dall'evento.",
    seatsLabel: "Posti disponibili *",
    contributionLabel: "Contributo a passeggero (€) *",
    contributionHint:
      "Andata e ritorno ~{distance} km · ~{suggested} a passeggero, in linea con un carpooling · con {seats} posti il massimo è {max}",
    contributionHintNoDistance:
      "Quota per passeggero, andata e ritorno. Serve a dividere le spese, non a guadagnarci: massimo {max}.",
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
    loadEventsFailed:
      "Non è stato possibile caricare gli eventi. Ricarica la pagina e riprova.",
    publishFailed: "Non è stato possibile pubblicare il passaggio.",
    publishSuccess: "Passaggio pubblicato con successo!",
    contributionTooHigh:
      "Con questi posti e questa tratta, oltre {max} a passeggero il viaggio ti frutterebbe un guadagno. Car2ne serve a dividere le spese, non a guadagnarci.",
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
    title: "Contributo sopra la quota equa",
    body: "Per un viaggio di andata e ritorno di circa {distance} km, circa {suggested} a passeggero è già in linea con un carpooling. Puoi pubblicare lo stesso, ma oltre questa cifra il passaggio inizia a generare un guadagno: valuta di abbassare il contributo.",
  },
};
