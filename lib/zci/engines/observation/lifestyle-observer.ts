/**
 * lib/zci/engines/observation/lifestyle-observer.ts
 *
 * Generates recovery, nutrition, lifestyle, and goal alignment observations.
 */

import type { Observation } from '../../types/observation'
import type { Evidence } from '../../types/evidence'
import type { ConfidenceMap } from '../confidence/confidence-engine'
import type { UserContext } from '../../types/context'
import { aggregateConfidence } from '../confidence/confidence-rules'
import { ZCI_CONFIG } from '../../config'
import { nanoid } from '../../utils/nanoid'

export function generateLifestyleObservations(
  evidenceItems: Evidence[],
  _confidenceMap: ConfidenceMap,
  ctx: UserContext
): Observation[] {
  const observations: Observation[] = []
  const now = new Date().toISOString()
  const { lifestyle, training, nutrition, health, goals } = ctx
  const { recovery: rConfig } = ZCI_CONFIG

  // ─── Recovery Observations ────────────────────────────────────────────────────

  const recoveryEvidence = evidenceItems.filter((e) => e.category === 'recovery_capacity')
  const recoveryConf = aggregateConfidence(recoveryEvidence)

  if (lifestyle.recoveryScore < 50) {
    observations.push({
      id: nanoid('obs'),
      category: 'recovery',
      statement: `Recovery capacity is currently limited (score: ${lifestyle.recoveryScore}/100). Sleep quality of ${lifestyle.sleepQuality}/5 and stress level of ${lifestyle.stressLevel}/5 are the primary contributors.`,
      supportingEvidenceIds: recoveryEvidence.map((e) => e.id),
      confidence: recoveryConf.level,
      confidenceReason: recoveryConf.explanation,
      isStrength: false,
      isOpportunity: true,
      observedAt: now,
    })
  } else if (lifestyle.recoveryScore >= 75) {
    observations.push({
      id: nanoid('obs'),
      category: 'recovery',
      statement: `Recovery capacity is good (score: ${lifestyle.recoveryScore}/100). Sleep and stress levels support consistent training.`,
      supportingEvidenceIds: recoveryEvidence.map((e) => e.id),
      confidence: recoveryConf.level,
      confidenceReason: recoveryConf.explanation,
      isStrength: true,
      isOpportunity: false,
      observedAt: now,
    })
  }

  // Specific sleep concern
  if (lifestyle.sleepQuality <= rConfig.sleepQualityThreshold) {
    observations.push({
      id: nanoid('obs'),
      category: 'recovery',
      statement: `Sleep quality is below the threshold required for optimal training adaptation (${lifestyle.sleepQuality}/5). Poor sleep directly limits muscle protein synthesis and fat metabolism.`,
      supportingEvidenceIds: recoveryEvidence.filter((e) => e.observation.includes('Sleep')).map((e) => e.id),
      confidence: 'moderate',
      confidenceReason: 'Based on self-reported sleep quality rating.',
      isStrength: false,
      isOpportunity: true,
      observedAt: now,
    })
  }

  // ─── Training Readiness ───────────────────────────────────────────────────────

  const trainingEvidence = evidenceItems.filter((e) => e.category === 'training_readiness')
  const trainingConf = aggregateConfidence(trainingEvidence)

  const minFreq = ZCI_CONFIG.training.minimumFrequency[training.experienceLevel]
  if (training.daysPerWeekAvailable < minFreq) {
    observations.push({
      id: nanoid('obs'),
      category: 'performance',
      statement: `Available training frequency (${training.daysPerWeekAvailable} days/week) is below the recommended minimum for ${training.experienceLevel} trainees (${minFreq} days/week). This will require prioritisation of higher-impact sessions.`,
      supportingEvidenceIds: trainingEvidence.map((e) => e.id),
      confidence: trainingConf.level,
      confidenceReason: trainingConf.explanation,
      isStrength: false,
      isOpportunity: true,
      observedAt: now,
    })
  }

  // ─── Nutrition Observations ───────────────────────────────────────────────────

  const nutritionEvidence = evidenceItems.filter((e) => e.category === 'nutrition_status')
  const nutritionConf = aggregateConfidence(nutritionEvidence)

  // Protein priority for muscle goals
  if (goals.primaryGoal === 'build_muscle' || goals.primaryGoal === 'recomposition') {
    observations.push({
      id: nanoid('obs'),
      category: 'nutrition',
      statement: `Given the muscle gain / recomposition goal, protein intake is a critical variable. Without tracking data, this cannot be verified — protein adequacy will be a key coaching priority.`,
      supportingEvidenceIds: nutritionEvidence.map((e) => e.id),
      confidence: 'low',
      confidenceReason: 'No dietary intake data available at this stage — observation is goal-based inference.',
      isStrength: false,
      isOpportunity: true,
      observedAt: now,
    })
  }

  // Diet restrictions as context
  if (nutrition.dietStyle !== 'no_restrictions') {
    observations.push({
      id: nanoid('obs'),
      category: 'nutrition',
      statement: `Dietary approach (${nutrition.dietStyle.replace('_', ' ')}) will shape all nutrition recommendations — macro targets will be adapted accordingly.`,
      supportingEvidenceIds: nutritionEvidence.map((e) => e.id),
      confidence: nutritionConf.level,
      confidenceReason: nutritionConf.explanation,
      isStrength: false,
      isOpportunity: false,
      observedAt: now,
    })
  }

  // ─── Goal Alignment ───────────────────────────────────────────────────────────

  const goalEvidence = evidenceItems.filter((e) => e.category === 'goal_alignment' || e.category === 'adherence_likelihood')
  const goalConf = aggregateConfidence(goalEvidence)

  const adherenceEv = goalEvidence.find((e) => e.category === 'adherence_likelihood')
  if (adherenceEv) {
    const likelihood = adherenceEv.value as string
    observations.push({
      id: nanoid('obs'),
      category: 'goal_alignment',
      statement: likelihood === 'high'
        ? `Schedule allows ${training.daysPerWeekAvailable} training days with ${training.sessionDurationMinutes}-minute sessions — adherence conditions are strong.`
        : likelihood === 'moderate'
        ? `Training frequency and duration are workable but lean. The plan must be highly efficient to achieve goal targets.`
        : `Limited training availability (${training.daysPerWeekAvailable} days/week) means every session must be optimised for maximum impact.`,
      supportingEvidenceIds: goalEvidence.map((e) => e.id),
      confidence: goalConf.level,
      confidenceReason: goalConf.explanation,
      isStrength: likelihood === 'high',
      isOpportunity: likelihood !== 'high',
      observedAt: now,
    })
  }

  // ─── Injury Observations ──────────────────────────────────────────────────────

  if (health.hasActiveInjuries && health.injuredAreas.length > 0) {
    const injuryEvidence = evidenceItems.filter((e) => e.category === 'injury_risk')
    const injuryConf = aggregateConfidence(injuryEvidence)

    observations.push({
      id: nanoid('obs'),
      category: 'physique',
      statement: `Active injuries in ${health.injuredAreas.join(', ')} require movement modifications. Affected patterns will be excluded from programming.`,
      supportingEvidenceIds: injuryEvidence.map((e) => e.id),
      confidence: injuryConf.level,
      confidenceReason: injuryConf.explanation,
      isStrength: false,
      isOpportunity: false,
      observedAt: now,
    })
  }

  return observations
}
