/**
 * lib/ai/storage/index.ts
 *
 * Storage provider factory + barrel export.
 * Provider is selected from AI_CONFIG.storage.provider.
 */

import type { IStorageProvider } from '../types/storage'
import { AI_CONFIG } from '../config'
import { MockStorageProvider }    from './mock-storage'
import { SupabaseStorageProvider } from './supabase-storage'

export type { IStorageProvider } from '../types/storage'
export { MockStorageProvider }    from './mock-storage'
export { SupabaseStorageProvider } from './supabase-storage'

let _instance: IStorageProvider | null = null

/**
 * Returns a singleton storage provider instance.
 * Provider selection is driven by AI_CONFIG.storage.provider.
 * Switching providers requires only an env var change — no code changes.
 */
export function getStorageProvider(): IStorageProvider {
  if (_instance) return _instance

  switch (AI_CONFIG.storage.provider) {
    case 'supabase':
      _instance = new SupabaseStorageProvider()
      break
    case 'mock':
    default:
      _instance = new MockStorageProvider()
  }

  return _instance
}

/** Reset the singleton (used in tests) */
export function resetStorageProvider(): void {
  _instance = null
}
