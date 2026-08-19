import type { it } from "../it";

export const events: (typeof it)["events"] = {
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
    loadMore: "Load more events",
    remaining: "remaining",
  },
  card: {
    ridesSingular: "ride",
    ridesPlural: "rides",
    viewEvent: "View event",
  },
  empty: {
    title: "No events found",
    description: "Try changing your search.",
  },
  concluded: {
    badge: "Event ended",
    description:
      "This event has already taken place, so it's no longer possible to search for or offer rides. Find your next event below.",
    browseEvents: "Browse events",
  },
  rides: {
    badge: "🚗 Available rides",
    title: "Choose your ride",
    subtitle: "Join other attendees and share the trip.",
    emptyTitle: "No rides available",
    emptyDescription: "Be the first to offer one.",
    driverFallback: "Driver",
    driverLabel: "Driver",
    driverVerifiedBadge: "Verified",
    seatsLabel: "seats",
    statusPendingBanner: "⏳ Request awaiting driver confirmation.",
    statusConfirmedBanner: "✓ The driver confirmed your seat.",
    statusRejectedBanner: "Your previous request was declined.",
    buttonSending: "Sending request...",
    buttonYourRide: "Your ride",
    buttonRequestSent: "Request sent",
    buttonConfirmed: "Seat confirmed",
    buttonRequestAgain: "Request again",
    buttonRequestSeat: "Request seat",
    errorOwnRide: "You can't request a seat on your own ride.",
    successRequestSent: "Request sent! The driver will need to confirm your seat.",
  },
};
