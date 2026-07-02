/**
 * lib/pie/types/model.ts
 *
 * PhysiqueModel — the complete PIE output.
 * This is what PIE produces. This is what ZCI consumes.
 *
 * Rule: PhysiqueModel is immutable once produced.
 * Rule: ZCI reads from PhysiqueModel — it never writes back.
 * Rule: PhysiqueModel contains NO coaching, NO text, NO recommendations.
 */

import type { BodyCompositionObservation } from './composition'
import type { MuscleDevelopmentModel } from './muscle'
import type { SymmetryObservation } from './symmetry'
import type { FrameObservation } from './frame'
import type { PostureObservation } from './posture'
import type { TrainingIndicatorObservation } from './training-indicator'
import type { PotentialObservation } from './potential'
import type { PIESafetyAssessment } from './safety'
import type { PhysiqueBaseline } from './baseline'

// ─── Input Views ─────────────────────────────────────────────────────────────

export type ViewType = 'front' | 'side' | 'back'

export interface PIEInputSummary {
  /** Which views were provided */
  viewsProvided: ViewType[]
  /** Total photos analysed */
  photoCount: number
  /** Overall image quality score (0–100, averaged across all views) */
  averageImageQuality: number
  /** Whether quality was sufficient for reliable analysis */
  qualitySufficient: boolean
  /** Any quality issues that may affect confidence */
  qualityIssues: string[]
}

// ─── PIE Pipeline Metadata ────────────────────────────────────────────────────

export interface PIEMeta {
  pieVersion: string
  producedAt: string
  processingMs: number
  viewsAnalysed: ViewType[]
  analyzerResults: Array<{
    analyzer: string
    success: boolean
    durationMs: number
    error?: string
  }>
}

// ─── Complete Physique Model ──────────────────────────────────────────────────

export interface PhysiqueModel {
  /** Unique ID for this PIE output */
  id: string
  /** ZCI session this belongs to */
  sessionId: string
  /** User ID (for future persistence) */
  userId: string
  /** ISO timestamp */
  producedAt: string

  // ─── Input summary ─────────────────────────────────────────────────────────
  input: PIEInputSummary

  // ─── Observation domains ───────────────────────────────────────────────────
  bodyComposition: BodyCompositionObservation
  muscleDevelopment: MuscleDevelopmentModel
  symmetry: SymmetryObservation
  frame: FrameObservation
  posture: PostureObservation
  trainingIndicator: TrainingIndicatorObservation
  potential: PotentialObservation

  // ─── Safety ────────────────────────────────────────────────────────────────
  safety: PIESafetyAssessment

  // ─── Progress baseline ────────────────────────────────────────────────────
  baseline: PhysiqueBaseline

  // ─── Pipeline metadata ────────────────────────────────────────────────────
  meta: PIEMeta

  /**
   * Overall observation confidence.
   * Driven by image quality and view count.
   * Used by ZCI to weight evidence reliability.
   */
  overallConfidence: 'high' | 'moderate' | 'low' | 'unknown'
}
