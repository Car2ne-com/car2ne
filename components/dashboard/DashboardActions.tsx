import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CarFront,
  Search,
  User,
} from "lucide-react";

type Dict = {
  title: string;
  description: string;
  cta: string;
  ctaPending: string;
  ctaVerified: string;
};

type Props = {
  dict: Dict;
  verificationStatus: string | null;
};

export default function DashboardActions({
  dict,
  verificationStatus,
}: Props) {
  return (
    <section className="mt-12 grid gap-6 lg:grid-cols-2">
      {/* Modifica profilo */}

      <Link
        href="/profile"
        className="group rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100">
          <User className="h-8 w-8 text-emerald-600" />
        </div>

        <h2 className="mt-8 text-3xl font-black text-slate-900">
          Il mio profilo
        </h2>

        <p className="mt-3 max-w-sm text-slate-600">
          Aggiorna i tuoi dati personali, la foto profilo e le informazioni del tuo account.
        </p>

        <div className="mt-8 flex items-center gap-2 font-semibold text-emerald-600">
          Modifica profilo

          <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
        </div>
      </Link>

      {/* Offri un passaggio */}

      <Link
        href="/offer-ride"
        className="group rounded-3xl bg-emerald-500 p-8 text-white transition duration-300 hover:-translate-y-1 hover:bg-emerald-600 hover:shadow-xl"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20">
          <CarFront className="h-8 w-8" />
        </div>

        <h2 className="mt-8 text-3xl font-black">
          Offri un passaggio
        </h2>

        <p className="mt-3 max-w-sm text-emerald-50">
          Condividi il tuo viaggio con altri partecipanti e dividi le spese.
        </p>

        <div className="mt-8 flex items-center gap-2 font-semibold">
          Inizia ora

          <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
        </div>
      </Link>

      {/* Cerca un evento */}

      <Link
        href="/events"
        className="group rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100">
          <Search className="h-8 w-8 text-emerald-600" />
        </div>

        <h2 className="mt-8 text-3xl font-black text-slate-900">
          Cerca un evento
        </h2>

        <p className="mt-3 max-w-sm text-slate-600">
          Esplora concerti, festival, fiere ed eventi sportivi e trova il tuo prossimo viaggio.
        </p>

        <div className="mt-8 flex items-center gap-2 font-semibold text-emerald-600">
          Esplora eventi

          <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
        </div>
      </Link>

      {/* Verifica conducente */}

      <Link
        href="/dashboard/verification"
        className="group rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100">
          <BadgeCheck className="h-8 w-8 text-emerald-600" />
        </div>

        <h2 className="mt-8 text-3xl font-black text-slate-900">
          {dict.title}
        </h2>

        <p className="mt-3 max-w-sm text-slate-600">
          {dict.description}
        </p>

        <div className="mt-8 flex items-center gap-2 font-semibold text-emerald-600">
          {verificationStatus === "approved"
            ? dict.ctaVerified
            : verificationStatus === "pending"
              ? dict.ctaPending
              : dict.cta}

          <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
        </div>
      </Link>
    </section>
  );
}