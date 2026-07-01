/**
 * lib/zci/types/priority.ts
 *
 * Priority engine types.
 *
 * The Priority Engine is the most important module in ZCI.
 * It ensures users are NEVER overwhelmed.
 * It ranks improvements by IMPACT, not by what the system can say.
 *
 * Priority = Impact × Confidence × Goal Alignment × Feasibility
 */

import type { ConfidenceLevel } from './confidence'
import type { ObservationCategory } from './observation'

// ─── Impact Domain ────────────────────────────────────────────────────────────

export type ImpactDomain =
  | 'physique_transformation'  // Direct visual/composition change
  | 'strength_performance'     // Force output, progressive overload
  | 'recovery_health'          // Sleep, stress, adaptation capacity
  | 'nutrition_metabolism'     // Caloric balance, macros, energy
  | 'adherence_behaviour'      // Sustainability, habit formation
  | 'injury_prevention'        // Risk reduction, longevity
  | 'lifestyle_integration'    // Work-life-training balance

// ─── Priority Score ───────────────────────────────────────────────────────────

export interface PriorityScore {
  /** 0–100 composite score */
  total: number
  /** Broken down by factor */
  breakdown: {
    /** How much impact does addressing this have? 0–100 */
    impact: number
    /** How confident are we this is actually an issue? 0–100 */
    confidence: number
    /** How well does this align with the user's primary goal? 0–100 */
    goalAlignment: number
    /** How feasible is this given the user's equipment, schedule, experience? 0–100 */
    feasibility: number
    /** Urgency modifier (injuries, extreme deficits, etc.) 0–100 */
    urgency: number
  }
}

// ─── Priority Item ────────────────────────────────────────────────────────────

export interface Priority {
  /** Unique identifier */
  id: string
  /** Short coaching label e.g. "Upper Chest", "Protein Intake", "Sleep Quality" */
  label: string
  /** Detailed description of what this priority addresses */
  description: string
  domain: ImpactDomain
  observationCategory: ObservationCategory
  /** Which observation IDs support this priority */
  supportingObservationIds: string[]
  score: PriorityScore
  confidence: ConfidenceLevel
  /** Rank 1 = highest priority */
  rank: number
  /**
   * Is this a SELECTED priority (will be actioned this cycle)?
   * The priority engine selects only the top N priorities.
   */
  selected: boolean
  /** Why was this ranked above others? */
  rankingRationale: string
}

// ─── Priority Ranking ─────────────────────────────────────────────────────────

export interface PriorityRanking {
  sessionId: string
  rankedAt: string
  /** All priorities, ranked by score */
  allPriorities: Priority[]
  /** The top priorities selected for this coaching cycle (default: top 3) */
  selectedPriorities: Priority[]
  /** Total number of identified opportunities */
  totalOpportunities: number
  /** Rationale for which priorities were selected vs. deferred */
  selectionRationale: string
}
