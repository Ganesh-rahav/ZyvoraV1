/**
 * lib/ai/security/hash.ts
 *
 * Client-side SHA-256 file hashing using the Web Crypto API.
 * The hash is computed over the original (pre-compression) file bytes
 * so duplicate uploads can be detected regardless of re-encoding.
 *
 * Never transmits file content — only the resulting hex digest.
 */

import type { HashResult } from '../types/security'
import { SecurityError } from '../errors'

/**
 * Compute a SHA-256 hash of any ArrayBuffer or Blob.
 * Uses the native SubtleCrypto API — no dependencies.
 */
export async function hashBuffer(data: ArrayBuffer): Promise<HashResult> {
  if (!globalThis.crypto?.subtle) {
    throw new SecurityError(
      'SubtleCrypto is not available in this environment.',
      'CRYPTO_UNAVAILABLE'
    )
  }

  const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))

  const hex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
  const base64 = btoa(String.fromCharCode(...new Uint8Array(hashBuffer)))

  return { algorithm: 'sha-256', hex, base64 }
}

/**
 * Compute SHA-256 hash of a File or Blob.
 */
export async function hashFile(file: File | Blob): Promise<HashResult> {
  const buffer = await file.arrayBuffer()
  return hashBuffer(buffer)
}

/**
 * Compare two hash results for equality (timing-safe string comparison).
 */
export function hashesEqual(a: HashResult, b: HashResult): boolean {
  if (a.hex.length !== b.hex.length) return false
  // XOR all chars — zero only if all chars match (constant-time in JS-land)
  let diff = 0
  for (let i = 0; i < a.hex.length; i++) {
    diff |= a.hex.charCodeAt(i) ^ b.hex.charCodeAt(i)
  }
  return diff === 0
}
