/*
 * Cooldown import Ticketmaster: unica fonte per la soglia (5 minuti)
 * e per il calcolo del tempo residuo, condivisa tra l'endpoint
 * /api/admin/import/ticketmaster (enforcement reale) e la UI
 * /admin/import (visualizzazione preventiva del cooldown residuo).
 * L'enforcement resta e deve restare solo lato API: questo helper
 * non decide se un import è permesso, calcola solo "quanto manca".
 */
export const IMPORT_COOLDOWN_MS = 5 * 60 * 1000;

export function getCooldownRemainingMs(
  lastStartedAt: string | null,
  now: Date = new Date()
): number {
  if (!lastStartedAt) {
    return 0;
  }

  const elapsedMs = now.getTime() - new Date(lastStartedAt).getTime();

  return Math.max(0, IMPORT_COOLDOWN_MS - elapsedMs);
}
