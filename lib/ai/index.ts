/**
 * lib/ai/index.ts
 *
 * Top-level barrel for the entire AI infrastructure.
 * Import from '@/lib/ai' for all AI-related functionality.
 */

// Types
export type {
  IVisionProvider,
  PhysiqueAnalysis,
  ImageQualityMetrics,
  VisionAnalysisInput,
  VisionHealthStatus,
} from './types/vision'

export type {
  UploadStatus,
  UploadProgressEvent,
  UploadOptions,
  UploadResult,
  CompressionResult,
} from './types/upload'

export type {
  ImageValidationResult,
  ValidationError,
  ValidationConstraints,
} from './types/validation'

export type {
  IStorageProvider,
  StorageResult,
} from './types/storage'

export type {
  HashResult,
  AuditEvent,
} from './types/security'

// Config
export { AI_CONFIG } from './config'

// Errors
export {
  ZyvoraAIError,
  ImageValidationError,
  CompressionError,
  UploadError,
  StorageError,
  VisionProviderError,
  toAIError,
} from './errors'

// Security
export { hashFile, hashBuffer, hashesEqual } from './security/hash'
export { emitAuditEvent, getSessionId }       from './security/audit'

// Validation
export { validateImage, DEFAULT_CONSTRAINTS } from './validation'

// Compression
export { compressImage } from './compression'

// Storage
export { getStorageProvider, resetStorageProvider } from './storage'

// Providers
export { getVisionProvider, resetVisionProvider } from './providers'

// Services
export { uploadPhoto, analysePhoto, validatePhotoQuality } from './services'
