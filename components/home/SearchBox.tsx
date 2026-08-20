"use client";

import { FormEvent, useState } from "react";
import { CalendarDays, MapPin, Search } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

type Props = {
  dict: {
    eventPlaceholder: string;
    departurePlaceholder: string;
    searchButton: string;
  };
};

export default function SearchBox({ dict }: Props) {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [departure, setDeparture] = useState("");
  const [date, setDate] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const params = new URLSearchParams();

    if (search.trim()) {
      params.set("search", search.trim());
    }

    if (departure.trim()) {
      params.set("from", departure.trim());
    }

    if (date) {
      params.set("date", date);
    }

    const queryString = params.toString();

    router.push(
      queryString
        ? `/events?${queryString}`
        : "/events"
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[32px] border border-border bg-card p-4 shadow-2xl"
    >
      <div className="grid gap-4 md:grid-cols-[1.5fr_1.2fr_1fr_auto]">

        {/* Evento */}

        <div className="flex items-center rounded-2xl border border-input bg-muted px-4 transition focus-within:border-ring focus-within:bg-background">
          <Search className="mr-3 h-5 w-5 shrink-0 text-muted-foreground" />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder={dict.eventPlaceholder}
            className="h-14 w-full bg-transparent outline-none placeholder:text-muted-foreground"
          />
        </div>

        {/* Partenza */}

        <div className="flex items-center rounded-2xl border border-input bg-muted px-4 transition focus-within:border-ring focus-within:bg-background">
          <MapPin className="mr-3 h-5 w-5 shrink-0 text-muted-foreground" />

          <input
            type="text"
            value={departure}
            onChange={(event) =>
              setDeparture(event.target.value)
            }
            placeholder={dict.departurePlaceholder}
            className="h-14 w-full bg-transparent outline-none placeholder:text-muted-foreground"
          />
        </div>

        {/* Data */}

        <div className="flex items-center rounded-2xl border border-input bg-muted px-4 transition focus-within:border-ring focus-within:bg-background">
          <CalendarDays className="mr-3 h-5 w-5 shrink-0 text-muted-foreground" />

          <input
            type="date"
            value={date}
            onChange={(event) =>
              setDate(event.target.value)
            }
            className="h-14 w-full bg-transparent outline-none"
          />
        </div>

        {/* Cerca */}

        <Button
          type="submit"
          className="h-14 rounded-2xl px-8 shadow-lg transition duration-300 hover:scale-105 hover:shadow-xl"
        >
          {dict.searchButton}
        </Button>

      </div>
    </form>
  );
}
