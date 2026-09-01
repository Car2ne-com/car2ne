import { getTranslations } from "@/lib/i18n";

export default async function OfferRideHeader() {
  const { dict } = await getTranslations();
  const t = dict.offerRide.header;

  return (
    <section className="mb-12">
      <h1 className="text-[2.5rem] leading-[1.05] font-medium tracking-tight text-foreground sm:text-5xl">
        {t.title}
      </h1>

      <p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">
        {t.subtitle}
      </p>
    </section>
  );
}