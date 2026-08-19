"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { toast } from "sonner";

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
};

type Props = {
  dict: PushDict;
};

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

export default function PushNotificationToggle({ dict }: Props) {
  const [supported, setSupported] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      !("PushManager" in window)
    ) {
      return;
    }

    setSupported(true);

    navigator.serviceWorker
      .register("/sw.js")
      .then(async (registration) => {
        const existing = await registration.pushManager.getSubscription();
        setSubscribed(!!existing);
      })
      .catch(() => {
        setSupported(false);
      });
  }, []);

  async function handleEnable() {
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

    if (!vapidPublicKey) {
      toast.error(dict.genericError);
      return;
    }

    setBusy(true);

    try {
      const permission = await Notification.requestPermission();

      if (permission !== "granted") {
        toast.error(dict.permissionDenied);
        return;
      }

      const registration = await navigator.serviceWorker.ready;

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          vapidPublicKey
        ) as BufferSource,
      });

      const json = subscription.toJSON();

      const response = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(json),
      });

      if (!response.ok) {
        throw new Error("subscribe failed");
      }

      setSubscribed(true);
      toast.success(dict.enableSuccess);
    } catch {
      toast.error(dict.genericError);
    } finally {
      setBusy(false);
    }
  }

  async function handleDisable() {
    setBusy(true);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        const endpoint = subscription.endpoint;
        await subscription.unsubscribe();

        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint }),
        });
      }

      setSubscribed(false);
      toast.success(dict.disableSuccess);
    } catch {
      toast.error(dict.genericError);
    } finally {
      setBusy(false);
    }
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
