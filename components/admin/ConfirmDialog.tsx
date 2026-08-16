"use client";

import { AlertDialog } from "@base-ui/react/alert-dialog";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  confirmTone?: "danger" | "warning" | "default";
  busy?: boolean;
  onConfirm: () => void;
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
 * ConfirmDialog minimale e riutilizzabile per azioni admin
 * potenzialmente distruttive/irreversibili (bulk publish/reject,
 * delete). Sostituisce window.confirm(): stesso scopo, coerente con
 * il design del pannello invece del prompt nativo del browser.
 */
export default function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  confirmTone = "default",
  busy = false,
  onConfirm,
}: Props) {
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="fixed inset-0 z-50 bg-slate-900/40" />

        <AlertDialog.Popup className="fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
          <AlertDialog.Title className="text-lg font-bold text-slate-900">
            {title}
          </AlertDialog.Title>

          <AlertDialog.Description className="mt-2 text-sm text-slate-600">
            {description}
          </AlertDialog.Description>

          <div className="mt-6 flex justify-end gap-3">
            <AlertDialog.Close
              disabled={busy}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Annulla
            </AlertDialog.Close>

            <button
              type="button"
              onClick={onConfirm}
              disabled={busy}
              className={`rounded-xl px-4 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${TONE_CLASSES[confirmTone]}`}
            >
              {busy ? "Attendere…" : confirmLabel}
            </button>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
