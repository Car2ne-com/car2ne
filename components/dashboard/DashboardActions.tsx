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
        className="group rounded-3xl border border-border bg-card p-8 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent">
          <User className="h-8 w-8 text-accent-foreground" />
        </div>

        <h2 className="mt-8 text-lg font-semibold text-foreground">
          Il mio profilo
        </h2>

        <p className="mt-3 max-w-sm text-muted-foreground">
          Aggiorna i tuoi dati personali, la foto profilo e le informazioni del tuo account.
        </p>

        <div className="mt-8 flex items-center gap-2 font-semibold text-primary">
          Modifica profilo

          <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
        </div>
      </Link>

      {/* Offri un passaggio */}

      <Link
        href="/offer-ride"
        className="group rounded-3xl bg-primary p-8 text-primary-foreground transition duration-300 hover:-translate-y-1 hover:bg-primary/90 hover:shadow-xl"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20">
          <CarFront className="h-8 w-8" />
        </div>

        <h2 className="mt-8 text-lg font-semibold">
          Offri un passaggio
        </h2>

        <p className="mt-3 max-w-sm text-primary-foreground/90">
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
        className="group rounded-3xl border border-border bg-card p-8 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent">
          <Search className="h-8 w-8 text-accent-foreground" />
        </div>

        <h2 className="mt-8 text-lg font-semibold text-foreground">
          Cerca un evento
        </h2>

        <p className="mt-3 max-w-sm text-muted-foreground">
          Esplora concerti, festival, fiere ed eventi sportivi e trova il tuo prossimo viaggio.
        </p>

        <div className="mt-8 flex items-center gap-2 font-semibold text-primary">
          Esplora eventi

          <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
        </div>
      </Link>

      {/* Verifica conducente */}

      <Link
        href="/dashboard/verification"
        className="group rounded-3xl border border-border bg-card p-8 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent">
          <BadgeCheck className="h-8 w-8 text-accent-foreground" />
        </div>

        <h2 className="mt-8 text-lg font-semibold text-foreground">
          {dict.title}
        </h2>

        <p className="mt-3 max-w-sm text-muted-foreground">
          {dict.description}
        </p>

        <div className="mt-8 flex items-center gap-2 font-semibold text-primary">
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