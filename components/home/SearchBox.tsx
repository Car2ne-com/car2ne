"use client";

import { FormEvent, useState } from "react";
import { CalendarDays, MapPin, Search } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SearchBox() {
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
      className="rounded-[32px] border border-white/70 bg-white/90 p-4 shadow-2xl backdrop-blur-xl"
    >
      <div className="grid gap-4 md:grid-cols-[1.5fr_1.2fr_1fr_auto]">

        {/* Evento */}

        <div className="flex items-center rounded-2xl border border-gray-200 bg-gray-50 px-4 transition-all focus-within:border-emerald-400 focus-within:bg-white">
          <Search className="mr-3 h-5 w-5 shrink-0 text-gray-400" />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Cerca un evento"
            className="h-14 w-full bg-transparent outline-none placeholder:text-gray-400"
          />
        </div>

        {/* Partenza */}

        <div className="flex items-center rounded-2xl border border-gray-200 bg-gray-50 px-4 transition-all focus-within:border-emerald-400 focus-within:bg-white">
          <MapPin className="mr-3 h-5 w-5 shrink-0 text-gray-400" />

          <input
            type="text"
            value={departure}
            onChange={(event) =>
              setDeparture(event.target.value)
            }
            placeholder="Partenza"
            className="h-14 w-full bg-transparent outline-none placeholder:text-gray-400"
          />
        </div>

        {/* Data */}

        <div className="flex items-center rounded-2xl border border-gray-200 bg-gray-50 px-4 transition-all focus-within:border-emerald-400 focus-within:bg-white">
          <CalendarDays className="mr-3 h-5 w-5 shrink-0 text-gray-400" />

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

        <button
          type="submit"
          className="h-14 rounded-2xl bg-emerald-500 px-8 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-emerald-600 hover:shadow-xl"
        >
          Cerca
        </button>

      </div>
    </form>
  );
}