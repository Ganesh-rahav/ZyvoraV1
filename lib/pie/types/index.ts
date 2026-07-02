/**
 * lib/pie/types/index.ts
 */

// Base observation
export type {
  PIEObservation,
  PIERangeObservation,
  PIEConfidence,
  PIEVisibility,
  PIEEvidenceSource,
} from './observation'
export { PIE_CONFIDENCE_SCORES } from './observation'

// Muscle
export type {
  MuscleGroupId,
  MuscleObservation,
  MuscleDevelopmentModel,
  MuscleDevelopmentLevel,
} from './muscle'
export { ALL_MUSCLE_GROUPS, MUSCLE_PRIMARY_VIEW, MUSCLE_LABELS } from './muscle'

// Body composition
export type {
  BodyCompositionObservation,
  FatDistributionPattern,
  BodyCompositionCategory,
  DefinitionLevel,
} from './composition'

// Symmetry
export type {
  SymmetryObservation,
  SymmetryDimension,
  SymmetryRating,
  PushPullDominance,
} from './symmetry'

// Frame
export type {
  FrameObservation,
  FrameCategory,
  WHRCategory,
  SWRCategory,
  TorsoLegBalance,
} from './frame'

// Posture
export type {
  PostureObservation,
  HeadPosition,
  ShoulderRounding,
  ThoracicCurve,
  LumbarPosition,
  PelvicTilt,
  KneeAlignment,
  WeightDistribution,
  StandingSymmetry,
} from './posture'

// Training indicator
export type {
  TrainingIndicatorObservation,
  VisualTrainingProfile,
  VisualIndicator,
  TrainingIndicatorType,
} from './training-indicator'

// Potential
export type {
  PotentialObservation,
  NaturalAdvantage,
  NaturalLimiter,
  GeneticIndicator,
  NaturalAdvantageType,
  NaturalLimiterType,
  GeneticIndicatorType,
} from './potential'

// Safety
export type {
  PIESafetyFlag,
  PIESafetyAssessment,
  PIESafetyFlagType,
  PIESafetyLevel,
} from './safety'

// Baseline
export type { PhysiqueBaseline, BaselineKeyMetrics } from './baseline'

// Comparison (interfaces only)
export type {
  IPhysiqueComparisonService,
  PhysiqueComparisonResult,
  MetricTrend,
  MuscleGroupTrend,
  TrendDirection,
  PhysiqueTrendHistory,
  BodyFatTrendPoint,
  MuscleHistoryPoint,
  PostureTrendPoint,
  SymmetryTrendPoint,
} from './comparison'
export { NullPhysiqueComparisonService } from './comparison'

// Model (top-level output)
export type { PhysiqueModel, PIEInputSummary, PIEMeta, ViewType } from './model'
