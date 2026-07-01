/**
 * lib/zci/types/evidence.ts
 *
 * Structured evidence types.
 * Evidence is the raw structured data extracted from UserContext.
 * It is NOT interpretation — it is observation of facts.
 *
 * Rule: Evidence never contains conclusions.
 * Evidence never contains recommendations.
 * Evidence is what the system SEES, not what it THINKS.
 */

// ─── Evidence Source ──────────────────────────────────────────────────────────

export type EvidenceSourceType =
  | 'vision_analysis'          // AI physique photo analysis
  | 'onboarding_data'          // User-provided onboarding answers
  | 'self_report'              // User explicitly stated something
  | 'derived_calculation'      // Computed from other data (BMI, TDEE, etc.)
  | 'behavioral_pattern'       // Inferred from usage/history patterns
  | 'biometric_measurement'    // Body weight, measurements, etc.

export interface EvidenceSource {
  type: EvidenceSourceType
  /** Human-readable label for explainability */
  label: string
  /** How reliable is this source? 0–1 */
  reliability: number
}

// ─── Evidence Strength ────────────────────────────────────────────────────────

export type EvidenceStrength =
  | 'strong'     // Multiple sources agree, high reliability
  | 'moderate'   // Single source or low reliability
  | 'weak'       // Inferred or estimated
  | 'absent'     // Evidence explicitly not present

// ─── Evidence Categories ──────────────────────────────────────────────────────

export type EvidenceCategory =
  | 'body_composition'
  | 'muscle_development'
  | 'posture_alignment'
  | 'symmetry'
  | 'recovery_capacity'
  | 'training_readiness'
  | 'nutrition_status'
  | 'lifestyle_load'
  | 'goal_alignment'
  | 'equipment_capability'
  | 'injury_risk'
  | 'adherence_likelihood'

// ─── Core Evidence Type ───────────────────────────────────────────────────────

export interface Evidence {
  /** Unique identifier for this evidence item */
  id: string
  category: EvidenceCategory
  /** What was observed (no interpretation) */
  observation: string
  /** Measured or estimated value (if numeric) */
  value?: number | string
  /** Unit of the value (e.g., 'kg', '%', '1-5 scale') */
  unit?: string
  sources: EvidenceSource[]
  strength: EvidenceStrength
  /** ISO timestamp when evidence was collected */
  collectedAt: string
  /** Any known limitations or caveats about this evidence */
  caveats?: string[]
}

// ─── Evidence Collection ──────────────────────────────────────────────────────

export interface EvidenceCollection {
  sessionId: string
  collectedAt: string
  items: Evidence[]
  /** How many evidence items were successfully collected */
  totalCollected: number
  /** How many categories have evidence */
  coveragePercent: number
}
