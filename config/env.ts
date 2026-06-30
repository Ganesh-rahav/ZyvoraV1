/**
 * Environment variable validation.
 * Throws at startup if required vars are missing.
 * Import this in server-side code that depends on env vars.
 */

type EnvKey =
  | 'NEXT_PUBLIC_SUPABASE_URL'
  | 'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  | 'SUPABASE_SERVICE_ROLE_KEY'
  | 'OPENAI_API_KEY'

const REQUIRED_ENV_VARS: EnvKey[] = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
]

const REQUIRED_SERVER_ENV_VARS: EnvKey[] = [
  'SUPABASE_SERVICE_ROLE_KEY',
  'OPENAI_API_KEY',
]

/**
 * Validates public environment variables. Safe to call from any context.
 */
export function validatePublicEnv(): void {
  const missing = REQUIRED_ENV_VARS.filter(
    (key) => !process.env[key]
  )

  if (missing.length > 0) {
    throw new Error(
      `Missing required public environment variables:\n${missing.map((k) => `  - ${k}`).join('\n')}\n\nCopy .env.example to .env.local and fill in the values.`
    )
  }
}

/**
 * Validates server-only environment variables. Call only from server code.
 */
export function validateServerEnv(): void {
  validatePublicEnv()

  const missing = REQUIRED_SERVER_ENV_VARS.filter(
    (key) => !process.env[key]
  )

  if (missing.length > 0) {
    throw new Error(
      `Missing required server environment variables:\n${missing.map((k) => `  - ${k}`).join('\n')}`
    )
  }
}

/**
 * Typed environment variable accessor — throws if undefined.
 */
export function requireEnv(key: string): string {
  const value = process.env[key]
  if (!value) throw new Error(`Environment variable "${key}" is not set.`)
  return value
}
