import { createServerClient } from '@supabase/ssr'
import type { CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/types/database'

/**
 * Supabase middleware client — refreshes session cookies on every
 * request so that auth state is never stale. Required by @supabase/ssr.
 *
 * TODO(auth-sprint): The env-var guard below is a temporary safety net while
 * NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are not yet
 * configured in Vercel. Remove the guard once the Authentication sprint is
 * complete and credentials are deployed.
 */
export async function updateSession(request: NextRequest) {
  // TODO(auth-sprint): Remove this guard when Supabase env vars are available.
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refreshes the session if expired — do not remove.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // ── Route Protection Logic ──────────────────────────────────────────────
  const { pathname } = request.nextUrl

  // Public paths that do NOT require authentication
  const publicPaths = ['/', '/login', '/register', '/forgot-password']
  const isPublicPath = publicPaths.some((path) => pathname === path || pathname.startsWith(path))

  // Auth callback path — always allow
  const isAuthCallback = pathname.startsWith('/auth/callback')

  if (isAuthCallback) {
    return supabaseResponse
  }

  // Redirect unauthenticated users away from protected routes
  if (!user && !isPublicPath) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/login'
    redirectUrl.searchParams.set('redirectedFrom', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Redirect authenticated users away from auth pages
  const authPaths = ['/login', '/register', '/forgot-password']
  const isAuthPath = authPaths.includes(pathname)

  if (user && isAuthPath && !isAuthCallback) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/dashboard'
    return NextResponse.redirect(redirectUrl)
  }

  return supabaseResponse
}
