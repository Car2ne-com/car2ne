"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

import LanguageSwitcher from "./LanguageSwitcher";

import { Card } from "@/components/ui/card";
import type { Locale } from "@/lib/i18n/locales";

type Props = {
  dict: { home: string; events: string; offerRide: string };
  ariaOpen: string;
  ariaClose: string;
  locale: Locale;
  languageSwitcherLabel: string;
};

export default function MobileMenu({
  dict,
  ariaOpen,
  ariaClose,
  locale,
  languageSwitcherLabel,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() =>
          setOpen((current) => !current)
        }
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-background/80 text-muted-foreground transition hover:border-primary/30 hover:bg-accent hover:text-primary sm:h-10 sm:w-10"
        aria-label={
          open ? ariaClose : ariaOpen
        }
        aria-expanded={open}
      >
        {open ? (
          <X className="h-5 w-5" />
        ) : (
          <Menu className="h-5 w-5" />
        )}
      </button>

      {open && (
        <Card className="absolute inset-x-2 top-full mt-2 rounded-2xl p-2 shadow-[0_10px_40px_rgba(15,23,42,.08)] sm:inset-x-4">
          <nav className="flex flex-col text-sm font-medium text-muted-foreground">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="rounded-xl px-4 py-3 transition hover:bg-accent hover:text-primary"
            >
              {dict.home}
            </Link>

            <Link
              href="/events"
              onClick={() => setOpen(false)}
              className="rounded-xl px-4 py-3 transition hover:bg-accent hover:text-primary"
            >
              {dict.events}
            </Link>

            <Link
              href="/offer-ride"
              onClick={() => setOpen(false)}
              className="rounded-xl px-4 py-3 transition hover:bg-accent hover:text-primary"
            >
              {dict.offerRide}
            </Link>
          </nav>

          <div className="mt-1 border-t border-border px-4 pt-3 md:hidden">
            <LanguageSwitcher locale={locale} srLabel={languageSwitcherLabel} />
          </div>
        </Card>
      )}
    </div>
  );
}
