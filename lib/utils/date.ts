export function isPastDateTime(
  date: string,
  time: string
): boolean {
  return (
    new Date(`${date}T${time}`).getTime() <
    Date.now()
  );
}

export function getCurrentYear(): number {
  return new Date().getFullYear();
}

const ROME_DAY_FORMATTER = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Rome",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/*
 * Data (YYYY-MM-DD) nel fuso Europe/Rome, indipendente dal fuso del
 * server. Usato per bucketing giornaliero (dashboard admin, analytics).
 */
export function romeDay(date: Date): string {
  return ROME_DAY_FORMATTER.format(date);
}
