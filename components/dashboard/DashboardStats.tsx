import Link from "next/link";
import {
  CarFront,
  Ticket,
  Star,
  Armchair,
} from "lucide-react";

import { Card } from "@/components/ui/card";

type Dict = {
  ridesPublished: string;
  bookingsMade: string;
  reviews: string;
  reviewsWithCount: string;
  seatsOffered: string;
};

type Props = {
  dict: Dict;
  userId: string;
  ridesCount: number;
  bookingsCount: number;
  seatsOffered: number;
  ratingAverage: number | null;
  ratingsCount: number;
};

export default function DashboardStats({
  dict,
  userId,
  ridesCount,
  bookingsCount,
  seatsOffered,
  ratingAverage,
  ratingsCount,
}: Props) {
  const stats = [
    {
      title: dict.ridesPublished,
      value: String(ridesCount),
      icon: CarFront,
      color: "bg-accent text-accent-foreground",
      href: "/dashboard/rides",
    },
    {
      title: dict.bookingsMade,
      value: String(bookingsCount),
      icon: Ticket,
      color: "bg-blue-100 text-blue-600",
      href: "/dashboard/bookings",
    },
    {
      title:
        ratingsCount > 0
          ? dict.reviewsWithCount.replace("{count}", String(ratingsCount))
          : dict.reviews,
      value:
        ratingAverage !== null
          ? ratingAverage.toFixed(1)
          : "—",
      icon: Star,
      color: "bg-amber-100 text-amber-600",
      href: `/profile/${userId}#reviews`,
    },
    {
      title: dict.seatsOffered,
      value: String(seatsOffered),
      icon: Armchair,
      color: "bg-violet-100 text-violet-600",
      href: "/dashboard/rides",
    },
  ];

  return (
    <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <Card
            key={stat.title}
            className="group relative p-6 transition duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg"
          >
            <Link
              href={stat.href}
              aria-label={stat.title}
              className="absolute inset-0 z-10"
            />

            <div
              className={`flex h-14 w-14 items-center justify-center rounded-2xl ${stat.color}`}
            >
              <Icon className="h-7 w-7" />
            </div>

            <h3 className="mt-6 text-4xl font-black text-foreground">
              {stat.value}
            </h3>

            <p className="mt-2 text-sm text-muted-foreground">
              {stat.title}
            </p>
          </Card>
        );
      })}
    </section>
  );
}
