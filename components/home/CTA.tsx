import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CTA() {
  return (
    <section className="bg-gradient-to-r from-emerald-600 to-emerald-500 py-24">
      <div className="mx-auto max-w-5xl px-6 text-center">

        <h2 className="text-5xl font-bold text-white">
          Pronto per il tuo prossimo evento?
        </h2>

        <p className="mx-auto mt-6 max-w-2xl text-xl text-emerald-100">
          Trova un passaggio oppure aiutane altri condividendo il tuo viaggio.
        </p>

        <div className="mt-10 flex justify-center gap-4">

          <Link
            href="/events"
            className="rounded-xl bg-white px-8 py-4 font-semibold text-emerald-600 transition hover:scale-105"
          >
            Cerca un passaggio
          </Link>

          <Link
            href="/offer-ride"
            className="flex items-center gap-2 rounded-xl border border-white px-8 py-4 font-semibold text-white transition hover:bg-white/10"
          >
            Offri un passaggio
            <ArrowRight size={18} />
          </Link>

        </div>

      </div>
    </section>
  );
}