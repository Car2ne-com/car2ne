import { getTranslations } from "@/lib/i18n";

export default async function OfferRideHeader() {
  const { dict } = await getTranslations();
  const t = dict.offerRide.header;

  return (
    <section className="mb-12">
      <h1 className="mt-6 text-5xl font-medium tracking-tight text-foreground">
        {t.title}
      </h1>

      <p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">
        {t.subtitle}
      </p>
    </section>
  );
}