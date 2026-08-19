"use client";

import { useState } from "react";

import { AlertDialog } from "@base-ui/react/alert-dialog";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  noteLabel: string;
  noteRequired?: boolean;
  confirmLabel: string;
  cancelLabel: string;
  confirmTone?: "danger" | "warning" | "default";
  busy?: boolean;
  onConfirm: (note: string) => void;
};

const TONE_CLASSES: Record<
  NonNullable<Props["confirmTone"]>,
  string
> = {
  danger: "bg-red-500 hover:bg-red-600",
  warning: "bg-amber-500 hover:bg-amber-600",
  default: "bg-emerald-500 hover:bg-emerald-600",
};

/*
 * Come ConfirmDialog, ma con un campo di testo per la motivazione
 * admin (rifiuto verifica, esito segnalazione) — condiviso tra
 * AdminVerificationTable e AdminReportTable, stesso identico bisogno.
 */
export default function AdminNoteDialog({
  open,
  onOpenChange,
  title,
  description,
  noteLabel,
  noteRequired = false,
  confirmLabel,
  cancelLabel,
  confirmTone = "default",
  busy = false,
  onConfirm,
}: Props) {
  const [note, setNote] = useState("");

  return (
    <AlertDialog.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) setNote("");
        onOpenChange(next);
      }}
    >
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="fixed inset-0 z-50 bg-slate-900/40" />

        <AlertDialog.Popup className="fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
          <AlertDialog.Title className="text-lg font-bold text-slate-900">
            {title}
          </AlertDialog.Title>

          <AlertDialog.Description className="mt-2 text-sm text-slate-600">
            {description}
          </AlertDialog.Description>

          <div className="mt-4">
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              {noteLabel}
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
              disabled={busy}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {cancelLabel}
            </AlertDialog.Close>

            <button
              type="button"
              onClick={() => onConfirm(note.trim())}
              disabled={busy || (noteRequired && !note.trim())}
              className={`rounded-xl px-4 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${TONE_CLASSES[confirmTone]}`}
            >
              {confirmLabel}
            </button>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
