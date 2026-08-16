import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

const MAX_RESULTS = 8;

type CityRow = {
  id: string;
  name: string;
  region: string | null;
};

/*
 * Ricerca pubblica sui comuni italiani (public.cities, 7.894+ righe).
 * Usata da CityCombobox invece di caricare l'intera tabella lato
 * client. Nessuna autenticazione richiesta: cities è già leggibile
 * pubblicamente via RLS, esattamente come le pagine /citta/*.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("q") ?? "").trim();

  if (!query) {
    return NextResponse.json({ cities: [] });
  }

  const supabase = await createClient();

  const { data, error } = await supabase.rpc("search_cities", {
    search_query: query,
    result_limit: MAX_RESULTS,
  });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    cities: ((data ?? []) as CityRow[]).map((city) => ({
      id: city.id,
      name: city.name,
      region: city.region,
    })),
  });
}
