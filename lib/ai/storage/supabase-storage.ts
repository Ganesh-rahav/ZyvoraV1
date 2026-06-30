/**
 * lib/ai/storage/supabase-storage.ts
 *
 * Supabase Storage provider stub.
 * Implements IStorageProvider — wired to real Supabase client in Auth Sprint.
 *
 * TODO(auth-sprint): Inject the Supabase client and implement each method.
 */

import type {
  IStorageProvider,
  StorageOptions,
  StorageResult,
  StorageDeletionResult,
  StorageProvider,
} from '../types/storage'
import { StorageError } from '../errors'

export class SupabaseStorageProvider implements IStorageProvider {
  readonly name: StorageProvider = 'supabase'

  // TODO(auth-sprint): Accept SupabaseClient via constructor injection
  // constructor(private readonly supabase: SupabaseClient) {}

  async upload(_file: Blob, _options: StorageOptions): Promise<StorageResult> {
    // TODO(auth-sprint): Implement
    // const { data, error } = await this.supabase.storage
    //   .from(options.bucket)
    //   .upload(`${options.path}/${options.filename}`, file, { contentType: options.contentType })
    // if (error) throw new StorageError(error.message, 'SUPABASE_UPLOAD_FAILED')
    throw new StorageError(
      'SupabaseStorageProvider is not yet configured.',
      'NOT_CONFIGURED',
      false
    )
  }

  async getSignedUrl(_key: string, _ttlSeconds?: number): Promise<string> {
    // TODO(auth-sprint): Implement
    // const { data, error } = await this.supabase.storage
    //   .from(bucket).createSignedUrl(key, ttlSeconds ?? 3600)
    throw new StorageError('SupabaseStorageProvider is not yet configured.', 'NOT_CONFIGURED', false)
  }

  async delete(_key: string): Promise<StorageDeletionResult> {
    // TODO(auth-sprint): Implement
    throw new StorageError('SupabaseStorageProvider is not yet configured.', 'NOT_CONFIGURED', false)
  }

  async exists(_key: string): Promise<boolean> {
    // TODO(auth-sprint): Implement
    throw new StorageError('SupabaseStorageProvider is not yet configured.', 'NOT_CONFIGURED', false)
  }
}
