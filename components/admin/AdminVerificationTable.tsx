"use client";

import { useMemo, useState } from "react";

import { useRouter } from "next/navigation";

import { CheckCircle2, Eye, XCircle } from "lucide-react";
import { toast } from "sonner";

import AdminNoteDialog from "./AdminNoteDialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";

type Verification = {
  id: string;
  driverName: string;
  vehicleMake: string;
  vehicleModel: string;
  vehiclePlate: string;
  licenseNumber: string;
  hasDocument: boolean;
  status: string;
  adminNote: string | null;
  createdAt: string;
};

type Filter = "all" | "pending" | "approved" | "rejected" | "expired";

type Dict = {
  emptyTitle: string;
  emptyDescription: string;
  filterAll: string;
  filterPending: string;
  filterApproved: string;
  filterRejected: string;
  filterExpired: string;
  noMatchTitle: string;
  colDriver: string;
  colVehicle: string;
  colPlate: string;
  colLicense: string;
  colStatus: string;
  colActions: string;
  viewDocument: string;
  viewDocumentAria: string;
  approve: string;
  approveAria: string;
  reject: string;
  rejectAria: string;
  documentUnavailable: string;
  contactServerError: string;
  driverVerifiedToast: string;
  requestRejectedToast: string;
  operationFailed: string;
  statusApproved: string;
  statusRejected: string;
  statusExpired: string;
  statusPending: string;
  rejectDialogTitle: string;
  rejectDialogDescription: string;
  reasonLabel: string;
  rejectButton: string;
  cancelButton: string;
};

export default function AdminVerificationTable({
  verifications,
  dict,
}: {
  verifications: Verification[];
  dict: Dict;
}) {
  const router = useRouter();

  const FILTERS: { key: Filter; label: string }[] = [
    { key: "all", label: dict.filterAll },
    { key: "pending", label: dict.filterPending },
    { key: "approved", label: dict.filterApproved },
    { key: "rejected", label: dict.filterRejected },
    { key: "expired", label: dict.filterExpired },
  ];

  const [filter, setFilter] = useState<Filter>("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rejectTargetId, setRejectTargetId] = useState<string | null>(
    null
  );

  const filtered = useMemo(() => {
    if (filter === "all") return verifications;
    return verifications.filter((v) => v.status === filter);
  }, [verifications, filter]);

  async function viewDocument(id: string) {
    setBusyId(id);

    try {
      const response = await fetch(
        `/api/admin/driver-verifications/${id}/document-url`
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error ?? dict.documentUnavailable);
        return;
      }

      window.open(data.url, "_blank", "noopener,noreferrer");
    } catch {
      toast.error(dict.contactServerError);
    } finally {
      setBusyId(null);
    }
  }

  async function updateStatus(
    id: string,
    status: "approved" | "rejected",
    adminNote?: string
  ) {
    setBusyId(id);

    try {
      const response = await fetch(
        `/api/admin/driver-verifications/${id}/status`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status, adminNote }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error ?? dict.operationFailed);
        return;
      }

      toast.success(
        status === "approved"
          ? dict.driverVerifiedToast
          : dict.requestRejectedToast
      );

      router.refresh();
    } catch {
      toast.error(dict.contactServerError);
    } finally {
      setBusyId(null);
      setRejectTargetId(null);
    }
  }

  if (verifications.length === 0) {
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
              "h-auto px-4 py-2",
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
        <Card className="overflow-x-auto p-0">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-4 text-left">{dict.colDriver}</th>
                <th className="px-6 py-4 text-left">{dict.colVehicle}</th>
                <th className="px-6 py-4 text-left">{dict.colPlate}</th>
                <th className="px-6 py-4 text-left">{dict.colLicense}</th>
                <th className="px-6 py-4 text-left">{dict.colStatus}</th>
                <th className="px-6 py-4 text-center">{dict.colActions}</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((v) => (
                <tr key={v.id} className="border-t border-border">
                  <td className="px-6 py-5 font-semibold">
                    {v.driverName || "—"}
                  </td>

                  <td className="px-6 py-5">
                    {v.vehicleMake} {v.vehicleModel}
                  </td>

                  <td className="px-6 py-5">{v.vehiclePlate}</td>
                  <td className="px-6 py-5">{v.licenseNumber}</td>

                  <td className="px-6 py-5">
                    <VerificationStatusBadge status={v.status} dict={dict} />

                    {v.adminNote && v.status === "rejected" && (
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {v.adminNote}
                      </p>
                    )}
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex justify-center gap-3">
                      {v.hasDocument && (
                        <Button
                          onClick={() => viewDocument(v.id)}
                          disabled={busyId === v.id}
                          title={dict.viewDocument}
                          aria-label={dict.viewDocumentAria.replace(
                            "{name}",
                            v.driverName
                          )}
                          size="icon-lg"
                          className="bg-blue-500 text-white hover:bg-blue-600"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}

                      {v.status === "pending" && (
                        <>
                          <Button
                            onClick={() => updateStatus(v.id, "approved")}
                            disabled={busyId === v.id}
                            title={dict.approve}
                            aria-label={dict.approveAria.replace(
                              "{name}",
                              v.driverName
                            )}
                            size="icon-lg"
                            className=""
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>

                          <Button
                            onClick={() => setRejectTargetId(v.id)}
                            disabled={busyId === v.id}
                            title={dict.reject}
                            aria-label={dict.rejectAria.replace(
                              "{name}",
                              v.driverName
                            )}
                            size="icon-lg"
                            className="rounded-xl bg-amber-500 text-white hover:bg-amber-600"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <AdminNoteDialog
        open={rejectTargetId !== null}
        onOpenChange={(open) => {
          if (!open) setRejectTargetId(null);
        }}
        title={dict.rejectDialogTitle}
        description={dict.rejectDialogDescription}
        noteLabel={dict.reasonLabel}
        noteRequired
        confirmLabel={dict.rejectButton}
        cancelLabel={dict.cancelButton}
        confirmTone="danger"
        busy={busyId === rejectTargetId}
        onConfirm={(note) => {
          if (rejectTargetId) {
            updateStatus(rejectTargetId, "rejected", note);
          }
        }}
      />
    </div>
  );
}

function VerificationStatusBadge({
  status,
  dict,
}: {
  status: string;
  dict: {
    statusApproved: string;
    statusRejected: string;
    statusExpired: string;
    statusPending: string;
  };
}) {
  if (status === "approved") {
    return (
      <StatusBadge variant="success">{dict.statusApproved}</StatusBadge>
    );
  }

  if (status === "rejected") {
    return (
      <StatusBadge variant="danger">{dict.statusRejected}</StatusBadge>
    );
  }

  if (status === "expired") {
    return (
      <StatusBadge variant="neutral">{dict.statusExpired}</StatusBadge>
    );
  }

  return <StatusBadge variant="warning">{dict.statusPending}</StatusBadge>;
}
