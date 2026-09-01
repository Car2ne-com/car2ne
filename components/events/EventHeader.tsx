import { getTranslations } from "@/lib/i18n";

export default async function EventHeader() {
  const { dict } = await getTranslations();
  const t = dict.events.header;

  return (
    <section className="mb-16">

      <h1 className="mt-6 text-5xl font-medium tracking-tight text-foreground md:text-6xl">
        {t.title}
      </h1>

      <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
        {t.subtitle}
      </p>

    </section>
  );
}