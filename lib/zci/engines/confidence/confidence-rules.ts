/**
 * lib/zci/engines/confidence/confidence-rules.ts
 *
 * Rules that determine how confidence is assessed.
 * Rules are pure functions — no side effects.
 */

import type { Evidence, EvidenceStrength } from '../../types/evidence'
import type { ConfidenceAssessment, ConfidenceChangeReason, ConfidenceLevel } from '../../types/confidence'
import { CONFIDENCE_SCORES } from '../../types/confidence'
import { ZCI_CONFIG } from '../../config'

/**
 * Maps evidence strength to a baseline confidence score.
 */
const STRENGTH_TO_SCORE: Record<EvidenceStrength, number> = {
  strong:  0.90,
  moderate: 0.65,
  weak:    0.35,
  absent:  0.00,
}

/**
 * Calculates confidence for a single evidence item based on its sources.
 */
export function assessEvidenceConfidence(evidence: Evidence): ConfidenceAssessment {
  const { confidence: cConfig } = ZCI_CONFIG

  if (evidence.strength === 'absent') {
    return {
      level: 'unknown',
      score: 0,
      reasons: ['no_data_available'],
      explanation: 'No data was available for this item.',
    }
  }

  // Average reliability of all sources
  const avgReliability = evidence.sources.reduce((sum, s) => sum + s.reliability, 0)
    / evidence.sources.length

  // Base score from evidence strength
  const baseScore = STRENGTH_TO_SCORE[evidence.strength]

  // Modulate by source reliability
  const adjustedScore = baseScore * avgReliability

  const reasons: ConfidenceChangeReason[] = []

  if (evidence.sources.length > 1) {
    reasons.push('multiple_sources_agree')
  } else {
    reasons.push('single_source_only')
  }

  if (evidence.sources.some((s) => s.type === 'self_report')) {
    reasons.push('source_is_self_report')
  }
  if (evidence.sources.some((s) => s.type === 'vision_analysis')) {
    reasons.push('source_is_vision_analysis')
  }
  if (evidence.sources.some((s) => s.type === 'derived_calculation')) {
    reasons.push('source_is_derived')
  }

  const level = scoreToLevel(adjustedScore, cConfig.lowThreshold, cConfig.highThreshold)

  return {
    level,
    score: adjustedScore,
    reasons,
    explanation: buildExplanation(level, reasons, evidence.caveats),
    improvableBy: level !== 'high'
      ? `Corroborating this with ${level === 'low' ? 'any additional' : 'more reliable'} data would increase confidence.`
      : undefined,
  }
}

/**
 * Aggregates confidence across multiple evidence items for an observation.
 */
export function aggregateConfidence(
  evidenceItems: Evidence[]
): ConfidenceAssessment {
  if (evidenceItems.length === 0) {
    return {
      level: 'unknown',
      score: 0,
      reasons: ['no_data_available'],
      explanation: 'No supporting evidence was found.',
    }
  }

  const assessments = evidenceItems.map(assessEvidenceConfidence)
  const avgScore = assessments.reduce((s, a) => s + a.score, 0) / assessments.length

  // Conflicting evidence? Use lowest score
  const maxScore = Math.max(...assessments.map((a) => a.score))
  const minScore = Math.min(...assessments.map((a) => a.score))
  const conflicting = maxScore - minScore > 0.3

  const finalScore = conflicting ? minScore : avgScore
  const reasons = conflicting
    ? (['contradictory_sources'] as ConfidenceChangeReason[])
    : [...new Set(assessments.flatMap((a) => a.reasons))]

  const { confidence: cConfig } = ZCI_CONFIG
  const level = scoreToLevel(finalScore, cConfig.lowThreshold, cConfig.highThreshold)

  return {
    level,
    score: finalScore,
    reasons,
    explanation: conflicting
      ? 'Supporting evidence was partially contradictory — confidence reduced accordingly.'
      : buildExplanation(level, reasons),
  }
}

function scoreToLevel(
  score: number,
  lowThreshold: number,
  highThreshold: number
): ConfidenceLevel {
  if (score <= 0) return 'unknown'
  if (score < lowThreshold) return 'low'
  if (score < highThreshold) return 'moderate'
  return 'high'
}

function buildExplanation(
  level: ConfidenceLevel,
  reasons: ConfidenceChangeReason[],
  caveats?: string[]
): string {
  const reasonLabels: Record<ConfidenceChangeReason, string> = {
    multiple_sources_agree: 'multiple sources agree',
    single_source_only: 'based on a single source',
    source_is_self_report: 'self-reported data',
    source_is_derived: 'calculated estimate',
    source_is_vision_analysis: 'photo-based analysis',
    data_freshness_low: 'older data',
    contradictory_sources: 'contradictory sources',
    limited_coverage: 'limited photo coverage',
    no_data_available: 'no data available',
  }

  const parts = reasons.map((r) => reasonLabels[r]).filter(Boolean)
  let explanation = `${level.charAt(0).toUpperCase() + level.slice(1)} confidence based on ${parts.join(', ')}.`

  if (caveats && caveats.length > 0) {
    explanation += ` Note: ${caveats[0]}`
  }

  return explanation
}

export { CONFIDENCE_SCORES }
