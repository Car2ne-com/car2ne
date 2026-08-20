"use client";

import { Bell, BellOff } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { usePushSubscription } from "@/lib/hooks/usePushSubscription";

export type PushDict = {
  title: string;
  descriptionOff: string;
  descriptionOn: string;
  enable: string;
  disable: string;
  enabling: string;
  disabling: string;
  unsupported: string;
  permissionDenied: string;
  enableSuccess: string;
  disableSuccess: string;
  genericError: string;
  promptTitle: string;
  promptDescription: string;
  dismiss: string;
};

type Props = {
  dict: PushDict;
};

export default function PushNotificationToggle({ dict }: Props) {
  const { supported, subscribed, busy, enable, disable } =
    usePushSubscription();

  async function handleEnable() {
    const ok = await enable();
    toast[ok ? "success" : "error"](
      ok ? dict.enableSuccess : dict.genericError
    );
  }

  async function handleDisable() {
    const ok = await disable();
    toast[ok ? "success" : "error"](
      ok ? dict.disableSuccess : dict.genericError
    );
  }

  if (!supported) {
    return null;
  }

  return (
    <div className="mb-8 flex flex-col gap-4 rounded-3xl border border-border bg-card p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
            subscribed ? "bg-accent" : "bg-muted"
          }`}
        >
          {subscribed ? (
            <Bell className="h-6 w-6 text-accent-foreground" />
          ) : (
            <BellOff className="h-6 w-6 text-muted-foreground" />
          )}
        </div>

        <div>
          <p className="font-bold text-foreground">{dict.title}</p>

          <p className="mt-1 text-sm text-muted-foreground">
            {subscribed ? dict.descriptionOn : dict.descriptionOff}
          </p>
        </div>
      </div>

      <Button
        type="button"
        variant={subscribed ? "outline" : "default"}
        onClick={subscribed ? handleDisable : handleEnable}
        disabled={busy}
        size="lg"
        className="shrink-0 rounded-2xl px-5 py-3"
      >
        {busy
          ? subscribed
            ? dict.disabling
            : dict.enabling
          : subscribed
            ? dict.disable
            : dict.enable}
      </Button>
    </div>
  );
}
