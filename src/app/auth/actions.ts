"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/**
 * Logout server action.
 *
 * Critical: invalidates ALL cached pages so the browser back button
 * cannot restore an authenticated view.
 */
export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  // Wipe all cached server renders so /dashboard, /plan, /shopping, etc.
  // re-run the auth check on next visit (and bounce to /login).
  revalidatePath("/", "layout");

  redirect("/login");
}
