/**
 * lib/ai/compression/image-compressor.ts
 *
 * Client-side image compression using the HTML5 Canvas API.
 *
 * Goals:
 *  • Maintain visual quality (target JPEG quality: 0.85)
 *  • Reduce upload size (typical 5–10 MB phone photo → ~300–600 KB)
 *  • Preserve original dimensions up to maxDimensionPx
 *  • Support HEIC/HEIF via canvas decode (browser handles natively on iOS 17+)
 *
 * No server-side processing — raw un-compressed images never leave the device.
 */

import type { CompressionResult } from '../types/upload'
import { CompressionError } from '../errors'
import { AI_CONFIG } from '../config'

export interface CompressOptions {
  quality?: number
  maxDimensionPx?: number
  outputFormat?: 'image/jpeg' | 'image/webp'
}

/**
 * Compress a File using the Canvas API.
 * Returns a Blob at the target quality and dimensions.
 */
export async function compressImage(
  file: File,
  options: CompressOptions = {}
): Promise<CompressionResult> {
  const {
    quality       = AI_CONFIG.upload.compressionQuality,
    maxDimensionPx = AI_CONFIG.upload.maxDimensionPx,
    outputFormat  = 'image/jpeg',
  } = options

  const originalSizeKb = Math.round(file.size / 1024)

  // Decode image into a bitmap
  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file)
  } catch (err) {
    throw new CompressionError('Failed to decode image for compression.', {
      originalError: err instanceof Error ? err.message : String(err),
    })
  }

  // Calculate target dimensions preserving aspect ratio
  let { width, height } = bitmap
  if (width > maxDimensionPx || height > maxDimensionPx) {
    const scale = maxDimensionPx / Math.max(width, height)
    width  = Math.round(width  * scale)
    height = Math.round(height * scale)
  }

  // Draw onto offscreen canvas
  const canvas = new OffscreenCanvas(width, height)
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    bitmap.close()
    throw new CompressionError('OffscreenCanvas 2D context unavailable.')
  }

  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  // Export as compressed JPEG/WebP
  let blob: Blob
  try {
    blob = await canvas.convertToBlob({ type: outputFormat, quality })
  } catch (err) {
    throw new CompressionError('Canvas export failed.', {
      originalError: err instanceof Error ? err.message : String(err),
    })
  }

  const compressedSizeKb = Math.round(blob.size / 1024)
  const compressionRatio = originalSizeKb > 0
    ? parseFloat((originalSizeKb / compressedSizeKb).toFixed(2))
    : 1

  return {
    blob,
    originalSizeKb,
    compressedSizeKb,
    compressionRatio,
    width,
    height,
    mimeType: outputFormat,
  }
}
