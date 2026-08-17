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
    note: "Destination and date are set automatically from the event.",
  },
  fields: {
    originCityLabel: "Departure city *",
    departureTimeLabel: "Departure time *",
    departureTimeHint: "Choose the time you expect to leave.",
    seatsLabel: "Available seats *",
    contributionLabel: "Contribution (€) *",
    descriptionLabel: "Description",
    descriptionPlaceholder: "Add useful information for passengers...",
  },
  submit: {
    publishing: "Publishing...",
    publish: "Publish ride",
  },
  toasts: {
    selectDepartureCity: "Select a departure city from the suggestions.",
    fillRequiredFields: "Fill in all required fields.",
    selectValidEvent: "Select a valid event.",
    checkExistingRideFailed: "Couldn't verify your rides. Please try again.",
    publishFailed: "Couldn't publish the ride.",
    publishSuccess: "Ride published successfully!",
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
};
