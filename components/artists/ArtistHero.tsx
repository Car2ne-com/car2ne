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
      <h1 className="text-[2.5rem] leading-[1.05] font-medium tracking-tight text-foreground sm:text-5xl md:text-6xl">
        {artistName}
      </h1>

      <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
        {description}
      </p>
    </section>
  );
}
