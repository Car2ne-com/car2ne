"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { ShieldCheck, ShieldOff } from "lucide-react";
import { toast } from "sonner";

type User = {
  id: string;
  email: string;
  name: string;
  surname: string;
  role: string;
  createdAt: string;
};

type Props = {
  users: User[];
  currentUserId: string;
};

const PAGE_SIZE = 50;

export default function AdminUserTable({
  users,
  currentUserId,
}: Props) {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState<
    string | null
  >(null);
  const [visibleCount, setVisibleCount] =
    useState(PAGE_SIZE);

  const filteredUsers = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) return users;

    return users.filter(
      (user) =>
        user.email.toLowerCase().includes(query) ||
        user.name.toLowerCase().includes(query) ||
        user.surname.toLowerCase().includes(query)
    );
  }, [users, search]);

  const visibleUsers = filteredUsers.slice(
    0,
    visibleCount
  );

  async function setRole(
    userId: string,
    role: "admin" | "user",
    label: string
  ) {
    const confirmed = window.confirm(
      role === "admin"
        ? `Rendere "${label}" admin? Avrà accesso completo al pannello di gestione.`
        : `Rimuovere il ruolo admin a "${label}"?`
    );

    if (!confirmed) return;

    setBusyId(userId);

    try {
      const response = await fetch(
        `/api/admin/users/${userId}/role`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ role }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(
          data.error ?? "Operazione fallita."
        );
        return;
      }

      toast.success(
        role === "admin"
          ? `"${label}" è ora admin.`
          : `Ruolo admin rimosso a "${label}".`
      );

      router.refresh();
    } catch (error) {
      console.error(
        "Errore cambio ruolo utente:",
        error
      );

      toast.error(
        "Impossibile contattare il server."
      );
    } finally {
      setBusyId(null);
    }
  }

  if (users.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-16 text-center shadow-sm">
        <h2 className="text-2xl font-bold">
          Nessun utente
        </h2>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          placeholder="Cerca per nome o email..."
          className="h-12 w-full max-w-md rounded-xl border border-slate-300 px-4 outline-none focus:border-emerald-500"
        />
      </div>

      <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-left">
                Nome
              </th>

              <th className="px-6 py-4 text-left">
                Email
              </th>

              <th className="px-6 py-4 text-left">
                Ruolo
              </th>

              <th className="px-6 py-4 text-left">
                Registrato il
              </th>

              <th className="px-6 py-4 text-center">
                Azioni
              </th>
            </tr>
          </thead>

          <tbody>
            {visibleUsers.map((user) => {
              const label =
                `${user.name} ${user.surname}`.trim() ||
                user.email;

              const isAdmin =
                user.role === "admin";

              const isSelf =
                user.id === currentUserId;

              return (
                <tr
                  key={user.id}
                  className="border-t border-slate-100"
                >
                  <td className="px-6 py-5 font-semibold">
                    {label}
                    {isSelf && (
                      <span className="ml-2 text-xs font-normal text-slate-400">
                        (tu)
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-5 text-slate-600">
                    {user.email}
                  </td>

                  <td className="px-6 py-5">
                    {isAdmin ? (
                      <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                        Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                        Utente
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-5 text-sm text-slate-500">
                    {new Date(
                      user.createdAt
                    ).toLocaleDateString("it-IT")}
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex justify-center">
                      {isAdmin ? (
                        <button
                          onClick={() =>
                            setRole(
                              user.id,
                              "user",
                              label
                            )
                          }
                          disabled={
                            busyId === user.id ||
                            isSelf
                          }
                          title={
                            isSelf
                              ? "Non puoi rimuovere il tuo stesso ruolo admin"
                              : "Rimuovi ruolo admin"
                          }
                          className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <ShieldOff className="h-4 w-4" />
                          Rimuovi admin
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            setRole(
                              user.id,
                              "admin",
                              label
                            )
                          }
                          disabled={
                            busyId === user.id
                          }
                          title="Rendi admin"
                          className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <ShieldCheck className="h-4 w-4" />
                          Rendi admin
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {visibleCount < filteredUsers.length && (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={() =>
              setVisibleCount(
                (count) => count + PAGE_SIZE
              )
            }
            className="rounded-2xl border border-slate-200 bg-white px-8 py-3 font-semibold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50"
          >
            Carica altri (
            {filteredUsers.length - visibleCount}{" "}
            rimanenti)
          </button>
        </div>
      )}
    </div>
  );
}
