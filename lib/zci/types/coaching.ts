/**
 * lib/zci/types/coaching.ts
 *
 * Coaching lifecycle types — sessions, cycles, check-ins, progress reviews.
 * These are the persistent units of the coaching relationship.
 */

import type { CoachingOutput } from './recommendation'
import type { CoachingStrategy } from './decision'

// ─── Coaching Cycle ───────────────────────────────────────────────────────────

/**
 * A CoachingCycle is a defined period of coaching (typically 4–8 weeks).
 * It contains the strategy, recommendations, and outcomes for that period.
 * Cycles are compared over time to detect progress and adaptation.
 */
export interface CoachingCycle {
  id: string
  userId: string
  cycleNumber: number
  /** ISO timestamp */
  startedAt: string
  /** ISO timestamp — null while cycle is active */
  completedAt: string | null
  lengthWeeks: number
  strategy: CoachingStrategy
  /** Initial output generated at cycle start */
  initialOutput: CoachingOutput
  /** Weekly check-in summaries for this cycle */
  checkIns: CheckIn[]
  /** Outcome data collected at cycle end */
  outcome?: CycleOutcome
  status: 'active' | 'completed' | 'abandoned'
}

// ─── Check-In ─────────────────────────────────────────────────────────────────

export interface CheckIn {
  id: string
  cycleId: string
  weekNumber: number
  completedAt: string
  /** Logged weight in kg at check-in time */
  weightKg?: number
  /** User-reported values 1–5 */
  selfReport: {
    sleepQuality: number
    energyLevel: number
    stressLevel: number
    adherenceRating: number
    /** Any free-text notes */
    notes?: string
  }
  /** AI assessment of the week */
  aiAssessment: {
    progressSummary: string
    keyObservations: string[]
    recommendedAdjustments: string[]
    plateauDetected: boolean
    deloadRecommended: boolean
  }
  /** Updated strategy for the next week (if adjusted) */
  strategyAdjusted: boolean
}

// ─── Cycle Outcome ────────────────────────────────────────────────────────────

export interface CycleOutcome {
  weightChangeKg: number
  /** Adherence percentage 0–100 */
  trainingAdherence: number
  nutritionAdherence: number
  /** Self-rated overall satisfaction 1–5 */
  userSatisfaction?: number
  /** Key wins during this cycle */
  wins: string[]
  /** Key challenges during this cycle */
  challenges: string[]
  /** AI assessment of whether goals were progressed */
  goalProgressAssessment: 'exceeded' | 'on_track' | 'behind' | 'stalled'
  /** Recommendations for the next cycle */
  nextCycleRecommendations: string[]
}

// ─── Progress Review ──────────────────────────────────────────────────────────

export interface ProgressReview {
  id: string
  userId: string
  reviewDate: string
  /** Cycles covered by this review */
  cyclesReviewed: string[]
  /** Aggregate progress assessment */
  overallProgress: {
    physique: string
    performance: string
    nutrition: string
    adherence: string
    wellbeing: string
  }
  /** Key pattern observations across cycles */
  patterns: string[]
  /** Strategy adjustments for the next period */
  strategyEvolution: string[]
  plateausDetected: boolean
  plateauInterventions?: string[]
}
