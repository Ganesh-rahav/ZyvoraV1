/**
 * lib/zci/engines/evidence/physique-evidence.ts
 *
 * Extracts structured ZCI Evidence from physique data.
 *
 * Sprint 5A upgrade:
 * When a PIE PhysiqueModel is available, evidence is sourced from the richer
 * structured PIE output (21 muscle groups, frame, symmetry dimensions, safety flags).
 *
 * When only raw PhysiqueAnalysis is available (no PIE), the legacy path runs.
 * This ensures zero breaking changes to the ZCI pipeline.
 */

import type { Evidence } from '../../types/evidence'
import type { UserContext } from '../../types/context'
import type { PhysiqueModel } from '@/lib/pie/types/model'
import { nanoid } from '../../utils/nanoid'

// ─── PIE_CONFIDENCE → ZCI Evidence Strength mapping ──────────────────────────

function pieConfToStrength(conf: string): Evidence['strength'] {
  if (conf === 'high') return 'strong'
  if (conf === 'moderate') return 'moderate'
  if (conf === 'low') return 'weak'
  return 'absent'
}

// ─── Main function ────────────────────────────────────────────────────────────

/**
 * collectPhysiqueEvidence
 *
 * @param ctx       — the ZCI UserContext
 * @param pieModel  — (optional) PIE PhysiqueModel from Sprint 5A
 *                    When provided, uses richer structured evidence.
 *                    When absent, falls back to raw vision analysis.
 */
export function collectPhysiqueEvidence(
  ctx: UserContext,
  pieModel?: PhysiqueModel
): Evidence[] {
  const items: Evidence[] = []
  const now = new Date().toISOString()

  if (ctx.physique.skipped || !ctx.physique.hasPhotos) {
    items.push({
      id: nanoid(),
      category: 'body_composition',
      observation: 'No physique photos provided — visual body composition assessment unavailable',
      sources: [{ type: 'onboarding_data', label: 'Photo upload skipped', reliability: 1.0 }],
      strength: 'absent',
      collectedAt: now,
      caveats: ['Recommendations will be based on self-reported data only'],
    })
    return items
  }

  // ─── PIE-powered path (Sprint 5A+) ───────────────────────────────────────
  if (pieModel) {
    return collectFromPIEModel(ctx, pieModel, now)
  }

  // ─── Legacy path (Sprint 4A raw vision) ──────────────────────────────────
  return collectFromRawVision(ctx, now)
}

// ─── PIE Model Evidence Collection ───────────────────────────────────────────

function collectFromPIEModel(
  ctx: UserContext,
  model: PhysiqueModel,
  now: string
): Evidence[] {
  const items: Evidence[] = []
  const { physical } = ctx
  const visionSource: Evidence['sources'][number] = {
    type: 'vision_analysis',
    label: `PIE v${model.meta.pieVersion} — ${model.meta.viewsAnalysed.length} views`,
    reliability: 0.65,
  }

  // ─── BMI (always from calculations) ──────────────────────────────────────
  if (physical.bmi > 0) {
    items.push({
      id: nanoid(),
      category: 'body_composition',
      observation: `BMI ${physical.bmi.toFixed(1)}`,
      value: physical.bmi,
      unit: 'kg/m²',
      sources: [{ type: 'derived_calculation', label: 'Weight ÷ Height²', reliability: 0.9 }],
      strength: 'strong',
      collectedAt: now,
      caveats: ['BMI does not distinguish muscle from fat'],
    })
  }

  // ─── Body Composition ─────────────────────────────────────────────────────
  const { bodyComposition } = model
  const bfMid = bodyComposition.bodyFat.midpoint

  if (bfMid > 0) {
    items.push({
      id: nanoid(),
      category: 'body_composition',
      observation: `Estimated body fat ${bodyComposition.bodyFat.min}–${bodyComposition.bodyFat.max}%`,
      value: bfMid,
      unit: '%',
      sources: [visionSource],
      strength: pieConfToStrength(bodyComposition.bodyFat.confidence),
      collectedAt: now,
      caveats: [bodyComposition.disclaimer],
    })
  }

  items.push({
    id: nanoid(),
    category: 'body_composition',
    observation: `Body composition category: ${String(bodyComposition.category.value).replace(/_/g, ' ')}`,
    value: String(bodyComposition.category.value),
    sources: [visionSource],
    strength: pieConfToStrength(bodyComposition.category.confidence),
    collectedAt: now,
  })

  items.push({
    id: nanoid(),
    category: 'body_composition',
    observation: `Muscle definition level: ${String(bodyComposition.definition.value).replace(/_/g, ' ')}`,
    value: String(bodyComposition.definition.value),
    sources: [visionSource],
    strength: pieConfToStrength(bodyComposition.definition.confidence),
    collectedAt: now,
  })

  // ─── Muscle Development — all 21 groups ──────────────────────────────────
  for (const [_id, obs] of Object.entries(model.muscleDevelopment.groups)) {
    if (!obs) continue
    items.push({
      id: nanoid(),
      category: 'muscle_development',
      observation: `${obs.label}: ${obs.developmentLevel} (score ${obs.rawScore.toFixed(1)}/10)${obs.isNotableStrength ? ' — notable strength' : obs.isNotableWeakness ? ' — notable weakness' : ''}`,
      value: obs.rawScore,
      unit: '/ 10',
      sources: [{ ...visionSource, reliability: 0.65 }],
      strength: pieConfToStrength(obs.confidence),
      collectedAt: now,
    })
  }

  // ─── Symmetry ─────────────────────────────────────────────────────────────
  const { symmetry } = model
  items.push({
    id: nanoid(),
    category: 'symmetry',
    observation: `Overall symmetry score: ${(symmetry.overallScore * 100).toFixed(0)}% — left/right: ${symmetry.leftRight.rating.replace(/_/g, ' ')}`,
    value: symmetry.overallScore,
    unit: 'symmetry score (0–1)',
    sources: [visionSource],
    strength: pieConfToStrength(symmetry.leftRight.confidence),
    collectedAt: now,
    caveats: ['Camera angle and pose can affect symmetry readings'],
  })

  if (symmetry.pushPull.dominance !== 'not_assessable') {
    items.push({
      id: nanoid(),
      category: 'symmetry',
      observation: `Push/pull balance: ${symmetry.pushPull.dominance.replace(/_/g, ' ')}`,
      value: symmetry.pushPull.dominance,
      sources: [visionSource],
      strength: pieConfToStrength(symmetry.pushPull.confidence),
      collectedAt: now,
    })
  }

  // ─── Posture Alignment ────────────────────────────────────────────────────
  const { posture } = model
  if (posture.notablePatterns.length > 0) {
    items.push({
      id: nanoid(),
      category: 'posture_alignment',
      observation: `Postural patterns: ${posture.notablePatterns.join('; ')}`,
      value: posture.notablePatterns.length,
      unit: 'pattern count',
      sources: [visionSource],
      strength: pieConfToStrength(posture.headPosition.confidence),
      collectedAt: now,
      caveats: ['Photo-based posture assessment is limited to static position'],
    })
  }

  if (posture.suggestedContraindications.length > 0) {
    items.push({
      id: nanoid(),
      category: 'injury_risk',
      observation: `Posture-derived movement cautions: ${posture.suggestedContraindications.join('; ')}`,
      sources: [visionSource],
      strength: 'weak',
      collectedAt: now,
      caveats: ['Movement cautions are based on visual posture assessment — not clinical evaluation'],
    })
  }

  // ─── Safety Flags ─────────────────────────────────────────────────────────
  for (const flag of model.safety.flags) {
    items.push({
      id: nanoid(),
      category: 'injury_risk',
      observation: `Safety flag: ${flag.observation}`,
      sources: [visionSource],
      strength: flag.confidence === 'high' ? 'strong' : flag.confidence === 'moderate' ? 'moderate' : 'weak',
      collectedAt: now,
      caveats: ['This is a visual flag — not a clinical diagnosis'],
    })
  }

  // ─── Frame (as supplementary context) ────────────────────────────────────
  const { frame } = model
  if (frame.frameCategory.confidence !== 'unknown') {
    items.push({
      id: nanoid(),
      category: 'body_composition',
      observation: `Skeletal frame: ${String(frame.frameCategory.value).replace(/_/g, ' ')}, shoulder-to-waist ratio ${String(frame.shoulderToWaistRatio.category).replace(/_/g, ' ')}`,
      sources: [{ ...visionSource, reliability: 0.55 }],
      strength: pieConfToStrength(frame.frameCategory.confidence),
      collectedAt: now,
      caveats: [frame.disclaimer],
    })
  }

  return items
}

// ─── Legacy Raw Vision Evidence Collection (Sprint 4A fallback) ───────────────

function collectFromRawVision(ctx: UserContext, now: string): Evidence[] {
  const items: Evidence[] = []
  const { physical } = ctx

  if (physical.estimatedBodyFatMin !== undefined && physical.estimatedBodyFatMax !== undefined) {
    items.push({
      id: nanoid(),
      category: 'body_composition',
      observation: `Estimated body fat ${physical.estimatedBodyFatMin}–${physical.estimatedBodyFatMax}%`,
      value: (physical.estimatedBodyFatMin + physical.estimatedBodyFatMax) / 2,
      unit: '%',
      sources: [{ type: 'vision_analysis', label: 'AI physique photo analysis', reliability: 0.65 }],
      strength: 'moderate',
      collectedAt: now,
      caveats: ['Photo-based estimates have ±3–5% margin of error vs DEXA'],
    })

    if (physical.bodyCompositionCategory) {
      items.push({
        id: nanoid(),
        category: 'body_composition',
        observation: `Body composition category: ${physical.bodyCompositionCategory.replace('_', ' ')}`,
        value: physical.bodyCompositionCategory,
        sources: [{ type: 'vision_analysis', label: 'AI physique classification', reliability: 0.65 }],
        strength: 'moderate',
        collectedAt: now,
      })
    }
  }

  if (physical.bmi > 0) {
    items.push({
      id: nanoid(),
      category: 'body_composition',
      observation: `BMI ${physical.bmi.toFixed(1)}`,
      value: physical.bmi,
      unit: 'kg/m²',
      sources: [{ type: 'derived_calculation', label: 'Weight ÷ Height²', reliability: 0.9 }],
      strength: 'strong',
      collectedAt: now,
      caveats: ['BMI does not distinguish muscle from fat — use with other indicators'],
    })
  }

  for (const [viewType, analysis] of Object.entries(ctx.physique.analyses)) {
    if (!analysis) continue

    items.push({
      id: nanoid(),
      category: 'body_composition',
      observation: `${viewType} view image quality score: ${analysis.imageQuality.overallScore}/100`,
      value: analysis.imageQuality.overallScore,
      unit: 'quality score',
      sources: [{ type: 'vision_analysis', label: `${viewType} view quality check`, reliability: 0.9 }],
      strength: analysis.imageQuality.overallScore >= 75 ? 'strong' : 'weak',
      collectedAt: now,
    })

    for (const muscle of analysis.muscleGroups) {
      if (muscle.developmentScore < 5 || muscle.developmentScore >= 7) {
        items.push({
          id: nanoid(),
          category: 'muscle_development',
          observation: `${muscle.label}: development score ${muscle.developmentScore}/10 (${viewType} view)`,
          value: muscle.developmentScore,
          unit: '/ 10',
          sources: [{ type: 'vision_analysis', label: `${viewType} muscle assessment`, reliability: 0.65 * muscle.confidence }],
          strength: muscle.confidence >= 0.75 ? 'moderate' : 'weak',
          collectedAt: now,
        })
      }
    }

    if (analysis.posture.primaryPattern !== 'neutral') {
      items.push({
        id: nanoid(),
        category: 'posture_alignment',
        observation: `Posture pattern: ${analysis.posture.primaryPattern.replace(/_/g, ' ')}`,
        value: analysis.posture.primaryPattern,
        sources: [{ type: 'vision_analysis', label: 'Posture assessment', reliability: 0.60 }],
        strength: analysis.posture.confidence >= 0.75 ? 'moderate' : 'weak',
        collectedAt: now,
        caveats: ['Photo-based posture assessment is limited to static position'],
      })
    }

    if (analysis.symmetry.flaggedAreas.length > 0) {
      items.push({
        id: nanoid(),
        category: 'symmetry',
        observation: `Potential asymmetry flagged: ${analysis.symmetry.flaggedAreas.join(', ')}`,
        value: analysis.symmetry.score,
        unit: 'symmetry score (0–1)',
        sources: [{ type: 'vision_analysis', label: 'Symmetry analysis', reliability: 0.55 }],
        strength: 'weak',
        collectedAt: now,
        caveats: ['Camera angle and pose can affect symmetry readings'],
      })
    }
  }

  return items
}
