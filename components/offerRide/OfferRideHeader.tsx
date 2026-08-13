import { CarFront } from "lucide-react";

export default function OfferRideHeader() {
  return (
    <section className="mb-12">
      <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
        <CarFront className="h-4 w-4" />
        Offri un passaggio
      </span>

      <h1 className="mt-6 text-5xl font-black tracking-tight text-slate-900">
        Condividi il tuo viaggio
      </h1>

      <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
        Hai dei posti liberi in auto? Pubblica il tuo viaggio e permetti ad
        altri partecipanti di raggiungere l&apos;evento con te, dividendo le spese.
      </p>
    </section>
  );
}