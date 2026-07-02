/**
 * lib/pie/config.ts
 *
 * All PIE thresholds, cutoffs, and calibration constants.
 * No magic numbers in analyzer logic.
 */

export const PIE_CONFIG = {
  version: '1.0.0',

  // ─── Image Quality ────────────────────────────────────────────────────────
  quality: {
    /** Minimum overall quality score to proceed with analysis */
    minimumQualityScore: 60,
    /** Quality score above which we report 'qualitySufficient: true' */
    sufficientQualityScore: 75,
  },

  // ─── Confidence Thresholds ────────────────────────────────────────────────
  confidence: {
    /** Vision provider score above which we assign 'high' confidence */
    highThreshold: 0.85,
    /** Vision provider score above which we assign 'moderate' confidence */
    moderateThreshold: 0.65,
    /** Below this → 'low' confidence */
    lowThreshold: 0.40,
    /** Multi-view bonus — each additional view adds this to confidence score */
    multiViewBonus: 0.08,
  },

  // ─── Muscle Development Thresholds ────────────────────────────────────────
  muscle: {
    /** Vision provider score (1–10) boundaries for development levels */
    scoreThresholds: {
      underdeveloped: 3,   // score ≤ 3
      developing:     5,   // score ≤ 5
      moderate:       7,   // score ≤ 7
      well_developed: 9,   // score ≤ 9
      elite:          10,  // score === 10
    },
    /**
     * A muscle is 'notable weakness' if its score is this many points
     * below the user's own average development score.
     */
    notableWeaknessGap: 2.0,
    /**
     * A muscle is 'notable strength' if its score is this many points
     * above the user's own average development score.
     */
    notableStrengthGap: 2.0,
    /** Minimum development score to even report the muscle (otherwise not_assessed) */
    minimumReportableScore: 1,
  },

  // ─── Body Composition Thresholds ──────────────────────────────────────────
  bodyComposition: {
    bodyFat: {
      male: {
        extremelyLean: 5,    // ≤ 5% — medical concern flag
        lean:          12,   // ≤ 12%
        average:       20,   // ≤ 20%
        aboveAverage:  25,   // ≤ 25%
        high:          30,   // > 30% → flag extreme_obesity if > 40%
        extremeObesity: 40,  // ≥ 40% — advisory flag
      },
      female: {
        extremelyLean: 12,
        lean:          20,
        average:       28,
        aboveAverage:  35,
        high:          40,
        extremeObesity: 50,
      },
    },
  },

  // ─── Symmetry Thresholds ──────────────────────────────────────────────────
  symmetry: {
    highlySymmetric:  0.95,  // score ≥ 0.95
    mostlySymmetric:  0.85,  // score ≥ 0.85
    mildAsymmetry:    0.75,  // score ≥ 0.75
    /** Below 0.75 → notable_asymmetry */
    notableAsymmetry: 0.75,
  },

  // ─── Frame Analysis ───────────────────────────────────────────────────────
  frame: {
    shoulderToWaist: {
      vTaperStrong:    1.45,
      vTaperModerate:  1.35,
      straight:        1.15,
      /** Below → inverse */
    },
    waistToHip: {
      male: {
        veryLow:  0.80,
        low:      0.85,
        average:  0.90,
        /** Above → high */
      },
      female: {
        veryLow:  0.75,
        low:      0.80,
        average:  0.85,
      },
    },
  },

  // ─── Safety Thresholds ────────────────────────────────────────────────────
  safety: {
    /** Body fat thresholds that trigger safety flags */
    extremeLean: {
      male: 5,
      female: 12,
    },
    extremeObesity: {
      male: 40,
      female: 50,
    },
    /** Symmetry score below which structural asymmetry concern is raised */
    asymmetryConcernThreshold: 0.65,
  },

  // ─── Potential Analysis ───────────────────────────────────────────────────
  potential: {
    /** Minimum confidence required to include a potential observation */
    minimumConfidenceForPotential: 0.65,
    /** Minimum views required to include genetic indicators */
    minimumViewsForGenetics: 2,
  },
} as const

export type PIEConfig = typeof PIE_CONFIG
