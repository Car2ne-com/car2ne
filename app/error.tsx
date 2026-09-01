"use client";

import { useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

import Logo from "@/components/layout/Logo";
import { Button } from "@/components/ui/button";

import { it } from "@/lib/i18n/dictionaries/it";
import { en } from "@/lib/i18n/dictionaries/en";
import { defaultLocale, isLocale, LOCALE_COOKIE } from "@/lib/i18n/locales";

function readLocaleCookie() {
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${LOCALE_COOKIE}=`));

  const value = match?.split("=")[1];

  return isLocale(value) ? value : defaultLocale;
}

function subscribeNoop() {
  return () => {};
}

function getServerSnapshot() {
  return defaultLocale;
}

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const locale = useSyncExternalStore(
    subscribeNoop,
    readLocaleCookie,
    getServerSnapshot
  );

  useEffect(() => {
    console.error(error);
  }, [error]);

  const t = (locale === "en" ? en : it).layout.error;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-6 text-center">
      <Logo />

      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="h-10 w-10 text-destructive" />
      </div>

      <div>
        <h1 className="text-2xl font-semibold text-foreground">{t.title}</h1>
        <p className="mt-3 max-w-md text-muted-foreground">{t.description}</p>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="outline" size="lg" onClick={() => retry()}>
          {t.retry}
        </Button>

        <Link href="/">
          <Button size="lg">{t.home}</Button>
        </Link>
      </div>
    </div>
  );
}
