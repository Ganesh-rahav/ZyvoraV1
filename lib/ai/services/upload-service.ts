/**
 * lib/ai/services/upload-service.ts
 *
 * Upload pipeline orchestrator.
 *
 * Pipeline (each step emits a progress event):
 *   1. Validate     — format, size, resolution, aspect ratio
 *   2. Hash         — SHA-256 of original file
 *   3. Compress     — Canvas API resize + quality reduction
 *   4. Store        — delegate to IStorageProvider
 *   5. Audit        — emit structured audit event
 *
 * The service is UI-agnostic. Progress is reported via an onProgress callback.
 */

import type { UploadOptions, UploadResult, UploadProgressEvent } from '../types/upload'
import type { PhotoViewType } from '@/types/photo-analysis'
import { validateImage }           from '../validation'
import { compressImage }           from '../compression'
import { hashFile }                from '../security'
import { emitAuditEvent, getSessionId } from '../security'
import { getStorageProvider }      from '../storage'
import { AI_CONFIG }               from '../config'
import { ImageValidationError, toAIError } from '../errors'
import { logger }                  from '@/lib/logger'

export interface UploadServiceInput {
  file: File
  viewType: PhotoViewType
  options?: UploadOptions
  onProgress?: (event: UploadProgressEvent) => void
}

function progress(
  onProgress: ((e: UploadProgressEvent) => void) | undefined,
  status: UploadProgressEvent['status'],
  pct: number,
  label: string
) {
  onProgress?.({ status, progress: pct, label })
}

export async function uploadPhoto(input: UploadServiceInput): Promise<UploadResult> {
  const { file, viewType, onProgress } = input
  const sessionId = getSessionId()
  const startTime = Date.now()
  const uploadId = `upl_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`

  logger.info('Photo upload started', { operation: 'uploadPhoto', meta: { viewType, uploadId } })
  emitAuditEvent('PHOTO_UPLOAD_STARTED', sessionId, true, { uploadId, meta: { viewType } })

  try {
    // ── Step 1: Validate ───────────────────────────────────────────────────
    progress(onProgress, 'validating', 5, 'Validating image...')

    const validation = await validateImage(file)
    if (!validation.valid) {
      const firstError = validation.errors[0]
      if (firstError) {
        emitAuditEvent('PHOTO_VALIDATION_FAILED', sessionId, false, {
          uploadId,
          errorCode: firstError.code,
        })
        throw new ImageValidationError(firstError.message, firstError.code)
      }
    }

    // ── Step 2: Hash original file ─────────────────────────────────────────
    progress(onProgress, 'hashing', 20, 'Securing file...')
    const hash = await hashFile(file)

    // ── Step 3: Compress ───────────────────────────────────────────────────
    progress(onProgress, 'compressing', 35, 'Optimising image...')

    const compression = await compressImage(file, {
      quality:        AI_CONFIG.upload.compressionQuality,
      maxDimensionPx: AI_CONFIG.upload.maxDimensionPx,
      outputFormat:   'image/jpeg',
    })

    logger.debug('Image compressed', {
      meta: {
        originalSizeKb:   compression.originalSizeKb,
        compressedSizeKb: compression.compressedSizeKb,
        ratio:            compression.compressionRatio,
      },
    })

    // ── Step 4: Upload to storage ──────────────────────────────────────────
    progress(onProgress, 'uploading', 55, 'Uploading securely...')

    const storageProvider = getStorageProvider()
    const storageResult = await storageProvider.upload(compression.blob, {
      bucket:      AI_CONFIG.storage.bucket,
      path:        `physique/${viewType}`,
      filename:    `${uploadId}_${viewType}.jpg`,
      contentType: 'image/jpeg',
    })

    progress(onProgress, 'uploading', 85, 'Finalising...')

    // ── Step 5: Audit ──────────────────────────────────────────────────────
    const durationMs = Date.now() - startTime
    emitAuditEvent('PHOTO_UPLOAD_COMPLETED', sessionId, true, {
      uploadId,
      fileHash:   hash.hex,
      durationMs,
    })

    logger.info('Photo upload completed', {
      operation: 'uploadPhoto',
      durationMs,
      meta: { uploadId, storageKey: storageResult.key },
    })

    progress(onProgress, 'complete', 100, 'Upload complete')

    return {
      uploadId,
      storageKey:        storageResult.key,
      accessUrl:         storageResult.url,
      fileHash:          hash.hex,
      storedSizeKb:      compression.compressedSizeKb,
      originalSizeKb:    compression.originalSizeKb,
      compressionRatio:  compression.compressionRatio,
      uploadedAt:        storageResult.storedAt,
      mimeType:          compression.mimeType,
    }
  } catch (err) {
    const aiError = toAIError(err)
    logger.error('Photo upload failed', aiError, { meta: { uploadId, viewType } })
    emitAuditEvent('PHOTO_UPLOAD_FAILED', sessionId, false, {
      uploadId,
      errorCode: aiError.code,
    })
    progress(onProgress, 'error', 0, 'Upload failed')
    throw aiError
  }
}
