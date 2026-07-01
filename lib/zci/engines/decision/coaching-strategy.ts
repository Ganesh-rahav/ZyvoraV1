/**
 * lib/zci/engines/decision/coaching-strategy.ts
 *
 * CoachingStrategy builder — converts priorities into structured coaching decisions.
 *
 * The Decision Engine asks ONE question:
 * "What produces the greatest transformation over the next coaching cycle?"
 *
 * It answers by building a structured CoachingStrategy with all 5 focus areas.
 */

import type { CoachingStrategy } from '../../types/decision'
import type { PriorityRanking } from '../../types/priority'
import type { UserContext } from '../../types/context'
import { ZCI_CONFIG } from '../../config'

export function buildCoachingStrategy(
  priorityRanking: PriorityRanking,
  ctx: UserContext
): CoachingStrategy {
  const now = new Date()
  const cycleEndDate = new Date(now.getTime() + ZCI_CONFIG.coaching.defaultCycleLengthWeeks * 7 * 24 * 60 * 60 * 1000)

  return {
    sessionId: ctx.sessionId,
    decidedAt: now.toISOString(),
    training:   buildTrainingFocus(priorityRanking, ctx),
    nutrition:  buildNutritionFocus(priorityRanking, ctx),
    recovery:   buildRecoveryFocus(ctx),
    lifestyle:  buildLifestyleFocus(ctx),
    behaviour:  buildBehaviourFocus(priorityRanking, ctx),
    overallConfidence: 'moderate',  // Initial cycle — improves with data
    recommendedCycleLengthWeeks: ZCI_CONFIG.coaching.defaultCycleLengthWeeks,
    nextReviewDate: cycleEndDate.toISOString(),
    assumptions: [
      'User data is self-reported and may not reflect precise physiological state',
      'No historical behavioral data available — adherence estimates are based on schedule only',
      'Vision analysis provides estimates — not clinical measurements',
    ],
    revisionTriggers: [
      'User reports injury or pain during training',
      'Weight trend diverges significantly from expected direction over 2+ weeks',
      'User requests goal change',
      'Adherence drops below 50% over 2 consecutive weeks',
    ],
  }
}

// ─── Training Focus ───────────────────────────────────────────────────────────

function buildTrainingFocus(
  priorityRanking: PriorityRanking,
  ctx: UserContext
): CoachingStrategy['training'] {
  const { goals, health, training } = ctx

  // Primary muscle groups to address — from top physique priorities
  const physiquePriorities = priorityRanking.selectedPriorities
    .filter((p) => p.domain === 'physique_transformation')
    .map((p) => p.label)

  // Movement patterns to avoid (from injuries)
  const contraindicated = health.injuredAreas.map((area) => getContraindicated(area))

  // Phase selection based on goal
  const phase = goalToPhase(goals.primaryGoal)

  // Recommended frequency (capped to available days)
  const minFreq = ZCI_CONFIG.training.minimumFrequency[training.experienceLevel]
  const recommendedFreq = Math.min(training.daysPerWeekAvailable, Math.max(minFreq, training.daysPerWeekAvailable - 1))

  return {
    primaryMuscleGroups: physiquePriorities.length > 0 ? physiquePriorities : derivePrimaryGroups(goals.primaryGoal),
    movementPatterns: getMovementPatterns(goals.primaryGoal, training.experienceLevel),
    contraindicated,
    recommendedFrequencyPerWeek: recommendedFreq,
    recommendedSessionMinutes: training.sessionDurationMinutes,
    phase,
    rationale: `Phase selected based on primary goal (${goals.primaryGoal.replace('_', ' ')}) and experience level (${training.experienceLevel}).`,
    confidence: 'moderate',
  }
}

// ─── Nutrition Focus ──────────────────────────────────────────────────────────

function buildNutritionFocus(
  _priorityRanking: PriorityRanking,
  ctx: UserContext
): CoachingStrategy['nutrition'] {
  const { physical, goals } = ctx
  const { nutrition: nConfig } = ZCI_CONFIG

  const caloricBalance = goalToCaloricBalance(goals.primaryGoal)
  const proteinGramsPerKg = nConfig.proteinPerKg.optimal

  // TDEE estimate (Mifflin-St Jeor + activity multiplier)
  const bmrEst = estimateBMR(physical)
  const activityMultiplier = getActivityMultiplier(ctx.lifestyle.activityLevel)
  const tdeeEst = Math.round(bmrEst * activityMultiplier)

  const caloricAdjustment =
    caloricBalance === 'deficit' ? -300 :
    caloricBalance === 'surplus' ? 250 :
    caloricBalance === 'aggressive_deficit' ? -500 : 0

  const targetMin = tdeeEst + caloricAdjustment - 100
  const targetMax = tdeeEst + caloricAdjustment + 100

  // Enforce safety floor
  const floor = ZCI_CONFIG.nutrition.caloricSafetyFloors[physical.biologicalSex]
  const safeMin = Math.max(targetMin, floor)
  const safeMax = Math.max(targetMax, floor + 200)

  return {
    caloricBalance,
    dailyCaloriesMin: safeMin,
    dailyCaloriesMax: safeMax,
    proteinPriority: goals.primaryGoal === 'build_muscle' ? 5 :
      goals.primaryGoal === 'recomposition' ? 5 :
      goals.primaryGoal === 'lose_fat' ? 4 : 3,
    proteinGramsPerKg,
    behavioralFocus: getNutritionBehaviors(goals.primaryGoal, ctx.nutrition.dietStyle),
    rationale: `Caloric target estimated from BMR (~${Math.round(bmrEst)} kcal) × activity multiplier (${activityMultiplier.toFixed(2)}) = TDEE ~${tdeeEst} kcal. ${caloricBalance} adjustment applied.`,
    confidence: 'low',  // Without actual intake data, this is an estimate
  }
}

// ─── Recovery Focus ───────────────────────────────────────────────────────────

function buildRecoveryFocus(ctx: UserContext): CoachingStrategy['recovery'] {
  const { lifestyle } = ctx
  const { recovery: rConfig } = ZCI_CONFIG

  const isRecoveryLimiting = lifestyle.recoveryScore < rConfig.recoveryScoreVolumeCutoff
  const volumeModification: CoachingStrategy['recovery']['volumeModification'] =
    lifestyle.recoveryScore < 30 ? 'deload' :
    lifestyle.recoveryScore < 50 ? 'reduce' :
    lifestyle.recoveryScore < 70 ? 'maintain' : 'increase'

  const interventions: string[] = []
  if (lifestyle.sleepQuality <= rConfig.sleepQualityThreshold) {
    interventions.push('Prioritise sleep consistency — aim for consistent wake/sleep times')
  }
  if (lifestyle.stressLevel >= rConfig.stressLevelThreshold) {
    interventions.push('Incorporate active stress management between sessions (e.g. 10-minute walks)')
  }
  if (lifestyle.energyLevel <= rConfig.energyLevelThreshold) {
    interventions.push('Monitor pre-workout nutrition to support session energy')
  }

  return {
    isRecoveryLimiting,
    recoveryPriority: isRecoveryLimiting ? 4 : 2,
    interventions,
    targetSleepHours: 8,
    volumeModification,
    rationale: `Recovery score: ${lifestyle.recoveryScore}/100. Volume modification: ${volumeModification}.`,
    confidence: 'moderate',
  }
}

// ─── Lifestyle Focus ──────────────────────────────────────────────────────────

function buildLifestyleFocus(ctx: UserContext): CoachingStrategy['lifestyle'] {
  const limitingFactors: string[] = []
  const recommendations: string[] = []

  if (ctx.lifestyle.occupation === 'desk_job') {
    limitingFactors.push('Sedentary occupation — NEAT (non-exercise activity thermogenesis) is low')
    recommendations.push('Add 10-minute walks at lunch and after dinner to increase daily activity')
  }
  if (ctx.lifestyle.stressLevel >= 4) {
    limitingFactors.push('High stress may impair recovery and appetite regulation')
    recommendations.push('Prioritise stress reduction as a performance variable, not just wellbeing')
  }
  if (ctx.training.daysPerWeekAvailable < 3) {
    limitingFactors.push('Limited training availability constrains program design')
    recommendations.push('Focus every session on highest-value compound movements')
  }

  return {
    limitingFactors,
    recommendations,
    priority: limitingFactors.length >= 2 ? 3 : 2,
    rationale: `${limitingFactors.length} lifestyle limiting factors identified.`,
  }
}

// ─── Behaviour Focus ──────────────────────────────────────────────────────────

function buildBehaviourFocus(
  _priorityRanking: PriorityRanking,
  ctx: UserContext
): CoachingStrategy['behaviour'] {
  const adherenceRisks: string[] = []

  if (ctx.training.daysPerWeekAvailable < 3) {
    adherenceRisks.push('Low training frequency increases risk of schedule disruption')
  }
  if (ctx.lifestyle.stressLevel >= 4) {
    adherenceRisks.push('High stress is a common adherence disruptor')
  }

  // Predicted adherence based on schedule and experience
  const baseProbability = ctx.training.daysPerWeekAvailable >= 4 ? 0.78 :
    ctx.training.daysPerWeekAvailable >= 3 ? 0.70 : 0.62
  const stressAdjustment = ctx.lifestyle.stressLevel >= 4 ? -0.08 : 0
  const experienceAdjustment = ctx.training.experienceLevel === 'advanced' ? 0.05 :
    ctx.training.experienceLevel === 'beginner' ? -0.05 : 0

  return {
    habitsToEstablish: [
      'Post-session protein intake',
      'Pre-session warm-up routine (10 minutes)',
      'Sleep consistent wake time (weekdays and weekends)',
    ],
    habitsToMaintain: [],  // Populated from memory in future sprints
    adherenceRisks,
    predictedAdherenceProbability: Math.max(0.4, Math.min(0.95, baseProbability + stressAdjustment + experienceAdjustment)),
    rationale: 'Adherence predicted from schedule frequency, stress level, and training experience.',
  }
}

// ─── Domain Helpers ───────────────────────────────────────────────────────────

function goalToPhase(goal: UserContext['goals']['primaryGoal']): CoachingStrategy['training']['phase'] {
  const map: Record<UserContext['goals']['primaryGoal'], CoachingStrategy['training']['phase']> = {
    lose_fat:      'hypertrophy',   // Preserve muscle while in deficit
    build_muscle:  'hypertrophy',
    recomposition: 'recomposition',
    build_strength: 'strength',
    improve_health: 'endurance',
  }
  return map[goal]
}

function goalToCaloricBalance(goal: UserContext['goals']['primaryGoal']): CoachingStrategy['nutrition']['caloricBalance'] {
  const map: Record<UserContext['goals']['primaryGoal'], CoachingStrategy['nutrition']['caloricBalance']> = {
    lose_fat:       'deficit',
    build_muscle:   'surplus',
    recomposition:  'maintenance',
    build_strength: 'maintenance',
    improve_health: 'maintenance',
  }
  return map[goal]
}

function derivePrimaryGroups(goal: UserContext['goals']['primaryGoal']): string[] {
  const map: Record<UserContext['goals']['primaryGoal'], string[]> = {
    lose_fat:       ['Full Body', 'Compound Movements'],
    build_muscle:   ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs'],
    recomposition:  ['Full Body', 'Compound Movements'],
    build_strength: ['Squat', 'Deadlift', 'Bench Press', 'Overhead Press'],
    improve_health: ['Full Body', 'Cardiovascular'],
  }
  return map[goal]
}

function getMovementPatterns(goal: UserContext['goals']['primaryGoal'], level: UserContext['training']['experienceLevel']): string[] {
  const base = ['Hip Hinge', 'Push', 'Pull', 'Squat', 'Carry']
  if (goal === 'build_strength') return ['Heavy Compound', ...base]
  if (level === 'beginner') return ['Bodyweight Fundamentals', ...base.slice(0, 3)]
  return base
}

function getContraindicated(area: string): string {
  const map: Record<string, string> = {
    lower_back:  'Heavy loaded spinal flexion (e.g. Good Mornings)',
    upper_back:  'Overhead pressing with external load',
    shoulder:    'Upright rows, behind-neck press',
    knee:        'Deep knee flexion under load, jumping',
    hip:         'Full range hip flexion under load',
    ankle:       'High-impact plyometrics, heavy calf raises',
    wrist:       'Heavy barbell pressing variations',
    neck:        'Direct neck flexion/extension under load',
    elbow:       'Heavy elbow flexion/extension under load',
  }
  return map[area] ?? `Load-bearing through ${area.replace('_', ' ')}`
}

function estimateBMR(physical: UserContext['physical']): number {
  // Mifflin-St Jeor formula
  if (physical.biologicalSex === 'male') {
    return 10 * physical.currentWeightKg + 6.25 * physical.heightCm - 5 * physical.ageYears + 5
  }
  return 10 * physical.currentWeightKg + 6.25 * physical.heightCm - 5 * physical.ageYears - 161
}

function getActivityMultiplier(level: UserContext['lifestyle']['activityLevel']): number {
  const map: Record<UserContext['lifestyle']['activityLevel'], number> = {
    sedentary:        1.20,
    lightly_active:   1.375,
    moderately_active: 1.55,
    very_active:      1.725,
    extremely_active: 1.90,
  }
  return map[level]
}

function getNutritionBehaviors(goal: UserContext['goals']['primaryGoal'], _dietStyle: string): string[] {
  const base = ['Hit protein target daily', 'Eat within a consistent meal window']
  if (goal === 'build_muscle') return [...base, 'Ensure pre- and post-workout nutrition is adequate']
  if (goal === 'lose_fat') return [...base, 'Track calories 5 out of 7 days for awareness']
  return base
}
