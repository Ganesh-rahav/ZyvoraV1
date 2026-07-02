/**
 * lib/pie/analyzers/utils.ts
 *
 * Shared utility functions for all PIE analyzers.
 */

import type { PIEConfidence, PIEEvidenceSource } from '../types/observation'
import type { ViewType } from '../types/model'
import { PIE_CONFIG } from '../config'

let _idCounter = 0
export function pieId(prefix: string): string {
  return `${prefix}_${Date.now()}_${(++_idCounter).toString(36)}`
}

export function now(): string {
  return new Date().toISOString()
}

/**
 * Convert a raw vision provider confidence score (0–1) to a PIEConfidence level.
 * Optional: add a bonus for multiple views (increases confidence).
 */
export function scoreToConfidence(
  score: number,
  viewBonus = 0
): PIEConfidence {
  const adjusted = Math.min(1, score + viewBonus)
  const { confidence: thresholds } = PIE_CONFIG
  if (adjusted >= thresholds.highThreshold) return 'high'
  if (adjusted >= thresholds.moderateThreshold) return 'moderate'
  if (adjusted >= thresholds.lowThreshold) return 'low'
  return 'unknown'
}

/**
 * Determine view bonus based on how many views are available.
 */
export function viewBonus(viewCount: number): number {
  if (viewCount <= 1) return 0
  if (viewCount === 2) return PIE_CONFIG.confidence.multiViewBonus
  return PIE_CONFIG.confidence.multiViewBonus * 2  // 3 views = double bonus
}

/**
 * Convert view types to PIEEvidenceSource entries.
 */
export function viewsToSources(views: ViewType[]): PIEEvidenceSource[] {
  const sources: PIEEvidenceSource[] = views.map((v) =>
    v === 'front' ? 'front_view' : v === 'side' ? 'side_view' : 'back_view'
  )
  if (views.length >= 2) sources.push('multi_view')
  return [...new Set(sources)]
}

/**
 * Average a list of numbers. Returns 0 if empty.
 */
export function avg(nums: number[]): number {
  if (nums.length === 0) return 0
  return nums.reduce((s, n) => s + n, 0) / nums.length
}

/**
 * Clamp a number between min and max.
 */
export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n))
}
