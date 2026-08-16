/*
 * Un evento è "concluso" dalle 9:00 UTC del giorno successivo alla
 * sua data — stesso momento in cui parte il promemoria di
 * recensione (0002_review_reminders.sql), non appena scocca
 * l'orario dell'evento. Dà margine per chi deve ancora coordinarsi
 * per il rientro.
 */
export function isEventConcluded(
  eventDate: string,
  now: Date = new Date()
): boolean {
  const eventDay = new Date(eventDate);

  const cutoff = new Date(
    Date.UTC(
      eventDay.getUTCFullYear(),
      eventDay.getUTCMonth(),
      eventDay.getUTCDate() + 1,
      9,
      0,
      0
    )
  );

  return now >= cutoff;
}
