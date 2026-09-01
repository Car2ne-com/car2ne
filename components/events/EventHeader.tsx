import { getTranslations } from "@/lib/i18n";

export default async function EventHeader() {
  const { dict } = await getTranslations();
  const t = dict.events.header;

  return (
    <section className="mb-16">

      <h1 className="text-[2.5rem] leading-[1.05] font-medium tracking-tight text-foreground sm:text-5xl md:text-6xl">
        {t.title}
      </h1>

      <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
        {t.subtitle}
      </p>

    </section>
  );
}