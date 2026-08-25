"use client";

import { useState } from "react";

import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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
  danger: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  warning: "bg-amber-600 text-white hover:bg-amber-700",
  default: "bg-primary text-primary-foreground hover:bg-primary/90",
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
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setNote("");
        onOpenChange(next);
      }}
    >
      <AlertDialogContent>
        <AlertDialogTitle>{title}</AlertDialogTitle>
        <AlertDialogDescription>{description}</AlertDialogDescription>

        <div className="mt-4">
          <Label htmlFor="admin-note-text">{noteLabel}</Label>

          <Textarea
            id="admin-note-text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            maxLength={500}
          />
        </div>

        <AlertDialogFooter>
          <AlertDialogClose disabled={busy}>{cancelLabel}</AlertDialogClose>

          <Button
            type="button"
            onClick={() => onConfirm(note.trim())}
            disabled={busy || (noteRequired && !note.trim())}
            className={TONE_CLASSES[confirmTone]}
          >
            {confirmLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
