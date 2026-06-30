/**
 * lib/ai/types/validation.ts
 *
 * Types for client-side image validation.
 */

export type ValidationErrorCode =
  | 'UNSUPPORTED_FORMAT'
  | 'FILE_TOO_LARGE'
  | 'FILE_TOO_SMALL'
  | 'RESOLUTION_TOO_LOW'
  | 'RESOLUTION_TOO_HIGH'
  | 'CORRUPTED_FILE'
  | 'DUPLICATE_UPLOAD'
  | 'INVALID_ASPECT_RATIO'
  | 'ORIENTATION_UNSUPPORTED'
  | 'UNKNOWN_ERROR'

export interface ValidationError {
  code: ValidationErrorCode
  message: string
  /** Actionable guidance for the user */
  hint: string
}

export interface ImageDimensions {
  width: number
  height: number
  aspectRatio: number
  megapixels: number
}

export interface ImageValidationResult {
  valid: boolean
  errors: ValidationError[]
  warnings: string[]
  dimensions?: ImageDimensions
  mimeType?: string
  fileSizeKb?: number
}

export interface ValidationConstraints {
  maxSizeBytes: number
  minSizeBytes: number
  maxWidthPx: number
  maxHeightPx: number
  minWidthPx: number
  minHeightPx: number
  allowedMimeTypes: readonly string[]
  minAspectRatio: number
  maxAspectRatio: number
}
