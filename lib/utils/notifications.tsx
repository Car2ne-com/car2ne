import {
  CheckCircle2,
  Clock3,
  Star,
  User2,
  XCircle,
} from "lucide-react";

export type NotificationLike = {
  type: string;
  booking_id: string | null;
  ride_id: string | null;
};

export function getNotificationIcon(
  type: string,
  size: "sm" | "md" = "sm"
) {
  const wrapperClass =
    size === "md"
      ? "flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
      : "flex h-10 w-10 shrink-0 items-center justify-center rounded-full";

  const iconClass =
    size === "md" ? "h-6 w-6" : "h-5 w-5";

  if (type === "booking_confirmed") {
    return (
      <div className={`${wrapperClass} bg-emerald-100`}>
        <CheckCircle2
          className={`${iconClass} text-emerald-600`}
        />
      </div>
    );
  }

  if (type === "booking_rejected") {
    return (
      <div className={`${wrapperClass} bg-red-100`}>
        <XCircle
          className={`${iconClass} text-red-500`}
        />
      </div>
    );
  }

  if (type === "booking_request") {
    return (
      <div className={`${wrapperClass} bg-amber-100`}>
        <User2
          className={`${iconClass} text-amber-600`}
        />
      </div>
    );
  }

  if (
    type === "review_reminder_passenger" ||
    type === "review_reminder_driver"
  ) {
    return (
      <div className={`${wrapperClass} bg-amber-100`}>
        <Star
          className={`${iconClass} text-amber-600`}
        />
      </div>
    );
  }

  return (
    <div className={`${wrapperClass} bg-slate-100`}>
      <Clock3
        className={`${iconClass} text-slate-500`}
      />
    </div>
  );
}

export function getNotificationHref(
  notification: NotificationLike
) {
  if (notification.type === "booking_request") {
    return "/dashboard/rides";
  }

  if (
    notification.type === "review_reminder_driver" &&
    notification.ride_id
  ) {
    return `/dashboard/rides/${notification.ride_id}`;
  }

  if (
    notification.type === "review_reminder_passenger" ||
    notification.booking_id
  ) {
    return "/dashboard/bookings";
  }

  return "/dashboard";
}
