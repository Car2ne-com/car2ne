export const email = {
  verifyEmail: {
    subject: "Il tuo codice di verifica Car2ne",
    heading: "Verifica la tua email",
    body:
      "Ciao {name},\n\ngrazie per esserti registrato su Car2ne! Usa il codice qui sotto per verificare il tuo indirizzo email. Il codice è valido per 10 minuti.\n\nSe non hai creato tu questo account, ignora pure questa email.",
  },
  mfaEnabled: {
    subject: "Autenticazione a due fattori attivata",
    heading: "Autenticazione a due fattori attivata",
    body:
      "Ciao {name},\n\nl'autenticazione a due fattori è stata attivata sul tuo account Car2ne. D'ora in poi, oltre alla password, ti verrà richiesto un codice generato dalla tua app di autenticazione per accedere.\n\nSe non sei stato tu ad attivarla, contattaci immediatamente.",
    ctaLabel: "Vai al tuo profilo",
  },
  mfaDisabled: {
    subject: "Autenticazione a due fattori disattivata",
    heading: "Autenticazione a due fattori disattivata",
    body:
      "Ciao {name},\n\nl'autenticazione a due fattori è stata disattivata sul tuo account Car2ne. D'ora in poi basterà la password per accedere.\n\nSe non sei stato tu a disattivarla, contattaci immediatamente.",
    ctaLabel: "Vai al tuo profilo",
  },
  accountDeleted: {
    subject: "Il tuo account Car2ne è stato eliminato",
    heading: "Account eliminato",
    body:
      "Ciao {name},\n\nti confermiamo che il tuo account Car2ne è stato eliminato su tua richiesta. I tuoi dati personali sono stati rimossi e non potrai più accedere con questo account.\n\nSe non sei stato tu a richiederlo, contattaci immediatamente.",
    ctaLabel: "",
  },
};
