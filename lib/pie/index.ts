/**
 * lib/pie/index.ts
 *
 * Top-level barrel for the Physique Intelligence Engine (PIE).
 * Import from '@/lib/pie' for all PIE functionality.
 *
 * PIE = Eyes. ZCI = Brain. Coach = Voice.
 */

// ─── Engine (Primary Interface) ───────────────────────────────────────────────
export { runPIEEngine } from './engine'
export type { PIEInput } from './engine'

// ─── Types ────────────────────────────────────────────────────────────────────
export type {
  PhysiqueModel,
  PIEInputSummary,
  PIEMeta,
  ViewType,
} from './types/model'

export type {
  PIEObservation,
  PIERangeObservation,
  PIEConfidence,
  PIEVisibility,
  PIEEvidenceSource,
} from './types/observation'
export { PIE_CONFIDENCE_SCORES } from './types/observation'

export type {
  MuscleGroupId,
  MuscleObservation,
  MuscleDevelopmentModel,
  MuscleDevelopmentLevel,
} from './types/muscle'
export { ALL_MUSCLE_GROUPS, MUSCLE_LABELS } from './types/muscle'

export type {
  BodyCompositionObservation,
  FatDistributionPattern,
  BodyCompositionCategory,
  DefinitionLevel,
} from './types/composition'

export type {
  SymmetryObservation,
  SymmetryRating,
  PushPullDominance,
} from './types/symmetry'

export type {
  FrameObservation,
  FrameCategory,
  SWRCategory,
  WHRCategory,
} from './types/frame'

export type {
  PostureObservation,
  PelvicTilt,
  KneeAlignment,
  ShoulderRounding,
} from './types/posture'

export type {
  TrainingIndicatorObservation,
  VisualTrainingProfile,
} from './types/training-indicator'

export type {
  PotentialObservation,
  NaturalAdvantage,
  NaturalLimiter,
} from './types/potential'

export type {
  PIESafetyFlag,
  PIESafetyAssessment,
  PIESafetyLevel,
} from './types/safety'

export type { PhysiqueBaseline, BaselineKeyMetrics } from './types/baseline'

export type {
  IPhysiqueComparisonService,
  PhysiqueComparisonResult,
  TrendDirection,
  PhysiqueTrendHistory,
} from './types/comparison'
export { NullPhysiqueComparisonService } from './types/comparison'

// ─── Config ───────────────────────────────────────────────────────────────────
export { PIE_CONFIG } from './config'

// ─── Errors ───────────────────────────────────────────────────────────────────
export {
  PIEError,
  PIEAnalyzerError,
  PIEEngineError,
  PIEInsufficientDataError,
} from './errors'
