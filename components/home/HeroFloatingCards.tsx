import {
  CalendarDays,
  MapPin,
  Star,
  Users,
} from "lucide-react";

type Props = {
  dict: {
    eventName: string;
    eventLocation: string;
    rating: string;
    reviews: string;
    seatsAvailable: string;
    departureFrom: string;
    destination: string;
    destinationLocation: string;
  };
};

export default function HeroFloatingCards({ dict }: Props) {
  return (
    <>
      {/* Evento */}
      <div className="absolute left-0 top-10 rounded-2xl border border-white/40 bg-white/70 px-5 py-4 shadow-[0_15px_50px_rgba(15,23,42,.10)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:scale-[1.03]">

        <div className="flex items-center gap-3">

          <div className="rounded-xl bg-emerald-100 p-2">
            <CalendarDays className="h-5 w-5 text-emerald-600" />
          </div>

          <div>
            <p className="font-semibold text-slate-900">
              {dict.eventName}
            </p>

            <p className="text-sm text-slate-500">
              {dict.eventLocation}
            </p>
          </div>

        </div>

      </div>

      {/* Rating */}
      <div className="absolute right-0 top-40 rounded-2xl border border-white/40 bg-white/70 px-5 py-4 shadow-[0_15px_50px_rgba(15,23,42,.10)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:scale-[1.03]">

        <div className="flex items-center gap-3">

          <Star
            className="h-5 w-5 text-yellow-400"
            fill="currentColor"
          />

          <div>
            <p className="font-semibold text-slate-900">
              {dict.rating}
            </p>

            <p className="text-sm text-slate-500">
              {dict.reviews}
            </p>
          </div>

        </div>

      </div>

      {/* Posti */}
      <div className="absolute bottom-10 left-12 rounded-2xl border border-white/40 bg-white/70 px-5 py-4 shadow-[0_15px_50px_rgba(15,23,42,.10)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:scale-[1.03]">

        <div className="flex items-center gap-3">

          <Users className="h-5 w-5 text-emerald-600" />

          <div>
            <p className="font-semibold text-slate-900">
              {dict.seatsAvailable}
            </p>

            <p className="text-sm text-slate-500">
              {dict.departureFrom}
            </p>
          </div>

        </div>

      </div>

      {/* Destinazione */}
      <div className="absolute bottom-24 right-10 rounded-2xl border border-white/40 bg-white/70 px-5 py-4 shadow-[0_15px_50px_rgba(15,23,42,.10)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:scale-[1.03]">

        <div className="flex items-center gap-3">

          <MapPin className="h-5 w-5 text-emerald-600" />

          <div>
            <p className="font-semibold text-slate-900">
              {dict.destination}
            </p>

            <p className="text-sm text-slate-500">
              {dict.destinationLocation}
            </p>
          </div>

        </div>

      </div>
    </>
  );
}