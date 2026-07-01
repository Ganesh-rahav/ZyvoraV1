/**
 * lib/zci/engines/evidence/goal-evidence.ts
 *
 * Extracts structured evidence about goal alignment and feasibility.
 */

import type { Evidence } from '../../types/evidence'
import type { UserContext } from '../../types/context'
import { nanoid } from '../../utils/nanoid'

export function collectGoalEvidence(ctx: UserContext): Evidence[] {
  const items: Evidence[] = []
  const now = new Date().toISOString()
  const { goals, physical, training } = ctx

  // Primary goal
  items.push({
    id: nanoid(),
    category: 'goal_alignment',
    observation: `Primary goal: ${goals.primaryGoal.replace('_', ' ')}`,
    value: goals.primaryGoal,
    sources: [{ type: 'self_report', label: 'Onboarding primary goal', reliability: 0.95 }],
    strength: 'strong',
    collectedAt: now,
  })

  // Timeline
  if (goals.timeline !== 'no_deadline' && goals.weeksRemaining !== null) {
    items.push({
      id: nanoid(),
      category: 'goal_alignment',
      observation: `Goal timeline: ${goals.weeksRemaining} weeks remaining`,
      value: goals.weeksRemaining,
      unit: 'weeks',
      sources: [{ type: 'derived_calculation', label: 'Timeline calculation', reliability: 0.95 }],
      strength: 'strong',
      collectedAt: now,
    })

    // Flag very short timelines as potential over-expectation
    if (goals.weeksRemaining < 8 && goals.primaryGoal === 'build_muscle') {
      items.push({
        id: nanoid(),
        category: 'goal_alignment',
        observation: 'Timeline may be too short for significant muscle gain — expectation management needed',
        sources: [{ type: 'derived_calculation', label: 'Goal-timeline feasibility check', reliability: 0.85 }],
        strength: 'strong',
        collectedAt: now,
        caveats: ['Muscle gain requires 8–16+ weeks of consistent training to be measurable'],
      })
    }
  }

  // Equipment–goal alignment
  const hasResistanceEquipment =
    ctx.training.gymEquipment.length > 0 ||
    ctx.training.homeEquipment.some((e) => e !== 'bodyweight_only')

  if (goals.primaryGoal === 'build_muscle' && !hasResistanceEquipment) {
    items.push({
      id: nanoid(),
      category: 'equipment_capability',
      observation: 'Muscle gain goal with bodyweight-only equipment — resistance progression limited',
      sources: [{ type: 'derived_calculation', label: 'Equipment-goal alignment', reliability: 0.85 }],
      strength: 'moderate',
      collectedAt: now,
    })
  }

  // Adherence likelihood based on schedule
  const adherenceLikelihood =
    training.daysPerWeekAvailable >= 4 && training.sessionDurationMinutes >= 45
      ? 'high'
      : training.daysPerWeekAvailable >= 3
      ? 'moderate'
      : 'low'

  items.push({
    id: nanoid(),
    category: 'adherence_likelihood',
    observation: `Adherence likelihood estimate: ${adherenceLikelihood} (${training.daysPerWeekAvailable} days/wk, ${training.sessionDurationMinutes}min sessions)`,
    value: adherenceLikelihood,
    sources: [{ type: 'derived_calculation', label: 'Schedule feasibility analysis', reliability: 0.70 }],
    strength: 'moderate',
    collectedAt: now,
    caveats: ['Adherence prediction improves with behavioral history data'],
  })

  // Goal-BMI relationship
  if (physical.bmi > 30 && goals.primaryGoal === 'build_muscle') {
    items.push({
      id: nanoid(),
      category: 'goal_alignment',
      observation: 'Recomposition may be more appropriate than pure muscle gain given current BMI',
      sources: [{ type: 'derived_calculation', label: 'BMI-goal alignment', reliability: 0.70 }],
      strength: 'moderate',
      collectedAt: now,
      caveats: ['BMI is not a precise body composition tool'],
    })
  }

  return items
}
