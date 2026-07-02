/**
 * lib/pie/types/composition.ts
 *
 * Body composition observation types.
 */

import type { PIERangeObservation, PIEObservation } from './observation'

// ─── Fat Distribution Pattern ─────────────────────────────────────────────────

export type FatDistributionPattern =
  | 'android'        // Apple — central / abdominal
  | 'gynoid'         // Pear — lower body / hips
  | 'uniform'        // Evenly distributed
  | 'peripheral'     // Limb-dominant
  | 'not_assessable' // Cannot determine from photos

// ─── Body Composition Category ────────────────────────────────────────────────

export type BodyCompositionCategory =
  | 'extremely_lean'    // Essential fat levels — possible medical concern
  | 'lean'              // Low body fat, visible musculature
  | 'average'           // Healthy range, moderate definition
  | 'above_average'     // Moderate body fat, limited definition
  | 'high'              // High body fat
  | 'not_assessable'

// ─── Muscle Definition Visibility ────────────────────────────────────────────

export type DefinitionLevel =
  | 'striated'      // Visible striations (extremely lean)
  | 'vascular'      // Visible vascularity
  | 'defined'       // Muscle bellies clearly visible
  | 'moderate'      // Some definition visible
  | 'limited'       // Minimal definition visible
  | 'not_visible'   // No definition visible

// ─── Body Composition Observation ────────────────────────────────────────────

export interface BodyCompositionObservation {
  /** Body fat % estimated range */
  bodyFat: PIERangeObservation
  /** Overall body composition category */
  category: PIEObservation & { value: BodyCompositionCategory }
  /** Fat distribution pattern */
  fatDistribution: PIEObservation & { value: FatDistributionPattern }
  /** Visible muscle definition */
  definition: PIEObservation & { value: DefinitionLevel }
  /** Disclaimer text — always included */
  disclaimer: string
}
