import { notFound } from "next/navigation";

import AdminEventForm from "@/components/admin/AdminEventForm";
import { createClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditEventPage({ params }: Props) {
  const { id } = await params;

  const supabase = await createClient();

  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  if (!event) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-5xl p-10">
      <AdminEventForm event={event} />
    </main>
  );
}