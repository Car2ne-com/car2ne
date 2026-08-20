"use client";

import { useEffect, useState } from "react";

import { Bell, X } from "lucide-react";
import { toast } from "sonner";

import { usePushSubscription } from "@/lib/hooks/usePushSubscription";
import type { PushDict } from "@/components/notifications/PushNotificationToggle";

const DISMISS_KEY = "car2ne_push_prompt_dismissed";

type Props = {
  dict: PushDict;
};

/*
 * Banner mostrato una sola volta (per browser, non per account: la
 * subscription push è comunque legata al dispositivo/browser, non
 * ha senso ricordare la scelta lato server) al primo accesso alla
 * dashboard, per proporre l'attivazione delle notifiche push senza
 * costringere l'utente a scoprirle da solo in /dashboard/notifications.
 */
export default function PushNotificationPrompt({ dict }: Props) {
  const { supported, subscribed, permission, busy, enable } =
    usePushSubscription();

  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setDismissed(localStorage.getItem(DISMISS_KEY) === "1");
  }, []);

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  }

  async function handleEnable() {
    const ok = await enable();

    if (ok) {
      localStorage.setItem(DISMISS_KEY, "1");
      setDismissed(true);
      toast.success(dict.enableSuccess);
    } else {
      toast.error(dict.genericError);
    }
  }

  if (
    !supported ||
    subscribed ||
    permission === "denied" ||
    dismissed
  ) {
    return null;
  }

  return (
    <div className="mb-8 flex flex-col gap-4 rounded-3xl border border-emerald-200 bg-emerald-50 p-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-100">
          <Bell className="h-6 w-6 text-emerald-600" />
        </div>

        <div>
          <p className="font-bold text-slate-900">{dict.promptTitle}</p>

          <p className="mt-1 text-sm text-slate-600">
            {dict.promptDescription}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={handleEnable}
          disabled={busy}
          className="rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? dict.enabling : dict.enable}
        </button>

        <button
          type="button"
          onClick={dismiss}
          disabled={busy}
          title={dict.dismiss}
          aria-label={dict.dismiss}
          className="rounded-2xl border border-transparent p-3 text-slate-500 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
