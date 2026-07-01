/**
 * lib/zci/types/reasoning.ts
 *
 * Reasoning trace types.
 *
 * Every recommendation is fully explainable via its reasoning trace.
 * The trace is NEVER shown to users directly —
 * it exists for explainability, debugging, auditing, and future learning.
 *
 * The trace captures the complete pipeline journey:
 * Input → Evidence → Observation → Priority → Decision → Recommendation
 */

import type { EvidenceCollection } from './evidence'
import type { ObservationSet } from './observation'
import type { PriorityRanking } from './priority'
import type { CoachingStrategy } from './decision'
import type { CoachingOutput } from './recommendation'

// ─── Reasoning Step ───────────────────────────────────────────────────────────

export type ReasoningStepType =
  | 'context_assembled'
  | 'evidence_collected'
  | 'observations_generated'
  | 'confidence_assessed'
  | 'priorities_ranked'
  | 'decision_made'
  | 'recommendations_generated'
  | 'safety_check_passed'
  | 'safety_check_failed'
  | 'output_formatted'

export interface ReasoningStep {
  step: ReasoningStepType
  /** ISO timestamp when this step completed */
  completedAt: string
  /** Processing time for this step in ms */
  durationMs: number
  /** Key facts surfaced in this step */
  keyFindings: string[]
  /** Any notable decisions made at this step */
  decisions: string[]
  /** Any assumptions made */
  assumptions: string[]
  /** Did this step alter the reasoning direction? */
  pivoted: boolean
  /** Why it pivoted (if applicable) */
  pivotReason?: string
}

// ─── Reasoning Trace ──────────────────────────────────────────────────────────

/**
 * ReasoningTrace captures the complete, ordered journey through the ZCI pipeline
 * for a single pipeline invocation. It is the "thinking" of the system.
 */
export interface ReasoningTrace {
  /** Unique trace identifier */
  id: string
  sessionId: string
  userId: string
  pipelineVersion: string
  startedAt: string
  completedAt: string
  totalDurationMs: number

  /** Ordered steps through the pipeline */
  steps: ReasoningStep[]

  /** Snapshot of each pipeline stage output */
  evidence: EvidenceCollection
  observations: ObservationSet
  priorities: PriorityRanking
  strategy: CoachingStrategy
  output: CoachingOutput

  /** High-level summary of the reasoning journey */
  summary: string
  /** Key decision points that shaped the final output */
  criticalDecisions: string[]
  /** Any uncertainty that significantly affected the output */
  uncertainties: string[]
  /** What additional data would have improved this reasoning? */
  dataGaps: string[]
}

// ─── Trace Builder Interface ──────────────────────────────────────────────────

export interface ITraceBuilder {
  startTrace(sessionId: string, userId: string): void
  recordStep(step: Omit<ReasoningStep, 'completedAt'>): void
  addEvidence(evidence: EvidenceCollection): void
  addObservations(observations: ObservationSet): void
  addPriorities(priorities: PriorityRanking): void
  addStrategy(strategy: CoachingStrategy): void
  addOutput(output: CoachingOutput): void
  finalize(): ReasoningTrace
}
