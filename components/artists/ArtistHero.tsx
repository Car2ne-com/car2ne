import { Music2 } from "lucide-react";

type ArtistHeroDict = {
  badge: string;
  withEventsSingular: string;
  withEventsPlural: string;
  noEvents: string;
};

type Props = {
  artistName: string;
  eventCount: number;
  dict: ArtistHeroDict;
};

export default function ArtistHero({
  artistName,
  eventCount,
  dict,
}: Props) {
  const description =
    eventCount > 0
      ? (eventCount === 1 ? dict.withEventsSingular : dict.withEventsPlural).replace(
          "{count}",
          String(eventCount)
        )
      : dict.noEvents.replace("{artist}", artistName);

  return (
    <section className="mb-16">
      <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
        <Music2 className="h-4 w-4" />
        {dict.badge}
      </span>

      <h1 className="mt-6 text-5xl font-black tracking-tight text-slate-900 md:text-6xl">
        {artistName}
      </h1>

      <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
        {description}
      </p>
    </section>
  );
}
