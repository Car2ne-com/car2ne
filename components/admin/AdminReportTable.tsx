"use client";

import { useMemo, useState } from "react";

import { useRouter } from "next/navigation";

import { CheckCircle2, Clock3, XCircle } from "lucide-react";
import { toast } from "sonner";

import AdminNoteDialog from "./AdminNoteDialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";

type Report = {
  id: string;
  category: string;
  description: string;
  status: string;
  adminNote: string | null;
  createdAt: string;
  reporterName: string;
  reportedName: string | null;
  hasRideRef: boolean;
  hasBookingRef: boolean;
};

type Filter = "all" | "open" | "reviewing" | "resolved" | "dismissed";

type Dict = {
  emptyTitle: string;
  emptyDescription: string;
  filterAll: string;
  filterOpen: string;
  filterReviewing: string;
  filterResolved: string;
  filterDismissed: string;
  noMatchTitle: string;
  categoryUserBehavior: string;
  categoryInappropriateContent: string;
  categoryTechnicalIssue: string;
  categorySafety: string;
  categoryNoShow: string;
  categoryOther: string;
  fromPrefix: string;
  regardingPrefix: string;
  rideRefNote: string;
  adminNoteLabel: string;
  markReviewing: string;
  resolve: string;
  dismiss: string;
  reportUpdatedToast: string;
  operationFailed: string;
  contactServerError: string;
  statusResolved: string;
  statusDismissed: string;
  statusReviewing: string;
  statusOpen: string;
  resolveDialogTitle: string;
  dismissDialogTitle: string;
  noteDialogDescription: string;
  noteForUserLabel: string;
  resolveButton: string;
  dismissButton: string;
  cancelButton: string;
};

export default function AdminReportTable({
  reports,
  dict,
}: {
  reports: Report[];
  dict: Dict;
}) {
  const router = useRouter();

  const FILTERS: { key: Filter; label: string }[] = [
    { key: "all", label: dict.filterAll },
    { key: "open", label: dict.filterOpen },
    { key: "reviewing", label: dict.filterReviewing },
    { key: "resolved", label: dict.filterResolved },
    { key: "dismissed", label: dict.filterDismissed },
  ];

  const CATEGORY_LABELS: Record<string, string> = {
    user_behavior: dict.categoryUserBehavior,
    inappropriate_content: dict.categoryInappropriateContent,
    technical_issue: dict.categoryTechnicalIssue,
    safety: dict.categorySafety,
    no_show: dict.categoryNoShow,
    other: dict.categoryOther,
  };

  const [filter, setFilter] = useState<Filter>("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [noteDialog, setNoteDialog] = useState<{
    id: string;
    status: "resolved" | "dismissed";
  } | null>(null);

  const filtered = useMemo(() => {
    if (filter === "all") return reports;
    return reports.filter((r) => r.status === filter);
  }, [reports, filter]);

  async function updateStatus(
    id: string,
    status: "reviewing" | "resolved" | "dismissed",
    adminNote?: string
  ) {
    setBusyId(id);

    try {
      const response = await fetch(`/api/admin/reports/${id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminNote }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error ?? dict.operationFailed);
        return;
      }

      toast.success(dict.reportUpdatedToast);
      router.refresh();
    } catch {
      toast.error(dict.contactServerError);
    } finally {
      setBusyId(null);
      setNoteDialog(null);
    }
  }

  if (reports.length === 0) {
    return (
      <EmptyState
        title={dict.emptyTitle}
        description={dict.emptyDescription}
      />
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
        <EmptyState
          title={dict.noMatchTitle}
          description=""
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((r) => (
            <Card key={r.id} className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
                      {CATEGORY_LABELS[r.category] ?? r.category}
                    </span>

                    <ReportStatusBadge status={r.status} dict={dict} />
                  </div>

                  <p className="mt-3 text-sm text-muted-foreground">
                    {dict.fromPrefix} <strong>{r.reporterName || "—"}</strong>
                    {r.reportedName && (
                      <>
                        {" "}
                        {dict.regardingPrefix} <strong>{r.reportedName}</strong>
                      </>
                    )}
                    {(r.hasRideRef || r.hasBookingRef) && (
                      <> {dict.rideRefNote}</>
                    )}
                  </p>

                  <p className="mt-3 whitespace-pre-wrap text-foreground">
                    {r.description}
                  </p>

                  {r.adminNote && (
                    <p className="mt-3 rounded-2xl bg-muted px-4 py-3 text-sm text-muted-foreground">
                      <strong>{dict.adminNoteLabel}</strong> {r.adminNote}
                    </p>
                  )}
                </div>

                {(r.status === "open" || r.status === "reviewing") && (
                  <div className="flex shrink-0 gap-3">
                    {r.status === "open" && (
                      <Button
                        onClick={() => updateStatus(r.id, "reviewing")}
                        disabled={busyId === r.id}
                        title={dict.markReviewing}
                        aria-label={dict.markReviewing}
                        size="icon-lg"
                        className="rounded-xl bg-blue-500 text-white hover:bg-blue-600"
                      >
                        <Clock3 className="h-4 w-4" />
                      </Button>
                    )}

                    <Button
                      onClick={() =>
                        setNoteDialog({ id: r.id, status: "resolved" })
                      }
                      disabled={busyId === r.id}
                      title={dict.resolve}
                      aria-label={dict.resolve}
                      size="icon-lg"
                      className="rounded-xl"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>

                    <Button
                      onClick={() =>
                        setNoteDialog({ id: r.id, status: "dismissed" })
                      }
                      disabled={busyId === r.id}
                      title={dict.dismiss}
                      aria-label={dict.dismiss}
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

      <AdminNoteDialog
        open={noteDialog !== null}
        onOpenChange={(open) => {
          if (!open) setNoteDialog(null);
        }}
        title={
          noteDialog?.status === "resolved"
            ? dict.resolveDialogTitle
            : dict.dismissDialogTitle
        }
        description={dict.noteDialogDescription}
        noteLabel={dict.noteForUserLabel}
        confirmLabel={
          noteDialog?.status === "resolved" ? dict.resolveButton : dict.dismissButton
        }
        cancelLabel={dict.cancelButton}
        confirmTone={
          noteDialog?.status === "resolved" ? "default" : "warning"
        }
        busy={busyId === noteDialog?.id}
        onConfirm={(note) => {
          if (noteDialog) {
            updateStatus(noteDialog.id, noteDialog.status, note);
          }
        }}
      />
    </div>
  );
}

function ReportStatusBadge({
  status,
  dict,
}: {
  status: string;
  dict: {
    statusResolved: string;
    statusDismissed: string;
    statusReviewing: string;
    statusOpen: string;
  };
}) {
  if (status === "resolved") {
    return (
      <StatusBadge variant="success">{dict.statusResolved}</StatusBadge>
    );
  }

  if (status === "dismissed") {
    return (
      <StatusBadge variant="neutral">{dict.statusDismissed}</StatusBadge>
    );
  }

  if (status === "reviewing") {
    return (
      <StatusBadge variant="info">{dict.statusReviewing}</StatusBadge>
    );
  }

  return <StatusBadge variant="warning">{dict.statusOpen}</StatusBadge>;
}
