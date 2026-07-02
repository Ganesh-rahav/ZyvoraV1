/**
 * lib/cee/confidence-filter.ts
 *
 * ConfidenceFilter — prevents unknown-confidence observations
 * from appearing in the coaching session without appropriate context.
 *
 * Rules:
 * - 'high' or 'moderate' → include without caveat (or mild caveat for moderate)
 * - 'low' → include with explicit caveat
 * - 'unknown' → OMIT from session, or replace with fallback
 */

import type { SessionConfidence } from './types/session'
import type { ConfidenceLevel } from '@/lib/zci/types/confidence'

/**
 * Map ZCI ConfidenceLevel → CEE SessionConfidence.
 */
export function toSessionConfidence(level: ConfidenceLevel): SessionConfidence {
  if (level === 'high') return 'high'
  if (level === 'moderate') return 'moderate'
  if (level === 'low') return 'low'
  // 'unknown' → treat as 'low' for session confidence
  return 'low'
}

/**
 * Determine the overall session confidence from all included priorities.
 */
export function computeSessionConfidence(levels: SessionConfidence[]): SessionConfidence {
  if (levels.length === 0) return 'low'
  const counts = { high: 0, moderate: 0, low: 0 }
  for (const l of levels) counts[l]++
  if (counts.high > levels.length / 2) return 'high'
  if (counts.low > levels.length / 2) return 'low'
  return 'moderate'
}

/**
 * Should a priority be included in the coaching session?
 * 'unknown' confidence priorities are excluded from the top 3.
 */
export function isIncludable(level: ConfidenceLevel): boolean {
  return level !== 'unknown' || false
}

/**
 * Should we show a baseline metric?
 * Metrics with source 'pie' require at least 'low' confidence.
 */
export function isBaselineMetricIncludable(
  level: ConfidenceLevel,
  source: 'pie' | 'self_report' | 'derived'
): boolean {
  if (source === 'self_report' || source === 'derived') return true
  // For PIE-sourced metrics, exclude 'unknown'
  return level !== 'unknown'
}
