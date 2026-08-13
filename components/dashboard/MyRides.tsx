import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin, Users } from "lucide-react";

const rides = [
  {
    id: 1,
    event: "Coldplay World Tour",
    route: "Peschiera Borromeo → San Siro",
    date: "18 Settembre 2027",
    seats: "3 posti liberi",
  },
  {
    id: 2,
    event: "Formula 1 Monza",
    route: "Milano → Monza",
    date: "7 Settembre 2027",
    seats: "Completo",
  },
];

export default function MyRides() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900">
            I miei passaggi
          </h2>

          <p className="mt-2 text-slate-500">
            Gestisci i passaggi che hai pubblicato.
          </p>
        </div>

        <Link
          href="/offer-ride"
          className="text-sm font-semibold text-emerald-600 hover:text-emerald-700"
        >
          Nuovo →
        </Link>
      </div>

      <div className="space-y-5">
        {rides.map((ride) => (
          <div
            key={ride.id}
            className="rounded-2xl border border-slate-200 p-5 transition hover:border-emerald-200 hover:shadow-md"
          >
            <h3 className="text-lg font-bold text-slate-900">
              {ride.event}
            </h3>

            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-emerald-600" />
                {ride.route}
              </div>

              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-emerald-600" />
                {ride.date}
              </div>

              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-emerald-600" />
                {ride.seats}
              </div>
            </div>

            <button className="mt-5 flex items-center gap-2 font-semibold text-emerald-600 hover:text-emerald-700">
              Gestisci

              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}