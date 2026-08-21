"use client";

import { useMemo, useState } from "react";

import { useRouter } from "next/navigation";

import { CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

import ConfirmDialog from "./ConfirmDialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

type Suggestion = {
  id: string;
  externalUrl: string;
  status: string;
  createdAt: string;
  suggesterName: string;
};

type Filter = "all" | "pending" | "approved" | "rejected";

type Dict = {
  emptyTitle: string;
  emptyDescription: string;
  filterAll: string;
  filterPending: string;
  filterApproved: string;
  filterRejected: string;
  noMatchTitle: string;
  suggestedByPrefix: string;
  linkLabel: string;
  approve: string;
  reject: string;
  statusPending: string;
  statusApproved: string;
  statusRejected: string;
  approveConfirmTitle: string;
  approveConfirmDescription: string;
  rejectConfirmTitle: string;
  rejectConfirmDescription: string;
  confirmButton: string;
  cancelButton: string;
  operationFailed: string;
  contactServerError: string;
  suggestionApprovedToast: string;
  suggestionRejectedToast: string;
};

export default function AdminEventSuggestionTable({
  suggestions,
  dict,
}: {
  suggestions: Suggestion[];
  dict: Dict;
}) {
  const router = useRouter();

  const FILTERS: { key: Filter; label: string }[] = [
    { key: "all", label: dict.filterAll },
    { key: "pending", label: dict.filterPending },
    { key: "approved", label: dict.filterApproved },
    { key: "rejected", label: dict.filterRejected },
  ];

  const [filter, setFilter] = useState<Filter>("pending");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<{
    id: string;
    url: string;
    action: "approve" | "reject";
  } | null>(null);

  const filtered = useMemo(() => {
    if (filter === "all") return suggestions;
    return suggestions.filter((s) => s.status === filter);
  }, [suggestions, filter]);

  async function handleConfirm() {
    if (!pendingAction) return;

    setBusyId(pendingAction.id);

    try {
      const response = await fetch(
        `/api/admin/event-suggestions/${pendingAction.id}/${pendingAction.action}`,
        { method: "POST" }
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error ?? dict.operationFailed);
        return;
      }

      toast.success(
        pendingAction.action === "approve"
          ? dict.suggestionApprovedToast
          : dict.suggestionRejectedToast
      );

      router.refresh();
    } catch {
      toast.error(dict.contactServerError);
    } finally {
      setBusyId(null);
      setPendingAction(null);
    }
  }

  if (suggestions.length === 0) {
    return (
      <EmptyState title={dict.emptyTitle} description={dict.emptyDescription} />
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((item) => (
          <Button
            key={item.key}
            type="button"
            onClick={() => setFilter(item.key)}
            className={cn(
              "h-auto rounded-xl px-4 py-2",
              filter === item.key
                ? "bg-foreground text-background hover:bg-foreground/90"
                : "bg-card text-muted-foreground hover:bg-muted"
            )}
          >
            {item.label}
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState title={dict.noMatchTitle} description="" />
      ) : (
        <div className="space-y-4">
          {filtered.map((s) => (
            <Card key={s.id} className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <a
                      href={s.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="font-semibold text-primary hover:underline"
                    >
                      {dict.linkLabel}
                    </a>

                    <StatusBadge status={s.status} dict={dict} />
                  </div>

                  <p className="mt-1 break-all text-sm text-muted-foreground">
                    {s.externalUrl}
                  </p>

                  <p className="mt-2 text-xs text-muted-foreground">
                    {dict.suggestedByPrefix} {s.suggesterName || "—"}
                  </p>
                </div>

                {s.status === "pending" && (
                  <div className="flex shrink-0 gap-3">
                    <Button
                      onClick={() =>
                        setPendingAction({
                          id: s.id,
                          url: s.externalUrl,
                          action: "approve",
                        })
                      }
                      disabled={busyId === s.id}
                      title={dict.approve}
                      aria-label={dict.approve}
                      size="icon-lg"
                      className="rounded-xl"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>

                    <Button
                      onClick={() =>
                        setPendingAction({
                          id: s.id,
                          url: s.externalUrl,
                          action: "reject",
                        })
                      }
                      disabled={busyId === s.id}
                      title={dict.reject}
                      aria-label={dict.reject}
                      size="icon-lg"
                      className="rounded-xl bg-muted-foreground text-background hover:bg-foreground"
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={pendingAction !== null}
        onOpenChange={(open) => {
          if (!open) setPendingAction(null);
        }}
        title={
          pendingAction?.action === "approve"
            ? dict.approveConfirmTitle
            : dict.rejectConfirmTitle
        }
        description={(pendingAction?.action === "approve"
          ? dict.approveConfirmDescription
          : dict.rejectConfirmDescription
        ).replace("{url}", pendingAction?.url ?? "")}
        confirmLabel={dict.confirmButton}
        cancelLabel={dict.cancelButton}
        confirmTone={pendingAction?.action === "approve" ? "default" : "warning"}
        busy={busyId === pendingAction?.id}
        onConfirm={handleConfirm}
      />
    </div>
  );
}

function StatusBadge({
  status,
  dict,
}: {
  status: string;
  dict: {
    statusPending: string;
    statusApproved: string;
    statusRejected: string;
  };
}) {
  if (status === "approved") {
    return (
      <span className="inline-flex items-center rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
        {dict.statusApproved}
      </span>
    );
  }

  if (status === "rejected") {
    return (
      <span className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
        {dict.statusRejected}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
      {dict.statusPending}
    </span>
  );
}
