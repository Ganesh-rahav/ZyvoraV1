/**
 * lib/pie/types/potential.ts
 *
 * Potential analysis observation types.
 *
 * Rule: Potential analysis is ONLY produced when confidence is sufficient (moderate+).
 * Rule: Low or unknown confidence → return 'unknown' value, not a guess.
 * Rule: PIE never promises outcomes. It observes structural indicators.
 */

import type { PIEObservation } from './observation'

// ─── Natural Advantage Categories ─────────────────────────────────────────────

export type NaturalAdvantageType =
  | 'wide_clavicles'           // Shoulder width advantage
  | 'narrow_hips'              // Waist-to-hip advantage
  | 'long_muscle_bellies'      // Larger potential muscle size
  | 'short_limb_leverage'      // Strength leverage advantage
  | 'long_limb_leverage'       // Range of motion advantage
  | 'favorable_waist_insertion' // Aesthetic waist appearance
  | 'balanced_proportions'     // Even development potential
  | 'unknown'

// ─── Natural Limiter Categories ───────────────────────────────────────────────

export type NaturalLimiterType =
  | 'narrow_clavicles'          // Limits shoulder width potential
  | 'wide_hips'                 // Affects waist-to-hip ratio
  | 'short_muscle_bellies'      // Limits muscle belly size
  | 'high_muscle_insertions'    // E.g. high bicep insertions
  | 'structural_asymmetry'      // Skeletal asymmetry
  | 'unfavorable_proportions'   // Long torso, short legs (or vice versa)
  | 'unknown'

// ─── Genetic Indicator ────────────────────────────────────────────────────────

export type GeneticIndicatorType =
  | 'fast_twitch_dominant'    // Dense, powerful-looking muscle
  | 'slow_twitch_dominant'    // Lean, endurance-looking development
  | 'ectomorphic_tendency'    // Difficulty gaining size
  | 'mesomorphic_tendency'    // Responds well to both strength and conditioning
  | 'endomorphic_tendency'    // Higher body fat storage tendency
  | 'unknown'

// ─── Individual Potential Observation ────────────────────────────────────────

export interface NaturalAdvantage {
  type: NaturalAdvantageType
  confidence: PIEObservation['confidence']
  reason: string
}

export interface NaturalLimiter {
  type: NaturalLimiterType
  confidence: PIEObservation['confidence']
  reason: string
}

export interface GeneticIndicator {
  type: GeneticIndicatorType
  confidence: PIEObservation['confidence']
  reason: string
}

// ─── Full Potential Observation ───────────────────────────────────────────────

export interface PotentialObservation {
  /**
   * Structural advantages observed — items are only included when
   * confidence is 'moderate' or 'high'. Otherwise empty array.
   */
  naturalAdvantages: NaturalAdvantage[]
  /**
   * Structural limiters observed — items only included at moderate+ confidence.
   */
  naturalLimiters: NaturalLimiter[]
  /**
   * Genetic tendency indicators — items only included at moderate+ confidence.
   */
  geneticIndicators: GeneticIndicator[]
  /**
   * Overall potential confidence.
   * 'unknown' if insufficient data to form any potential observation.
   */
  overallConfidence: PIEObservation['confidence']
  /**
   * CRITICAL DISCLAIMER — always included.
   * Genetic potential analysis from photos is speculative.
   */
  disclaimer: string
}
