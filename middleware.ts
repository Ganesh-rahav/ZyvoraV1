import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

/**
 * Next.js Middleware
 * Runs on every matched request before it reaches the page/route handler.
 * Responsibilities:
 *  1. Refresh Supabase auth session cookies (mandatory for @supabase/ssr)
 *  2. Enforce route-level authentication guards
 */
export async function middleware(request: NextRequest) {
  return await updateSession(request)
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
