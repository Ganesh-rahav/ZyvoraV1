/**
 * lib/pie/analyzers/muscle-group.ts
 *
 * MuscleGroupAnalyzer
 * Evaluates all 21 muscle groups from all available views.
 * Each muscle is assessed independently.
 */

import type { PhysiqueAnalysis } from '@/lib/ai/types/vision'
import type { MuscleObservation, MuscleDevelopmentModel, MuscleGroupId, MuscleDevelopmentLevel } from '../types/muscle'
import type { ViewType } from '../types/model'
import { ALL_MUSCLE_GROUPS, MUSCLE_PRIMARY_VIEW, MUSCLE_LABELS } from '../types/muscle'
import { PIE_CONFIG } from '../config'
import { pieId, now, scoreToConfidence, viewBonus, viewsToSources, avg } from './utils'
import { PIEAnalyzerError } from '../errors'

// ─── Vision provider muscle ID → PIE MuscleGroupId mapping ───────────────────
// The vision provider uses simpler IDs — we map to our 21-group taxonomy

const VISION_ID_MAP: Record<string, MuscleGroupId[]> = {
  chest:      ['upper_chest', 'mid_chest', 'lower_chest'],
  shoulders:  ['front_delts', 'side_delts'],
  biceps:     ['biceps'],
  triceps:    ['triceps'],
  forearms:   ['forearms'],
  abs:        ['abs'],
  obliques:   ['obliques'],
  quads:      ['quadriceps'],
  hamstrings: ['hamstrings'],
  calves:     ['calves'],
  back:       ['upper_back', 'mid_back', 'lats'],
  traps:      ['traps'],
  glutes:     ['glutes'],
  neck:       ['neck'],
}

export function analyzeMuscleGroups(
  analyses: Partial<Record<ViewType, PhysiqueAnalysis>>
): MuscleDevelopmentModel {
  const views = Object.keys(analyses) as ViewType[]
  const allAnalyses = Object.values(analyses).filter(Boolean) as PhysiqueAnalysis[]

  if (allAnalyses.length === 0) {
    throw new PIEAnalyzerError('muscle-group', 'No analyses provided')
  }

  const bonus = viewBonus(views.length)

  // Aggregate raw muscle group scores across all views
  const aggregatedScores = aggregateMuscleScores(allAnalyses)

  // Build individual muscle observations
  const groups: Partial<Record<MuscleGroupId, MuscleObservation>> = {}
  const notAssessed: MuscleGroupId[] = []
  const rawScores: number[] = []

  for (const muscleId of ALL_MUSCLE_GROUPS) {
    const primaryViews = MUSCLE_PRIMARY_VIEW[muscleId]
    const hasRequiredView = primaryViews.some((pv) =>
      views.includes(pv === 'front_view' ? 'front' : pv === 'side_view' ? 'side' : 'back')
    )

    if (!hasRequiredView) {
      notAssessed.push(muscleId)
      continue
    }

    const aggregated = aggregatedScores[muscleId]
    if (!aggregated) {
      notAssessed.push(muscleId)
      continue
    }

    const { rawScore, confidence: confScore } = aggregated
    const confidence = scoreToConfidence(confScore, bonus)
    const developmentLevel = scoreToDevelopmentLevel(rawScore)
    const evidenceSources = viewsToSources(
      primaryViews
        .filter((pv) => views.includes(pv === 'front_view' ? 'front' : pv === 'side_view' ? 'side' : 'back'))
        .map((pv) => pv === 'front_view' ? 'front' : pv === 'side_view' ? 'side' : 'back')
    )

    rawScores.push(rawScore)

    groups[muscleId] = {
      id: pieId('mg'),
      observedAt: now(),
      muscleGroupId: muscleId,
      label: MUSCLE_LABELS[muscleId],
      rawScore,
      developmentLevel,
      confidence,
      visibility: hasRequiredView ? 'clearly_visible' : 'partially_visible',
      evidenceSources,
      reason: `Development score ${rawScore.toFixed(1)}/10 from ${views.length} view(s). Classified as '${developmentLevel}'.`,
      needsHumanReview: false,
      isNotableStrength: false,  // Set after average calculation
      isNotableWeakness: false,  // Set after average calculation
    }
  }

  // Calculate average and flag notable strengths/weaknesses
  const averageDevelopmentScore = avg(rawScores)
  const notableStrengths: MuscleGroupId[] = []
  const notableWeaknesses: MuscleGroupId[] = []
  const { notableStrengthGap, notableWeaknessGap } = PIE_CONFIG.muscle

  for (const [id, obs] of Object.entries(groups) as [MuscleGroupId, MuscleObservation][]) {
    if (obs.rawScore >= averageDevelopmentScore + notableStrengthGap) {
      obs.isNotableStrength = true
      notableStrengths.push(id)
    }
    if (obs.rawScore <= averageDevelopmentScore - notableWeaknessGap) {
      obs.isNotableWeakness = true
      notableWeaknesses.push(id)
    }
  }

  const assessedCount = Object.keys(groups).length
  const coveragePercent = Math.round((assessedCount / ALL_MUSCLE_GROUPS.length) * 100)

  return {
    groups,
    notAssessed,
    assessedCount,
    coveragePercent,
    averageDevelopmentScore: Math.round(averageDevelopmentScore * 10) / 10,
    notableStrengths,
    notableWeaknesses,
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

interface AggregatedScore {
  rawScore: number
  confidence: number
}

function aggregateMuscleScores(
  analyses: PhysiqueAnalysis[]
): Partial<Record<MuscleGroupId, AggregatedScore>> {
  const scores: Partial<Record<MuscleGroupId, AggregatedScore[]>> = {}

  for (const analysis of analyses) {
    for (const visionGroup of analysis.muscleGroups) {
      const pieIds = VISION_ID_MAP[visionGroup.id] ?? []
      for (const pieId_ of pieIds) {
        if (!scores[pieId_]) scores[pieId_] = []
        scores[pieId_]!.push({
          rawScore: visionGroup.developmentScore,
          confidence: visionGroup.confidence,
        })
      }
    }
  }

  const aggregated: Partial<Record<MuscleGroupId, AggregatedScore>> = {}
  for (const [id, scoreList] of Object.entries(scores) as [MuscleGroupId, AggregatedScore[]][]) {
    aggregated[id] = {
      rawScore: avg(scoreList.map((s) => s.rawScore)),
      confidence: avg(scoreList.map((s) => s.confidence)),
    }
  }
  return aggregated
}

function scoreToDevelopmentLevel(score: number): MuscleDevelopmentLevel {
  const { scoreThresholds } = PIE_CONFIG.muscle
  if (score <= scoreThresholds.underdeveloped) return 'underdeveloped'
  if (score <= scoreThresholds.developing) return 'developing'
  if (score <= scoreThresholds.moderate) return 'moderate'
  if (score <= scoreThresholds.well_developed) return 'well_developed'
  return 'elite'
}
