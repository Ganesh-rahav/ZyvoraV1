/**
 * lib/pie/types/safety.ts
 *
 * PIE Safety Flag types.
 *
 * PIE flags visual indicators that suggest:
 * - Possible injury
 * - Extreme physiological states requiring medical attention
 * - Conditions that ZCI must address before coaching
 *
 * PIE does NOT diagnose. It flags for human review.
 */

// ─── Safety Flag Types ────────────────────────────────────────────────────────

export type PIESafetyFlagType =
  | 'possible_injury_indicator'    // Visible asymmetry, guarding, abnormal posture
  | 'extreme_underweight'          // Visual indicators of dangerously low body weight
  | 'extreme_obesity'              // Visual indicators of morbid obesity
  | 'significant_postural_concern' // Severe spinal curvature or misalignment
  | 'possible_eating_disorder'     // Extreme leanness combined with other indicators
  | 'structural_asymmetry_concern' // Asymmetry suggesting possible scoliosis
  | 'visible_skin_concern'         // Visible dermatological issue (not assessed)

// ─── Safety Level ─────────────────────────────────────────────────────────────

export type PIESafetyLevel =
  | 'informational'  // Note for context — no action required from coach
  | 'advisory'       // ZCI should acknowledge and modify recommendations
  | 'requires_review' // Human expert review strongly recommended
  | 'block_coaching'  // ZCI should not proceed with standard coaching

// ─── Safety Flag ─────────────────────────────────────────────────────────────

export interface PIESafetyFlag {
  id: string
  type: PIESafetyFlagType
  level: PIESafetyLevel
  /** Plain-language description of what was observed (not a diagnosis) */
  observation: string
  /** Why this flag was raised */
  reason: string
  /** Confidence in this flag */
  confidence: 'high' | 'moderate' | 'low'
  /** Recommended response for ZCI */
  recommendedResponse: string
  /** Always true — PIE never diagnoses */
  requiresHumanReview: boolean
  flaggedAt: string
}

// ─── Safety Assessment ────────────────────────────────────────────────────────

export interface PIESafetyAssessment {
  /** All flags raised across all analyzers */
  flags: PIESafetyFlag[]
  /** Highest severity level across all flags */
  highestSeverity: PIESafetyLevel | 'none'
  /** Whether any flags require blocking standard coaching */
  blockCoaching: boolean
  /** Whether any flags require human expert review */
  requiresHumanReview: boolean
  /** Whether PIE found no safety concerns */
  clear: boolean
}
