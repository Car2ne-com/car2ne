"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { isBetaChecklistEnabled } from "@/lib/betaChecklist/config";

type Tabs = {
  dashboard: string;
  events: string;
  users: string;
  import: string;
  driverVerifications: string;
  reports: string;
  analytics: string;
  betaChecklist: string;
};

type Props = {
  tabs: Tabs;
};

export default function AdminTabs({ tabs }: Props) {
  const pathname = usePathname();

  const TABS = [
    { href: "/admin", label: tabs.dashboard },
    { href: "/admin/events", label: tabs.events },
    { href: "/admin/users", label: tabs.users },
    { href: "/admin/import", label: tabs.import },
    {
      href: "/admin/driver-verifications",
      label: tabs.driverVerifications,
    },
    { href: "/admin/reports", label: tabs.reports },
    { href: "/admin/analytics", label: tabs.analytics },
    ...(isBetaChecklistEnabled
      ? [{ href: "/admin/beta-checklist", label: tabs.betaChecklist }]
      : []),
  ];

  return (
    <nav className="flex gap-2 overflow-x-auto border-b border-slate-200">
      {TABS.map((tab) => {
        const active =
          tab.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(tab.href);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`shrink-0 rounded-t-xl px-5 py-3 text-sm font-semibold transition ${
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
