/**
 * lib/zci/engines/evidence/lifestyle-evidence.ts
 *
 * Extracts structured evidence from lifestyle, nutrition, and health data.
 */

import type { Evidence } from '../../types/evidence'
import type { UserContext } from '../../types/context'
import { ZCI_CONFIG } from '../../config'
import { nanoid } from '../../utils/nanoid'

export function collectLifestyleEvidence(ctx: UserContext): Evidence[] {
  const items: Evidence[] = []
  const now = new Date().toISOString()
  const { lifestyle, nutrition, health, training } = ctx

  // ─── Recovery Evidence ────────────────────────────────────────────────────────

  items.push({
    id: nanoid(),
    category: 'recovery_capacity',
    observation: `Sleep quality: ${lifestyle.sleepQuality}/5`,
    value: lifestyle.sleepQuality,
    unit: '1-5 scale',
    sources: [{ type: 'self_report', label: 'Onboarding sleep quality', reliability: 0.70 }],
    strength: lifestyle.sleepQuality >= 4 ? 'strong' : lifestyle.sleepQuality >= 3 ? 'moderate' : 'weak',
    collectedAt: now,
  })

  items.push({
    id: nanoid(),
    category: 'recovery_capacity',
    observation: `Stress level: ${lifestyle.stressLevel}/5`,
    value: lifestyle.stressLevel,
    unit: '1-5 scale',
    sources: [{ type: 'self_report', label: 'Onboarding stress level', reliability: 0.70 }],
    strength: lifestyle.stressLevel <= 2 ? 'strong' : lifestyle.stressLevel <= 3 ? 'moderate' : 'weak',
    collectedAt: now,
  })

  items.push({
    id: nanoid(),
    category: 'recovery_capacity',
    observation: `Energy level: ${lifestyle.energyLevel}/5`,
    value: lifestyle.energyLevel,
    unit: '1-5 scale',
    sources: [{ type: 'self_report', label: 'Onboarding energy level', reliability: 0.70 }],
    strength: 'moderate',
    collectedAt: now,
  })

  items.push({
    id: nanoid(),
    category: 'recovery_capacity',
    observation: `Composite recovery score: ${lifestyle.recoveryScore}/100`,
    value: lifestyle.recoveryScore,
    unit: '0-100',
    sources: [{ type: 'derived_calculation', label: 'Sleep × Stress × Energy composite', reliability: 0.75 }],
    strength: lifestyle.recoveryScore >= 70 ? 'strong' : lifestyle.recoveryScore >= 45 ? 'moderate' : 'weak',
    collectedAt: now,
  })

  // Flag if recovery is limiting
  const { recovery: rConfig } = ZCI_CONFIG
  if (
    lifestyle.sleepQuality <= rConfig.sleepQualityThreshold ||
    lifestyle.stressLevel >= rConfig.stressLevelThreshold ||
    lifestyle.energyLevel <= rConfig.energyLevelThreshold
  ) {
    items.push({
      id: nanoid(),
      category: 'recovery_capacity',
      observation: 'Recovery appears to be a limiting factor based on self-reported data',
      sources: [{ type: 'derived_calculation', label: 'Recovery threshold analysis', reliability: 0.75 }],
      strength: 'moderate',
      collectedAt: now,
    })
  }

  // ─── Training Readiness ───────────────────────────────────────────────────────

  items.push({
    id: nanoid(),
    category: 'training_readiness',
    observation: `Experience level: ${training.experienceLevel}`,
    value: training.experienceLevel,
    sources: [{ type: 'self_report', label: 'Onboarding experience level', reliability: 0.70 }],
    strength: 'strong',
    collectedAt: now,
  })

  items.push({
    id: nanoid(),
    category: 'training_readiness',
    observation: `Available training days: ${training.daysPerWeekAvailable} per week`,
    value: training.daysPerWeekAvailable,
    unit: 'days/week',
    sources: [{ type: 'self_report', label: 'Onboarding schedule', reliability: 0.80 }],
    strength: 'strong',
    collectedAt: now,
  })

  items.push({
    id: nanoid(),
    category: 'training_readiness',
    observation: `Session duration: ${training.sessionDurationMinutes} minutes`,
    value: training.sessionDurationMinutes,
    unit: 'minutes',
    sources: [{ type: 'self_report', label: 'Onboarding session duration', reliability: 0.80 }],
    strength: 'strong',
    collectedAt: now,
  })

  // ─── Lifestyle Load ───────────────────────────────────────────────────────────

  items.push({
    id: nanoid(),
    category: 'lifestyle_load',
    observation: `Occupation type: ${lifestyle.occupation.replace('_', ' ')}`,
    value: lifestyle.occupation,
    sources: [{ type: 'self_report', label: 'Onboarding occupation', reliability: 0.85 }],
    strength: 'strong',
    collectedAt: now,
  })

  items.push({
    id: nanoid(),
    category: 'lifestyle_load',
    observation: `Non-exercise activity level: ${lifestyle.activityLevel.replace('_', ' ')}`,
    value: lifestyle.activityLevel,
    sources: [{ type: 'self_report', label: 'Onboarding activity level', reliability: 0.70 }],
    strength: 'moderate',
    collectedAt: now,
  })

  // ─── Nutrition Evidence ───────────────────────────────────────────────────────

  items.push({
    id: nanoid(),
    category: 'nutrition_status',
    observation: `Dietary approach: ${nutrition.dietStyle.replace('_', ' ')}`,
    value: nutrition.dietStyle,
    sources: [{ type: 'self_report', label: 'Onboarding diet style', reliability: 0.85 }],
    strength: 'strong',
    collectedAt: now,
  })

  if (nutrition.allergies.length > 0 && !nutrition.allergies.includes('none')) {
    items.push({
      id: nanoid(),
      category: 'nutrition_status',
      observation: `Food allergies / intolerances: ${nutrition.allergies.join(', ')}`,
      value: nutrition.allergies.join(', '),
      sources: [{ type: 'self_report', label: 'Onboarding allergies', reliability: 0.95 }],
      strength: 'strong',
      collectedAt: now,
    })
  }

  items.push({
    id: nanoid(),
    category: 'nutrition_status',
    observation: `Meal frequency: ${nutrition.mealFrequency} meals/day`,
    value: nutrition.mealFrequency,
    unit: 'meals/day',
    sources: [{ type: 'self_report', label: 'Onboarding meal frequency', reliability: 0.70 }],
    strength: 'moderate',
    collectedAt: now,
  })

  // ─── Injury Evidence ──────────────────────────────────────────────────────────

  if (health.hasActiveInjuries && health.injuredAreas.length > 0) {
    items.push({
      id: nanoid(),
      category: 'injury_risk',
      observation: `Active injury areas: ${health.injuredAreas.join(', ')}`,
      value: health.injuredAreas.join(', '),
      sources: [{ type: 'self_report', label: 'Onboarding injury report', reliability: 0.90 }],
      strength: 'strong',
      collectedAt: now,
      caveats: ['AI cannot assess injury severity — self-reported only'],
    })
  }

  return items
}
