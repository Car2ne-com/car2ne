export function buildPaypalMeLink(username: string, amount: number): string {
  return `https://paypal.me/${encodeURIComponent(username)}/${amount.toFixed(2)}EUR`;
}
