import type { it } from "../it";

export const dashboardBookings: (typeof it)["dashboardBookings"] = {
  page: {
    badge: "🎟️ My bookings",
    title: "My bookings",
    subtitle: "Manage the rides you've booked on Car2ne.",
  },
  empty: {
    title: "No bookings yet",
    description:
      "When you book a ride, you'll find it here and can manage it directly from your account.",
    cta: "Search an event",
  },
  card: {
    statusConfirmed: "Confirmed",
    statusCancelled: "Cancelled",
    eventLabel: "Event",
    driverLabel: "Driver",
    driverFallback: "Driver",
    rideLabel: "Booked ride",
    viewEvent: "View event",
    openChat: "Open chat",
    cancelButton: "Cancel booking",
    cancelling: "Cancelling...",
    cancelConfirmMessage:
      "Are you sure you want to cancel this booking?\n\nThe seat will become available to other users again.",
    cancelSuccess: "Booking cancelled successfully.",
    cancelError: "Couldn't cancel the booking.",
  },
};
