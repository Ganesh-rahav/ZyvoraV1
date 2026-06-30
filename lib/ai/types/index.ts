/**
 * lib/ai/types/index.ts
 *
 * Barrel export for all AI infrastructure types.
 */

export type {
  BodyLandmark,
  MuscleGroup,
  PostureAssessment,
  SymmetryAssessment,
  BodyCompositionEstimate,
  ImageQualityMetrics,
  PhysiqueAnalysis,
  VisionAnalysisInput,
  VisionHealthStatus,
  IVisionProvider,
} from './vision'

export type {
  UploadStatus,
  UploadProgressEvent,
  CompressionResult,
  UploadOptions,
  UploadResult,
} from './upload'

export type {
  ValidationErrorCode,
  ValidationError,
  ImageDimensions,
  ImageValidationResult,
  ValidationConstraints,
} from './validation'

export type {
  StorageProvider,
  StorageOptions,
  StorageResult,
  StorageDeletionResult,
  IStorageProvider,
} from './storage'

export type {
  HashResult,
  AuditEventType,
  AuditEvent,
  EncryptionOptions,
  EncryptionReadyPayload,
} from './security'
