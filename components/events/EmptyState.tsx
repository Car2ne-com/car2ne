import { SearchX } from "lucide-react";

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-8 py-20 text-center">

      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
        <SearchX className="h-10 w-10 text-emerald-600" />
      </div>

      <h3 className="text-2xl font-bold text-slate-900">
        Nessun evento trovato
      </h3>

      <p className="mt-3 max-w-md text-slate-500">
        Prova a modificare la ricerca.
      </p>

    </div>
  );
}