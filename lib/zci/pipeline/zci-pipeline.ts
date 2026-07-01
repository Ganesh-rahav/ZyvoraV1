/**
 * lib/zci/pipeline/zci-pipeline.ts
 *
 * ZCIPipeline — the complete thinking system.
 *
 * This is the heart of Zyvora.
 * It orchestrates all engines in order.
 * It never generates text directly.
 * Text generation (coaching messages) occurs LAST, after all reasoning is complete.
 *
 * The Golden Rule: THINK before SPEAKING.
 *
 * Pipeline:
 * Context → Safety → Evidence → Confidence → Observations → Priorities → Decision → Behaviour → Output
 */

import type { CoachingOutput } from '../types/recommendation'
import type { ReasoningTrace } from '../types/reasoning'
import type { SafetyCheckResult } from '../types/safety'
import type { ICoachMemory } from '../types/memory'
import type { UserContext } from '../types/context'
import { collectEvidence } from '../engines/evidence'
import { runConfidenceEngine } from '../engines/confidence'
import { runObservationEngine } from '../engines/observation'
import { runPriorityEngine } from '../engines/priority'
import { runDecisionEngine } from '../engines/decision'
import { runSafetyGate } from '../engines/decision/safety-gate'
import { runBehaviourEngine } from '../engines/behaviour'
import { TraceBuilder } from '../reasoning/trace-builder'
import { PipelineError, toZCIError } from '../errors'
import { NullCoachMemory } from '../types/memory'

export interface ZCIPipelineResult {
  output: CoachingOutput
  trace: ReasoningTrace
  safetyResult: SafetyCheckResult
  success: boolean
  error?: string
}

export interface ZCIPipelineOptions {
  /** Optional memory layer — defaults to NullCoachMemory */
  memory?: ICoachMemory
  /** Set to true to skip trace generation (performance mode) */
  skipTrace?: boolean
}

/**
 * runZCIPipeline — executes the complete ZCI thinking pipeline.
 *
 * INPUT:  UserContext (fully assembled by ContextAssembler)
 * OUTPUT: CoachingOutput + ReasoningTrace
 *
 * Every step is recorded in the ReasoningTrace for full explainability.
 */
export async function runZCIPipeline(
  ctx: UserContext,
  options: ZCIPipelineOptions = {}
): Promise<ZCIPipelineResult> {
  const pipelineStartMs = Date.now()
  const tracer = new TraceBuilder()
  tracer.startTrace(ctx.sessionId, ctx.onboarding.firstName ?? 'anonymous')

  const memory = options.memory ?? new NullCoachMemory(ctx.onboarding.firstName ?? 'anonymous')
  void memory  // Memory integration in future sprint

  try {
    // ─── Step 0: Safety Gate ───────────────────────────────────────────────────
    const safetyResult = runSafetyGate(ctx)

    tracer.recordStep({
      step: safetyResult.safe ? 'safety_check_passed' : 'safety_check_failed',
      durationMs: 0,
      keyFindings: [
        safetyResult.safe ? 'No safety issues detected' : 'Safety issue detected — pipeline modified',
        `${safetyResult.signals.length} signals`,
      ],
      decisions: safetyResult.blockPipeline
        ? ['Pipeline BLOCKED by safety gate']
        : safetyResult.signals.length > 0
        ? ['Safety warnings noted — pipeline continues with modifications']
        : [],
      assumptions: [],
      pivoted: safetyResult.blockPipeline,
      pivotReason: safetyResult.blockPipeline ? 'Safety gate blocked pipeline' : undefined,
    })

    if (safetyResult.blockPipeline) {
      // Return a safe response immediately — no further pipeline processing
      const safeOutput = buildSafetyBlockOutput(ctx, safetyResult)
      const trace = buildMinimalTrace(tracer, ctx, safeOutput)
      return { output: safeOutput, trace, safetyResult, success: false, error: 'safety_gate_triggered' }
    }

    // ─── Step 1: Evidence Collection ──────────────────────────────────────────
    const { collection, step: evidenceStep } = await collectEvidence(ctx)
    tracer.addEvidence(collection)
    tracer.recordStep(evidenceStep)

    // ─── Step 2: Confidence Assessment ────────────────────────────────────────
    const { confidenceMap, step: confidenceStep } = runConfidenceEngine(collection)
    tracer.recordStep(confidenceStep)

    // ─── Step 3: Observation Generation ──────────────────────────────────────
    const { observationSet, step: observationStep } = runObservationEngine(collection, confidenceMap, ctx)
    tracer.addObservations(observationSet)
    tracer.recordStep(observationStep)

    // ─── Step 4: Priority Ranking ─────────────────────────────────────────────
    const { priorityRanking, step: priorityStep } = runPriorityEngine(observationSet, collection, confidenceMap, ctx)
    tracer.addPriorities(priorityRanking)
    tracer.recordStep(priorityStep)

    // ─── Step 5: Decision Engine ──────────────────────────────────────────────
    const { strategy, step: decisionStep } = runDecisionEngine(priorityRanking, ctx)
    tracer.addStrategy(strategy)
    tracer.recordStep(decisionStep)

    // ─── Step 6: Behaviour Engine (Recommendations) ───────────────────────────
    const { output, step: behaviourStep } = runBehaviourEngine(priorityRanking, strategy, ctx, pipelineStartMs)
    tracer.addOutput(output)
    tracer.recordStep(behaviourStep)

    tracer.recordStep({
      step: 'output_formatted',
      durationMs: Date.now() - pipelineStartMs,
      keyFindings: [
        `Total pipeline duration: ${Date.now() - pipelineStartMs}ms`,
        `${output.recommendations.length} recommendations ready for delivery`,
      ],
      decisions: ['Output formatted and ready'],
      assumptions: [],
      pivoted: false,
    })

    const trace = tracer.finalize()

    return { output, trace, safetyResult, success: true }

  } catch (err) {
    const zciErr = toZCIError(err, 'pipeline')
    throw new PipelineError(`ZCI Pipeline failed at stage: ${zciErr.stage}`, {
      stage: zciErr.stage,
      message: zciErr.message,
      sessionId: ctx.sessionId,
    })
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildSafetyBlockOutput(ctx: UserContext, safetyResult: SafetyCheckResult): CoachingOutput {
  return {
    sessionId: ctx.sessionId,
    generatedAt: new Date().toISOString(),
    recommendations: [],
    strategyId: ctx.sessionId,
    sessionOpeningMessage: safetyResult.forcedResponse ?? 'There is something important we need to address before continuing.',
    safetyNotices: safetyResult.signals.map((s) => s.requiredResponse),
    emergencyTriggered: safetyResult.signals.some((s) => s.level === 'emergency'),
    meta: {
      pipelineVersion: '1.0.0',
      totalPrioritiesIdentified: 0,
      totalRecommendationsGenerated: 0,
      processingMs: 0,
    },
  }
}

function buildMinimalTrace(
  tracer: TraceBuilder,
  ctx: UserContext,
  output: CoachingOutput
): ReasoningTrace {
  // Build a minimal valid trace for safety-blocked pipelines
  const minCollection = {
    sessionId: ctx.sessionId,
    collectedAt: new Date().toISOString(),
    items: [],
    totalCollected: 0,
    coveragePercent: 0,
  }
  const minObsSet = {
    sessionId: ctx.sessionId,
    observations: [],
    strengths: [],
    opportunities: [],
    totalObservations: 0,
    physiqueConverage: 0,
  }
  const minPriorities = {
    sessionId: ctx.sessionId,
    rankedAt: new Date().toISOString(),
    allPriorities: [],
    selectedPriorities: [],
    totalOpportunities: 0,
    selectionRationale: 'Pipeline blocked by safety gate',
  }
  const minStrategy = {
    sessionId: ctx.sessionId,
    decidedAt: new Date().toISOString(),
    training: { primaryMuscleGroups: [], movementPatterns: [], contraindicated: [], recommendedFrequencyPerWeek: 0, recommendedSessionMinutes: 0, phase: 'maintenance' as const, rationale: 'Safety gate', confidence: 'unknown' as const },
    nutrition: { caloricBalance: 'maintenance' as const, dailyCaloriesMin: 0, dailyCaloriesMax: 0, proteinPriority: 3 as const, proteinGramsPerKg: 0, behavioralFocus: [], rationale: 'Safety gate', confidence: 'unknown' as const },
    recovery: { isRecoveryLimiting: false, recoveryPriority: 1 as const, interventions: [], volumeModification: 'maintain' as const, rationale: 'Safety gate', confidence: 'unknown' as const },
    lifestyle: { limitingFactors: [], recommendations: [], priority: 1 as const, rationale: 'Safety gate' },
    behaviour: { habitsToEstablish: [], habitsToMaintain: [], adherenceRisks: [], predictedAdherenceProbability: 0, rationale: 'Safety gate' },
    overallConfidence: 'unknown' as const,
    recommendedCycleLengthWeeks: 0,
    nextReviewDate: new Date().toISOString(),
    assumptions: [],
    revisionTriggers: [],
  }

  tracer.addEvidence(minCollection)
  tracer.addObservations(minObsSet)
  tracer.addPriorities(minPriorities)
  tracer.addStrategy(minStrategy)
  tracer.addOutput(output)

  return tracer.finalize()
}
