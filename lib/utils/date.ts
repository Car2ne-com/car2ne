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
