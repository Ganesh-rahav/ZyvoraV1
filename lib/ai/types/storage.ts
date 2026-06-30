/**
 * lib/ai/types/storage.ts
 *
 * Storage provider abstraction types.
 * Today: Supabase Storage
 * Future: AWS S3, Cloudflare R2, Azure Blob
 */

export type StorageProvider = 'supabase' | 's3' | 'r2' | 'azure' | 'mock'

export interface StorageOptions {
  /** Storage bucket/container name */
  bucket: string
  /** Folder prefix / virtual directory */
  path: string
  /** Override the auto-generated filename */
  filename?: string
  /** Make the file publicly accessible (default: false) */
  isPublic?: boolean
  /** TTL in seconds for signed URLs */
  signedUrlTtlSeconds?: number
  /** Content-Type override */
  contentType?: string
}

export interface StorageResult {
  /** Unique key identifying the stored object */
  key: string
  /** Provider-level object identifier */
  objectId: string
  /** Publicly accessible URL or signed URL */
  url: string
  /** ISO timestamp */
  storedAt: string
  sizeBytes: number
  provider: StorageProvider
}

export interface StorageDeletionResult {
  key: string
  deletedAt: string
  success: boolean
  error?: string
}

/**
 * IStorageProvider — implemented by every storage backend.
 *
 * Implementations:
 *   MockStorageProvider     — stores blob URLs in memory only
 *   SupabaseStorageProvider — Supabase Storage (wired in Auth sprint)
 *   S3StorageProvider       — future
 */
export interface IStorageProvider {
  readonly name: StorageProvider

  upload(file: Blob, options: StorageOptions): Promise<StorageResult>

  getSignedUrl(key: string, ttlSeconds?: number): Promise<string>

  delete(key: string): Promise<StorageDeletionResult>

  exists(key: string): Promise<boolean>
}
