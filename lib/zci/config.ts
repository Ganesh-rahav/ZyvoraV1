/**
 * lib/zci/config.ts
 *
 * ZCI configuration — all tuneable coaching thresholds live here.
 * Nothing is hardcoded in engine logic.
 */

import { CALORIC_SAFETY_FLOORS } from './types/safety'

export const ZCI_CONFIG = {
  /** Pipeline version — increment when reasoning logic changes */
  pipelineVersion: '1.0.0',

  priority: {
    /** Maximum number of priorities to surface per coaching cycle */
    maxSelectedPriorities: 3,

    /** Minimum priority score (0–100) to be eligible for selection */
    minimumScoreThreshold: 40,

    /**
     * Weights applied to each priority score factor.
     * Must sum to 1.0.
     */
    scoreWeights: {
      impact:        0.35,
      confidence:    0.20,
      goalAlignment: 0.25,
      feasibility:   0.15,
      urgency:       0.05,
    },

    /** Urgency multiplier for safety-related priorities (injuries, deficits) */
    safetyUrgencyMultiplier: 3.0,
  },

  confidence: {
    /** Below this score (0–1), observations are marked 'low' confidence */
    lowThreshold:      0.40,
    /** Above this score, observations are marked 'high' confidence */
    highThreshold:     0.75,
    /** Vision analysis source reliability (camera-based — not clinical) */
    visionReliability: 0.65,
    /** Self-report reliability */
    selfReportReliability: 0.70,
    /** Derived calculation reliability */
    derivedReliability: 0.80,
  },

  nutrition: {
    /** Per docs/02-ai-coach-spec.md §10.1 */
    caloricSafetyFloors: CALORIC_SAFETY_FLOORS,

    /** Protein target range in g per kg bodyweight */
    proteinPerKg: {
      minimum:    1.6,
      optimal:    2.0,
      aggressive: 2.4,
    },

    /** Fat floor in g per kg bodyweight (hormonal function) */
    fatFloorGramsPerKg: 0.8,

    /** Caloric adjustment increment (per docs/02-ai-coach-spec.md §12.1) */
    caloricAdjustmentStepKcal: 150,
  },

  recovery: {
    /** Sleep quality below this (1–5 scale) triggers recovery concern */
    sleepQualityThreshold: 2,
    /** Stress level above this triggers recovery concern */
    stressLevelThreshold: 4,
    /** Energy level below this triggers recovery concern */
    energyLevelThreshold: 2,
    /** Recovery score below this reduces training volume recommendation */
    recoveryScoreVolumeCutoff: 50,
  },

  training: {
    /** Minimum training frequency per week by experience level */
    minimumFrequency: {
      beginner:     2,
      intermediate: 3,
      advanced:     4,
    },

    /** Volume modification multipliers */
    volumeModifiers: {
      deload:   0.50,
      reduce:   0.75,
      maintain: 1.00,
      increase: 1.20,
    },
  },

  coaching: {
    /** Default coaching cycle length in weeks */
    defaultCycleLengthWeeks: 6,
    /** Minimum weeks before strategy can be revised */
    minWeeksBeforeRevision: 2,
    /** Days without interaction before session is considered stale */
    sessionStaleDays: 14,
  },

  plateau: {
    /** Weeks of strength stagnation before plateau is declared */
    strengthPlateauWeeks: 3,
    /** Weeks of weight stagnation before composition plateau is declared */
    compositionPlateauWeeks: 3,
  },
} as const

export type ZciConfig = typeof ZCI_CONFIG
