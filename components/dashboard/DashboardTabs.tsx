"use client";

import { useState } from "react";

type TabDef = {
  id: string;
  label: string;
  count: number;
  content: React.ReactNode;
};

type Props = {
  tabs: TabDef[];
  defaultTab?: string;
};

/*
 * Tab client-side per separare i passaggi ancora in programma da
 * quelli conclusi (evento finito). Tutti i pannelli restano montati
 * — vengono solo nascosti con `hidden` — così i componenti client
 * al loro interno (card prenotazione, ecc.) non si rimontano a ogni
 * cambio tab.
 */
export function DashboardTabs({
  tabs,
  defaultTab,
}: Props) {
  const [active, setActive] = useState(
    defaultTab ?? tabs[0]?.id
  );

  return (
    <div>
      <div
        role="tablist"
        className="mb-8 flex flex-wrap gap-1 border-b border-border"
      >
        {tabs.map((tab) => {
          const isActive = active === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(tab.id)}
              className={`-mb-px flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
                isActive
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}

              {tab.count > 0 && (
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {tabs.map((tab) => (
        <div
          key={tab.id}
          role="tabpanel"
          hidden={active !== tab.id}
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}
