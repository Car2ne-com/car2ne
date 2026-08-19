export const driverVerification = {
  page: {
    title: "Verifica conducente",
    subtitle:
      "Verifica la tua identità e il tuo veicolo per ottenere il badge \"Conducente verificato\" e aumentare la fiducia degli altri utenti.",
  },
  status: {
    pending: "In revisione",
    approved: "Verificato",
    rejected: "Rifiutato",
    expired: "Scaduta",
    pendingDescription:
      "La tua richiesta è in attesa di revisione da parte del nostro team.",
    approvedDescription:
      "Sei un conducente verificato! Il badge è visibile sul tuo profilo e sui tuoi passaggi.",
    rejectedDescription: "La tua richiesta non è stata approvata.",
    expiredDescription:
      "La richiesta precedente non è stata revisionata in tempo. Puoi inviarne una nuova.",
    adminNoteLabel: "Motivazione",
  },
  form: {
    vehicleMakeLabel: "Marca veicolo *",
    vehicleModelLabel: "Modello veicolo *",
    vehiclePlateLabel: "Targa *",
    licenseNumberLabel: "Numero patente *",
    documentLabel: "Documento (patente o carta d'identità)",
    documentHint:
      "JPG, PNG o PDF · massimo 5 MB. Il documento viene cancellato subito dopo la revisione.",
    submit: "Invia richiesta",
    submitting: "Invio...",
    resubmit: "Invia una nuova richiesta",
  },
  toasts: {
    missingFields: "Compila tutti i campi obbligatori.",
    missingDocument: "Carica un documento.",
    fileTooLarge: "Il file non può superare 5 MB.",
    unsupportedFile: "Formato non supportato. Usa JPG, PNG o PDF.",
    submitFailed: "Non è stato possibile inviare la richiesta.",
    submitSuccess: "Richiesta inviata! Ti avviseremo appena revisionata.",
  },
  badge: "Conducente verificato",
  dashboardCard: {
    title: "Diventa conducente verificato",
    description:
      "Verifica la tua identità e il tuo veicolo per ottenere il badge di fiducia sul tuo profilo.",
    cta: "Verifica ora",
    ctaPending: "In revisione",
    ctaVerified: "Conducente verificato",
  },
};
