/**
 * lib/pie/types/frame.ts
 *
 * Frame analysis observation types.
 * Frame refers to skeletal structure — the fixed architecture of the body.
 *
 * Frame is NOT changeable through training.
 * Frame analysis informs what is possible, not what is optimal.
 */

import type { PIEObservation, PIERangeObservation } from './observation'

// ─── Frame Category ───────────────────────────────────────────────────────────

export type FrameCategory =
  | 'small'        // Narrow shoulders, small bone structure
  | 'medium'       // Average proportions
  | 'large'        // Wide shoulders, dense bone structure
  | 'ectomorphic'  // Long limbs, narrow frame
  | 'mesomorphic'  // Athletic proportions, balanced
  | 'endomorphic'  // Wider hips, shorter torso
  | 'not_assessable'

// ─── Waist-to-Hip Ratio Category ─────────────────────────────────────────────

export type WHRCategory =
  | 'very_low'    // < 0.75 (female) / < 0.80 (male)
  | 'low'         // 0.75–0.80 (female) / 0.80–0.85 (male)
  | 'average'     // 0.80–0.85 (female) / 0.85–0.90 (male)
  | 'high'        // > 0.85 (female) / > 0.90 (male)
  | 'not_assessable'

// ─── Shoulder-to-Waist Ratio Category ────────────────────────────────────────

export type SWRCategory =
  | 'v_taper_strong'   // Ratio > 1.45
  | 'v_taper_moderate' // Ratio 1.35–1.45
  | 'straight'         // Ratio 1.15–1.35
  | 'inverse'          // Ratio < 1.15
  | 'not_assessable'

// ─── Torso/Leg Ratio ──────────────────────────────────────────────────────────

export type TorsoLegBalance =
  | 'long_torso'   // Torso-dominant
  | 'balanced'     // Even proportions
  | 'long_legs'    // Leg-dominant
  | 'not_assessable'

// ─── Frame Observation ────────────────────────────────────────────────────────

export interface FrameObservation {
  /** Estimated shoulder width (relative to body height) */
  shoulderWidth: PIERangeObservation
  /** Estimated hip width (relative to body height) */
  hipWidth: PIERangeObservation
  /** Shoulder-to-waist ratio */
  shoulderToWaistRatio: PIEObservation & { value: number; category: SWRCategory }
  /** Waist-to-hip ratio */
  waistToHipRatio: PIEObservation & { value: number; category: WHRCategory }
  /** Torso vs leg proportion */
  torsoLegBalance: PIEObservation & { value: TorsoLegBalance }
  /** Overall frame category */
  frameCategory: PIEObservation & { value: FrameCategory }
  /** Caveat: frame analysis from photos has significant limitations */
  disclaimer: string
}
