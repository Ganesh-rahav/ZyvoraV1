/**
 * lib/zci/utils/nanoid.ts
 *
 * Lightweight ID generator — no external dependency.
 * Produces URL-safe IDs like: zci_k7f2x9q3
 */

export function nanoid(prefix = 'zci'): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).slice(2, 8)
  return `${prefix}_${timestamp}${random}`
}
