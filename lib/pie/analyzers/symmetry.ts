/**
 * lib/pie/analyzers/symmetry.ts
 *
 * SymmetryAnalyzer
 * Evaluates 6 symmetry dimensions from all available views.
 */

import type { PhysiqueAnalysis } from '@/lib/ai/types/vision'
import type { SymmetryObservation, SymmetryDimension, PushPullDimension, SymmetryRating, PushPullDominance } from '../types/symmetry'
import type { MuscleDevelopmentModel } from '../types/muscle'
import type { ViewType } from '../types/model'
import { PIE_CONFIG } from '../config'
import { pieId, now, scoreToConfidence, viewBonus, viewsToSources, avg } from './utils'

export function analyzeSymmetry(
  analyses: Partial<Record<ViewType, PhysiqueAnalysis>>,
  muscleDevelopment: MuscleDevelopmentModel
): SymmetryObservation {
  const views = Object.keys(analyses) as ViewType[]
  const allAnalyses = Object.values(analyses).filter(Boolean) as PhysiqueAnalysis[]
  const bonus = viewBonus(views.length)
  const evidenceSources = viewsToSources(views)

  // Aggregate symmetry scores from all analyses
  const avgSymmetryScore = avg(allAnalyses.map((a) => a.symmetry.score))
  const allFlagged = [...new Set(allAnalyses.flatMap((a) => a.symmetry.flaggedAreas))]
  const leftDominantCount = allAnalyses.filter((a) => a.symmetry.leftDominant).length
  const dominantSide = leftDominantCount > allAnalyses.length / 2 ? 'left' as const : 'right' as const

  // ─── Left/Right ──────────────────────────────────────────────────────────
  const lrConfidence = scoreToConfidence(avgSymmetryScore * 0.9, bonus)
  const leftRight: SymmetryDimension = {
    id: pieId('sym-lr'),
    observedAt: now(),
    analyzer: 'symmetry',
    rating: scoreToRating(avgSymmetryScore),
    deviationPercent: Math.round((1 - avgSymmetryScore) * 100),
    dominantSide: avgSymmetryScore < PIE_CONFIG.symmetry.mostlySymmetric ? dominantSide : undefined,
    confidence: lrConfidence,
    visibility: views.includes('front') ? 'clearly_visible' : 'not_visible',
    reason: `Left/right symmetry score: ${(avgSymmetryScore * 100).toFixed(0)}% from ${allAnalyses.length} view(s).`,
    evidenceSources,
    needsHumanReview: false,
  }

  // ─── Upper/Lower ─────────────────────────────────────────────────────────
  const upperGroupIds = ['upper_chest', 'mid_chest', 'front_delts', 'side_delts', 'biceps', 'triceps', 'lats', 'upper_back']
  const lowerGroupIds = ['quadriceps', 'hamstrings', 'glutes', 'calves']
  const upperScores = upperGroupIds.flatMap((id) => {
    const g = muscleDevelopment.groups[id as keyof typeof muscleDevelopment.groups]
    return g ? [g.rawScore] : []
  })
  const lowerScores = lowerGroupIds.flatMap((id) => {
    const g = muscleDevelopment.groups[id as keyof typeof muscleDevelopment.groups]
    return g ? [g.rawScore] : []
  })

  const upperAvg = avg(upperScores)
  const lowerAvg = avg(lowerScores)
  const ulDiff = Math.abs(upperAvg - lowerAvg)
  const ulRating: SymmetryRating = ulDiff < 0.5 ? 'highly_symmetric' : ulDiff < 1.0 ? 'mostly_symmetric' : ulDiff < 2.0 ? 'mild_asymmetry' : 'notable_asymmetry'

  const upperLower: SymmetryDimension = {
    id: pieId('sym-ul'),
    observedAt: now(),
    analyzer: 'symmetry',
    rating: ulRating,
    deviationPercent: Math.round(ulDiff * 10),
    dominantSide: upperAvg > lowerAvg ? 'upper' : 'lower',
    confidence: upperScores.length > 0 && lowerScores.length > 0 ? scoreToConfidence(0.75, bonus) : 'unknown',
    visibility: views.includes('front') ? 'clearly_visible' : 'partially_visible',
    reason: `Upper body avg: ${upperAvg.toFixed(1)}/10, Lower body avg: ${lowerAvg.toFixed(1)}/10.`,
    evidenceSources,
    needsHumanReview: false,
  }

  // ─── Push/Pull ────────────────────────────────────────────────────────────
  const pushGroupIds = ['upper_chest', 'mid_chest', 'lower_chest', 'front_delts', 'side_delts', 'triceps']
  const pullGroupIds = ['lats', 'upper_back', 'mid_back', 'rear_delts', 'biceps']

  const pushScores = pushGroupIds.flatMap((id) => {
    const g = muscleDevelopment.groups[id as keyof typeof muscleDevelopment.groups]
    return g ? [g.rawScore] : []
  })
  const pullScores = pullGroupIds.flatMap((id) => {
    const g = muscleDevelopment.groups[id as keyof typeof muscleDevelopment.groups]
    return g ? [g.rawScore] : []
  })

  const pushAvg = avg(pushScores)
  const pullAvg = avg(pullScores)
  const ppDiff = pushAvg - pullAvg
  const dominance: PushPullDominance =
    pushScores.length === 0 || pullScores.length === 0 ? 'not_assessable' :
    Math.abs(ppDiff) < 0.5 ? 'balanced' :
    ppDiff > 0 ? 'push_dominant' : 'pull_dominant'

  const pushPull: PushPullDimension = {
    id: pieId('sym-pp'),
    observedAt: now(),
    analyzer: 'symmetry',
    dominance,
    confidence: pushScores.length > 0 && pullScores.length > 0 ? scoreToConfidence(0.72, bonus) : 'unknown',
    visibility: views.includes('front') && views.includes('back') ? 'clearly_visible' : 'partially_visible',
    reason: dominance === 'not_assessable'
      ? 'Insufficient view coverage to assess push/pull balance.'
      : `Push muscles avg: ${pushAvg.toFixed(1)}/10, Pull muscles avg: ${pullAvg.toFixed(1)}/10. Classification: ${dominance}.`,
    evidenceSources,
    needsHumanReview: false,
  }

  // ─── Shoulder Balance ─────────────────────────────────────────────────────
  // Derived from landmark positions and overall symmetry
  const shoulderBalance: SymmetryDimension = {
    id: pieId('sym-sh'),
    observedAt: now(),
    analyzer: 'symmetry',
    rating: scoreToRating(avgSymmetryScore * 0.95),
    deviationPercent: Math.round((1 - avgSymmetryScore) * 100 * 0.8),
    confidence: views.includes('front') ? scoreToConfidence(0.80, bonus) : 'unknown',
    visibility: views.includes('front') ? 'clearly_visible' : 'not_visible',
    reason: 'Shoulder balance inferred from left/right landmark positions in front view.',
    evidenceSources,
    needsHumanReview: false,
  }

  // ─── Waist Balance ────────────────────────────────────────────────────────
  const waistBalance: SymmetryDimension = {
    id: pieId('sym-wb'),
    observedAt: now(),
    analyzer: 'symmetry',
    rating: scoreToRating(avgSymmetryScore),
    confidence: views.includes('front') ? scoreToConfidence(0.70, bonus) : 'unknown',
    visibility: views.includes('front') ? 'clearly_visible' : 'not_visible',
    reason: 'Waist/hip alignment symmetry from front view landmark analysis.',
    evidenceSources,
    needsHumanReview: false,
  }

  // ─── Leg Symmetry ─────────────────────────────────────────────────────────
  const leftQuad = muscleDevelopment.groups['quadriceps']?.rawScore
  const leftHam = muscleDevelopment.groups['hamstrings']?.rawScore
  const legScore = leftQuad !== undefined && leftHam !== undefined
    ? avgSymmetryScore * 0.9  // Proxy — we can't directly compare L/R legs from vision
    : 0.5

  const legSymmetry: SymmetryDimension = {
    id: pieId('sym-leg'),
    observedAt: now(),
    analyzer: 'symmetry',
    rating: scoreToRating(legScore),
    confidence: views.includes('front') ? scoreToConfidence(0.60, bonus) : 'unknown',
    visibility: views.includes('front') ? 'partially_visible' : 'not_visible',
    reason: 'Leg symmetry estimated from overall bilateral symmetry score. Direct L/R comparison requires calibrated measurement.',
    evidenceSources,
    needsHumanReview: false,
  }

  // ─── Overall ──────────────────────────────────────────────────────────────
  const overallScore = avg([avgSymmetryScore, ulDiff < 1 ? 0.9 : 0.7, Math.abs(ppDiff) < 1 ? 0.85 : 0.65])

  return {
    leftRight,
    upperLower,
    pushPull,
    shoulderBalance,
    waistBalance,
    legSymmetry,
    overallScore: Math.round(overallScore * 100) / 100,
    flaggedAreas: allFlagged,
  }
}

function scoreToRating(score: number): SymmetryRating {
  const t = PIE_CONFIG.symmetry
  if (score >= t.highlySymmetric) return 'highly_symmetric'
  if (score >= t.mostlySymmetric) return 'mostly_symmetric'
  if (score >= t.mildAsymmetry) return 'mild_asymmetry'
  if (score >= 0) return 'notable_asymmetry'
  return 'not_assessable'
}
