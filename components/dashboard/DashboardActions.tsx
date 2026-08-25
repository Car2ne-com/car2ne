import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CarFront,
  Search,
  User,
} from "lucide-react";

import { Card } from "@/components/ui/card";

type VerificationDict = {
  title: string;
  description: string;
  cta: string;
  ctaPending: string;
  ctaVerified: string;
};

type ActionsDict = {
  editProfileTitle: string;
  editProfileDescription: string;
  editProfileCta: string;
  offerRideTitle: string;
  offerRideDescription: string;
  offerRideCta: string;
  findEventTitle: string;
  findEventDescription: string;
  findEventCta: string;
};

type Props = {
  dict: ActionsDict;
  verificationDict: VerificationDict;
  verificationStatus: string | null;
};

export default function DashboardActions({
  dict,
  verificationDict,
  verificationStatus,
}: Props) {
  return (
    <section className="mt-12 grid gap-6 lg:grid-cols-2">
      {/* Modifica profilo */}

      <Card className="group relative p-8 transition duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl">
        <Link
          href="/profile"
          aria-label={dict.editProfileTitle}
          className="absolute inset-0 z-10"
        />

        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent">
          <User className="h-8 w-8 text-accent-foreground" />
        </div>

        <h2 className="mt-8 text-lg font-semibold text-foreground">
          {dict.editProfileTitle}
        </h2>

        <p className="mt-3 max-w-sm text-muted-foreground">
          {dict.editProfileDescription}
        </p>

        <div className="mt-8 flex items-center gap-2 font-semibold text-primary">
          {dict.editProfileCta}

          <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
        </div>
      </Card>

      {/* Offri un passaggio */}

      <Link
        href="/offer-ride"
        className="group rounded-3xl bg-primary p-8 text-primary-foreground transition duration-300 hover:-translate-y-1 hover:bg-primary/90 hover:shadow-xl"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20">
          <CarFront className="h-8 w-8" />
        </div>

        <h2 className="mt-8 text-lg font-semibold">
          {dict.offerRideTitle}
        </h2>

        <p className="mt-3 max-w-sm text-primary-foreground/90">
          {dict.offerRideDescription}
        </p>

        <div className="mt-8 flex items-center gap-2 font-semibold">
          {dict.offerRideCta}

          <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
        </div>
      </Link>

      {/* Cerca un evento */}

      <Card className="group relative p-8 transition duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl">
        <Link
          href="/events"
          aria-label={dict.findEventTitle}
          className="absolute inset-0 z-10"
        />

        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent">
          <Search className="h-8 w-8 text-accent-foreground" />
        </div>

        <h2 className="mt-8 text-lg font-semibold text-foreground">
          {dict.findEventTitle}
        </h2>

        <p className="mt-3 max-w-sm text-muted-foreground">
          {dict.findEventDescription}
        </p>

        <div className="mt-8 flex items-center gap-2 font-semibold text-primary">
          {dict.findEventCta}

          <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
        </div>
      </Card>

      {/* Verifica conducente */}

      <Card className="group relative p-8 transition duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl">
        <Link
          href="/dashboard/verification"
          aria-label={verificationDict.title}
          className="absolute inset-0 z-10"
        />

        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent">
          <BadgeCheck className="h-8 w-8 text-accent-foreground" />
        </div>

        <h2 className="mt-8 text-lg font-semibold text-foreground">
          {verificationDict.title}
        </h2>

        <p className="mt-3 max-w-sm text-muted-foreground">
          {verificationDict.description}
        </p>

        <div className="mt-8 flex items-center gap-2 font-semibold text-primary">
          {verificationStatus === "approved"
            ? verificationDict.ctaVerified
            : verificationStatus === "pending"
              ? verificationDict.ctaPending
              : verificationDict.cta}

          <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
        </div>
      </Card>
    </section>
  );
}