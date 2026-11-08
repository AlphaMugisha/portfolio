import { createClient } from "@supabase/supabase-js";
import { SUPABASE_KEY, SUPABASE_URL, isSupabaseConfigured } from "./env";

/**
 * Cookie-less client for public pages. Reads only what RLS exposes to an
 * anonymous visitor — published rows — and is never used for writes.
 *
 * Returns null when Supabase is not configured, so callers fall back to the
 * static content rather than crashing the page.
 *
 * Deliberately NOT parameterised with a generated `Database` type. Those
 * generics change shape between postgrest-js releases and a mismatch collapses
 * every row to `never`, which is far more painful than it is worth. The
 * hand-written row types in `types/database.ts` carry the safety instead, and
 * every query that needs casting lives in `lib/db/` where it can be audited in
 * one place.
 */
export function createPublicClient() {
  if (!isSupabaseConfigured) return null;
  return createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
