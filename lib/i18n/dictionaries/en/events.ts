import type { it } from "../it";

export const events: (typeof it)["events"] = {
  meta: {
    index: {
      title: "Events | Car2ne",
      description:
        "Concerts, festivals, sports and fairs all over Italy: find a ride or share your trip with Car2ne.",
    },
    detail: {
      title: "{title} | Car2ne",
      description:
        "{artist} — {venue}, {city}. Find a ride to the event or share your trip with Car2ne.",
    },
  },
  header: {
    badge: "🎫 All events",
    title: "Find your next event",
    subtitle:
      "Concerts, festivals, sports, fairs and shows. Find a ride or share your trip with other attendees.",
  },
  search: {
    placeholder: "Search an event, a city or a venue...",
  },
  filters: {
    cityAriaLabel: "Filter by city",
    allCities: "All cities",
    venueAriaLabel: "Filter by venue",
    allVenues: "All venues",
    departureBadge: "📍 Departure searched",
    departureSearching: "You're looking for rides departing from",
    resultsCount: "{count} events found",
    previous: "Previous",
    next: "Next",
    pageIndicator: "Page {page} of {total}",
  },
  card: {
    ridesSingular: "ride",
    ridesPlural: "rides",
    viewEvent: "View event",
  },
  empty: {
    title: "No events found",
    description: "Try changing your search.",
    suggestCta: "Can't find it? Let us know",
  },
  concluded: {
    badge: "Event ended",
    description:
      "This event has already taken place, so it's no longer possible to search for or offer rides. Find your next event below.",
    browseEvents: "Browse events",
    leaveReviewButton: "Leave a review",
  },
  rides: {
    badge: "🚗 Available rides",
    title: "Choose your ride",
    subtitle: "Join other attendees and share the outbound and return trip.",
    emptyTitle: "No rides available",
    emptyDescription: "Be the first to offer one.",
    emptyCta: "Offer a ride",
    driverFallback: "Driver",
    driverLabel: "Driver",
    driverVerifiedBadge: "Verified",
    outboundLabel: "🚗 Outbound",
    returnLabel: "🔁 Return",
    seatsLabel: "seats available",
    statusPendingBanner: "⏳ Request awaiting driver confirmation.",
    statusConfirmedBanner: "✓ The driver confirmed your seat.",
    statusRejectedBanner: "Your previous request was declined.",
    buttonSending: "Sending request...",
    buttonYourRide: "Your ride",
    buttonRequestSent: "Request sent",
    buttonConfirmed: "Seat confirmed",
    buttonRequestAgain: "Request again",
    buttonRequestSeat: "Request outbound and return",
    errorOwnRide: "You can't request a seat on your own ride.",
    successRequestSent: "Request sent! The driver will need to confirm your seat.",
  },
};
