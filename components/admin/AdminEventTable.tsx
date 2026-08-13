"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { createClient } from "@/lib/supabase/client";

type Event = {
  id: string;
  title: string;
  artist: string;
  city: string;
  venue: string;
  category: string;
  event_date: string;
};

type Props = {
  events: Event[];
};

export default function AdminEventTable({ events }: Props) {
  const router = useRouter();
  const supabase = createClient();

  async function deleteEvent(id: string, title: string) {
    const confirmed = window.confirm(
      `Vuoi eliminare "${title}"?\n\nQuesta operazione è irreversibile.`
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("events")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Evento eliminato!");

    router.refresh();
  }

  if (events.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-16 text-center shadow-sm">
        <h2 className="text-2xl font-bold">
          Nessun evento
        </h2>

        <p className="mt-2 text-slate-500">
          Crea il primo evento dal pulsante in alto.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-6 py-4 text-left">
              Titolo
            </th>

            <th className="px-6 py-4 text-left">
              Artista
            </th>

            <th className="px-6 py-4 text-left">
              Città
            </th>

            <th className="px-6 py-4 text-left">
              Data
            </th>

            <th className="px-6 py-4 text-center">
              Azioni
            </th>
          </tr>
        </thead>

        <tbody>
          {events.map((event) => (
            <tr
              key={event.id}
              className="border-t border-slate-100"
            >
              <td className="px-6 py-5 font-semibold">
                {event.title}
              </td>

              <td className="px-6 py-5">
                {event.artist}
              </td>

              <td className="px-6 py-5">
                {event.city}
              </td>

              <td className="px-6 py-5">
                {new Date(
                  event.event_date
                ).toLocaleDateString("it-IT")}
              </td>

              <td className="px-6 py-5">
                <div className="flex justify-center gap-3">
                  <Link
                    href={`/admin/events/${event.id}`}
                    className="rounded-xl bg-blue-500 p-3 text-white transition hover:bg-blue-600"
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>

                  <button
                    onClick={() =>
                      deleteEvent(event.id, event.title)
                    }
                    className="rounded-xl bg-red-500 p-3 text-white transition hover:bg-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}