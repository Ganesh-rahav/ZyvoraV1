/**
 * lib/pie/analyzers/body-composition.ts
 *
 * BodyCompositionAnalyzer
 * Processes body composition estimates from all available views.
 * Aggregates across multiple analyses for best estimate.
 */

import type { PhysiqueAnalysis } from '@/lib/ai/types/vision'
import type { BodyCompositionObservation, BodyCompositionCategory, FatDistributionPattern, DefinitionLevel } from '../types/composition'
import type { PIERangeObservation } from '../types/observation'
import type { ViewType } from '../types/model'
import { PIE_CONFIG } from '../config'
import { pieId, now, scoreToConfidence, viewBonus, viewsToSources, avg } from './utils'
import { PIEAnalyzerError } from '../errors'

export function analyzeBodyComposition(
  analyses: Partial<Record<ViewType, PhysiqueAnalysis>>,
  biologicalSex: 'male' | 'female'
): BodyCompositionObservation {
  const views = Object.keys(analyses) as ViewType[]
  const allAnalyses = Object.values(analyses).filter(Boolean) as PhysiqueAnalysis[]

  if (allAnalyses.length === 0) {
    throw new PIEAnalyzerError('body-composition', 'No analyses provided')
  }

  const bonus = viewBonus(views.length)
  const evidenceSources = viewsToSources(views)

  // ─── Body Fat Aggregation ─────────────────────────────────────────────────
  const bfMins = allAnalyses.map((a) => a.bodyComposition.bodyFatMin)
  const bfMaxs = allAnalyses.map((a) => a.bodyComposition.bodyFatMax)
  const bfConfScores = allAnalyses.map((a) => a.bodyComposition.confidence)

  const bfMin = Math.round(avg(bfMins) * 10) / 10
  const bfMax = Math.round(avg(bfMaxs) * 10) / 10
  const bfMid = (bfMin + bfMax) / 2
  const bfConfScore = avg(bfConfScores)
  const bfConfidence = scoreToConfidence(bfConfScore, bonus)

  const bodyFat: PIERangeObservation = {
    id: pieId('bf'),
    observedAt: now(),
    analyzer: 'body-composition',
    min: bfMin,
    max: bfMax,
    midpoint: Math.round(bfMid * 10) / 10,
    unit: '%',
    confidence: bfConfidence,
    visibility: views.includes('front') ? 'clearly_visible' : 'partially_visible',
    reason: `Body fat estimated from ${views.length} view(s). Average confidence across views: ${(bfConfScore * 100).toFixed(0)}%.`,
    evidenceSources,
    needsHumanReview: bfConfidence === 'low' || bfConfidence === 'unknown',
    reviewReason: bfConfidence === 'low' || bfConfidence === 'unknown'
      ? 'Body fat estimate confidence is below reliable threshold — verify with clinical measurement'
      : undefined,
  }

  // ─── Category ─────────────────────────────────────────────────────────────
  const category = classifyBodyFat(bfMid, biologicalSex)
  const categoryConfidence = scoreToConfidence(bfConfScore, bonus)

  // ─── Fat Distribution ─────────────────────────────────────────────────────
  const fatDistribution = deriveFatDistribution(allAnalyses, views, biologicalSex, bfConfScore, bonus, evidenceSources)

  // ─── Definition Level ─────────────────────────────────────────────────────
  const definition = deriveDefinitionLevel(bfMid, biologicalSex, bfConfScore, bonus, evidenceSources)

  return {
    bodyFat,
    category: {
      id: pieId('cat'),
      observedAt: now(),
      analyzer: 'body-composition',
      value: category,
      confidence: categoryConfidence,
      visibility: views.includes('front') ? 'clearly_visible' : 'partially_visible',
      reason: `Body composition classified as '${category}' based on estimated body fat midpoint of ${bfMid.toFixed(1)}%.`,
      evidenceSources,
      needsHumanReview: false,
    },
    fatDistribution,
    definition,
    disclaimer:
      'Body fat estimates from photographs are approximations only (±5–8%). ' +
      'For accurate measurements, use DEXA, hydrostatic weighing, or clinical assessment.',
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function classifyBodyFat(midpoint: number, sex: 'male' | 'female'): BodyCompositionCategory {
  const thresholds = PIE_CONFIG.bodyComposition.bodyFat[sex]
  if (midpoint <= thresholds.extremelyLean) return 'extremely_lean'
  if (midpoint <= thresholds.lean) return 'lean'
  if (midpoint <= thresholds.average) return 'average'
  if (midpoint <= thresholds.aboveAverage) return 'above_average'
  return 'high'
}

function deriveFatDistribution(
  analyses: PhysiqueAnalysis[],
  views: ViewType[],
  sex: 'male' | 'female',
  confScore: number,
  bonus: number,
  evidenceSources: ReturnType<typeof viewsToSources>
): BodyCompositionObservation['fatDistribution'] {
  // Distribution pattern is sex-influenced when confidence is low
  // Vision provider posture patterns give us some signal on distribution
  const postureLabels = analyses.flatMap((a) => a.posture.labels)
  const hasAbdominal = postureLabels.some((l) =>
    l.toLowerCase().includes('anterior') || l.toLowerCase().includes('abdominal')
  )

  const pattern: FatDistributionPattern =
    confScore < PIE_CONFIG.confidence.moderateThreshold
      ? 'not_assessable'
      : hasAbdominal && sex === 'male'
      ? 'android'
      : !hasAbdominal && sex === 'female'
      ? 'gynoid'
      : 'uniform'

  return {
    id: pieId('fd'),
    observedAt: now(),
    analyzer: 'body-composition',
    value: pattern,
    confidence: pattern === 'not_assessable' ? 'unknown' : scoreToConfidence(confScore * 0.8, bonus),
    visibility: views.includes('front') && views.includes('side') ? 'clearly_visible' : 'partially_visible',
    reason: pattern === 'not_assessable'
      ? 'Insufficient confidence to assess fat distribution pattern from available photos.'
      : `Fat distribution pattern inferred from posture markers and body proportions visible in ${views.join(', ')} view(s).`,
    evidenceSources,
    needsHumanReview: false,
  }
}

function deriveDefinitionLevel(
  bfMidpoint: number,
  sex: 'male' | 'female',
  confScore: number,
  bonus: number,
  evidenceSources: ReturnType<typeof viewsToSources>
): BodyCompositionObservation['definition'] {
  const thresholds = PIE_CONFIG.bodyComposition.bodyFat[sex]
  let level: DefinitionLevel

  if (confScore < PIE_CONFIG.confidence.lowThreshold) {
    level = 'not_visible'
  } else if (bfMidpoint <= thresholds.extremelyLean) {
    level = 'striated'
  } else if (bfMidpoint <= thresholds.lean - 3) {
    level = 'vascular'
  } else if (bfMidpoint <= thresholds.lean) {
    level = 'defined'
  } else if (bfMidpoint <= thresholds.average) {
    level = 'moderate'
  } else if (bfMidpoint <= thresholds.aboveAverage) {
    level = 'limited'
  } else {
    level = 'not_visible'
  }

  return {
    id: pieId('def'),
    observedAt: now(),
    analyzer: 'body-composition',
    value: level,
    confidence: scoreToConfidence(confScore, bonus),
    visibility: level === 'not_visible' ? 'not_visible' : 'clearly_visible',
    reason: `Muscle definition level '${level}' inferred from estimated body fat of ~${bfMidpoint.toFixed(1)}%.`,
    evidenceSources,
    needsHumanReview: false,
  }
}
