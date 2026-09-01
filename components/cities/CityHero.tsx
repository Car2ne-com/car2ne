import type { City } from "@/types/city";

type HeroDict = {
  badge: string;
  title: string;
  withEventsSingular: string;
  withEventsPlural: string;
  noEvents: string;
};

type Props = {
  city: City;
  eventCount: number;
  dict: HeroDict;
};

export default function CityHero({ city, eventCount, dict }: Props) {
  const description =
    eventCount > 0
      ? (eventCount === 1 ? dict.withEventsSingular : dict.withEventsPlural)
          .replace("{count}", String(eventCount))
          .replace("{city}", city.name)
      : dict.noEvents.replace("{city}", city.name);

  return (
    <section className="mb-16">
      <h1 className="mt-6 text-5xl font-medium tracking-tight text-foreground md:text-6xl">
        {dict.title.replace("{city}", city.name)}
      </h1>

      <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
        {description}
      </p>
    </section>
  );
}
