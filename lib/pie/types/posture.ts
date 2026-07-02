/**
 * lib/pie/types/posture.ts
 *
 * Posture observation types — 8 independent dimensions.
 * Posture analysis informs injury risk and movement contraindications for ZCI.
 */

import type { PIEObservation } from './observation'

// ─── Posture Classifications ──────────────────────────────────────────────────

export type HeadPosition =
  | 'neutral'
  | 'mild_forward_head'
  | 'moderate_forward_head'
  | 'severe_forward_head'
  | 'not_assessable'

export type ShoulderRounding =
  | 'neutral'
  | 'mild_rounding'
  | 'moderate_rounding'
  | 'severe_rounding'
  | 'not_assessable'

export type ThoracicCurve =
  | 'normal'
  | 'mild_kyphosis'
  | 'moderate_kyphosis'
  | 'flat_thoracic'
  | 'not_assessable'

export type LumbarPosition =
  | 'neutral'
  | 'mild_lordosis'
  | 'moderate_lordosis'
  | 'flat_lumbar'
  | 'not_assessable'

export type PelvicTilt =
  | 'neutral'
  | 'anterior_tilt'
  | 'posterior_tilt'
  | 'lateral_tilt'
  | 'not_assessable'

export type KneeAlignment =
  | 'neutral'
  | 'mild_valgus'    // Knock-knees
  | 'moderate_valgus'
  | 'mild_varus'     // Bow-legs
  | 'moderate_varus'
  | 'hyperextended'
  | 'not_assessable'

export type WeightDistribution =
  | 'balanced'
  | 'forward_weighted'
  | 'backward_weighted'
  | 'left_weighted'
  | 'right_weighted'
  | 'not_assessable'

export type StandingSymmetry =
  | 'symmetric'
  | 'slight_lean_left'
  | 'slight_lean_right'
  | 'compensatory_pattern'
  | 'not_assessable'

// ─── Individual Posture Dimension ─────────────────────────────────────────────

type PostureDimension<T> = Omit<PIEObservation, 'value'> & { value: T }

// ─── Full Posture Observation ─────────────────────────────────────────────────

export interface PostureObservation {
  headPosition: PostureDimension<HeadPosition>
  shoulderRounding: PostureDimension<ShoulderRounding>
  thoracicCurve: PostureDimension<ThoracicCurve>
  lumbarPosition: PostureDimension<LumbarPosition>
  pelvicTilt: PostureDimension<PelvicTilt>
  kneeAlignment: PostureDimension<KneeAlignment>
  weightDistribution: PostureDimension<WeightDistribution>
  standingSymmetry: PostureDimension<StandingSymmetry>
  /** Notable patterns that may affect training programming */
  notablePatterns: string[]
  /** Contraindicated movement patterns derived from posture observations */
  suggestedContraindications: string[]
}
