/**
 * lib/pie/types/training-indicator.ts
 *
 * Training indicator observation types.
 * PIE detects EVIDENCE of training history — it does NOT diagnose experience level.
 * The difference: ZCI fuses visual indicators with self-reported experience.
 */

import type { PIEObservation } from './observation'

// ─── Training Profile Category ────────────────────────────────────────────────

export type VisualTrainingProfile =
  | 'strength_athlete'    // Dense musculature, even if not large
  | 'bodybuilder'         // High muscle volume, likely deliberate hypertrophy
  | 'athletic'            // Lean, functional-looking development
  | 'beginner'            // Low development, no dominant patterns
  | 'sedentary'           // Very limited visible development
  | 'unknown'             // Cannot determine reliably

// ─── Visual Indicators ────────────────────────────────────────────────────────

export type TrainingIndicatorType =
  | 'compound_strength_indicators'    // Dense traps, thick back, glute development
  | 'hypertrophy_indicators'          // High muscle volume, moderate body fat
  | 'cardiovascular_indicators'       // Lean, low body fat, limited bulk
  | 'beginner_indicators'             // Low development across all groups
  | 'inactivity_indicators'           // Very low development, higher body fat
  | 'postural_training_indicators'    // Deliberate posture-focused development

// ─── Training Indicator Observation ──────────────────────────────────────────

export interface VisualIndicator {
  type: TrainingIndicatorType
  observed: boolean
  confidence: PIEObservation['confidence']
  reason: string
}

export interface TrainingIndicatorObservation {
  /** Best-fit visual training profile */
  visualProfile: Omit<PIEObservation, 'value'> & { value: VisualTrainingProfile }
  /** All detected indicator types */
  detectedIndicators: VisualIndicator[]
  /** Visual evidence supporting the profile classification */
  supportingEvidence: string[]
  /**
   * IMPORTANT: This is a VISUAL inference only.
   * Self-reported experience level must be fused with this by ZCI.
   */
  disclaimer: string
}
