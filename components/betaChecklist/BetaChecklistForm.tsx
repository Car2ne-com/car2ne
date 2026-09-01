"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import type {
  BetaChecklistResultsByItem,
  BetaChecklistSectionDict,
  BetaChecklistStatus,
} from "@/types/betaChecklist";

type Dict = {
  progress: { tested: string; ok: string; problem: string; untested: string };
  states: { untested: string; ok: string; problem: string };
  expectedLabel: string;
  notePlaceholder: string;
  saveErrorToast: string;
};

type Props = {
  userId: string;
  sections: BetaChecklistSectionDict[];
  initialResults: BetaChecklistResultsByItem;
  dict: Dict;
};

export default function BetaChecklistForm({
  userId,
  sections,
  initialResults,
  dict,
}: Props) {
  const supabase = createClient();
  const [results, setResults] = useState<BetaChecklistResultsByItem>(initialResults);

  const totalItems = useMemo(
    () => sections.reduce((total, section) => total + section.items.length, 0),
    [sections]
  );

  const { okCount, problemCount } = useMemo(() => {
    let ok = 0;
    let problem = 0;
    for (const itemId in results) {
      if (results[itemId].status === "ok") ok++;
      else if (results[itemId].status === "problem") problem++;
    }
    return { okCount: ok, problemCount: problem };
  }, [results]);

  const testedCount = okCount + problemCount;
  const untestedCount = totalItems - testedCount;
  const progressPct = totalItems > 0 ? Math.round((testedCount / totalItems) * 100) : 0;

  async function setStatus(itemId: string, status: BetaChecklistStatus) {
    const current = results[itemId]?.status;
    const nextStatus: BetaChecklistStatus | "untested" =
      current === status ? "untested" : status;

    const previous = results[itemId];

    if (nextStatus === "untested") {
      setResults((prev) => {
        const next = { ...prev };
        delete next[itemId];
        return next;
      });

      const { error } = await supabase
        .from("beta_checklist_results")
        .delete()
        .eq("user_id", userId)
        .eq("item_id", itemId);

      if (error) {
        console.warn("Errore rimozione esito checklist:", error.message);
        toast.error(dict.saveErrorToast);
        setResults((prev) => ({ ...prev, ...(previous ? { [itemId]: previous } : {}) }));
      }
      return;
    }

    const note = previous?.note ?? "";

    setResults((prev) => ({ ...prev, [itemId]: { status: nextStatus, note } }));

    const { error } = await supabase.from("beta_checklist_results").upsert(
      { user_id: userId, item_id: itemId, status: nextStatus, note: note || null },
      { onConflict: "user_id,item_id" }
    );

    if (error) {
      console.warn("Errore salvataggio esito checklist:", error.message);
      toast.error(dict.saveErrorToast);
      setResults((prev) => {
        const next = { ...prev };
        if (previous) next[itemId] = previous;
        else delete next[itemId];
        return next;
      });
    }
  }

  function updateNoteLocally(itemId: string, note: string) {
    setResults((prev) => {
      const entry = prev[itemId];
      if (!entry) return prev;
      return { ...prev, [itemId]: { ...entry, note } };
    });
  }

  async function saveNote(itemId: string) {
    const entry = results[itemId];
    if (!entry) return;

    const { error } = await supabase.from("beta_checklist_results").upsert(
      { user_id: userId, item_id: itemId, status: entry.status, note: entry.note || null },
      { onConflict: "user_id,item_id" }
    );

    if (error) {
      console.warn("Errore salvataggio nota checklist:", error.message);
      toast.error(dict.saveErrorToast);
    }
  }

  return (
    <div className="space-y-8">
      <Card className="sticky top-4 z-10 bg-card/95 p-6 backdrop-blur">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <span className="text-2xl font-black text-foreground">{progressPct}%</span>

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span>
              {dict.progress.tested}: <b className="font-semibold text-foreground">{testedCount}</b>/{totalItems}
            </span>
            <span>
              {dict.progress.ok}: <b className="font-semibold text-primary">{okCount}</b>
            </span>
            <span>
              {dict.progress.problem}: <b className="font-semibold text-destructive">{problemCount}</b>
            </span>
            <span>
              {dict.progress.untested}: <b className="font-semibold text-foreground">{untestedCount}</b>
            </span>
          </div>
        </div>

        <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${totalItems > 0 ? (okCount / totalItems) * 100 : 0}%` }}
          />
          <div
            className="h-full bg-destructive transition-all"
            style={{ width: `${totalItems > 0 ? (problemCount / totalItems) * 100 : 0}%` }}
          />
        </div>
      </Card>

      {sections.map((section) => {
        const sectionTested = section.items.filter((item) => results[item.id]).length;

        return (
          <section key={section.id}>
            <div className="mb-4 flex items-baseline justify-between gap-3 border-b border-border pb-3">
              <h2 className="text-lg font-semibold text-foreground">{section.title}</h2>
              <span className="shrink-0 text-xs font-medium text-muted-foreground">
                {sectionTested} / {section.items.length}
              </span>
            </div>

            {section.note && (
              <p className="-mt-2 mb-4 text-sm text-muted-foreground">{section.note}</p>
            )}

            <ul className="space-y-3">
              {section.items.map((item) => {
                const entry = results[item.id];
                const status = entry?.status;

                return (
                  <li
                    key={item.id}
                    className={`rounded-2xl border p-4 transition-colors ${
                      status === "ok"
                        ? "border-primary/30 bg-accent/60"
                        : status === "problem"
                          ? "border-destructive/30 bg-destructive/5"
                          : "border-border bg-card"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">{item.title}</p>
                        {item.expected && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            <span className="font-semibold text-muted-foreground">{dict.expectedLabel}:</span>{" "}
                            {item.expected}
                          </p>
                        )}
                      </div>

                      <div className="flex shrink-0 gap-2">
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => setStatus(item.id, "ok")}
                          className={
                            status === "ok"
                              ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
                              : "border-border bg-muted text-muted-foreground hover:border-primary/40 hover:text-primary"
                          }
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          {dict.states.ok}
                        </Button>

                        <Button
                          type="button"
                          size="sm"
                          onClick={() => setStatus(item.id, "problem")}
                          className={
                            status === "problem"
                              ? "border-destructive bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              : "border-border bg-muted text-muted-foreground hover:border-destructive/40 hover:text-destructive"
                          }
                        >
                          <AlertTriangle className="h-3.5 w-3.5" />
                          {dict.states.problem}
                        </Button>
                      </div>
                    </div>

                    {status === "problem" && (
                      <Textarea
                        value={entry?.note ?? ""}
                        onChange={(e) => updateNoteLocally(item.id, e.target.value)}
                        onBlur={() => saveNote(item.id)}
                        placeholder={dict.notePlaceholder}
                        rows={2}
                        className="mt-3 min-h-0 border-destructive/30 focus-visible:border-destructive focus-visible:ring-destructive/20"
                      />
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
