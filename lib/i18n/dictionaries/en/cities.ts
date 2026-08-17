import type { it } from "../it";

export const cities: (typeof it)["cities"] = {
  index: {
    badge: "🗺️ Cities",
    title: "Browse events by city",
    subtitle:
      "Choose a city to see upcoming concerts and festivals and find a ride.",
    countSummary: "{count} Italian towns — page {page} of {totalPages}",
    noCities: "No cities available at the moment.",
    paginationAriaLabel: "City pagination",
    previous: "Previous",
    next: "Next",
    pageOf: "Page {page} of {totalPages}",
  },
  card: {
    eventsSingular: "{count} event scheduled",
    eventsPlural: "{count} events scheduled",
    noEvents: "No events scheduled",
  },
  hero: {
    badge: "City",
    title: "Events in {city}",
    withEventsSingular:
      "{count} event scheduled in {city}. Find a ride or share your trip with other attendees.",
    withEventsPlural:
      "{count} events scheduled in {city}. Find a ride or share your trip with other attendees.",
    noEvents: "No events scheduled in {city} at the moment.",
  },
  venueList: {
    title: "Venues in {city}",
  },
  venueHero: {
    withEventsSingular: "{count} event scheduled at {venue}.",
    withEventsPlural: "{count} events scheduled at {venue}.",
    noEvents: "No events scheduled at {venue} at the moment.",
  },
  artistHero: {
    badge: "Artist",
    withEventsSingular:
      "{count} date scheduled. Find a ride or share your trip with other attendees.",
    withEventsPlural:
      "{count} dates scheduled. Find a ride or share your trip with other attendees.",
    noEvents: "No dates scheduled for {artist} at the moment.",
  },
};
