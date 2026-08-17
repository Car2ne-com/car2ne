"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

import { setLocaleAction } from "@/lib/i18n/actions";
import type { Locale } from "@/lib/i18n/locales";

const options: { code: Locale; label: string }[] = [
  { code: "it", label: "IT" },
  { code: "en", label: "EN" },
];

type Props = {
  locale: Locale;
  srLabel: string;
};

export default function LanguageSwitcher({ locale, srLabel }: Props) {
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
    <div
      role="group"
      aria-label={srLabel}
      className="flex shrink-0 items-center gap-0.5 rounded-full border border-slate-200 bg-white/80 p-0.5 text-xs font-semibold text-slate-500"
    >
      {options.map((option) => (
        <button
          key={option.code}
          type="button"
          onClick={() => handleSelect(option.code)}
          aria-pressed={locale === option.code}
          disabled={isPending}
          className={`rounded-full px-2 py-1 transition disabled:opacity-60 ${
            locale === option.code
              ? "bg-emerald-500 text-white shadow-sm"
              : "hover:bg-slate-100 hover:text-slate-700"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
