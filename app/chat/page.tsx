import { redirect } from "next/navigation";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ChatList from "@/components/chat/ChatList";
import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "@/lib/i18n";

export default async function ChatPage() {
  const supabase = await createClient();
  const { dict } = await getTranslations();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <>
      <Navbar />

      <main className="mx-auto max-w-5xl px-6 pb-24 pt-28">
        <div className="mb-10">
          <h1 className="text-[2.5rem] leading-[1.05] font-medium tracking-tight text-foreground sm:text-5xl">
            {dict.chat.page.title}
          </h1>

          <p className="mt-4 text-lg text-muted-foreground">
            {dict.chat.page.subtitle}
          </p>
        </div>

        <ChatList currentUserId={user.id} dict={dict.chat.list} />
      </main>

      <Footer />
    </>
  );
}