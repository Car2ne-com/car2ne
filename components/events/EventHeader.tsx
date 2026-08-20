import { getTranslations } from "@/lib/i18n";

export default async function EventHeader() {
  const { dict } = await getTranslations();
  const t = dict.events.header;

  return (
    <section className="mb-16">

      <span className="inline-flex items-center rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground">
        {t.badge}
      </span>

      <h1 className="mt-6 text-5xl font-black tracking-tight text-foreground md:text-6xl">
        {t.title}
      </h1>

      <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
        {t.subtitle}
      </p>

    </section>
  );
}