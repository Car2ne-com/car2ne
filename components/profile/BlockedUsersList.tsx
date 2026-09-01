"use client";

import { useState } from "react";

import { ShieldOff } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

type Dict = {
  title: string;
  description: string;
  empty: string;
  unblockButton: string;
  unblocking: string;
  unblockedSuccess: string;
  errorGeneric: string;
};

export type BlockedUser = {
  id: string;
  name: string;
};

type Props = {
  blockedUsers: BlockedUser[];
  dict: Dict;
};

export default function BlockedUsersList({
  blockedUsers: initialBlockedUsers,
  dict,
}: Props) {
  const supabase = createClient();

  const [blockedUsers, setBlockedUsers] = useState(initialBlockedUsers);
  const [unblockingId, setUnblockingId] = useState<string | null>(null);

  async function handleUnblock(id: string) {
    setUnblockingId(id);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setUnblockingId(null);
      return;
    }

    const { error } = await supabase
      .from("blocked_users")
      .delete()
      .eq("blocker_id", user.id)
      .eq("blocked_id", id);

    setUnblockingId(null);

    if (error) {
      toast.error(dict.errorGeneric);
      return;
    }

    setBlockedUsers((current) => current.filter((u) => u.id !== id));
    toast.success(dict.unblockedSuccess);
  }

  return (
    <Card className="p-8">
      <h3 className="text-lg font-semibold text-foreground">{dict.title}</h3>

      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {dict.description}
      </p>

      {blockedUsers.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">{dict.empty}</p>
      ) : (
        <ul className="mt-6 divide-y divide-border">
          {blockedUsers.map((blockedUser) => (
            <li
              key={blockedUser.id}
              className="flex items-center justify-between gap-4 py-3"
            >
              <span className="text-sm font-medium text-foreground/90">
                {blockedUser.name}
              </span>

              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={unblockingId === blockedUser.id}
                onClick={() => handleUnblock(blockedUser.id)}
                className="font-semibold"
              >
                <ShieldOff className="mr-1.5 h-3.5 w-3.5" />
                {unblockingId === blockedUser.id
                  ? dict.unblocking
                  : dict.unblockButton}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
