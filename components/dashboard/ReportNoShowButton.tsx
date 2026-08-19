"use client";

import { useState } from "react";

import { AlertDialog } from "@base-ui/react/alert-dialog";
import { Flag } from "lucide-react";
import { toast } from "sonner";

export type NoShowDict = {
  button: string;
  reported: string;
  dialogTitle: string;
  dialogDescription: string;
  noteLabel: string;
  confirm: string;
  cancel: string;
  submitting: string;
  toastSuccess: string;
  toastFailed: string;
};

type Props = {
  dict: NoShowDict;
  bookingId: string;
  rideId: string;
};

export default function ReportNoShowButton({
  dict,
  bookingId,
  rideId,
}: Props) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reported, setReported] = useState(false);

  async function handleConfirm() {
    setSubmitting(true);

    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: "no_show",
          description: note.trim() || dict.dialogTitle,
          bookingId,
          rideId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error ?? dict.toastFailed);
        return;
      }

      toast.success(dict.toastSuccess);
      setReported(true);
      setOpen(false);
    } catch {
      toast.error(dict.toastFailed);
    } finally {
      setSubmitting(false);
    }
  }

  if (reported) {
    return (
      <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-slate-400">
        <Flag className="h-3.5 w-3.5" />
        {dict.reported}
      </p>
    );
  }

  return (
    <AlertDialog.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) setNote("");
        setOpen(next);
      }}
    >
      <AlertDialog.Trigger className="mt-3 flex items-center gap-1.5 text-xs font-medium text-slate-400 underline-offset-2 transition hover:text-red-600 hover:underline">
        <Flag className="h-3.5 w-3.5" />
        {dict.button}
      </AlertDialog.Trigger>

      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="fixed inset-0 z-50 bg-slate-900/40" />

        <AlertDialog.Popup className="fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
          <AlertDialog.Title className="text-lg font-bold text-slate-900">
            {dict.dialogTitle}
          </AlertDialog.Title>

          <AlertDialog.Description className="mt-2 text-sm text-slate-600">
            {dict.dialogDescription}
          </AlertDialog.Description>

          <div className="mt-4">
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              {dict.noteLabel}
            </label>

            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              maxLength={500}
              className="w-full rounded-2xl border border-slate-200 p-3 text-sm outline-none focus:border-emerald-500"
            />
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <AlertDialog.Close
              disabled={submitting}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {dict.cancel}
            </AlertDialog.Close>

            <button
              type="button"
              onClick={handleConfirm}
              disabled={submitting}
              className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? dict.submitting : dict.confirm}
            </button>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
