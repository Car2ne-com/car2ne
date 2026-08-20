import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import AdminUserTable from "@/components/admin/AdminUserTable";

export default async function AdminUsersPage() {
  const supabase = await createClient();

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  const adminClient = createAdminClient();

  /*
   * L'email vive solo in auth.users (non in profiles), quindi
   * serve il client service-role per recuperarla. perPage alto:
   * la base utenti è ancora piccola, va rivisto con la paginazione
   * reale se cresce oltre qualche migliaio.
   */
  const [
    { data: authUsers, error: authError },
    { data: profiles, error: profilesError },
  ] = await Promise.all([
    adminClient.auth.admin.listUsers({
      perPage: 1000,
    }),
    adminClient
      .from("profiles")
      .select("id, name, surname, role"),
  ]);

  if (authError) {
    throw new Error(authError.message);
  }

  if (profilesError) {
    throw new Error(profilesError.message);
  }

  const profileById = new Map(
    (profiles ?? []).map((profile) => [
      profile.id,
      profile,
    ])
  );

  const users = authUsers.users.map((authUser) => {
    const profile = profileById.get(authUser.id);

    return {
      id: authUser.id,
      email: authUser.email ?? "—",
      name: profile?.name ?? "",
      surname: profile?.surname ?? "",
      role: profile?.role ?? "user",
      createdAt: authUser.created_at,
    };
  });

  return (
    <main className="mx-auto max-w-7xl p-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">
          Gestione utenti
        </h1>

        <p className="mt-2 text-muted-foreground">
          Assegna o rimuovi il ruolo admin.
        </p>
      </div>

      <AdminUserTable
        users={users}
        currentUserId={currentUser?.id ?? ""}
      />
    </main>
  );
}
