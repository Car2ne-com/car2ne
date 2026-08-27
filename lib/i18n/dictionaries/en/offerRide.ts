import type { it } from "../it";

export const offerRide: (typeof it)["offerRide"] = {
  header: {
    badge: "Offer a ride",
    title: "Share your trip",
    subtitle:
      "Do you have free seats in your car? Post your trip and let other attendees reach the event with you, splitting the cost.",
  },
  loginNotice:
    "You can fill out the form freely: your data won't be lost, we'll only ask you to log in when you publish the ride.",
  eventLabel: "Event *",
  eventCombobox: {
    loading: "Loading events...",
    placeholder: "Select an event",
    searchPlaceholder: "Search by title, artist or city...",
    noResults: "No events found.",
    moreResults: "{count} more results, refine your search.",
  },
  alreadyHasRide: {
    title: "You already have an active ride",
    description:
      "You've already published a ride for this event. You can edit or delete it from the My rides section.",
    cta: "Go to my rides",
  },
  eventInfo: {
    destination: "📍 Destination",
    eventDate: "📅 Event date",
    note: "The venue and date are set automatically from the event.",
  },
  fields: {
    originCityLabel: "Departure and return city *",
    departureTimeLabel: "Outbound time *",
    departureTimeHint: "Choose the time you expect to leave towards the event.",
    returnTimeLabel: "Return time *",
    returnTimeHint: "Choose the time you expect to leave from the event.",
    seatsLabel: "Available seats *",
    contributionLabel: "Contribution per passenger (€) *",
    contributionHint:
      "Round trip ~{distance} km · ~{suggested} per passenger, in line with a carpool · with {seats} seats the maximum is {max}",
    contributionHintNoDistance:
      "Per-passenger amount for the round trip. It's for splitting costs, not making money: maximum {max}.",
    descriptionLabel: "Description",
    descriptionPlaceholder: "Add useful information for passengers...",
  },
  submit: {
    publishing: "Publishing...",
    publish: "Publish ride",
  },
  toasts: {
    selectDepartureCity: "Select a city from the suggestions.",
    fillRequiredFields: "Fill in all required fields.",
    selectValidEvent: "Select a valid event.",
    checkExistingRideFailed: "Couldn't verify your rides. Please try again.",
    loadEventsFailed: "Couldn't load events. Reload the page and try again.",
    publishFailed: "Couldn't publish the ride.",
    publishSuccess: "Ride published successfully!",
    contributionTooHigh:
      "With these seats and this route, above {max} per passenger the trip would earn you a profit. Car2ne is for splitting costs, not making money.",
  },
  cityCombobox: {
    changeCityAriaLabel: "Change city",
    searching: "Searching...",
    searchFailed: "Search failed. Please try again.",
    noCityFound: "No city found.",
    minCharsHint: "Type at least {count} characters to search.",
    selectSuggestion: "Select a city from the suggestions.",
    placeholder: "Search a city...",
  },
  fairPrice: {
    title: "Contribution above the fair share",
    body: "For a round trip of about {distance} km, around {suggested} per passenger is already in line with a carpool. You can still publish, but above this the ride starts making you money: consider lowering the contribution.",
  },
};
