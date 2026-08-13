import { createClient } from "@/lib/supabase/client";

export async function getEvents() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("event_date");

  if (error) throw error;

  return data;
}