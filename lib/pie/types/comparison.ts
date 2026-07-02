/**
 * lib/pie/types/comparison.ts
 *
 * Future comparison interfaces — ARCHITECTURE ONLY.
 * These interfaces define the contracts for progress comparison.
 * IMPLEMENTATION is NOT done in Sprint 5A.
 *
 * When the Progress Tracking sprint begins, implementations of
 * IPhysiqueComparisonService plug in here without model rewrites.
 */

import type { PhysiqueBaseline, BaselineKeyMetrics } from './baseline'
import type { MuscleGroupId } from './muscle'
import type { PIEConfidence } from './observation'

// ─── Trend Direction ──────────────────────────────────────────────────────────

export type TrendDirection =
  | 'improving'
  | 'stable'
  | 'declining'
  | 'insufficient_data'

// ─── Metric Trend ─────────────────────────────────────────────────────────────

export interface MetricTrend {
  metric: string
  baselineValue: number
  currentValue: number
  absoluteChange: number
  percentChange: number
  direction: TrendDirection
  confidence: PIEConfidence
  weeksElapsed: number
}

// ─── Muscle Development Trend ─────────────────────────────────────────────────

export interface MuscleGroupTrend {
  muscleGroupId: MuscleGroupId
  baselineScore: number
  currentScore: number
  direction: TrendDirection
  confidence: PIEConfidence
}

// ─── Comparison Result ────────────────────────────────────────────────────────

export interface PhysiqueComparisonResult {
  baselineId: string
  currentSessionId: string
  comparedAt: string
  weeksElapsed: number

  bodyFatTrend: MetricTrend
  muscleGroupTrends: MuscleGroupTrend[]
  symmetryTrend: MetricTrend
  postureTrend: MetricTrend

  /** Metrics improving */
  improvements: string[]
  /** Metrics declining */
  regressions: string[]
  /** Metrics unchanged */
  stable: string[]

  summary: string
}

// ─── Comparison Service Interface ─────────────────────────────────────────────

/**
 * IPhysiqueComparisonService
 *
 * NOT IMPLEMENTED in Sprint 5A.
 * Interface only — for future Progress Tracking sprint.
 */
export interface IPhysiqueComparisonService {
  /**
   * Compare a new PhysiqueBaseline against a stored baseline.
   */
  compare(
    baseline: PhysiqueBaseline,
    current: PhysiqueBaseline
  ): Promise<PhysiqueComparisonResult>

  /**
   * Retrieve all stored baselines for a user.
   */
  getHistory(userId: string): Promise<PhysiqueBaseline[]>

  /**
   * Store a new baseline snapshot.
   */
  saveBaseline(baseline: PhysiqueBaseline): Promise<void>

  /**
   * Get latest baseline for a user.
   */
  getLatestBaseline(userId: string): Promise<PhysiqueBaseline | null>
}

// ─── Body Composition Trend (flattened for chart rendering) ──────────────────

export interface BodyFatTrendPoint {
  capturedAt: string
  midpointEstimate: number
  minEstimate: number
  maxEstimate: number
  confidence: PIEConfidence
}

// ─── Muscle Development History (for individual muscle tracking) ───────────────

export interface MuscleHistoryPoint {
  capturedAt: string
  muscleGroupId: MuscleGroupId
  rawScore: number
  confidence: PIEConfidence
}

// ─── Posture Trend ────────────────────────────────────────────────────────────

export interface PostureTrendPoint {
  capturedAt: string
  concernCount: number
  primaryPattern: string
}

// ─── Symmetry Trend ───────────────────────────────────────────────────────────

export interface SymmetryTrendPoint {
  capturedAt: string
  overallScore: number
  flaggedAreas: string[]
}

// ─── Aggregate Trend History ──────────────────────────────────────────────────

/**
 * PhysiqueTrendHistory — NOT IMPLEMENTED in Sprint 5A.
 * This is what the Progress Tracking sprint will populate.
 */
export interface PhysiqueTrendHistory {
  userId: string
  bodyFatHistory: BodyFatTrendPoint[]
  muscleHistory: MuscleHistoryPoint[]
  postureHistory: PostureTrendPoint[]
  symmetryHistory: SymmetryTrendPoint[]
  baselineMetricsHistory: Array<BaselineKeyMetrics & { capturedAt: string }>
}

// ─── Null implementation (for testing and initial sprint) ─────────────────────

export class NullPhysiqueComparisonService implements IPhysiqueComparisonService {
  async compare(
    _baseline: PhysiqueBaseline,
    _current: PhysiqueBaseline
  ): Promise<PhysiqueComparisonResult> {
    throw new Error('PhysiqueComparisonService not implemented — available in Progress Tracking sprint')
  }

  async getHistory(_userId: string): Promise<PhysiqueBaseline[]> {
    return []
  }

  async saveBaseline(_baseline: PhysiqueBaseline): Promise<void> {
    // No-op in Sprint 5A
  }

  async getLatestBaseline(_userId: string): Promise<PhysiqueBaseline | null> {
    return null
  }
}
