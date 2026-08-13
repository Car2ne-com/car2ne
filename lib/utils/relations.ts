/**
 * Le relazioni Supabase generate da un `select` con join possono
 * arrivare come array o come oggetto singolo a seconda del client
 * e della cardinalità della relazione. Questo helper normalizza
 * sempre al singolo oggetto (o null).
 */
export function toOne<T>(
  value: T | T[] | null | undefined
): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}
