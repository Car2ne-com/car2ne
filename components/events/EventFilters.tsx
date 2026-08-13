"use client";

import {
  Drama,
  Music2,
  Sparkles,
  Ticket,
  Trophy,
  type LucideIcon,
} from "lucide-react";

import { EventCategory } from "@/types/event";

type Filter = "Tutti" | EventCategory;

type Props = {
  value: Filter;
  onChange: (value: Filter) => void;
};

const filters: {
  label: Filter;
  icon: LucideIcon;
}[] = [
  {
    label: "Tutti",
    icon: Sparkles,
  },
  {
    label: "Concerto",
    icon: Music2,
  },
  {
    label: "Festival",
    icon: Ticket,
  },
  {
    label: "Sport",
    icon: Trophy,
  },
  {
    label: "Fiera",
    icon: Ticket,
  },
  {
    label: "Teatro",
    icon: Drama,
  },
];

export default function EventFilters({
  value,
  onChange,
}: Props) {
  return (
    <div className="flex flex-wrap gap-3">
      {filters.map((filter) => {
        const Icon = filter.icon;

        const active = value === filter.label;

        return (
          <button
            key={filter.label}
            onClick={() => onChange(filter.label)}
            className={`
              inline-flex
              items-center
              gap-2
              rounded-full
              border
              px-5
              py-3
              text-sm
              font-semibold
              transition-all
              duration-300
              ${
                active
                  ? "border-emerald-500 bg-emerald-500 text-white shadow-lg"
                  : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50"
              }
            `}
          >
            <Icon className="h-4 w-4" />

            {filter.label}
          </button>
        );
      })}
    </div>
  );
}