"use client";

import { Bell, BellOff } from "lucide-react";
import { toast } from "sonner";

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
    <div className="mb-8 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
            subscribed ? "bg-emerald-100" : "bg-slate-100"
          }`}
        >
          {subscribed ? (
            <Bell className="h-6 w-6 text-emerald-600" />
          ) : (
            <BellOff className="h-6 w-6 text-slate-400" />
          )}
        </div>

        <div>
          <p className="font-bold text-slate-900">{dict.title}</p>

          <p className="mt-1 text-sm text-slate-500">
            {subscribed ? dict.descriptionOn : dict.descriptionOff}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={subscribed ? handleDisable : handleEnable}
        disabled={busy}
        className={`shrink-0 rounded-2xl px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
          subscribed
            ? "border border-slate-200 text-slate-700 hover:bg-slate-50"
            : "bg-emerald-500 text-white hover:bg-emerald-600"
        }`}
      >
        {busy
          ? subscribed
            ? dict.disabling
            : dict.enabling
          : subscribed
            ? dict.disable
            : dict.enable}
      </button>
    </div>
  );
}
