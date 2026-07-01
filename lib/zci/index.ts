/**
 * lib/zci/index.ts
 *
 * Top-level barrel export for the Zyvora Coaching Intelligence (ZCI).
 *
 * Import pattern:
 *   import { runZCIPipeline, assembleUserContext } from '@/lib/zci'
 *   import type { UserContext, CoachingOutput } from '@/lib/zci'
 */

// ─── Pipeline (Primary Interface) ────────────────────────────────────────────
export { runZCIPipeline, assembleUserContext } from './pipeline'
export type { ZCIPipelineResult, ZCIPipelineOptions, ContextAssemblerInput } from './pipeline'

// ─── Types ────────────────────────────────────────────────────────────────────
export type {
  UserContext,
  PhysicalProfile,
  GoalContext,
  TrainingProfile,
  LifestyleProfile,
  NutritionProfile,
  HealthContext,
  CoachContext,
  PhysiqueInput,
} from './types/context'

export type {
  Evidence,
  EvidenceCollection,
  EvidenceCategory,
  EvidenceStrength,
} from './types/evidence'

export type {
  Observation,
  ObservationSet,
  ObservationCategory,
  BodyRegion,
} from './types/observation'

export type {
  ConfidenceLevel,
  ConfidenceAssessment,
} from './types/confidence'
export { CONFIDENCE_SCORES } from './types/confidence'

export type {
  Priority,
  PriorityRanking,
  PriorityScore,
  ImpactDomain,
} from './types/priority'

export type {
  CoachingStrategy,
  TransformationPlan,
  TrainingFocus,
  NutritionFocus,
  RecoveryFocus,
} from './types/decision'

export type {
  Recommendation,
  CoachingOutput,
  ActionStep,
  BehaviourGoal,
} from './types/recommendation'

export type {
  CoachingCycle,
  CheckIn,
  ProgressReview,
} from './types/coaching'

export type {
  ICoachMemory,
  MemoryLayer,
  MemoryEvent,
} from './types/memory'
export { NullCoachMemory } from './types/memory'

export type {
  ReasoningTrace,
  ReasoningStep,
} from './types/reasoning'

export type {
  SafetyCheckResult,
  SafetySignal,
} from './types/safety'
export { CALORIC_SAFETY_FLOORS } from './types/safety'

// ─── Config ───────────────────────────────────────────────────────────────────
export { ZCI_CONFIG } from './config'

// ─── Errors ───────────────────────────────────────────────────────────────────
export {
  ZCIError,
  PipelineError,
  SafetyGateError,
  DecisionEngineError,
} from './errors'

// ─── Trace Builder (for testing + debugging) ─────────────────────────────────
export { TraceBuilder } from './reasoning'
