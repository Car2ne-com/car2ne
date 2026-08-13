import { Sparkles } from "lucide-react";

type Props = {
  name: string;
};

export default function DashboardHeader({ name }: Props) {
  return (
    <section className="mb-12">
      <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
        <Sparkles className="h-4 w-4" />
        Dashboard
      </span>

      <h1 className="mt-6 text-5xl font-black tracking-tight text-slate-900">
        Ciao {name} 👋
      </h1>

      <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
        Benvenuto nella tua dashboard. Da qui puoi gestire i tuoi passaggi,
        controllare le prenotazioni e organizzare tutti i tuoi viaggi verso gli
        eventi.
      </p>
    </section>
  );
}