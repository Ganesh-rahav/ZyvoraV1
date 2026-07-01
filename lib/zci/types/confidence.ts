/**
 * lib/zci/types/confidence.ts
 *
 * Confidence system types.
 *
 * Every claim in ZCI carries a confidence level.
 * The system NEVER fabricates certainty.
 * 'unknown' is a valid, first-class answer.
 *
 * Confidence is stored with its REASON — so it is explainable
 * and can be improved when more data becomes available.
 */

// ─── Confidence Level ─────────────────────────────────────────────────────────

export type ConfidenceLevel =
  | 'high'      // Multiple corroborating sources, high reliability evidence
  | 'moderate'  // Single good source, or multiple weak sources
  | 'low'       // Limited data, estimation or inference
  | 'unknown'   // Genuinely cannot determine — stated explicitly

// ─── Confidence Score ─────────────────────────────────────────────────────────
// Numeric representation for calculations: high=0.9, moderate=0.65, low=0.35, unknown=0

export const CONFIDENCE_SCORES: Record<ConfidenceLevel, number> = {
  high:     0.90,
  moderate: 0.65,
  low:      0.35,
  unknown:  0.00,
}

// ─── Why Confidence Changed ───────────────────────────────────────────────────

export type ConfidenceChangeReason =
  | 'multiple_sources_agree'
  | 'single_source_only'
  | 'source_is_self_report'      // Self-reports have lower reliability
  | 'source_is_derived'          // Calculations have medium reliability
  | 'source_is_vision_analysis'  // Vision analysis has known limitations
  | 'data_freshness_low'         // Old data, may not reflect current state
  | 'contradictory_sources'      // Sources disagree — reduces confidence
  | 'limited_coverage'           // Photo angles incomplete
  | 'no_data_available'          // Nothing to base this on

// ─── Confidence Assessment ────────────────────────────────────────────────────

export interface ConfidenceAssessment {
  level: ConfidenceLevel
  score: number             // 0–1 numeric score
  reasons: ConfidenceChangeReason[]
  /** Human-readable explanation of why confidence is at this level */
  explanation: string
  /** What additional data would increase confidence? */
  improvableBy?: string
}

// ─── Confidence Envelope ──────────────────────────────────────────────────────
// Used when confidence varies by sub-domain within a single assessment

export interface ConfidenceEnvelope {
  overall: ConfidenceAssessment
  byCategory: Partial<Record<string, ConfidenceAssessment>>
}
