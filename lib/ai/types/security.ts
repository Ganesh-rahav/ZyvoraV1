/**
 * lib/ai/types/security.ts
 *
 * Security architecture types.
 * Production: SHA-256 hashing, upload signing, audit events.
 */

export interface HashResult {
  algorithm: 'sha-256'
  hex: string
  /** base64 encoding of the hash for URL-safe use */
  base64: string
}

export type AuditEventType =
  | 'PHOTO_UPLOAD_STARTED'
  | 'PHOTO_UPLOAD_COMPLETED'
  | 'PHOTO_UPLOAD_FAILED'
  | 'PHOTO_VALIDATION_FAILED'
  | 'PHOTO_ANALYSIS_STARTED'
  | 'PHOTO_ANALYSIS_COMPLETED'
  | 'PHOTO_ANALYSIS_FAILED'
  | 'PHOTO_DELETED'
  | 'PHOTO_ACCESSED'

export interface AuditEvent {
  eventType: AuditEventType
  timestamp: string
  /** Pseudonymised session identifier — never a real user ID here */
  sessionId: string
  /** SHA-256 hash of the file (not the file itself) */
  fileHash?: string
  uploadId?: string
  durationMs?: number
  success: boolean
  errorCode?: string
  meta?: Record<string, string | number | boolean>
}

export interface EncryptionOptions {
  algorithm: 'AES-256-GCM'
  keyDerivation: 'PBKDF2'
}

/** Architecture placeholder — encryption happens server-side via Supabase Storage policies */
export interface EncryptionReadyPayload {
  fileHash: string
  uploadId: string
  /** Signed token proving the upload was validated client-side */
  validationSignature: string
  encryptionOptions: EncryptionOptions
}
