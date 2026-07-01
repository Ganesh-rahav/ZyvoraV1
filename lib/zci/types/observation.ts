/**
 * lib/zci/types/observation.ts
 *
 * Observation types — the INTERPRETED layer above evidence.
 *
 * Rule: Every observation MUST reference at least one evidence item.
 * Rule: Observations do NOT contain recommendations.
 * Rule: Observations ARE conclusions about what the evidence means.
 */

import type { ConfidenceLevel } from './confidence'

// ─── Body Regions ─────────────────────────────────────────────────────────────

export type BodyRegion =
  | 'upper_chest'
  | 'lower_chest'
  | 'front_delts'
  | 'side_delts'
  | 'rear_delts'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'upper_back'
  | 'lats'
  | 'lower_back'
  | 'abs'
  | 'obliques'
  | 'glutes'
  | 'quads'
  | 'hamstrings'
  | 'calves'
  | 'overall_symmetry'
  | 'posture'
  | 'body_composition'

// ─── Observation Categories ───────────────────────────────────────────────────

export type ObservationCategory =
  | 'physique'          // What the body looks like
  | 'performance'       // Training capacity
  | 'nutrition'         // Dietary status
  | 'recovery'          // Recovery and readiness
  | 'lifestyle'         // Behavioral and lifestyle factors
  | 'psychological'     // Motivation, adherence, mindset signals
  | 'goal_alignment'    // How aligned current state is with goal

// ─── Development Status ───────────────────────────────────────────────────────

export type DevelopmentStatus =
  | 'underdeveloped'   // Significantly below balanced development
  | 'below_average'    // Slightly below
  | 'average'          // Expected for user profile
  | 'above_average'    // Slightly above
  | 'well_developed'   // Significantly above — strength of physique
  | 'unknown'          // Insufficient data

// ─── Core Observation ────────────────────────────────────────────────────────

export interface Observation {
  /** Unique identifier */
  id: string
  category: ObservationCategory
  /** The actual interpretive statement */
  statement: string
  /**
   * The specific body region this observation is about (if applicable).
   * Null for non-physique observations.
   */
  bodyRegion?: BodyRegion
  /** Development assessment (for physique observations) */
  developmentStatus?: DevelopmentStatus
  /**
   * IDs of evidence items that support this observation.
   * Must have at least one — enforced by ObservationEngine.
   */
  supportingEvidenceIds: string[]
  confidence: ConfidenceLevel
  /** Why confidence is at this level */
  confidenceReason: string
  /** True if this observation represents a strength to preserve */
  isStrength: boolean
  /** True if this observation represents an area for improvement */
  isOpportunity: boolean
  /** ISO timestamp */
  observedAt: string
}

// ─── Observation Set ──────────────────────────────────────────────────────────

export interface ObservationSet {
  sessionId: string
  observations: Observation[]
  strengths: Observation[]
  opportunities: Observation[]
  /** How many observations were generated */
  totalObservations: number
  /** How many required body regions have observations */
  physiqueConverage: number
}
