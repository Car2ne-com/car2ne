import {
  CalendarDays,
  MapPin,
  Star,
  Users,
} from "lucide-react";

import { Card } from "@/components/ui/card";

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
      <Card className="absolute left-0 top-10 rounded-2xl border-border/40 bg-card/70 px-5 py-4 shadow-[0_15px_50px_rgba(15,23,42,.10)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:scale-[1.03]">

        <div className="flex items-center gap-3">

          <div className="rounded-xl bg-accent p-2">
            <CalendarDays className="h-5 w-5 text-accent-foreground" />
          </div>

          <div>
            <p className="font-semibold text-foreground">
              {dict.eventName}
            </p>

            <p className="text-sm text-muted-foreground">
              {dict.eventLocation}
            </p>
          </div>

        </div>

      </Card>

      {/* Rating */}
      <Card className="absolute right-0 top-40 rounded-2xl border-border/40 bg-card/70 px-5 py-4 shadow-[0_15px_50px_rgba(15,23,42,.10)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:scale-[1.03]">

        <div className="flex items-center gap-3">

          <Star
            className="h-5 w-5 text-yellow-400"
            fill="currentColor"
          />

          <div>
            <p className="font-semibold text-foreground">
              {dict.rating}
            </p>

            <p className="text-sm text-muted-foreground">
              {dict.reviews}
            </p>
          </div>

        </div>

      </Card>

      {/* Posti */}
      <Card className="absolute bottom-10 left-12 rounded-2xl border-border/40 bg-card/70 px-5 py-4 shadow-[0_15px_50px_rgba(15,23,42,.10)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:scale-[1.03]">

        <div className="flex items-center gap-3">

          <Users className="h-5 w-5 text-accent-foreground" />

          <div>
            <p className="font-semibold text-foreground">
              {dict.seatsAvailable}
            </p>

            <p className="text-sm text-muted-foreground">
              {dict.departureFrom}
            </p>
          </div>

        </div>

      </Card>

      {/* Destinazione */}
      <Card className="absolute bottom-24 right-10 rounded-2xl border-border/40 bg-card/70 px-5 py-4 shadow-[0_15px_50px_rgba(15,23,42,.10)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:scale-[1.03]">

        <div className="flex items-center gap-3">

          <MapPin className="h-5 w-5 text-accent-foreground" />

          <div>
            <p className="font-semibold text-foreground">
              {dict.destination}
            </p>

            <p className="text-sm text-muted-foreground">
              {dict.destinationLocation}
            </p>
          </div>

        </div>

      </Card>
    </>
  );
}
