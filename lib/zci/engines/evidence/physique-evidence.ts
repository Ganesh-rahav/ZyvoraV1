/**
 * lib/zci/engines/evidence/physique-evidence.ts
 *
 * Extracts structured evidence from PhysiqueAnalysis (Sprint 4A vision output).
 * Converts AI vision data into discrete, categorised Evidence items.
 */

import type { Evidence } from '../../types/evidence'
import type { UserContext } from '../../types/context'
import { nanoid } from '../../utils/nanoid'

export function collectPhysiqueEvidence(ctx: UserContext): Evidence[] {
  const items: Evidence[] = []
  const now = new Date().toISOString()

  if (ctx.physique.skipped || !ctx.physique.hasPhotos) {
    // Still record the fact that no physique data is available
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

  const { physical } = ctx

  // ─── Body Composition from vision ────────────────────────────────────────────
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

  // ─── BMI ──────────────────────────────────────────────────────────────────────
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

  // ─── Per-photo muscle development ────────────────────────────────────────────
  for (const [viewType, analysis] of Object.entries(ctx.physique.analyses)) {
    if (!analysis) continue

    // Image quality
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

    // Top muscle groups by development
    for (const muscle of analysis.muscleGroups) {
      if (muscle.developmentScore < 5 || muscle.developmentScore >= 7) {
        // Only record notably under- or over-developed groups
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

    // Posture
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

    // Symmetry
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
