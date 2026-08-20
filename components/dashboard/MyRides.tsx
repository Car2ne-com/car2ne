import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin, Users } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
    <Card className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            I miei passaggi
          </h2>

          <p className="mt-2 text-muted-foreground">
            Gestisci i passaggi che hai pubblicato.
          </p>
        </div>

        <Link
          href="/offer-ride"
          className="text-sm font-semibold text-primary hover:text-primary/80"
        >
          Nuovo →
        </Link>
      </div>

      <div className="space-y-5">
        {rides.map((ride) => (
          <div
            key={ride.id}
            className="rounded-2xl border border-border p-5 transition hover:border-primary/30 hover:shadow-md"
          >
            <h3 className="text-lg font-bold text-foreground">
              {ride.event}
            </h3>

            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                {ride.route}
              </div>

              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary" />
                {ride.date}
              </div>

              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                {ride.seats}
              </div>
            </div>

            <Button
              variant="link"
              className="mt-5 h-auto p-0 gap-2 font-semibold text-primary hover:text-primary/80"
            >
              Gestisci

              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
}