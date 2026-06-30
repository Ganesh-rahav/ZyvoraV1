import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

/**
 * Supabase browser client — use in Client Components ('use client').
 * Creates a new client instance on each call; memoize at the component
 * level if needed. Using @supabase/ssr ensures cookies are handled
 * correctly for SSR/SSG pages.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
