"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
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
    <div className="rounded-3xl border border-red-200 bg-red-50/40 p-8 shadow-sm">
      <div>
        <h3 className="text-xl font-bold text-red-700">
          {dict.title}
        </h3>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          {dict.description}
        </p>
      </div>

      <div className="mt-6">
        {!open ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(true)}
            className="h-11 rounded-2xl border-red-300 px-6 font-semibold text-red-700 hover:bg-red-100"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {dict.openButton}
          </Button>
        ) : (
          <div className="space-y-6">
            <div className="flex gap-3 rounded-2xl bg-red-100 p-4">
              <AlertTriangle className="h-5 w-5 shrink-0 text-red-600" />

              <div>
                <p className="text-sm font-bold text-red-800">
                  {dict.warningTitle}
                </p>

                <p className="mt-1 text-sm leading-6 text-red-700">
                  {dict.warningBody}
                </p>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                {dict.confirmLabel}
              </label>

              <input
                type="text"
                value={confirmText}
                onChange={(e) =>
                  setConfirmText(e.target.value)
                }
                placeholder={dict.confirmPlaceholder}
                disabled={loading}
                className="h-14 w-full rounded-2xl border border-slate-200 px-4 outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-100 disabled:cursor-not-allowed disabled:bg-slate-50"
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
                className="h-11 rounded-2xl bg-red-600 px-6 font-semibold hover:bg-red-700"
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
    </div>
  );
}
