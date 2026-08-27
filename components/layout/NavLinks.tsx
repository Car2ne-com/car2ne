"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Car } from "lucide-react";

import { cn } from "@/lib/utils";

type Props = {
  dict: { home: string; events: string; offerRide: string };
};

const LINKS = [
  { href: "/", key: "home" as const, exact: true },
  { href: "/events", key: "events" as const, exact: false },
];

export default function NavLinks({ dict }: Props) {
  const pathname = usePathname();

  const offerActive = pathname.startsWith("/offer-ride");

  return (
    <nav className="hidden items-center gap-1 md:flex">
      {LINKS.map((link) => {
        const active = link.exact
          ? pathname === link.href
          : pathname.startsWith(link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
              active
                ? "bg-accent text-accent-foreground"
                : "text-foreground/70 hover:bg-muted hover:text-foreground"
            )}
          >
            {dict[link.key]}
          </Link>
        );
      })}

      <Link
        href="/offer-ride"
        aria-current={offerActive ? "page" : undefined}
        className={cn(
          "ml-1 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold text-primary-foreground transition-colors",
          offerActive ? "bg-primary/90" : "bg-primary hover:bg-primary/90"
        )}
      >
        <Car className="h-4 w-4" />
        {dict.offerRide}
      </Link>
    </nav>
  );
}
