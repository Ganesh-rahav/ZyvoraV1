/**
 * lib/ai/storage/mock-storage.ts
 *
 * In-memory mock storage provider.
 * Stores blob: object URLs in a WeakMap-like registry — no persistence,
 * no network calls. Revokes object URLs on delete.
 *
 * Used when NEXT_PUBLIC_STORAGE_PROVIDER=mock (the default).
 */

import type {
  IStorageProvider,
  StorageOptions,
  StorageResult,
  StorageDeletionResult,
  StorageProvider,
} from '../types/storage'

// In-memory registry: key → { url, sizeBytes }
const registry = new Map<string, { url: string; sizeBytes: number; storedAt: string }>()

export class MockStorageProvider implements IStorageProvider {
  readonly name: StorageProvider = 'mock'

  async upload(file: Blob, options: StorageOptions): Promise<StorageResult> {
    const filename = options.filename ?? `photo_${Date.now()}.jpg`
    const key = `${options.path}/${filename}`
    const url = URL.createObjectURL(file)
    const storedAt = new Date().toISOString()

    registry.set(key, { url, sizeBytes: file.size, storedAt })

    return {
      key,
      objectId: key,
      url,
      storedAt,
      sizeBytes: file.size,
      provider: 'mock',
    }
  }

  async getSignedUrl(key: string): Promise<string> {
    const entry = registry.get(key)
    if (!entry) throw new Error(`MockStorage: key "${key}" not found.`)
    return entry.url
  }

  async delete(key: string): Promise<StorageDeletionResult> {
    const entry = registry.get(key)
    if (entry) {
      URL.revokeObjectURL(entry.url)
      registry.delete(key)
    }
    return { key, deletedAt: new Date().toISOString(), success: true }
  }

  async exists(key: string): Promise<boolean> {
    return registry.has(key)
  }
}
