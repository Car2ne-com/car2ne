"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Globe } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { setLocaleAction } from "@/lib/i18n/actions";
import type { Locale } from "@/lib/i18n/locales";

const options: { code: Locale; label: string }[] = [
  { code: "it", label: "Italiano" },
  { code: "en", label: "English" },
];

type Props = {
  locale: Locale;
  srLabel: string;
};

/*
 * Selettore lingua compatto per il desktop: un solo pulsante-icona
 * (globo) che apre un menu con le lingue disponibili. Occupa molto
 * meno spazio orizzontale del segmentato IT|EN, che resta in uso nel
 * menu mobile dove lo spazio non è un problema.
 */
export default function LanguageMenu({ locale, srLabel }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSelect(code: Locale) {
    if (code === locale || isPending) return;

    startTransition(async () => {
      await setLocaleAction(code);
      router.refresh();
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={srLabel}
        disabled={isPending}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/80 text-muted-foreground transition hover:border-primary/30 hover:bg-accent hover:text-primary disabled:opacity-60"
      >
        <Globe className="h-5 w-5" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-44 rounded-xl">
        {options.map((option) => (
          <DropdownMenuItem
            key={option.code}
            onClick={() => handleSelect(option.code)}
            className="justify-between"
          >
            {option.label}

            {locale === option.code && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
