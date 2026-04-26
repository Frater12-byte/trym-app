import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase client for use in Client Components
 * (anything with "use client" directive).
 *
 * Usage:
 *   import { createClient } from "@/lib/supabase/client";
 *   const supabase = createClient();
 *   const { data, error } = await supabase.from("meals").select("*");
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
