import { NextResponse, type NextRequest } from 'next/server'

// TODO(auth-sprint): Supabase authentication middleware is temporarily bypassed
// to allow Vercel deployment before environment variables are configured.
// Re-enable by restoring the original implementation below when the
// Authentication sprint begins.
//
// Original implementation (DO NOT DELETE):
// ─────────────────────────────────────────────────────────────────────────────
// import { type NextRequest } from 'next/server'
// import { updateSession } from '@/lib/supabase/middleware'
//
// export async function middleware(request: NextRequest) {
//   return await updateSession(request)
// }
// ─────────────────────────────────────────────────────────────────────────────

/**
 * TEMPORARY PASSTHROUGH MIDDLEWARE
 * All routes pass through unconditionally.
 * No session refresh, no route guards, no redirects.
 * Replace this function body with the original above once Supabase
 * environment variables (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)
 * are set in Vercel project settings.
 */
export function middleware(_request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all paths EXCEPT:
     * - _next/static   (static files)
     * - _next/image    (image optimization)
     * - favicon.ico
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
