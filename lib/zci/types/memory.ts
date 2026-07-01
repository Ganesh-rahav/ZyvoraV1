/**
 * lib/zci/types/memory.ts
 *
 * Memory system types — architecture interfaces for Sprint 4B.
 *
 * The memory system implements the four layers defined in docs/02-ai-coach-spec.md §5:
 *   1. Session Memory    — Active conversation context
 *   2. Short-Term Memory — Rolling 14-day activity window
 *   3. Long-Term Memory  — Structured historical summaries
 *   4. Persistent Memory — Fixed profile facts that never expire
 *
 * NOTE: Implementation is deferred to the Auth + Memory sprint.
 * This file defines INTERFACES only — no implementation.
 */

import type { CoachingStrategy } from './decision'
import type { CoachingOutput } from './recommendation'

// ─── Memory Layer Enum ────────────────────────────────────────────────────────

export type MemoryLayer =
  | 'session'        // Active session — not persisted
  | 'short_term'     // 14-day rolling window
  | 'long_term'      // Historical summaries — permanent
  | 'persistent'     // Fixed profile facts — permanent

// ─── Memory Event ─────────────────────────────────────────────────────────────

export type MemoryEventType =
  | 'coaching_session_started'
  | 'coaching_session_completed'
  | 'check_in_completed'
  | 'cycle_completed'
  | 'goal_changed'
  | 'injury_reported'
  | 'plateau_detected'
  | 'milestone_reached'
  | 'preference_updated'
  | 'strategy_revised'
  | 'progress_reviewed'

export interface MemoryEvent {
  id: string
  userId: string
  eventType: MemoryEventType
  timestamp: string
  /** Which memory layers this event should be written to */
  targetLayers: MemoryLayer[]
  payload: Record<string, unknown>
  /** Whether this event should trigger a memory promotion */
  triggerPromotion: boolean
}

// ─── Session Memory ───────────────────────────────────────────────────────────

export interface SessionMemory {
  sessionId: string
  userId: string
  startedAt: string
  interactionType: string
  /** Message thread for the active session */
  messages: Array<{
    role: 'coach' | 'user' | 'system'
    content: string
    timestamp: string
  }>
  /** ZCI output generated in this session */
  zciOutput?: CoachingOutput
  /** Any user signals captured during this session */
  capturedSignals: MemoryEvent[]
}

// ─── Short-Term Memory ────────────────────────────────────────────────────────

export interface ShortTermMemory {
  userId: string
  windowDays: number  // Default: 14
  updatedAt: string
  workoutLogs: Array<{
    date: string
    completed: boolean
    sessionsCompleted: number
    notes?: string
  }>
  nutritionLogs: Array<{
    date: string
    estimatedCalories?: number
    proteinGrams?: number
    adherenceRating?: number
  }>
  weightLogs: Array<{
    date: string
    weightKg: number
  }>
  activeInjuries: Array<{
    area: string
    onsetDate: string
    movementRestrictions: string[]
  }>
  coachSummaries: Array<{
    date: string
    summary: string
    keyPoints: string[]
  }>
}

// ─── Long-Term Memory ─────────────────────────────────────────────────────────

export interface LongTermMemory {
  userId: string
  updatedAt: string
  trainingBlockSummaries: Array<{
    blockId: string
    startDate: string
    endDate: string
    adherencePercent: number
    strengthGains: string[]
    volumeTrend: 'increasing' | 'stable' | 'decreasing'
  }>
  nutritionPhaseSummaries: Array<{
    phaseId: string
    startDate: string
    endDate: string
    caloricTarget: number
    adherencePercent: number
    weightOutcomeKg: number
  }>
  bodyCompositionHistory: Array<{
    date: string
    weightKg: number
    estimatedBodyFatMin?: number
    estimatedBodyFatMax?: number
  }>
  exerciseResponseNotes: Array<{
    exercise: string
    response: 'positive' | 'neutral' | 'negative' | 'pain_reported'
    notes: string
    date: string
  }>
  injuryHistory: Array<{
    area: string
    onsetDate: string
    resolvedDate?: string
    movementRestrictions: string[]
  }>
  behavioralPatterns: Array<{
    pattern: string
    frequency: string
    context: string
    lastObserved: string
  }>
  goalHistory: Array<{
    goal: string
    setAt: string
    changedAt?: string
    reason?: string
  }>
  coachingStrategies: Array<{
    strategyId: string
    createdAt: string
    summary: string
    strategy: CoachingStrategy
  }>
}

// ─── Persistent Memory ────────────────────────────────────────────────────────

export interface PersistentMemory {
  userId: string
  biologicalSex: 'male' | 'female'
  dateOfBirth: string
  heightCm: number
  /** Body composition at onboarding */
  baselineBodyComposition: {
    estimatedBodyFatMin?: number
    estimatedBodyFatMax?: number
    weightKg: number
    date: string
  }
  confirmedInjuries: Array<{
    area: string
    type: 'structural' | 'chronic' | 'past'
    movementRestrictions: string[]
  }>
  dietaryRestrictions: string[]
  coachingStyle: string
  units: 'metric' | 'imperial'
  subscriptionTier: string
}

// ─── Coach Memory ─────────────────────────────────────────────────────────────

/**
 * CoachMemory is the unified interface the ZCI pipeline uses to read memory.
 * The actual persistence layer (Supabase, Redis) implements this interface.
 * TODO(memory-sprint): Implement SupabaseCoachMemory.
 */
export interface ICoachMemory {
  readonly userId: string

  getSession(): Promise<SessionMemory | null>
  getShortTerm(): Promise<ShortTermMemory | null>
  getLongTerm(): Promise<LongTermMemory | null>
  getPersistent(): Promise<PersistentMemory | null>

  saveSession(memory: SessionMemory): Promise<void>
  saveShortTerm(memory: ShortTermMemory): Promise<void>
  appendLongTerm(event: MemoryEvent): Promise<void>
  updatePersistent(updates: Partial<PersistentMemory>): Promise<void>

  emitEvent(event: MemoryEvent): Promise<void>
}

// ─── In-Memory Mock ───────────────────────────────────────────────────────────

/**
 * NullCoachMemory — used when no persistence layer is configured.
 * Returns null for all reads, no-ops for all writes.
 * TODO(memory-sprint): Replace with SupabaseCoachMemory.
 */
export class NullCoachMemory implements ICoachMemory {
  readonly userId: string

  constructor(userId: string) {
    this.userId = userId
  }

  async getSession(): Promise<null> { return null }
  async getShortTerm(): Promise<null> { return null }
  async getLongTerm(): Promise<null> { return null }
  async getPersistent(): Promise<null> { return null }
  async saveSession(): Promise<void> { /* no-op */ }
  async saveShortTerm(): Promise<void> { /* no-op */ }
  async appendLongTerm(): Promise<void> { /* no-op */ }
  async updatePersistent(): Promise<void> { /* no-op */ }
  async emitEvent(): Promise<void> { /* no-op */ }
}
