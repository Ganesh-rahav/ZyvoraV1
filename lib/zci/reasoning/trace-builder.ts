/**
 * lib/zci/reasoning/trace-builder.ts
 *
 * TraceBuilder — accumulates pipeline steps and produces the final ReasoningTrace.
 * Implements ITraceBuilder.
 */

import type {
  ReasoningTrace,
  ReasoningStep,
  ITraceBuilder,
} from '../types/reasoning'
import type { EvidenceCollection } from '../types/evidence'
import type { ObservationSet } from '../types/observation'
import type { PriorityRanking } from '../types/priority'
import type { CoachingStrategy } from '../types/decision'
import type { CoachingOutput } from '../types/recommendation'
import { ZCI_CONFIG } from '../config'
import { nanoid } from '../utils/nanoid'

export class TraceBuilder implements ITraceBuilder {
  private traceId: string = ''
  private sessionId: string = ''
  private userId: string = ''
  private startedAt: string = ''
  private steps: ReasoningStep[] = []

  private evidence: EvidenceCollection | null = null
  private observations: ObservationSet | null = null
  private priorities: PriorityRanking | null = null
  private strategy: CoachingStrategy | null = null
  private output: CoachingOutput | null = null

  startTrace(sessionId: string, userId: string): void {
    this.traceId = nanoid('trace')
    this.sessionId = sessionId
    this.userId = userId
    this.startedAt = new Date().toISOString()
    this.steps = []
  }

  recordStep(step: Omit<ReasoningStep, 'completedAt'>): void {
    this.steps.push({
      ...step,
      completedAt: new Date().toISOString(),
    })
  }

  addEvidence(evidence: EvidenceCollection): void {
    this.evidence = evidence
  }

  addObservations(observations: ObservationSet): void {
    this.observations = observations
  }

  addPriorities(priorities: PriorityRanking): void {
    this.priorities = priorities
  }

  addStrategy(strategy: CoachingStrategy): void {
    this.strategy = strategy
  }

  addOutput(output: CoachingOutput): void {
    this.output = output
  }

  finalize(): ReasoningTrace {
    if (!this.evidence || !this.observations || !this.priorities || !this.strategy || !this.output) {
      throw new Error('TraceBuilder: finalize() called before all pipeline stages were added')
    }

    const completedAt = new Date().toISOString()
    const startMs = new Date(this.startedAt).getTime()
    const endMs = new Date(completedAt).getTime()

    // Collect all uncertainties from steps
    const uncertainties = this.steps
      .filter((s) => s.pivoted)
      .map((s) => s.pivotReason ?? 'Unknown pivot reason')

    // Data gaps from evidence — categories with absent evidence
    const dataGaps = this.evidence.items
      .filter((e) => e.strength === 'absent' || e.strength === 'weak')
      .map((e) => `Low-confidence evidence: ${e.category} — ${e.observation}`)
      .slice(0, 5)  // Cap at 5 to keep traces readable

    // Critical decisions are the decisions from the most important steps
    const criticalDecisions = this.steps
      .flatMap((s) => s.decisions)
      .filter(Boolean)
      .slice(0, 8)

    const summary = this.buildSummary()

    return {
      id: this.traceId,
      sessionId: this.sessionId,
      userId: this.userId,
      pipelineVersion: ZCI_CONFIG.pipelineVersion,
      startedAt: this.startedAt,
      completedAt,
      totalDurationMs: endMs - startMs,
      steps: this.steps,
      evidence: this.evidence,
      observations: this.observations,
      priorities: this.priorities,
      strategy: this.strategy,
      output: this.output,
      summary,
      criticalDecisions,
      uncertainties,
      dataGaps,
    }
  }

  private buildSummary(): string {
    const evidenceCount = this.evidence?.totalCollected ?? 0
    const obsCount = this.observations?.totalObservations ?? 0
    const priorityCount = this.priorities?.selectedPriorities.length ?? 0
    const recCount = this.output?.recommendations.length ?? 0

    return [
      `ZCI Pipeline v${ZCI_CONFIG.pipelineVersion} completed in ${Date.now() - new Date(this.startedAt).getTime()}ms.`,
      `Evidence: ${evidenceCount} items collected.`,
      `Observations: ${obsCount} generated (${this.observations?.strengths.length ?? 0} strengths, ${this.observations?.opportunities.length ?? 0} opportunities).`,
      `Priorities: ${this.priorities?.totalOpportunities ?? 0} identified, ${priorityCount} selected.`,
      `Recommendations: ${recCount} generated.`,
    ].join(' ')
  }
}
