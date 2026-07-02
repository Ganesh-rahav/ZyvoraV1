/**
 * lib/pie/types/symmetry.ts
 *
 * Symmetry observation types.
 * Evaluates 6 symmetry dimensions independently.
 */

import type { PIEObservation } from './observation'

// ─── Symmetry Rating ──────────────────────────────────────────────────────────

export type SymmetryRating =
  | 'highly_symmetric'   // < 5% measurable difference
  | 'mostly_symmetric'   // 5–10% difference
  | 'mild_asymmetry'     // 10–20% difference
  | 'notable_asymmetry'  // > 20% difference
  | 'not_assessable'

// ─── Push/Pull Dominance ──────────────────────────────────────────────────────

export type PushPullDominance =
  | 'push_dominant'   // Chest/Delts more developed than Back
  | 'pull_dominant'   // Back/Biceps more developed
  | 'balanced'        // No clear dominance
  | 'not_assessable'

// ─── Individual Symmetry Dimension ───────────────────────────────────────────

export interface SymmetryDimension extends Omit<PIEObservation, 'value'> {
  rating: SymmetryRating
  /** Estimated deviation % if measurable */
  deviationPercent?: number
  /** Which side or direction is dominant (if applicable) */
  dominantSide?: 'left' | 'right' | 'upper' | 'lower' | 'push' | 'pull'
}

// ─── Push/Pull Dimension ──────────────────────────────────────────────────────

export interface PushPullDimension extends Omit<PIEObservation, 'value'> {
  dominance: PushPullDominance
}

// ─── Full Symmetry Observation ────────────────────────────────────────────────

export interface SymmetryObservation {
  /** Left vs Right balance (front view) */
  leftRight: SymmetryDimension
  /** Upper body vs Lower body development balance */
  upperLower: SymmetryDimension
  /** Push muscle vs Pull muscle development */
  pushPull: PushPullDimension
  /** Shoulder width symmetry (left shoulder vs right) */
  shoulderBalance: SymmetryDimension
  /** Waist/hip alignment symmetry */
  waistBalance: SymmetryDimension
  /** Left leg vs Right leg development */
  legSymmetry: SymmetryDimension
  /** Overall symmetry summary score 0–1 */
  overallScore: number
  /** Flagged asymmetries for ZCI attention */
  flaggedAreas: string[]
}
