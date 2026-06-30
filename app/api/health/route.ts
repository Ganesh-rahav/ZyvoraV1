import { NextResponse } from 'next/server'

/**
 * Health check endpoint.
 * Used by Vercel uptime monitoring and external health checkers.
 * Referenced in docs/03-system-architecture.md, Section 13.3.
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'zyvora-api',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version ?? '0.1.0',
    environment: process.env.NODE_ENV,
  })
}
