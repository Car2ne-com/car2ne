import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

import OfferRideHeader from "@/components/offerRide/OfferRideHeader";
import OfferRideForm from "@/components/offerRide/OfferRideForm";

import { getTranslations } from "@/lib/i18n";

type Props = {
  searchParams: Promise<{
    eventId?: string;
    direction?: string;
  }>;
};

export default async function OfferRidePage({
  searchParams,
}: Props) {
  const params = await searchParams;

  const { locale, dict } = await getTranslations();

  return (
    <>
      <Navbar />

      <main className="mx-auto max-w-5xl px-6 pt-40 pb-24">
        <OfferRideHeader />

        <OfferRideForm
          locale={locale}
          dict={dict.offerRide}
          initialEventId={params.eventId ?? ""}
          initialDirection={params.direction ?? ""}
        />
      </main>

      <Footer />
    </>
  );
}