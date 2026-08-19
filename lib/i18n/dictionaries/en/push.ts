import type { it } from "../it";

export const push: (typeof it)["push"] = {
  title: "Push notifications",
  descriptionOff:
    "Get notified in your browser even when Car2ne isn't open.",
  descriptionOn: "Push notifications are active on this device.",
  enable: "Enable push notifications",
  disable: "Disable push notifications",
  enabling: "Enabling...",
  disabling: "Disabling...",
  unsupported: "Your browser doesn't support push notifications.",
  permissionDenied:
    "You've blocked notifications for this site. Enable them in your browser settings.",
  enableSuccess: "Push notifications enabled.",
  disableSuccess: "Push notifications disabled.",
  genericError: "Couldn't update push notifications.",
};
