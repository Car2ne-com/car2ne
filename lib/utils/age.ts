export const MINIMUM_AGE = 18;

export function calculateAge(
  birthDateStr: string
): number | null {
  if (!birthDateStr) {
    return null;
  }

  const parsed = new Date(birthDateStr);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  const today = new Date();

  let age =
    today.getFullYear() -
    parsed.getFullYear();

  const monthDiff =
    today.getMonth() - parsed.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 &&
      today.getDate() < parsed.getDate())
  ) {
    age--;
  }

  return age;
}
