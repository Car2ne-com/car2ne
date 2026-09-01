"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Car, Menu, X } from "lucide-react";

import LanguageSwitcher from "./LanguageSwitcher";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/locales";

type Props = {
  dict: { home: string; events: string; offerRide: string };
  auth: { login: string } | null;
  social: { heading: string; instagram: string; tiktok: string };
  ariaOpen: string;
  ariaClose: string;
  locale: Locale;
  languageSwitcherLabel: string;
};

export default function MobileMenu({
  dict,
  auth,
  social,
  ariaOpen,
  ariaClose,
  locale,
  languageSwitcherLabel,
}: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Esc per chiudere + blocco dello scroll di fondo mentre è aperto.
  useEffect(() => {
    if (!open) return;

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const navLinks = [
    { href: "/", label: dict.home, exact: true },
    { href: "/events", label: dict.events, exact: false },
  ];

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/80 text-muted-foreground transition hover:border-primary/30 hover:bg-accent hover:text-primary"
        aria-label={open ? ariaClose : ariaOpen}
        aria-expanded={open}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open &&
        createPortal(
          <div className="fixed inset-0 z-40 md:hidden">
            <button
              type="button"
              tabIndex={-1}
              aria-hidden="true"
              onClick={() => setOpen(false)}
              className="absolute inset-x-0 bottom-0 top-16 cursor-default bg-foreground/20 backdrop-blur-sm sm:top-20"
            />

            <Card className="absolute inset-x-2 top-[4.5rem] rounded-2xl p-2 shadow-[0_16px_50px_rgba(15,23,42,0.18)] sm:inset-x-4 sm:top-[5.5rem]">
              <nav className="flex flex-col">
                {navLinks.map((link) => {
                  const active = link.exact
                    ? pathname === link.href
                    : pathname.startsWith(link.href);

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "rounded-xl px-4 py-3.5 text-sm font-medium transition",
                        active
                          ? "bg-accent text-accent-foreground"
                          : "text-foreground/80 hover:bg-muted hover:text-foreground"
                      )}
                    >
                      {link.label}
                    </Link>
                  );
                })}

                {auth && (
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="rounded-xl px-4 py-3.5 text-sm font-medium text-foreground/80 transition hover:bg-muted hover:text-foreground"
                  >
                    {auth.login}
                  </Link>
                )}
              </nav>

              <Link
                href="/offer-ride"
                onClick={() => setOpen(false)}
                aria-current={
                  pathname.startsWith("/offer-ride") ? "page" : undefined
                }
                className="mt-1 flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
              >
                <Car className="h-4 w-4" />
                {dict.offerRide}
              </Link>

              <div className="mt-2 flex items-center justify-between gap-4 border-t border-border px-2 pt-3">
                <LanguageSwitcher
                  locale={locale}
                  srLabel={languageSwitcherLabel}
                />

                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-muted-foreground">
                    {social.heading}
                  </span>

                  <a
                    href="https://www.instagram.com/car2ne_official"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.instagram}
                    onClick={() => setOpen(false)}
                    className="text-muted-foreground transition hover:text-primary"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                      className="h-5 w-5"
                    >
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                    </svg>
                  </a>

                  <a
                    href="https://www.tiktok.com/@car2ne_official"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.tiktok}
                    onClick={() => setOpen(false)}
                    className="text-muted-foreground transition hover:text-primary"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                      className="h-5 w-5"
                    >
                      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                    </svg>
                  </a>
                </div>
              </div>
            </Card>
          </div>,
          document.body
        )}
    </div>
  );
}
