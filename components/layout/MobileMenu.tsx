"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export default function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() =>
          setOpen((current) => !current)
        }
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white/80 text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600 sm:h-10 sm:w-10"
        aria-label={
          open ? "Chiudi menu" : "Apri menu"
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
        <div className="absolute inset-x-2 top-full mt-2 rounded-2xl border border-white/40 bg-white/95 p-2 shadow-[0_10px_40px_rgba(15,23,42,.08)] backdrop-blur-2xl sm:inset-x-4">
          <nav className="flex flex-col text-sm font-medium text-slate-600">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="rounded-xl px-4 py-3 transition hover:bg-emerald-50 hover:text-emerald-600"
            >
              Home
            </Link>

            <Link
              href="/events"
              onClick={() => setOpen(false)}
              className="rounded-xl px-4 py-3 transition hover:bg-emerald-50 hover:text-emerald-600"
            >
              Eventi
            </Link>

            <Link
              href="/offer-ride"
              onClick={() => setOpen(false)}
              className="rounded-xl px-4 py-3 transition hover:bg-emerald-50 hover:text-emerald-600"
            >
              Offri un passaggio
            </Link>
          </nav>
        </div>
      )}
    </div>
  );
}
