"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

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
      <div className="sticky top-4 z-10 rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-sm backdrop-blur">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <span className="text-2xl font-black text-slate-900">{progressPct}%</span>

          <div className="flex flex-wrap gap-4 text-sm text-slate-500">
            <span>
              {dict.progress.tested}: <b className="font-semibold text-slate-900">{testedCount}</b>/{totalItems}
            </span>
            <span>
              {dict.progress.ok}: <b className="font-semibold text-emerald-600">{okCount}</b>
            </span>
            <span>
              {dict.progress.problem}: <b className="font-semibold text-red-600">{problemCount}</b>
            </span>
            <span>
              {dict.progress.untested}: <b className="font-semibold text-slate-900">{untestedCount}</b>
            </span>
          </div>
        </div>

        <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full bg-emerald-500 transition-all"
            style={{ width: `${totalItems > 0 ? (okCount / totalItems) * 100 : 0}%` }}
          />
          <div
            className="h-full bg-red-500 transition-all"
            style={{ width: `${totalItems > 0 ? (problemCount / totalItems) * 100 : 0}%` }}
          />
        </div>
      </div>

      {sections.map((section) => {
        const sectionTested = section.items.filter((item) => results[item.id]).length;

        return (
          <section key={section.id}>
            <div className="mb-4 flex items-baseline justify-between gap-3 border-b border-slate-200 pb-3">
              <h2 className="text-lg font-bold text-slate-900">{section.title}</h2>
              <span className="shrink-0 text-xs font-medium text-slate-400">
                {sectionTested} / {section.items.length}
              </span>
            </div>

            {section.note && (
              <p className="-mt-2 mb-4 text-sm text-slate-500">{section.note}</p>
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
                        ? "border-emerald-200 bg-emerald-50/60"
                        : status === "problem"
                          ? "border-red-200 bg-red-50/60"
                          : "border-slate-200 bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-800">{item.title}</p>
                        {item.expected && (
                          <p className="mt-1 text-xs text-slate-500">
                            <span className="font-semibold text-slate-600">{dict.expectedLabel}:</span>{" "}
                            {item.expected}
                          </p>
                        )}
                      </div>

                      <div className="flex shrink-0 gap-2">
                        <button
                          type="button"
                          onClick={() => setStatus(item.id, "ok")}
                          className={`flex items-center gap-1 rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                            status === "ok"
                              ? "border-emerald-500 bg-emerald-500 text-white"
                              : "border-slate-200 bg-slate-50 text-slate-500 hover:border-emerald-300 hover:text-emerald-700"
                          }`}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          {dict.states.ok}
                        </button>

                        <button
                          type="button"
                          onClick={() => setStatus(item.id, "problem")}
                          className={`flex items-center gap-1 rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                            status === "problem"
                              ? "border-red-500 bg-red-500 text-white"
                              : "border-slate-200 bg-slate-50 text-slate-500 hover:border-red-300 hover:text-red-700"
                          }`}
                        >
                          <AlertTriangle className="h-3.5 w-3.5" />
                          {dict.states.problem}
                        </button>
                      </div>
                    </div>

                    {status === "problem" && (
                      <textarea
                        value={entry?.note ?? ""}
                        onChange={(e) => updateNoteLocally(item.id, e.target.value)}
                        onBlur={() => saveNote(item.id)}
                        placeholder={dict.notePlaceholder}
                        rows={2}
                        className="mt-3 w-full rounded-xl border border-red-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-100"
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
