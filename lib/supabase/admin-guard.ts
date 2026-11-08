import { redirect } from "next/navigation";
import { createServerSupabase } from "./server";

export type AdminSession = {
  supabase: Awaited<ReturnType<typeof createServerSupabase>>;
  userId: string;
  email: string | null;
};

/**
 * The security boundary for everything under /admin and every write action.
 *
 * `middleware.ts` also redirects unauthenticated visitors, but that is a
 * convenience — it runs on the edge and can be bypassed by calling a server
 * action directly. THIS check, plus the RLS policies in 0002, is what actually
 * protects the data, so every action calls it before touching a table.
 *
 * Being signed in is not enough: the user must also be in `public.admins`,
 * which can only be populated by running SQL against the database.
 */
export async function requireAdmin(): Promise<AdminSession> {
  const supabase = await createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: admin } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!admin) {
    await supabase.auth.signOut();
    redirect("/admin/login?error=not-admin");
  }

  return { supabase, userId: user.id, email: user.email ?? null };
}
