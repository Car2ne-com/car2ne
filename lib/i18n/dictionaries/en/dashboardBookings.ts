import type { it } from "../it";

export const dashboardBookings: (typeof it)["dashboardBookings"] = {
  widget: {
    title: "My bookings",
    subtitle: "The rides you've booked.",
    viewAll: "See all →",
    emptyTitle: "No bookings",
    emptyDescription: "You haven't booked any rides yet.",
    findEvent: "Find an event",
    statusConfirmed: "Confirmed",
    statusCancelled: "Cancelled",
    eventFallback: "Event",
    driverFallback: "Driver",
    manageBooking: "Manage booking",
  },
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
    eventFallback: "Event",
    statusConfirmed: "Confirmed",
    statusCancelled: "Cancelled",
    eventLabel: "Event",
    driverLabel: "Driver",
    driverFallback: "Driver",
    rideLabel: "Booked ride",
    viewEvent: "View event",
    openChat: "Open chat",
    cancelButton: "Cancel booking",
    dialogCancelButton: "Cancel",
    dialogPleaseWait: "Please wait…",
    cancelling: "Cancelling...",
    cancelConfirmMessage:
      "Are you sure you want to cancel this booking?\n\nThe seat will become available to other users again.",
    cancelSuccess: "Booking cancelled successfully.",
    cancelError: "Couldn't cancel the booking.",
    payTitle: "Pay the driver",
    payDisclaimer:
      "Payment happens directly between you and the driver. Car2ne does not take part in or guarantee the transaction.",
    payWithPaypal: "Pay with PayPal",
    payWithRevolut: "Pay with Revolut",
    payWithSatispay: "Pay with Satispay",
    payInPerson: "Pay in person",
    payInPersonNote:
      "Arrange with the driver to pay in cash or in person at the meeting point.",
    payConfirmTitle: "Confirm payment?",
    payConfirmDescription:
      "Did you complete the payment via {method}? Once confirmed, the booking will be marked as paid and this section will be disabled.",
    payConfirmButton: "Yes, I paid",
    markingPaid: "Recording...",
    markPaidSuccess: "Payment recorded!",
    markPaidError: "Couldn't record the payment.",
    methodPaypal: "PayPal",
    methodRevolut: "Revolut",
    methodSatispay: "Satispay",
    paidBadge: "Paid ✓",
    paidWith: "Paid with {method} on {date}",
  },
};
