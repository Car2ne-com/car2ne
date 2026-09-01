"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { ShieldOff, ShieldCheck, Flag } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

type Dict = {
  blockButton: string;
  unblockButton: string;
  confirmTitle: string;
  confirmBody: string;
  confirmButton: string;
  cancelButton: string;
  blocking: string;
  unblocking: string;
  blockedSuccess: string;
  unblockedSuccess: string;
  errorGeneric: string;
  blockedBadge: string;
};

type Props = {
  targetUserId: string;
  initiallyBlocked: boolean;
  reportButtonLabel: string;
  dict: Dict;
};

export default function BlockUserButton({
  targetUserId,
  initiallyBlocked,
  reportButtonLabel,
  dict,
}: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [blocked, setBlocked] = useState(initiallyBlocked);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleBlock() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("blocked_users").insert({
      blocker_id: user.id,
      blocked_id: targetUserId,
    });

    setLoading(false);

    if (error) {
      toast.error(dict.errorGeneric);
      return;
    }

    setBlocked(true);
    setConfirmOpen(false);
    toast.success(dict.blockedSuccess);
    router.refresh();
  }

  async function handleUnblock() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from("blocked_users")
      .delete()
      .eq("blocker_id", user.id)
      .eq("blocked_id", targetUserId);

    setLoading(false);

    if (error) {
      toast.error(dict.errorGeneric);
      return;
    }

    setBlocked(false);
    toast.success(dict.unblockedSuccess);
    router.refresh();
  }

  if (blocked) {
    return (
      <div className="mt-6 flex flex-col items-center gap-3">
        <span className="inline-flex items-center gap-2 rounded-full bg-muted px-4 py-1.5 text-xs font-semibold text-muted-foreground">
          <ShieldOff className="h-3.5 w-3.5" />
          {dict.blockedBadge}
        </span>

        <Button
          type="button"
          variant="outline"
          disabled={loading}
          onClick={handleUnblock}
          className="h-10 px-5 text-sm font-semibold"
        >
          <ShieldCheck className="mr-2 h-4 w-4" />
          {loading ? dict.unblocking : dict.unblockButton}
        </Button>
      </div>
    );
  }

  if (confirmOpen) {
    return (
      <div className="mt-6 w-full max-w-sm space-y-4 rounded-2xl border border-destructive/20 bg-destructive/5 p-5 text-center">
        <p className="text-sm font-bold text-destructive">
          {dict.confirmTitle}
        </p>

        <p className="text-sm leading-6 text-muted-foreground">
          {dict.confirmBody}
        </p>

        <div className="flex justify-center gap-3">
          <Button
            type="button"
            disabled={loading}
            onClick={handleBlock}
            className="h-10 bg-destructive px-5 text-sm font-semibold text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? dict.blocking : dict.confirmButton}
          </Button>

          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={() => setConfirmOpen(false)}
            className="h-10 px-5 text-sm font-semibold"
          >
            {dict.cancelButton}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
      <Button
        type="button"
        variant="outline"
        onClick={() => setConfirmOpen(true)}
        className="h-10 border-destructive/30 px-5 text-sm font-semibold text-destructive hover:bg-destructive/10"
      >
        <ShieldOff className="mr-2 h-4 w-4" />
        {dict.blockButton}
      </Button>

      <Button
        type="button"
        variant="ghost"
        onClick={() =>
          router.push(`/segnala-un-problema?userId=${targetUserId}`)
        }
        className="h-10 px-5 text-sm font-semibold text-muted-foreground"
      >
        <Flag className="mr-2 h-4 w-4" />
        {reportButtonLabel}
      </Button>
    </div>
  );
}
