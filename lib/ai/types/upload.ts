/**
 * lib/ai/types/upload.ts
 *
 * Types for the upload pipeline.
 * The pipeline is: Validate → Compress → Hash → Store → Result
 */

export type UploadStatus =
  | 'idle'
  | 'validating'
  | 'compressing'
  | 'hashing'
  | 'uploading'
  | 'analysing'
  | 'complete'
  | 'error'
  | 'cancelled'

export interface UploadProgressEvent {
  status: UploadStatus
  /** 0–100 overall progress */
  progress: number
  /** Human-readable stage label */
  label: string
  /** Bytes uploaded so far (if available) */
  bytesUploaded?: number
  /** Total bytes to upload (if known) */
  bytesTotal?: number
}

export interface CompressionResult {
  /** Compressed blob */
  blob: Blob
  originalSizeKb: number
  compressedSizeKb: number
  compressionRatio: number
  width: number
  height: number
  mimeType: 'image/jpeg' | 'image/webp'
}

export interface UploadOptions {
  /** Maximum file size in bytes (default: 10 MB) */
  maxSizeBytes?: number
  /** Target quality after compression 0–1 (default: 0.85) */
  quality?: number
  /** Maximum dimension (width or height) in pixels (default: 2048) */
  maxDimension?: number
  /** MIME types to accept */
  allowedMimeTypes?: string[]
  /** Whether to generate a SHA-256 hash */
  generateHash?: boolean
}

export interface UploadResult {
  /** Unique identifier for this upload event */
  uploadId: string
  /** Storage key / path where the file is stored */
  storageKey: string
  /** Public or signed URL to access the file */
  accessUrl: string
  /** SHA-256 hash of the original (pre-compression) file */
  fileHash: string
  /** Final stored file size in KB */
  storedSizeKb: number
  originalSizeKb: number
  compressionRatio: number
  uploadedAt: string
  mimeType: string
}
