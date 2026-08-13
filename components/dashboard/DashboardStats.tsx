import {
  CarFront,
  Ticket,
  Star,
  Armchair,
} from "lucide-react";

type Props = {
  ridesCount: number;
  bookingsCount: number;
  seatsOffered: number;
  ratingAverage: number | null;
  ratingsCount: number;
};

export default function DashboardStats({
  ridesCount,
  bookingsCount,
  seatsOffered,
  ratingAverage,
  ratingsCount,
}: Props) {
  const stats = [
    {
      title: "Passaggi pubblicati",
      value: String(ridesCount),
      icon: CarFront,
      color: "bg-emerald-100 text-emerald-600",
    },
    {
      title: "Prenotazioni effettuate",
      value: String(bookingsCount),
      icon: Ticket,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title:
        ratingsCount > 0
          ? `Recensioni (${ratingsCount})`
          : "Recensioni",
      value:
        ratingAverage !== null
          ? ratingAverage.toFixed(1)
          : "—",
      icon: Star,
      color: "bg-amber-100 text-amber-600",
    },
    {
      title: "Posti offerti",
      value: String(seatsOffered),
      icon: Armchair,
      color: "bg-violet-100 text-violet-600",
    },
  ];

  return (
    <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.title}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
          >
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-2xl ${stat.color}`}
            >
              <Icon className="h-7 w-7" />
            </div>

            <h3 className="mt-6 text-4xl font-black text-slate-900">
              {stat.value}
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              {stat.title}
            </p>
          </div>
        );
      })}
    </section>
  );
}
