"use client";

import { useState } from "react";

import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
      <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Flag className="h-3.5 w-3.5" />
        {dict.reported}
      </p>
    );
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setNote("");
        setOpen(next);
      }}
    >
      <AlertDialogTrigger className="mt-3 flex items-center gap-1.5 text-xs font-medium text-muted-foreground underline-offset-2 transition hover:text-destructive hover:underline">
        <Flag className="h-3.5 w-3.5" />
        {dict.button}
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogTitle>
          {dict.dialogTitle}
        </AlertDialogTitle>

        <AlertDialogDescription>
          {dict.dialogDescription}
        </AlertDialogDescription>

        <div className="mt-4">
          <Label htmlFor="no-show-note">
            {dict.noteLabel}
          </Label>

          <Textarea
            id="no-show-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            maxLength={500}
            className="rounded-2xl"
          />
        </div>

        <AlertDialogFooter>
          <AlertDialogClose disabled={submitting}>
            {dict.cancel}
          </AlertDialogClose>

          <Button
            type="button"
            onClick={handleConfirm}
            disabled={submitting}
            className="h-auto bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground hover:bg-destructive/90"
          >
            {submitting ? dict.submitting : dict.confirm}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
