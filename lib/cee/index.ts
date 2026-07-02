/**
 * lib/cee/index.ts
 *
 * Top-level barrel for the Coaching Experience Engine (CEE).
 * Import from '@/lib/cee' for all CEE functionality.
 *
 * CEE = The voice.
 * POE = The eyes.
 * ZCI = The brain.
 */

export { assembleCEESession } from './cee-assembler'
export { sanitiseCoachVoice, assertsCoachVoice } from './language-engine'
export { toSessionConfidence, computeSessionConfidence } from './confidence-filter'

export type {
  CoachingSession,
  GreetingSection,
  FoundationSection,
  FoundationStrength,
  FocusSection,
  FocusArea,
  ReasoningSection,
  ReasoningItem,
  BaselineSection,
  BaselineMetric,
  ParticipationSection,
  ParticipationResponse,
  SessionConfidence,
  ConfidenceCaveat,
} from './types/session'
