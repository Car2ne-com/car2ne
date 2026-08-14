import { Music2 } from "lucide-react";

type Props = {
  artistName: string;
  eventCount: number;
};

export default function ArtistHero({
  artistName,
  eventCount,
}: Props) {
  return (
    <section className="mb-16">
      <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
        <Music2 className="h-4 w-4" />
        Artista
      </span>

      <h1 className="mt-6 text-5xl font-black tracking-tight text-slate-900 md:text-6xl">
        {artistName}
      </h1>

      <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
        {eventCount > 0
          ? `${eventCount} ${eventCount === 1 ? "data in programma" : "date in programma"}. Trova un passaggio o condividi il viaggio con altri partecipanti.`
          : `Nessuna data in programma al momento per ${artistName}.`}
      </p>
    </section>
  );
}
