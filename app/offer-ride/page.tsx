import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

import OfferRideHeader from "@/components/offerRide/OfferRideHeader";
import OfferRideForm from "@/components/offerRide/OfferRideForm";

export default function OfferRidePage() {
  return (
    <>
      <Navbar />

      <main className="mx-auto max-w-5xl px-6 pt-40 pb-24">
        <OfferRideHeader />

        <OfferRideForm />
      </main>

      <Footer />
    </>
  );
}