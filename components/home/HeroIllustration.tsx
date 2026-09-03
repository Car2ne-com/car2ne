import { CalendarDays, Leaf, MapPin, Music, Users } from "lucide-react";

type Props = {
  dict: {
    departure: string;
    arrival: string;
    eventName: string;
    eventVenue: string;
    eventDate: string;
    rideDriver: string;
    rideRoute: string;
    rideSeats: string;
    co2Label: string;
    co2Value: string;
  };
};

/**
 * Hero visual: una composizione "prodotto" invece di un'illustrazione.
 * Un pannello con una rotta stilizzata (mappa astratta) e due card che
 * galleggiano sopra — evento + passaggio — come nell'app reale.
 */
export default function HeroIllustration({ dict }: Props) {
  return (
    <div className="relative hidden lg:block">
      {/* Pannello mappa / rotta */}
      <div className="relative aspect-[4/3.3] w-full max-w-[560px] overflow-hidden rounded-[2rem] border border-border bg-gradient-to-br from-primary/10 via-card to-accent shadow-pop ring-1 ring-inset ring-white/40">
        <div className="bg-dotgrid pointer-events-none absolute inset-0 text-foreground" />

        <svg
          viewBox="0 0 400 330"
          fill="none"
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-0 h-full w-full"
        >
          {/* Alone morbido sotto la rotta */}
          <path
            d="M58 286 C 150 250, 108 150, 200 128 S 296 84, 316 58"
            stroke="var(--primary)"
            strokeWidth="18"
            strokeLinecap="round"
            opacity="0.09"
          />
          {/* Rotta tratteggiata */}
          <path
            d="M58 286 C 150 250, 108 150, 200 128 S 296 84, 316 58"
            stroke="var(--primary)"
            strokeWidth="3.5"
            strokeDasharray="0.5 11"
            strokeLinecap="round"
            opacity="0.9"
          />
        </svg>

        {/* Nodo partenza */}
        <div className="absolute left-[16%] top-[87%] -translate-x-1/2 -translate-y-1/2">
          <div className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 shadow-soft">
            <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/50 ring-4 ring-muted-foreground/15" />
            <span className="text-xs font-semibold text-foreground">
              {dict.departure}
            </span>
          </div>
        </div>

        {/* Nodo arrivo */}
        <div className="absolute left-[79%] top-[18%] -translate-x-1/2 -translate-y-1/2">
          <div className="flex items-center gap-2 rounded-full bg-primary px-3 py-1.5 text-primary-foreground shadow-brand">
            <MapPin className="h-3.5 w-3.5" />
            <span className="text-xs font-semibold">{dict.arrival}</span>
          </div>
        </div>
      </div>

      {/* Card evento — galleggia in alto a sinistra */}
      <div className="absolute -left-8 top-6 w-[16.5rem] rounded-2xl border border-border bg-card p-4 shadow-pop">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
            <Music className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-foreground">
              {dict.eventName}
            </p>
            <p className="truncate text-sm text-muted-foreground">
              {dict.eventVenue}
            </p>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-1.5 border-t border-border pt-3 text-xs font-medium text-muted-foreground">
          <CalendarDays className="h-3.5 w-3.5" />
          {dict.eventDate}
        </div>
      </div>

      {/* Card passaggio — galleggia in basso a destra */}
      <div className="absolute -right-6 bottom-4 w-[17rem] rounded-2xl border border-border bg-card p-4 shadow-pop">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
            G
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              {dict.rideDriver}
            </p>
            <p className="truncate text-sm text-muted-foreground">
              {dict.rideRoute}
            </p>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-1.5 border-t border-border pt-3 text-xs font-medium text-muted-foreground">
          <Users className="h-3.5 w-3.5" />
          {dict.rideSeats}
        </div>
      </div>

      {/* Pill CO2 — piccolo accento sulla rotta */}
      <div className="absolute right-6 top-1/2 inline-flex -translate-y-1/2 items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground shadow-soft">
        <Leaf className="h-3.5 w-3.5 text-primary" />
        {dict.co2Label}
        <span className="text-primary">{dict.co2Value}</span>
      </div>
    </div>
  );
}
