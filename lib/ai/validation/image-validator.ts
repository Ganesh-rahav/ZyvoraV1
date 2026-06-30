/**
 * lib/ai/validation/image-validator.ts
 *
 * Client-side image validation service.
 * Runs entirely in the browser — no server round-trip required.
 *
 * Checks (in order):
 *  1. MIME type / extension
 *  2. File size (min + max)
 *  3. Image decodability (via createImageBitmap)
 *  4. Resolution (min + max dimensions)
 *  5. Aspect ratio
 */

import type {
  ImageValidationResult,
  ImageDimensions,
  ValidationError,
  ValidationConstraints,
} from '../types/validation'
import { AI_CONFIG } from '../config'

// ─── Default constraints from config ─────────────────────────────────────────

export const DEFAULT_CONSTRAINTS: ValidationConstraints = {
  maxSizeBytes:    AI_CONFIG.upload.maxFileSizeBytes,
  minSizeBytes:    AI_CONFIG.upload.minFileSizeBytes,
  maxWidthPx:      AI_CONFIG.upload.maxDimensionPx * 2,  // allow very wide panoramas
  maxHeightPx:     AI_CONFIG.upload.maxDimensionPx * 2,
  minWidthPx:      AI_CONFIG.upload.minDimensionPx,
  minHeightPx:     AI_CONFIG.upload.minDimensionPx,
  allowedMimeTypes: AI_CONFIG.upload.allowedMimeTypes,
  minAspectRatio:  0.3,   // very portrait (height >> width) — OK for phone cameras
  maxAspectRatio:  3.0,   // very landscape — likely not a physique photo
}

// ─── MIME type helpers ────────────────────────────────────────────────────────

const MIME_EXTENSIONS: Record<string, string[]> = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png':  ['.png'],
  'image/webp': ['.webp'],
  'image/heic': ['.heic'],
  'image/heif': ['.heif'],
}

function detectMimeType(file: File): string {
  // Prefer the browser-reported MIME type; fall back to extension sniffing
  if (file.type && file.type !== 'application/octet-stream') return file.type
  const ext = `.${file.name.split('.').pop()?.toLowerCase() ?? ''}`
  for (const [mime, exts] of Object.entries(MIME_EXTENSIONS)) {
    if (exts.includes(ext)) return mime
  }
  return file.type || 'application/octet-stream'
}

// ─── Dimension extraction ─────────────────────────────────────────────────────

async function getImageDimensions(file: File): Promise<ImageDimensions | null> {
  try {
    const bitmap = await createImageBitmap(file)
    const { width, height } = bitmap
    bitmap.close()
    return {
      width,
      height,
      aspectRatio: width / height,
      megapixels: parseFloat(((width * height) / 1_000_000).toFixed(2)),
    }
  } catch {
    return null   // createImageBitmap fails on corrupt files
  }
}

// ─── Main validator ───────────────────────────────────────────────────────────

export async function validateImage(
  file: File,
  constraints: ValidationConstraints = DEFAULT_CONSTRAINTS
): Promise<ImageValidationResult> {
  const errors: ValidationError[] = []
  const warnings: string[] = []
  const fileSizeKb = Math.round(file.size / 1024)
  const mimeType = detectMimeType(file)

  // 1. MIME type check
  if (!constraints.allowedMimeTypes.includes(mimeType as never)) {
    errors.push({
      code: 'UNSUPPORTED_FORMAT',
      message: `File type "${mimeType}" is not supported.`,
      hint: 'Please upload a JPG, PNG, WebP, or HEIC image.',
    })
  }

  // 2. File size — max
  if (file.size > constraints.maxSizeBytes) {
    errors.push({
      code: 'FILE_TOO_LARGE',
      message: `File is ${fileSizeKb} KB. Maximum is ${Math.round(constraints.maxSizeBytes / 1024)} KB.`,
      hint: `Reduce the image size to under ${Math.round(constraints.maxSizeBytes / 1024 / 1024)} MB and try again.`,
    })
  }

  // 3. File size — min (likely corrupt)
  if (file.size < constraints.minSizeBytes) {
    errors.push({
      code: 'FILE_TOO_SMALL',
      message: `File is only ${fileSizeKb} KB — this may be corrupted.`,
      hint: 'Select a complete, unmodified photo from your device.',
    })
  }

  // If format or size is wrong we can stop here before attempting to decode
  if (errors.length > 0) {
    return { valid: false, errors, warnings, mimeType, fileSizeKb }
  }

  // 4. Decodability + resolution
  const dimensions = await getImageDimensions(file)

  if (!dimensions) {
    errors.push({
      code: 'CORRUPTED_FILE',
      message: 'The image could not be decoded.',
      hint: 'The file may be corrupted. Try exporting or re-saving the photo.',
    })
    return { valid: false, errors, warnings, mimeType, fileSizeKb }
  }

  if (dimensions.width < constraints.minWidthPx || dimensions.height < constraints.minHeightPx) {
    errors.push({
      code: 'RESOLUTION_TOO_LOW',
      message: `Image is ${dimensions.width}×${dimensions.height}px. Minimum is ${constraints.minWidthPx}×${constraints.minHeightPx}px.`,
      hint: 'Use a photo taken with your phone camera for best results.',
    })
  }

  if (dimensions.width > constraints.maxWidthPx || dimensions.height > constraints.maxHeightPx) {
    // Soft warning — we'll compress it down
    warnings.push(
      `Image is ${dimensions.width}×${dimensions.height}px and will be resized automatically.`
    )
  }

  // 5. Aspect ratio
  const { aspectRatio } = dimensions
  if (aspectRatio < constraints.minAspectRatio || aspectRatio > constraints.maxAspectRatio) {
    errors.push({
      code: 'INVALID_ASPECT_RATIO',
      message: `Unusual aspect ratio (${aspectRatio.toFixed(2)}:1).`,
      hint: 'Take a full-body photo in portrait orientation.',
    })
  }

  const valid = errors.length === 0
  return { valid, errors, warnings, dimensions, mimeType, fileSizeKb }
}
