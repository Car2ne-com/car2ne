import { redirect } from "next/navigation";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ChatList from "@/components/chat/ChatList";
import { createClient } from "@/lib/supabase/server";

export default async function ChatPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <>
      <Navbar />

      <main className="mx-auto max-w-5xl px-6 pb-24 pt-40">
        <div className="mb-10">
          <h1 className="text-5xl font-black tracking-tight text-slate-900">
            Chat
          </h1>

          <p className="mt-4 text-lg text-slate-600">
            Le tue conversazioni con gli altri utenti di
            Car2ne.
          </p>
        </div>

        <ChatList currentUserId={user.id} />
      </main>

      <Footer />
    </>
  );
}