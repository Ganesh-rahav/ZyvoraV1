/**
 * lib/pie/errors.ts
 *
 * PIE-specific error hierarchy.
 */

export class PIEError extends Error {
  readonly stage: string
  readonly analyzer: string

  constructor(message: string, meta: { stage: string; analyzer: string; cause?: string }) {
    super(message)
    this.name = 'PIEError'
    this.stage = meta.stage
    this.analyzer = meta.analyzer
    if (meta.cause) this.cause = meta.cause
  }
}

export class PIEAnalyzerError extends PIEError {
  constructor(analyzer: string, message: string, cause?: unknown) {
    super(`[${analyzer}] ${message}`, {
      stage: 'analyzer',
      analyzer,
      cause: cause instanceof Error ? cause.message : String(cause ?? ''),
    })
    this.name = 'PIEAnalyzerError'
  }
}

export class PIEEngineError extends PIEError {
  constructor(message: string, cause?: unknown) {
    super(message, {
      stage: 'engine',
      analyzer: 'engine',
      cause: cause instanceof Error ? cause.message : String(cause ?? ''),
    })
    this.name = 'PIEEngineError'
  }
}

export class PIEInsufficientDataError extends PIEError {
  constructor(message: string) {
    super(message, { stage: 'validation', analyzer: 'engine' })
    this.name = 'PIEInsufficientDataError'
  }
}

export function toPIEError(err: unknown, analyzer = 'unknown'): PIEError {
  if (err instanceof PIEError) return err
  const msg = err instanceof Error ? err.message : String(err)
  return new PIEAnalyzerError(analyzer, msg)
}
