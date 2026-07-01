/**
 * lib/zci/errors.ts
 *
 * ZCI-specific typed error hierarchy.
 */

export class ZCIError extends Error {
  readonly code: string
  readonly stage: string
  readonly meta?: Record<string, unknown>

  constructor(message: string, code: string, stage: string, meta?: Record<string, unknown>) {
    super(message)
    this.name = 'ZCIError'
    this.code = code
    this.stage = stage
    this.meta = meta
  }
}

export class ContextAssemblyError extends ZCIError {
  constructor(message: string, meta?: Record<string, unknown>) {
    super(message, 'CONTEXT_ASSEMBLY_FAILED', 'context_assembly', meta)
    this.name = 'ContextAssemblyError'
  }
}

export class EvidenceCollectionError extends ZCIError {
  constructor(message: string, meta?: Record<string, unknown>) {
    super(message, 'EVIDENCE_COLLECTION_FAILED', 'evidence_engine', meta)
    this.name = 'EvidenceCollectionError'
  }
}

export class ObservationError extends ZCIError {
  constructor(message: string, meta?: Record<string, unknown>) {
    super(message, 'OBSERVATION_FAILED', 'observation_engine', meta)
    this.name = 'ObservationError'
  }
}

export class PriorityEngineError extends ZCIError {
  constructor(message: string, meta?: Record<string, unknown>) {
    super(message, 'PRIORITY_ENGINE_FAILED', 'priority_engine', meta)
    this.name = 'PriorityEngineError'
  }
}

export class DecisionEngineError extends ZCIError {
  constructor(message: string, meta?: Record<string, unknown>) {
    super(message, 'DECISION_ENGINE_FAILED', 'decision_engine', meta)
    this.name = 'DecisionEngineError'
  }
}

export class SafetyGateError extends ZCIError {
  constructor(message: string, meta?: Record<string, unknown>) {
    super(message, 'SAFETY_GATE_TRIGGERED', 'safety_gate', meta)
    this.name = 'SafetyGateError'
  }
}

export class PipelineError extends ZCIError {
  constructor(message: string, meta?: Record<string, unknown>) {
    super(message, 'PIPELINE_FAILED', 'pipeline', meta)
    this.name = 'PipelineError'
  }
}

export function toZCIError(err: unknown, stage: string): ZCIError {
  if (err instanceof ZCIError) return err
  const message = err instanceof Error ? err.message : String(err)
  return new ZCIError(message, 'UNKNOWN_ZCI_ERROR', stage)
}
