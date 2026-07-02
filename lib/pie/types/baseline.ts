/**
 * lib/pie/types/baseline.ts
 *
 * Progress baseline model.
 * The baseline is a timestamped snapshot of all PIE observations.
 * Future photos are compared against this baseline — not against each other.
 *
 * Rule: No scoring. No ratings. Only structured observations over time.
 */

import type { BodyCompositionObservation } from './composition'
import type { MuscleDevelopmentModel } from './muscle'
import type { SymmetryObservation } from './symmetry'
import type { FrameObservation } from './frame'
import type { PostureObservation } from './posture'
import type { TrainingIndicatorObservation } from './training-indicator'

// ─── Baseline Snapshot ────────────────────────────────────────────────────────

export interface PhysiqueBaseline {
  /** Unique baseline ID */
  id: string
  /** ZCI session that produced this baseline */
  sessionId: string
  /** User ID (for future Supabase persistence) */
  userId: string
  /** ISO timestamp of baseline creation */
  capturedAt: string
  /** Which photo views were available for this baseline */
  photoViews: Array<'front' | 'side' | 'back'>
  /** Number of views used */
  viewCount: number

  // ─── Snapshot of all PIE observations ──────────────────────────────────────
  bodyComposition: BodyCompositionObservation
  muscleDevelopment: MuscleDevelopmentModel
  symmetry: SymmetryObservation
  frame: FrameObservation
  posture: PostureObservation
  trainingIndicator: TrainingIndicatorObservation

  /**
   * Key metrics extracted for quick comparison access.
   * These are flat values extracted from the structured observations above.
   */
  keyMetrics: BaselineKeyMetrics
}

// ─── Key Metrics (flat, for efficient trend analysis) ─────────────────────────

export interface BaselineKeyMetrics {
  /** Estimated body fat % midpoint */
  estimatedBodyFatMidpoint?: number
  /** Average muscle development score (0–10) */
  averageMuscleScore: number
  /** Overall symmetry score (0–1) */
  symmetryScore: number
  /** Number of posture concerns detected */
  postureConcernCount: number
  /** Number of notable muscle weaknesses */
  muscleWeaknessCount: number
  /** Number of notable muscle strengths */
  muscleStrengthCount: number
  /** Visual training profile at baseline */
  visualTrainingProfile: string
}
