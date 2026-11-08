/**
 * Supabase environment.
 *
 * `NEXT_PUBLIC_` variables must be read with a LITERAL property access so Next
 * can inline them into the browser bundle — `process.env[name]` is undefined on
 * the client.
 *
 * Nothing here throws when the variables are missing. The site is expected to
 * run before a Supabase project exists: `lib/db/public.ts` falls back to the
 * static content in `lib/` when `isSupabaseConfigured` is false, so a fresh
 * clone renders correctly with no .env.local at all. Only the admin area
 * actually requires the connection, and it says so.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const SUPABASE_URL = url ?? "";
export const SUPABASE_KEY = key ?? "";

/** True once both variables are present. See `.env.example`. */
export const isSupabaseConfigured = Boolean(url && key);

export const MEDIA_BUCKET = "media";

/**
 * Public CDN URL for an object in the media bucket.
 *
 * Paths that are already absolute pass straight through, which is what lets a
 * row point at a file in `public/` (`/images/portrait.jpg`) before anything has
 * been uploaded — the seed relies on this.
 */
export function mediaUrl(storagePath: string): string {
  if (!storagePath) return "";
  if (storagePath.startsWith("/") || /^https?:\/\//.test(storagePath)) return storagePath;
  return `${SUPABASE_URL}/storage/v1/object/public/${MEDIA_BUCKET}/${storagePath}`;
}
