/**
 * lib/ai/errors.ts
 *
 * Typed error hierarchy for the AI vision pipeline.
 * All pipeline errors extend ZyvoraAIError so callers can catch
 * the base class and still access structured metadata.
 */

// ─── Base error ───────────────────────────────────────────────────────────────

export class ZyvoraAIError extends Error {
  readonly code: string
  readonly retryable: boolean
  readonly meta?: Record<string, unknown>

  constructor(
    message: string,
    code: string,
    retryable = false,
    meta?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'ZyvoraAIError'
    this.code = code
    this.retryable = retryable
    this.meta = meta
  }
}

// ─── Validation errors ────────────────────────────────────────────────────────

export class ImageValidationError extends ZyvoraAIError {
  constructor(message: string, code: string, meta?: Record<string, unknown>) {
    super(message, code, false, meta)
    this.name = 'ImageValidationError'
  }
}

// ─── Compression errors ───────────────────────────────────────────────────────

export class CompressionError extends ZyvoraAIError {
  constructor(message: string, meta?: Record<string, unknown>) {
    super(message, 'COMPRESSION_FAILED', true, meta)
    this.name = 'CompressionError'
  }
}

// ─── Upload errors ────────────────────────────────────────────────────────────

export class UploadError extends ZyvoraAIError {
  constructor(message: string, code = 'UPLOAD_FAILED', retryable = true, meta?: Record<string, unknown>) {
    super(message, code, retryable, meta)
    this.name = 'UploadError'
  }
}

export class UploadTimeoutError extends UploadError {
  constructor(timeoutMs: number) {
    super(`Upload timed out after ${timeoutMs}ms`, 'UPLOAD_TIMEOUT', true, { timeoutMs })
    this.name = 'UploadTimeoutError'
  }
}

// ─── Storage errors ───────────────────────────────────────────────────────────

export class StorageError extends ZyvoraAIError {
  constructor(message: string, code = 'STORAGE_ERROR', retryable = true, meta?: Record<string, unknown>) {
    super(message, code, retryable, meta)
    this.name = 'StorageError'
  }
}

// ─── Vision provider errors ───────────────────────────────────────────────────

export class VisionProviderError extends ZyvoraAIError {
  readonly provider: string

  constructor(
    provider: string,
    message: string,
    code = 'VISION_PROVIDER_ERROR',
    retryable = true,
    meta?: Record<string, unknown>
  ) {
    super(message, code, retryable, meta)
    this.name = 'VisionProviderError'
    this.provider = provider
  }
}

export class VisionProviderUnavailableError extends VisionProviderError {
  constructor(provider: string) {
    super(provider, `Vision provider "${provider}" is currently unavailable.`, 'VISION_UNAVAILABLE', true)
    this.name = 'VisionProviderUnavailableError'
  }
}

export class VisionAnalysisTimeoutError extends VisionProviderError {
  constructor(provider: string, timeoutMs: number) {
    super(provider, `Vision analysis timed out after ${timeoutMs}ms`, 'VISION_TIMEOUT', true, { timeoutMs })
    this.name = 'VisionAnalysisTimeoutError'
  }
}

// ─── Security errors ──────────────────────────────────────────────────────────

export class SecurityError extends ZyvoraAIError {
  constructor(message: string, code = 'SECURITY_ERROR', meta?: Record<string, unknown>) {
    super(message, code, false, meta)
    this.name = 'SecurityError'
  }
}

// ─── Helper ───────────────────────────────────────────────────────────────────

/** Safely converts an unknown thrown value into a ZyvoraAIError */
export function toAIError(err: unknown, fallbackCode = 'UNKNOWN_ERROR'): ZyvoraAIError {
  if (err instanceof ZyvoraAIError) return err
  const message = err instanceof Error ? err.message : String(err)
  return new ZyvoraAIError(message, fallbackCode, false)
}
