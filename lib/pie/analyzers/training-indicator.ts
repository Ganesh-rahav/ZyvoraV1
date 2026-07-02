/**
 * lib/pie/analyzers/training-indicator.ts
 *
 * TrainingIndicatorAnalyzer
 * Detects visual evidence of training background.
 * This is VISUAL INFERENCE ONLY — self-report from ZCI context must be fused separately.
 */

import type { PhysiqueAnalysis } from '@/lib/ai/types/vision'
import type { TrainingIndicatorObservation, VisualTrainingProfile, VisualIndicator } from '../types/training-indicator'
import type { MuscleDevelopmentModel } from '../types/muscle'
import type { ViewType } from '../types/model'
import { pieId, now, scoreToConfidence, viewBonus, viewsToSources, avg } from './utils'

export function analyzeTrainingIndicators(
  analyses: Partial<Record<ViewType, PhysiqueAnalysis>>,
  muscleDevelopment: MuscleDevelopmentModel
): TrainingIndicatorObservation {
  const views = Object.keys(analyses) as ViewType[]
  const allAnalyses = Object.values(analyses).filter(Boolean) as PhysiqueAnalysis[]
  const bonus = viewBonus(views.length)
  const evidenceSources = viewsToSources(views)

  const avgDevScore = muscleDevelopment.averageDevelopmentScore
  const groups = muscleDevelopment.groups

  // ─── Detect Indicators ────────────────────────────────────────────────────

  // Compound strength indicators: traps, lower back, glutes, overall density
  const strengthIndicatorScore = avg([
    groups['traps']?.rawScore ?? 0,
    groups['lower_back']?.rawScore ?? 0,
    groups['glutes']?.rawScore ?? 0,
    groups['quadriceps']?.rawScore ?? 0,
  ])

  // Hypertrophy indicators: high overall volume, chest + arms + back
  const hypertrophyIndicatorScore = avg([
    groups['upper_chest']?.rawScore ?? 0,
    groups['mid_chest']?.rawScore ?? 0,
    groups['biceps']?.rawScore ?? 0,
    groups['triceps']?.rawScore ?? 0,
    groups['lats']?.rawScore ?? 0,
    groups['upper_back']?.rawScore ?? 0,
  ])

  // Cardiovascular indicators: lean, limited bulk, body fat low
  const avgSymScore = avg(allAnalyses.map((a) => a.symmetry.score))
  const avgBfConf = avg(allAnalyses.map((a) => a.bodyComposition.confidence))

  const indicators: VisualIndicator[] = [
    {
      type: 'compound_strength_indicators',
      observed: strengthIndicatorScore >= 6.5,
      confidence: scoreToConfidence(strengthIndicatorScore / 10, bonus),
      reason: `Compound strength indicators: traps, lower back, glutes, quads avg score ${strengthIndicatorScore.toFixed(1)}/10.`,
    },
    {
      type: 'hypertrophy_indicators',
      observed: hypertrophyIndicatorScore >= 6.5 && avgDevScore >= 6.0,
      confidence: scoreToConfidence(hypertrophyIndicatorScore / 10, bonus),
      reason: `Hypertrophy indicators: push/pull muscle avg ${hypertrophyIndicatorScore.toFixed(1)}/10.`,
    },
    {
      type: 'beginner_indicators',
      observed: avgDevScore < 4.5,
      confidence: scoreToConfidence(1 - avgDevScore / 10, bonus),
      reason: `Average muscle development score of ${avgDevScore.toFixed(1)}/10 suggests beginner development level.`,
    },
    {
      type: 'inactivity_indicators',
      observed: avgDevScore < 3.0,
      confidence: scoreToConfidence(1 - avgDevScore / 10, bonus),
      reason: `Very low average development score (${avgDevScore.toFixed(1)}/10) consistent with sedentary lifestyle.`,
    },
    {
      type: 'postural_training_indicators',
      observed: avgSymScore > 0.90 && avgDevScore >= 5.0,
      confidence: scoreToConfidence(avgSymScore, bonus),
      reason: `High symmetry score (${(avgSymScore * 100).toFixed(0)}%) with moderate development suggests deliberate, balanced training.`,
    },
  ]

  // ─── Classify Visual Profile ──────────────────────────────────────────────
  const visualProfile = classifyProfile(
    avgDevScore,
    strengthIndicatorScore,
    hypertrophyIndicatorScore,
    avgBfConf,
    views.length
  )

  const profileConf = scoreToConfidence(
    avgDevScore < 3 ? 0.80 :   // Beginner/sedentary is clear
    avgDevScore > 7 ? 0.75 :   // Well developed is moderately clear
    0.55,                       // Middle range — harder to classify
    bonus
  )

  const supportingEvidence = indicators
    .filter((i) => i.observed)
    .map((i) => i.reason)

  return {
    visualProfile: {
      id: pieId('vtp'),
      observedAt: now(),
      analyzer: 'training-indicator',
      value: visualProfile,
      confidence: profileConf,
      visibility: views.length > 0 ? 'clearly_visible' : 'not_visible',
      reason: `Visual profile '${visualProfile}' inferred from muscle development patterns across ${views.length} view(s).`,
      evidenceSources,
      needsHumanReview: false,
    },
    detectedIndicators: indicators,
    supportingEvidence,
    disclaimer:
      'Training profile classification is a VISUAL INFERENCE ONLY. ' +
      'Self-reported experience level must be weighted alongside this assessment by the coaching system.',
  }
}

function classifyProfile(
  avgScore: number,
  strengthScore: number,
  hypertrophyScore: number,
  _bfConf: number,
  viewCount: number
): VisualTrainingProfile {
  if (viewCount === 0) return 'unknown'
  if (avgScore < 3.0) return 'sedentary'
  if (avgScore < 4.5) return 'beginner'
  if (strengthScore >= 7.0 && hypertrophyScore < 6.5) return 'strength_athlete'
  if (hypertrophyScore >= 7.0) return 'bodybuilder'
  if (avgScore >= 5.5) return 'athletic'
  return 'unknown'
}
