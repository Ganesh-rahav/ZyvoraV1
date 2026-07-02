/**
 * lib/pie/types/observation.ts
 *
 * Base observation type for all PIE observations.
 *
 * Every PIE observation answers three questions:
 *   What was observed?   → value
 *   How sure are we?     → confidence + reason
 *   Can we see it?       → visibility
 *
 * PIE NEVER makes recommendations.
 * PIE NEVER generates text for users.
 * PIE ONLY structures what is observed.
 */

// ─── Confidence ───────────────────────────────────────────────────────────────

export type PIEConfidence =
  | 'high'      // Clear, unambiguous visual evidence
  | 'moderate'  // Visible but partially obscured or estimated
  | 'low'       // Inferred or weakly supported
  | 'unknown'   // Cannot reliably determine

export const PIE_CONFIDENCE_SCORES: Record<PIEConfidence, number> = {
  high:     0.90,
  moderate: 0.65,
  low:      0.35,
  unknown:  0.00,
}

// ─── Visibility ───────────────────────────────────────────────────────────────

export type PIEVisibility =
  | 'clearly_visible'    // Full view, unobstructed, well-lit
  | 'partially_visible'  // Partially obscured by clothing, angle, or lighting
  | 'not_visible'        // Cannot see this in provided photos

// ─── Evidence Source ──────────────────────────────────────────────────────────

export type PIEEvidenceSource =
  | 'front_view'
  | 'side_view'
  | 'back_view'
  | 'multi_view'          // Cross-referenced from 2+ views
  | 'derived_landmark'    // Computed from landmark positions
  | 'derived_proportion'  // Computed from body proportions
  | 'biometric_input'     // Height, weight, sex from onboarding

// ─── Base PIE Observation ─────────────────────────────────────────────────────

export interface PIEObservation {
  /** Unique observation identifier */
  id: string
  /** ISO timestamp of observation */
  observedAt: string
  /** Which PIE analyzer produced this */
  analyzer: string
  /** The actual measured or classified value */
  value: string | number | boolean
  /** Unit of measurement (if numeric) */
  unit?: string
  confidence: PIEConfidence
  visibility: PIEVisibility
  /** Why confidence is at this level */
  reason: string
  /** Sources of evidence that support this observation */
  evidenceSources: PIEEvidenceSource[]
  /** True if human expert review is recommended before acting on this */
  needsHumanReview: boolean
  /** Review reason (if needsHumanReview = true) */
  reviewReason?: string
}

// ─── Numeric Range Observation ────────────────────────────────────────────────
// Used when the observation is a range (e.g. body fat 12–16%)

export interface PIERangeObservation extends Omit<PIEObservation, 'value'> {
  min: number
  max: number
  midpoint: number
  unit: string
}
