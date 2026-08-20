"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

type Dict = {
  title: string;
  description: string;
  openButton: string;
  warningTitle: string;
  warningBody: string;
  confirmLabel: string;
  confirmPlaceholder: string;
  confirmWord: string;
  confirmButton: string;
  deleting: string;
  cancelButton: string;
  success: string;
  genericError: string;
};

type Props = {
  dict: Dict;
};

export default function DeleteAccountForm({
  dict,
}: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);

  function resetForm() {
    setConfirmText("");
    setOpen(false);
  }

  async function handleDelete() {
    if (confirmText !== dict.confirmWord) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "/api/profile/delete",
        { method: "POST" }
      );

      const result = await response.json();

      if (!response.ok) {
        toast.error(
          result.error ?? dict.genericError
        );
        return;
      }

      await supabase.auth.signOut();

      toast.success(dict.success);

      router.push("/");
      router.refresh();
    } catch (error) {
      console.error(
        "Errore eliminazione account:",
        error
      );

      toast.error(dict.genericError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-destructive/20 bg-destructive/5 p-8">
      <div>
        <h3 className="text-lg font-semibold text-destructive">
          {dict.title}
        </h3>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {dict.description}
        </p>
      </div>

      <div className="mt-6">
        {!open ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(true)}
            className="h-11 rounded-2xl border-destructive/30 px-6 font-semibold text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {dict.openButton}
          </Button>
        ) : (
          <div className="space-y-6">
            <div className="flex gap-3 rounded-2xl bg-destructive/10 p-4">
              <AlertTriangle className="h-5 w-5 shrink-0 text-destructive" />

              <div>
                <p className="text-sm font-bold text-destructive">
                  {dict.warningTitle}
                </p>

                <p className="mt-1 text-sm leading-6 text-destructive/90">
                  {dict.warningBody}
                </p>
              </div>
            </div>

            <div>
              <Label>{dict.confirmLabel}</Label>

              <Input
                type="text"
                value={confirmText}
                onChange={(e) =>
                  setConfirmText(e.target.value)
                }
                placeholder={dict.confirmPlaceholder}
                disabled={loading}
                className="h-14 rounded-2xl focus-visible:border-destructive focus-visible:ring-destructive/20"
              />
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                disabled={
                  loading ||
                  confirmText !== dict.confirmWord
                }
                onClick={handleDelete}
                className="h-11 rounded-2xl bg-destructive px-6 font-semibold text-destructive-foreground hover:bg-destructive/90"
              >
                {loading
                  ? dict.deleting
                  : dict.confirmButton}
              </Button>

              <Button
                type="button"
                variant="outline"
                disabled={loading}
                onClick={resetForm}
                className="h-11 rounded-2xl px-6 font-semibold"
              >
                {dict.cancelButton}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
