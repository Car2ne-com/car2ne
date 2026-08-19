export const reports = {
  page: {
    title: "Segnala un problema",
    intro:
      "Se hai riscontrato un problema tecnico, un comportamento scorretto da parte di un altro utente, un contenuto inappropriato in chat o in una recensione, oppure qualsiasi altra difficoltà con Car2ne, segnalacelo e ti risponderemo il prima possibile.",
  },
  guestNotice: {
    title: "Cosa ci aiuta a risponderti prima",
    tips: [
      "Una descrizione chiara del problema",
      "Se riguarda un passaggio o un utente specifico: l'evento, la data e, se possibile, il nome dell'altro utente coinvolto",
      "Eventuali screenshot, se pertinenti",
    ],
    cta: "Scrivi a report@car2ne.com",
  },
  form: {
    categoryLabel: "Categoria *",
    categories: {
      user_behavior: "Comportamento di un utente",
      inappropriate_content: "Contenuto inappropriato",
      technical_issue: "Problema tecnico",
      safety: "Sicurezza",
      no_show: "Mancata presentazione",
      other: "Altro",
    },
    rideLabel: "Riguarda un passaggio specifico? (opzionale)",
    rideNone: "Nessuno / segnalazione generale",
    descriptionLabel: "Descrizione *",
    descriptionPlaceholder: "Descrivi cosa è successo...",
    submit: "Invia segnalazione",
    submitting: "Invio...",
  },
  toasts: {
    missingCategory: "Seleziona una categoria.",
    missingDescription: "Descrivi il problema.",
    submitFailed: "Non è stato possibile inviare la segnalazione.",
    submitSuccess: "Segnalazione inviata. Ti risponderemo il prima possibile.",
  },
  success: {
    title: "Segnalazione inviata",
    description:
      "Grazie per la segnalazione. Il nostro team la esaminerà e ti aggiorneremo tramite le notifiche.",
    another: "Invia un'altra segnalazione",
  },
  noShow: {
    button: "Segnala mancata presentazione",
    reported: "Mancata presentazione segnalata",
    dialogTitle: "Segnala mancata presentazione",
    dialogDescription:
      "Confermi che la controparte non si è presentata? Il nostro team esaminerà la segnalazione.",
    noteLabel: "Nota (facoltativa)",
    confirm: "Segnala",
    cancel: "Annulla",
    submitting: "Invio...",
    toastSuccess: "Segnalazione inviata. Grazie per averci avvisato.",
    toastFailed: "Non è stato possibile inviare la segnalazione.",
  },
};
