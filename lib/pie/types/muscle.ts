/**
 * lib/pie/types/muscle.ts
 *
 * Muscle group observation types.
 * All 21 muscle groups evaluated independently.
 *
 * Rule: Every muscle observation is independent.
 * Rule: No muscle is compared to another — that is ZCI's job.
 * Rule: PIE only observes. ZCI interprets.
 */

import type { PIEConfidence, PIEVisibility, PIEEvidenceSource } from './observation'

// ─── Muscle Group IDs ─────────────────────────────────────────────────────────

export type MuscleGroupId =
  | 'upper_chest'
  | 'mid_chest'
  | 'lower_chest'
  | 'front_delts'
  | 'side_delts'
  | 'rear_delts'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'lats'
  | 'upper_back'
  | 'mid_back'
  | 'lower_back'
  | 'traps'
  | 'abs'
  | 'obliques'
  | 'glutes'
  | 'quadriceps'
  | 'hamstrings'
  | 'calves'
  | 'neck'

export const ALL_MUSCLE_GROUPS: MuscleGroupId[] = [
  'upper_chest', 'mid_chest', 'lower_chest',
  'front_delts', 'side_delts', 'rear_delts',
  'biceps', 'triceps', 'forearms',
  'lats', 'upper_back', 'mid_back', 'lower_back', 'traps',
  'abs', 'obliques',
  'glutes', 'quadriceps', 'hamstrings', 'calves',
  'neck',
]

// ─── Which view reveals which muscle group ────────────────────────────────────

export const MUSCLE_PRIMARY_VIEW: Record<MuscleGroupId, PIEEvidenceSource[]> = {
  upper_chest:  ['front_view'],
  mid_chest:    ['front_view'],
  lower_chest:  ['front_view'],
  front_delts:  ['front_view'],
  side_delts:   ['front_view', 'back_view'],
  rear_delts:   ['back_view'],
  biceps:       ['front_view'],
  triceps:      ['back_view'],
  forearms:     ['front_view', 'back_view'],
  lats:         ['back_view', 'front_view'],
  upper_back:   ['back_view'],
  mid_back:     ['back_view'],
  lower_back:   ['back_view'],
  traps:        ['back_view', 'front_view'],
  abs:          ['front_view'],
  obliques:     ['front_view', 'side_view'],
  glutes:       ['back_view'],
  quadriceps:   ['front_view'],
  hamstrings:   ['back_view'],
  calves:       ['back_view', 'front_view'],
  neck:         ['front_view', 'side_view'],
}

// ─── Development Scale ────────────────────────────────────────────────────────

export type MuscleDevelopmentLevel =
  | 'underdeveloped'    // Score 1–3 / 10
  | 'developing'        // Score 4–5 / 10
  | 'moderate'          // Score 6–7 / 10
  | 'well_developed'    // Score 8–9 / 10
  | 'elite'             // Score 10 / 10
  | 'not_assessed'      // Not visible in available photos

// ─── Individual Muscle Observation ───────────────────────────────────────────

export interface MuscleObservation {
  id: string
  observedAt: string
  muscleGroupId: MuscleGroupId
  label: string
  /** Raw development score 1–10 from vision provider */
  rawScore: number
  /** Normalised development level */
  developmentLevel: MuscleDevelopmentLevel
  confidence: PIEConfidence
  visibility: PIEVisibility
  evidenceSources: PIEEvidenceSource[]
  reason: string
  needsHumanReview: boolean
  reviewReason?: string
  /** True if this muscle is clearly a strength of this physique */
  isNotableStrength: boolean
  /** True if this muscle is clearly underdeveloped relative to the whole */
  isNotableWeakness: boolean
}

// ─── Full Muscle Development Model ───────────────────────────────────────────

export interface MuscleDevelopmentModel {
  /** All 21 muscle group observations, keyed by ID */
  groups: Partial<Record<MuscleGroupId, MuscleObservation>>
  /** Groups where assessment was not possible (not visible) */
  notAssessed: MuscleGroupId[]
  /** Assessed group count */
  assessedCount: number
  /** Total coverage as a % of 21 muscle groups */
  coveragePercent: number
  /** Average development score across assessed groups (0–10) */
  averageDevelopmentScore: number
  /** Groups scoring notably above average (≥ 2 points above avg) */
  notableStrengths: MuscleGroupId[]
  /** Groups scoring notably below average (≥ 2 points below avg) */
  notableWeaknesses: MuscleGroupId[]
}

// ─── Muscle Group Labels ──────────────────────────────────────────────────────

export const MUSCLE_LABELS: Record<MuscleGroupId, string> = {
  upper_chest:  'Upper Chest',
  mid_chest:    'Mid Chest',
  lower_chest:  'Lower Chest',
  front_delts:  'Front Deltoids',
  side_delts:   'Side Deltoids',
  rear_delts:   'Rear Deltoids',
  biceps:       'Biceps',
  triceps:      'Triceps',
  forearms:     'Forearms',
  lats:         'Latissimus Dorsi',
  upper_back:   'Upper Back',
  mid_back:     'Mid Back',
  lower_back:   'Lower Back',
  traps:        'Trapezius',
  abs:          'Abdominals',
  obliques:     'Obliques',
  glutes:       'Glutes',
  quadriceps:   'Quadriceps',
  hamstrings:   'Hamstrings',
  calves:       'Calves',
  neck:         'Neck',
}
