"use client";

import { useRouter } from "next/navigation";

import { LogOut } from "lucide-react";

import {
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { createClient } from "@/lib/supabase/client";

export default function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();

    router.push("/");
    router.refresh();
  }

  return (
    <DropdownMenuItem
      onClick={handleLogout}
      className="cursor-pointer text-red-600 focus:text-red-600"
    >
      <LogOut className="mr-2 h-4 w-4" />
      Esci
    </DropdownMenuItem>
  );
}