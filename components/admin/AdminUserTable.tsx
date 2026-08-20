"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { ShieldCheck, ShieldOff } from "lucide-react";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import ConfirmDialog from "./ConfirmDialog";

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

type PendingRoleChange = {
  userId: string;
  role: "admin" | "user";
  label: string;
} | null;

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
  const [pendingRoleChange, setPendingRoleChange] =
    useState<PendingRoleChange>(null);

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
      setPendingRoleChange(null);
    }
  }

  if (users.length === 0) {
    return <EmptyState title="Nessun utente" description="" />;
  }

  return (
    <div>
      <div className="mb-4">
        <Input
          type="text"
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          placeholder="Cerca per nome o email..."
          className="h-12 max-w-md"
        />
      </div>

      <Card className="overflow-x-auto p-0">
        <table className="w-full">
          <thead className="bg-muted">
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
                  className="border-t border-border"
                >
                  <td className="px-6 py-5 font-semibold">
                    {label}
                    {isSelf && (
                      <span className="ml-2 text-xs font-normal text-muted-foreground">
                        (tu)
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-5 text-muted-foreground">
                    {user.email}
                  </td>

                  <td className="px-6 py-5">
                    {isAdmin ? (
                      <span className="inline-flex items-center rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
                        Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
                        Utente
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-5 text-sm text-muted-foreground">
                    {new Date(
                      user.createdAt
                    ).toLocaleDateString("it-IT")}
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex justify-center">
                      {isAdmin ? (
                        <Button
                          onClick={() =>
                            setPendingRoleChange({
                              userId: user.id,
                              role: "user",
                              label,
                            })
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
                          className="h-auto gap-2 rounded-xl bg-amber-500 px-4 py-2 text-white hover:bg-amber-600"
                        >
                          <ShieldOff className="h-4 w-4" />
                          Rimuovi admin
                        </Button>
                      ) : (
                        <Button
                          onClick={() =>
                            setPendingRoleChange({
                              userId: user.id,
                              role: "admin",
                              label,
                            })
                          }
                          disabled={
                            busyId === user.id
                          }
                          title="Rendi admin"
                          className="h-auto gap-2 rounded-xl px-4 py-2"
                        >
                          <ShieldCheck className="h-4 w-4" />
                          Rendi admin
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      {visibleCount < filteredUsers.length && (
        <div className="mt-6 flex justify-center">
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setVisibleCount(
                (count) => count + PAGE_SIZE
              )
            }
            className="h-auto rounded-2xl px-8 py-3"
          >
            Carica altri (
            {filteredUsers.length - visibleCount}{" "}
            rimanenti)
          </Button>
        </div>
      )}

      <ConfirmDialog
        open={pendingRoleChange !== null}
        onOpenChange={(open) => {
          if (!open) setPendingRoleChange(null);
        }}
        title={
          pendingRoleChange?.role === "admin"
            ? "Rendi admin"
            : "Rimuovi ruolo admin"
        }
        description={
          pendingRoleChange?.role === "admin"
            ? `Rendere "${pendingRoleChange?.label}" admin? Avrà accesso completo al pannello di gestione.`
            : `Rimuovere il ruolo admin a "${pendingRoleChange?.label}"?`
        }
        confirmLabel={
          pendingRoleChange?.role === "admin"
            ? "Rendi admin"
            : "Rimuovi admin"
        }
        confirmTone={
          pendingRoleChange?.role === "admin" ? "default" : "warning"
        }
        busy={busyId === pendingRoleChange?.userId}
        onConfirm={() => {
          if (pendingRoleChange) {
            setRole(
              pendingRoleChange.userId,
              pendingRoleChange.role,
              pendingRoleChange.label
            );
          }
        }}
      />
    </div>
  );
}
