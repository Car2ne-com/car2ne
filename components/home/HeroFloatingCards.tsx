import {
  CalendarDays,
  MapPin,
  Star,
  Users,
} from "lucide-react";

export default function HeroFloatingCards() {
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
              Coldplay World Tour
            </p>

            <p className="text-sm text-slate-500">
              Milano • 18 Settembre
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
              4.9 / 5
            </p>

            <p className="text-sm text-slate-500">
              120 recensioni
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
              3 posti disponibili
            </p>

            <p className="text-sm text-slate-500">
              Partenza da Milano
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
              Tomorrowland
            </p>

            <p className="text-sm text-slate-500">
              Boom, Belgio
            </p>
          </div>

        </div>

      </div>
    </>
  );
}