import Link from "next/link";
import { CalendarCheck, MapPin } from "lucide-react";

type Props = {
  event: {
    title: string;
    artist: string;
    city: string;
    venue: string;
    event_date: string;
  };
};

export default function EventConcluded({
  event,
}: Props) {
  const formattedDate = new Intl.DateTimeFormat(
    "it-IT",
    {
      dateStyle: "full",
    }
  ).format(new Date(event.event_date));

  return (
    <section className="mx-auto max-w-2xl px-6 py-32 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
        <CalendarCheck className="h-8 w-8 text-slate-400" />
      </div>

      <span className="mt-6 inline-flex rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600">
        Evento concluso
      </span>

      <h1 className="mt-6 text-4xl font-black tracking-tight text-slate-900">
        {event.title}
      </h1>

      <p className="mt-2 text-lg font-medium text-emerald-600">
        {event.artist}
      </p>

      <div className="mt-6 flex items-center justify-center gap-2 text-slate-500">
        <MapPin className="h-4 w-4" />
        <span>
          {event.city} · {event.venue}
        </span>
      </div>

      <p className="mt-1 text-slate-500">
        {formattedDate}
      </p>

      <p className="mx-auto mt-8 max-w-md text-slate-500">
        Questo evento si è già svolto, quindi non è più
        possibile cercare o offrire passaggi. Trova il tuo
        prossimo evento qui sotto.
      </p>

      <Link
        href="/events"
        className="mt-8 inline-flex rounded-2xl bg-emerald-500 px-8 py-4 font-semibold text-white transition hover:bg-emerald-600"
      >
        Sfoglia gli eventi
      </Link>
    </section>
  );
}
