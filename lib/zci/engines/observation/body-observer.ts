/**
 * lib/zci/engines/observation/body-observer.ts
 *
 * Generates physique and body composition observations from evidence.
 * Converts raw evidence into interpreted observations with confidence.
 */

import type { Observation } from '../../types/observation'
import type { Evidence } from '../../types/evidence'
import type { ConfidenceMap } from '../confidence/confidence-engine'
import type { UserContext } from '../../types/context'
import { aggregateConfidence } from '../confidence/confidence-rules'
import { nanoid } from '../../utils/nanoid'

export function generateBodyObservations(
  evidenceItems: Evidence[],
  _confidenceMap: ConfidenceMap,
  ctx: UserContext
): Observation[] {
  const observations: Observation[] = []
  const now = new Date().toISOString()

  // Filter to body-relevant evidence
  const bodyEvidence = evidenceItems.filter(
    (e) => e.category === 'body_composition' || e.category === 'muscle_development'
  )
  const postureEvidence = evidenceItems.filter((e) => e.category === 'posture_alignment')
  const symmetryEvidence = evidenceItems.filter((e) => e.category === 'symmetry')

  // ─── Body Composition Overview ────────────────────────────────────────────────

  const bfEvidence = bodyEvidence.filter((e) => e.observation.includes('body fat'))
  if (bfEvidence.length > 0) {
    const conf = aggregateConfidence(bfEvidence)
    observations.push({
      id: nanoid('obs'),
      category: 'physique',
      statement: buildBodyCompositionStatement(ctx, bfEvidence),
      bodyRegion: 'body_composition',
      developmentStatus: deriveBodyCompositionStatus(ctx),
      supportingEvidenceIds: bfEvidence.map((e) => e.id),
      confidence: conf.level,
      confidenceReason: conf.explanation,
      isStrength: false,
      isOpportunity: true,
      observedAt: now,
    })
  }

  // ─── Muscle Group Observations ────────────────────────────────────────────────

  const muscleEvidence = evidenceItems.filter((e) => e.category === 'muscle_development')
  const muscleGroups = new Map<string, Evidence[]>()

  for (const ev of muscleEvidence) {
    const match = ev.observation.match(/^([^:]+):/)
    if (match) {
      const group = match[1].trim()
      if (!muscleGroups.has(group)) muscleGroups.set(group, [])
      muscleGroups.get(group)!.push(ev)
    }
  }

  for (const [group, groupEvidence] of muscleGroups) {
    const conf = aggregateConfidence(groupEvidence)
    const avgScore = groupEvidence.reduce((s, e) => s + (typeof e.value === 'number' ? e.value : 0), 0)
      / groupEvidence.length

    const isUnderdeveloped = avgScore < 5
    const isWellDeveloped = avgScore >= 7

    if (!isUnderdeveloped && !isWellDeveloped) continue // Skip average — not actionable

    observations.push({
      id: nanoid('obs'),
      category: 'physique',
      statement: isUnderdeveloped
        ? `${group} appears underdeveloped relative to overall physique balance.`
        : `${group} is well-developed — a visible strength of your physique.`,
      bodyRegion: muscleGroupToBodyRegion(group),
      developmentStatus: isUnderdeveloped ? 'underdeveloped' : 'well_developed',
      supportingEvidenceIds: groupEvidence.map((e) => e.id),
      confidence: conf.level,
      confidenceReason: conf.explanation,
      isStrength: isWellDeveloped,
      isOpportunity: isUnderdeveloped,
      observedAt: now,
    })
  }

  // ─── Posture Observations ─────────────────────────────────────────────────────

  if (postureEvidence.length > 0) {
    const conf = aggregateConfidence(postureEvidence)
    const pattern = postureEvidence[0]?.value

    if (pattern && pattern !== 'neutral') {
      observations.push({
        id: nanoid('obs'),
        category: 'physique',
        statement: `Posture assessment indicates ${String(pattern).replace(/_/g, ' ')}. This may reflect muscle imbalances worth addressing.`,
        bodyRegion: 'posture',
        supportingEvidenceIds: postureEvidence.map((e) => e.id),
        confidence: conf.level,
        confidenceReason: conf.explanation,
        isStrength: false,
        isOpportunity: true,
        observedAt: now,
      })
    }
  }

  // ─── Symmetry Observations ────────────────────────────────────────────────────

  if (symmetryEvidence.length > 0) {
    const conf = aggregateConfidence(symmetryEvidence)
    observations.push({
      id: nanoid('obs'),
      category: 'physique',
      statement: `Potential asymmetry detected in one or more muscle groups. Note: camera angle affects this reading.`,
      bodyRegion: 'overall_symmetry',
      supportingEvidenceIds: symmetryEvidence.map((e) => e.id),
      confidence: conf.level,
      confidenceReason: conf.explanation,
      isStrength: false,
      isOpportunity: true,
      observedAt: now,
    })
  }

  return observations
}

function buildBodyCompositionStatement(ctx: UserContext, _evidence: Evidence[]): string {
  const { physical } = ctx
  if (physical.estimatedBodyFatMin !== undefined && physical.estimatedBodyFatMax !== undefined) {
    return `Estimated body fat is approximately ${physical.estimatedBodyFatMin}–${physical.estimatedBodyFatMax}%. Current body composition category: ${physical.bodyCompositionCategory?.replace('_', ' ') ?? 'unknown'}.`
  }
  return `Body composition is being assessed from available data.`
}

function deriveBodyCompositionStatus(ctx: UserContext): Observation['developmentStatus'] {
  const mid = ctx.physical.estimatedBodyFatMin !== undefined && ctx.physical.estimatedBodyFatMax !== undefined
    ? (ctx.physical.estimatedBodyFatMin + ctx.physical.estimatedBodyFatMax) / 2
    : null

  if (mid === null) return 'unknown'

  const isMale = ctx.physical.biologicalSex === 'male'
  if (isMale) {
    if (mid < 12) return 'well_developed'
    if (mid < 18) return 'average'
    if (mid < 25) return 'below_average'
    return 'underdeveloped'
  } else {
    if (mid < 20) return 'well_developed'
    if (mid < 28) return 'average'
    if (mid < 35) return 'below_average'
    return 'underdeveloped'
  }
}

function muscleGroupToBodyRegion(group: string): Observation['bodyRegion'] {
  const map: Record<string, Observation['bodyRegion']> = {
    'chest': 'lower_chest',
    'upper chest': 'upper_chest',
    'lower chest': 'lower_chest',
    'shoulders': 'side_delts',
    'front delts': 'front_delts',
    'side delts': 'side_delts',
    'rear delts': 'rear_delts',
    'biceps': 'biceps',
    'triceps': 'triceps',
    'back': 'upper_back',
    'lats': 'lats',
    'abs': 'abs',
    'glutes': 'glutes',
    'quads': 'quads',
    'hamstrings': 'hamstrings',
    'calves': 'calves',
  }
  return map[group.toLowerCase()] ?? 'overall_symmetry'
}
