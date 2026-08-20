"use client";

import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

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

const TONE_CLASSES: Record<NonNullable<Props["confirmTone"]>, string> = {
  danger: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  warning: "bg-amber-600 text-white hover:bg-amber-700",
  default: "bg-primary text-primary-foreground hover:bg-primary/90",
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
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogTitle>{title}</AlertDialogTitle>
        <AlertDialogDescription>{description}</AlertDialogDescription>

        <AlertDialogFooter>
          <AlertDialogClose disabled={busy}>Annulla</AlertDialogClose>

          <Button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={TONE_CLASSES[confirmTone]}
          >
            {busy ? "Attendere…" : confirmLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
