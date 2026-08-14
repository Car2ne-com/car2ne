"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/admin/events", label: "Eventi" },
  { href: "/admin/users", label: "Utenti" },
];

export default function AdminTabs() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-2 border-b border-slate-200">
      {TABS.map((tab) => {
        const active = pathname.startsWith(tab.href);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`rounded-t-xl px-5 py-3 text-sm font-semibold transition ${
              active
                ? "border-x border-t border-slate-200 bg-white text-emerald-700"
                : "text-slate-600 hover:bg-white hover:text-slate-900"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
