/**
 * lib/pie/analyzers/safety.ts
 *
 * SafetyFlagAnalyzer
 * Scans all PIE observations for visual safety concerns.
 * PIE does NOT diagnose. It flags observations for human review.
 * Every flag includes: what was observed, why it was flagged, recommended response.
 */

import type { PIESafetyFlag, PIESafetyAssessment, PIESafetyLevel } from '../types/safety'
import type { BodyCompositionObservation } from '../types/composition'
import type { MuscleDevelopmentModel } from '../types/muscle'
import type { SymmetryObservation } from '../types/symmetry'
import type { PostureObservation } from '../types/posture'
import { PIE_CONFIG } from '../config'
import { pieId, now } from './utils'

export function analyzeSafety(
  bodyComposition: BodyCompositionObservation,
  _muscleDevelopment: MuscleDevelopmentModel,
  symmetry: SymmetryObservation,
  posture: PostureObservation,
  biologicalSex: 'male' | 'female'
): PIESafetyAssessment {
  const flags: PIESafetyFlag[] = []
  const safetyConfig = PIE_CONFIG.safety

  // ─── Check 1: Extreme Leanness ─────────────────────────────────────────────
  const bfMid = bodyComposition.bodyFat.midpoint
  const extremeLeanThreshold = safetyConfig.extremeLean[biologicalSex]

  if (bfMid > 0 && bfMid <= extremeLeanThreshold && bodyComposition.bodyFat.confidence !== 'unknown') {
    flags.push(makeFlag(
      'extreme_underweight',
      'requires_review',
      `Estimated body fat of ~${bfMid.toFixed(1)}% is at or below essential fat levels for ${biologicalSex}s.`,
      `Body fat estimate of ${bfMid.toFixed(1)}% falls at or below the essential fat threshold (${extremeLeanThreshold}% for ${biologicalSex}s). This may indicate insufficient body fat for healthy hormonal function.`,
      'moderate',
      'Coaching should not proceed with caloric restriction or fat-loss programming. Medical review recommended.'
    ))
  }

  // ─── Check 2: Extreme Obesity ────────────────────────────────────────────
  const extremeObesityThreshold = safetyConfig.extremeObesity[biologicalSex]
  if (bfMid >= extremeObesityThreshold && bodyComposition.bodyFat.confidence !== 'unknown') {
    flags.push(makeFlag(
      'extreme_obesity',
      'advisory',
      `Estimated body fat of ~${bfMid.toFixed(1)}% is above the extreme obesity threshold.`,
      `Body fat estimate of ~${bfMid.toFixed(1)}% exceeds the ${extremeObesityThreshold}% advisory threshold.`,
      'low',
      'Medical clearance recommended before commencing high-intensity exercise programming.'
    ))
  }

  // ─── Check 3: Structural Asymmetry Concern ───────────────────────────────
  if (
    symmetry.leftRight.rating === 'notable_asymmetry' &&
    symmetry.overallScore < safetyConfig.asymmetryConcernThreshold
  ) {
    flags.push(makeFlag(
      'structural_asymmetry_concern',
      'informational',
      `Notable bilateral asymmetry observed (overall symmetry score: ${(symmetry.overallScore * 100).toFixed(0)}%).`,
      'Significant left/right asymmetry detected. This may reflect training history, injury compensation, or structural variation.',
      'low',
      'ZCI should note this for programming — unilateral work may be appropriate.'
    ))
  }

  // ─── Check 4: Significant Postural Concern ────────────────────────────────
  const significantPostureIssues = posture.notablePatterns.length >= 3
  if (significantPostureIssues) {
    flags.push(makeFlag(
      'significant_postural_concern',
      'advisory',
      `${posture.notablePatterns.length} significant postural patterns identified.`,
      `Multiple postural deviations observed: ${posture.notablePatterns.join(', ')}.`,
      'moderate',
      'Programming should include postural corrective work. Physiotherapy assessment may be beneficial.'
    ))
  }

  // ─── Check 5: Possible Injury Indicator ──────────────────────────────────
  // Notable asymmetry in specific paired muscle groups (left/right)
  const pushPullImbalance = symmetry.pushPull.dominance !== 'balanced' &&
    symmetry.pushPull.dominance !== 'not_assessable' &&
    symmetry.pushPull.confidence !== 'unknown'

  if (pushPullImbalance && symmetry.overallScore < 0.75) {
    flags.push(makeFlag(
      'possible_injury_indicator',
      'informational',
      `Push/pull muscle imbalance observed (${symmetry.pushPull.dominance}) with reduced overall symmetry.`,
      'Combination of push/pull dominance and bilateral asymmetry can indicate previous injury compensation or chronic imbalanced training.',
      'low',
      'ZCI should query injury history and adapt movement selection accordingly.'
    ))
  }

  // ─── Compute Assessment ───────────────────────────────────────────────────
  const levels: PIESafetyLevel[] = ['informational', 'advisory', 'requires_review', 'block_coaching']
  const severityOrder = (l: PIESafetyLevel) => levels.indexOf(l)
  const highestSeverity: PIESafetyLevel | 'none' =
    flags.length === 0
      ? 'none'
      : flags.reduce<PIESafetyLevel>(
          (max, f) => severityOrder(f.level) > severityOrder(max) ? f.level : max,
          'informational'
        )

  return {
    flags,
    highestSeverity,
    blockCoaching: flags.some((f) => f.level === 'block_coaching'),
    requiresHumanReview: flags.some((f) => f.requiresHumanReview),
    clear: flags.length === 0,
  }
}

function makeFlag(
  type: PIESafetyFlag['type'],
  level: PIESafetyLevel,
  observation: string,
  reason: string,
  confidence: PIESafetyFlag['confidence'],
  recommendedResponse: string
): PIESafetyFlag {
  return {
    id: pieId('sf'),
    type,
    level,
    observation,
    reason,
    confidence,
    recommendedResponse,
    requiresHumanReview: level === 'requires_review' || level === 'block_coaching',
    flaggedAt: now(),
  }
}
