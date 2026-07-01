/**
 * lib/zci/types/decision.ts
 *
 * Decision engine types.
 *
 * The Decision Engine answers ONE question:
 * "What produces the greatest transformation over the next coaching cycle?"
 *
 * It produces a structured coaching strategy — not free text.
 * Text generation comes AFTER the decision.
 */

import type { ConfidenceLevel } from './confidence'

// ─── Coaching Focus Areas ─────────────────────────────────────────────────────

export interface TrainingFocus {
  /** Primary muscle groups to prioritize */
  primaryMuscleGroups: string[]
  /** Movements or patterns to emphasize */
  movementPatterns: string[]
  /** Movements or patterns to AVOID (injuries, imbalances) */
  contraindicated: string[]
  /** Recommended training frequency per week */
  recommendedFrequencyPerWeek: number
  /** Recommended session duration in minutes */
  recommendedSessionMinutes: number
  /** Current phase recommendation */
  phase: 'hypertrophy' | 'strength' | 'endurance' | 'deload' | 'recomposition' | 'maintenance'
  /** Rationale for this training focus */
  rationale: string
  confidence: ConfidenceLevel
}

export interface NutritionFocus {
  /** Caloric balance recommendation */
  caloricBalance: 'deficit' | 'maintenance' | 'surplus' | 'aggressive_deficit' | 'aggressive_surplus'
  /**
   * Estimated daily caloric target range.
   * ZCI does NOT prescribe exact calories — it provides ranges.
   */
  dailyCaloriesMin: number
  dailyCaloriesMax: number
  /** Protein priority level 1–5 (5 = critical to address) */
  proteinPriority: 1 | 2 | 3 | 4 | 5
  /** Estimated daily protein target in grams per kg bodyweight */
  proteinGramsPerKg: number
  /** Key nutrition behaviors to adopt or improve */
  behavioralFocus: string[]
  rationale: string
  confidence: ConfidenceLevel
}

export interface RecoveryFocus {
  /** Is recovery a limiting factor right now? */
  isRecoveryLimiting: boolean
  /** Recovery priority level 1–5 */
  recoveryPriority: 1 | 2 | 3 | 4 | 5
  /** Specific recovery interventions to prioritize */
  interventions: string[]
  /** Target sleep hours */
  targetSleepHours?: number
  /** Should training volume be modified for recovery? */
  volumeModification: 'increase' | 'maintain' | 'reduce' | 'deload'
  rationale: string
  confidence: ConfidenceLevel
}

export interface LifestyleFocus {
  /** Lifestyle factors actively limiting transformation */
  limitingFactors: string[]
  /** Specific lifestyle changes recommended */
  recommendations: string[]
  /** Priority order for lifestyle changes */
  priority: 1 | 2 | 3 | 4 | 5
  rationale: string
}

export interface BehaviourFocus {
  /** Key habits to establish this cycle */
  habitsToEstablish: string[]
  /** Key habits to maintain */
  habitsToMaintain: string[]
  /** Potential adherence risks to mitigate */
  adherenceRisks: string[]
  /** Predicted adherence probability 0–1 */
  predictedAdherenceProbability: number
  rationale: string
}

// ─── Coaching Strategy ────────────────────────────────────────────────────────

/**
 * CoachingStrategy is the structured output of the Decision Engine.
 * It is the COMPLETE reasoning product — before any text is generated.
 */
export interface CoachingStrategy {
  sessionId: string
  decidedAt: string
  training: TrainingFocus
  nutrition: NutritionFocus
  recovery: RecoveryFocus
  lifestyle: LifestyleFocus
  behaviour: BehaviourFocus
  /** Overall confidence in this strategy */
  overallConfidence: ConfidenceLevel
  /** Coaching cycle length recommendation in weeks */
  recommendedCycleLengthWeeks: number
  /** When to re-evaluate this strategy */
  nextReviewDate: string
  /** Key assumptions this strategy depends on */
  assumptions: string[]
  /** What would cause this strategy to be revised? */
  revisionTriggers: string[]
}

// ─── Transformation Plan ──────────────────────────────────────────────────────

/**
 * TransformationPlan is the high-level arc — the coaching direction
 * over multiple cycles. Individual CoachingStrategies are instances within it.
 */
export interface TransformationPlan {
  userId: string
  createdAt: string
  primaryGoal: string
  /** Expected transformation timeline in weeks */
  timelineWeeks: number
  /** Key milestones with expected weeks to reach them */
  milestones: Array<{
    label: string
    expectedWeek: number
    metric: string
    target: string
  }>
  /** Phase sequence e.g. ['assessment', 'foundation', 'hypertrophy', 'cut'] */
  phases: string[]
  /** High-level vision statement — NOT generated text, structured data */
  transformationVision: {
    primaryFocus: string
    secondaryFocus: string
    keyStrengthsToPreserve: string[]
    keyOpportunitiesToAddress: string[]
  }
}
