/**
 * lib/zci/types/index.ts — barrel export for all ZCI types
 */

export type {
  PhysicalProfile,
  GoalContext,
  TrainingProfile,
  LifestyleProfile,
  NutritionProfile,
  HealthContext,
  CoachContext,
  PhysiqueInput,
  UserContext,
} from './context'

export type {
  EvidenceSourceType,
  EvidenceSource,
  EvidenceStrength,
  EvidenceCategory,
  Evidence,
  EvidenceCollection,
} from './evidence'

export type {
  BodyRegion,
  ObservationCategory,
  DevelopmentStatus,
  Observation,
  ObservationSet,
} from './observation'

export type {
  ConfidenceLevel,
  ConfidenceChangeReason,
  ConfidenceAssessment,
  ConfidenceEnvelope,
} from './confidence'
export { CONFIDENCE_SCORES } from './confidence'

export type {
  ImpactDomain,
  PriorityScore,
  Priority,
  PriorityRanking,
} from './priority'

export type {
  TrainingFocus,
  NutritionFocus,
  RecoveryFocus,
  LifestyleFocus,
  BehaviourFocus,
  CoachingStrategy,
  TransformationPlan,
} from './decision'

export type {
  ActionStep,
  BehaviourGoal,
  Recommendation,
  CoachingOutput,
} from './recommendation'

export type {
  CoachingCycle,
  CheckIn,
  CycleOutcome,
  ProgressReview,
} from './coaching'

export type {
  MemoryLayer,
  MemoryEventType,
  MemoryEvent,
  SessionMemory,
  ShortTermMemory,
  LongTermMemory,
  PersistentMemory,
  ICoachMemory,
} from './memory'
export { NullCoachMemory } from './memory'

export type {
  ReasoningStepType,
  ReasoningStep,
  ReasoningTrace,
  ITraceBuilder,
} from './reasoning'

export type {
  SafetySignalType,
  SafetyLevel,
  SafetySignal,
  ScopeViolationType,
  ScopeViolation,
  SafetyCheckResult,
  EmergencyResponse,
} from './safety'
export { CALORIC_SAFETY_FLOORS } from './safety'
