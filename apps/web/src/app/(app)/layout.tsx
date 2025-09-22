import { redirect } from "next/navigation";
import { getServerSupabase } from "@/lib/supabase/server";
import { ensureUser } from "@/lib/db";
import React from "react";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = getServerSupabase();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect("/signin");
  }
  await ensureUser(session.user.id);
  return <>{children}</>;
}
