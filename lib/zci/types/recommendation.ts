/**
 * lib/zci/types/recommendation.ts
 *
 * Recommendation types — the OUTPUT layer of ZCI.
 *
 * Recommendations are the product of the full pipeline.
 * They are always grounded in a CoachingStrategy and PriorityRanking.
 * They are always explainable via the ReasoningTrace.
 *
 * The Golden Rule: every recommendation influences future behaviour.
 */

import type { ConfidenceLevel } from './confidence'
import type { ImpactDomain } from './priority'

// ─── Action Step ─────────────────────────────────────────────────────────────

/**
 * A single, concrete, executable step.
 * Bad: "Eat more protein."
 * Good: "Add one palm-sized portion of protein after each training session."
 */
export interface ActionStep {
  id: string
  /** The specific action to take */
  action: string
  /** Why this action matters in context */
  rationale: string
  /** When to do it */
  timing?: string
  /** How to measure success */
  successCriteria?: string
  /** How difficult is this to implement? */
  difficulty: 'easy' | 'moderate' | 'hard'
  /** Is this a one-time or recurring action? */
  frequency: 'once' | 'daily' | 'per_session' | 'weekly' | 'ongoing'
}

// ─── Behaviour Goal ───────────────────────────────────────────────────────────

/**
 * A specific behavioural change target.
 * Grounded in the user's current state — not a generic prescription.
 */
export interface BehaviourGoal {
  id: string
  label: string
  /** Current state */
  currentState: string
  /** Target state */
  targetState: string
  /** Why this specific target for this specific user */
  personalisation: string
  /** The smallest next step */
  minimumViableAction: string
  /** Target timeframe in days */
  timeframeDays: number
  /** How to track progress */
  trackingMethod: string
  domain: ImpactDomain
}

// ─── Recommendation ───────────────────────────────────────────────────────────

export interface Recommendation {
  id: string
  /** Short coaching headline e.g. "Build your upper chest over the next 6 weeks" */
  headline: string
  /** The full coaching message — this is the ONLY place natural language appears */
  coachingMessage: string
  /** Why this recommendation, for this user, right now */
  whyNow: string
  /** What the user should expect if they follow this */
  expectedBenefit: string
  /** At least one alternative approach */
  alternatives: string[]
  /** Specific action steps */
  actionSteps: ActionStep[]
  /** Behaviour goal this recommendation supports */
  behaviourGoal?: BehaviourGoal
  /** Which priority this recommendation addresses */
  priorityId: string
  domain: ImpactDomain
  confidence: ConfidenceLevel
  /** ID of the reasoning trace that produced this recommendation */
  reasoningTraceId: string
}

// ─── Coaching Output ──────────────────────────────────────────────────────────

/**
 * The complete output of a ZCI pipeline run.
 * This is what gets returned to the UI and stored in memory.
 */
export interface CoachingOutput {
  sessionId: string
  generatedAt: string
  /** Top recommendations for this cycle (max 3) */
  recommendations: Recommendation[]
  /** The structured strategy that produced these recommendations */
  strategyId: string
  /** Summary coaching message — the "opening" of the coaching session */
  sessionOpeningMessage: string
  /** Any safety notices (non-blocking) */
  safetyNotices: string[]
  /** Whether any emergency protocol was triggered */
  emergencyTriggered: boolean
  /** Metadata for storage and future retrieval */
  meta: {
    pipelineVersion: string
    totalPrioritiesIdentified: number
    totalRecommendationsGenerated: number
    processingMs: number
  }
}
