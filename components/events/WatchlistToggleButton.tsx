"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Bell, BellOff } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

type Dict = {
  notifyMe: string;
  stopNotifying: string;
  watchingBadge: string;
  toastAdded: string;
  toastRemoved: string;
  toastError: string;
};

type Props = {
  eventId: string;
  initiallyWatching: boolean;
  dict: Dict;
};

export default function WatchlistToggleButton({
  eventId,
  initiallyWatching,
  dict,
}: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [watching, setWatching] = useState(initiallyWatching);
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    if (loading) {
      return;
    }

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      router.push(
        `/login?redirect=${encodeURIComponent(window.location.pathname)}`
      );
      return;
    }

    if (watching) {
      const { error } = await supabase
        .from("event_watchlist")
        .delete()
        .eq("user_id", user.id)
        .eq("event_id", eventId);

      setLoading(false);

      if (error) {
        toast.error(dict.toastError);
        return;
      }

      setWatching(false);
      toast.success(dict.toastRemoved);
      router.refresh();
      return;
    }

    const { error } = await supabase
      .from("event_watchlist")
      .insert({ user_id: user.id, event_id: eventId });

    setLoading(false);

    if (error) {
      toast.error(dict.toastError);
      return;
    }

    setWatching(true);
    toast.success(dict.toastAdded);
    router.refresh();
  }

  return (
    <Button
      type="button"
      variant={watching ? "secondary" : "outline"}
      disabled={loading}
      onClick={handleToggle}
      className="h-10 gap-2 px-5 text-sm font-semibold"
    >
      {watching ? (
        <BellOff className="h-4 w-4" />
      ) : (
        <Bell className="h-4 w-4" />
      )}
      {watching ? dict.stopNotifying : dict.notifyMe}
    </Button>
  );
}
