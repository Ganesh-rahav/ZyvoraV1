/**
 * lib/zci/pipeline/context-assembler.ts
 *
 * ContextAssembler — builds the complete UserContext from raw inputs.
 * This is the entry point for every ZCI pipeline invocation.
 */

import type { UserContext, PhysicalProfile, GoalContext, TrainingProfile, LifestyleProfile, NutritionProfile, HealthContext, CoachContext, PhysiqueInput } from '../types/context'
import type { OnboardingData } from '@/types/onboarding'
import type { PhysiqueAnalysis } from '@/lib/ai/types/vision'
import { nanoid } from '../utils/nanoid'

export interface ContextAssemblerInput {
  onboarding: Partial<OnboardingData>
  physiqueAnalyses?: Partial<Record<'front' | 'side' | 'back', PhysiqueAnalysis>>
  physiqueSkipped?: boolean
  interactionType?: CoachContext['interactionType']
  userId?: string
}

export function assembleUserContext(input: ContextAssemblerInput): UserContext {
  const { onboarding } = input

  const physical = buildPhysicalProfile(onboarding, input.physiqueAnalyses)
  const goals = buildGoalContext(onboarding)
  const training = buildTrainingProfile(onboarding)
  const lifestyle = buildLifestyleProfile(onboarding)
  const nutrition = buildNutritionProfile(onboarding)
  const health = buildHealthContext(onboarding)
  const coach = buildCoachContext(onboarding, input.interactionType)
  const physique = buildPhysiqueInput(input.physiqueAnalyses, input.physiqueSkipped)

  return {
    sessionId: nanoid('sess'),
    onboarding,
    physical,
    goals,
    training,
    lifestyle,
    nutrition,
    health,
    coach,
    physique,
  }
}

// ─── Physical Profile ─────────────────────────────────────────────────────────

function buildPhysicalProfile(
  ob: Partial<OnboardingData>,
  analyses?: Partial<Record<'front' | 'side' | 'back', PhysiqueAnalysis>>
): PhysicalProfile {
  const heightCm = ob.heightCm ?? 170
  const weightKg = ob.weightKg ?? 70
  const biologicalSex = ob.biologicalSex ?? 'male'
  const heightM = heightCm / 100
  const bmi = Math.round((weightKg / (heightM * heightM)) * 10) / 10

  // Extract body fat estimates from vision analyses
  let estimatedBodyFatMin: number | undefined
  let estimatedBodyFatMax: number | undefined

  if (analyses) {
    const allAnalyses = Object.values(analyses).filter(Boolean) as PhysiqueAnalysis[]
    if (allAnalyses.length > 0) {
      const mins = allAnalyses.map((a) => a.bodyComposition.bodyFatMin).filter((v) => v > 0)
      const maxs = allAnalyses.map((a) => a.bodyComposition.bodyFatMax).filter((v) => v > 0)
      if (mins.length > 0 && maxs.length > 0) {
        estimatedBodyFatMin = mins.reduce((s, v) => s + v, 0) / mins.length
        estimatedBodyFatMax = maxs.reduce((s, v) => s + v, 0) / maxs.length
      }
    }
  }

  // Age from dateOfBirth
  const ageYears = ob.dateOfBirth
    ? Math.floor((Date.now() - new Date(ob.dateOfBirth).getTime()) / (365.25 * 24 * 3600 * 1000))
    : 28  // Default if not provided

  const bodyCompositionCategory = deriveBodyCompositionCategory(
    estimatedBodyFatMin,
    estimatedBodyFatMax,
    biologicalSex,
    bmi
  )

  return {
    ageYears,
    biologicalSex,
    heightCm,
    currentWeightKg: weightKg,
    bmi,
    estimatedBodyFatMin,
    estimatedBodyFatMax,
    bodyCompositionCategory,
  }
}

// ─── Goal Context ─────────────────────────────────────────────────────────────

function buildGoalContext(ob: Partial<OnboardingData>): GoalContext {
  const timeline = ob.timeline ?? 'no_deadline'

  let weeksRemaining: number | null = null
  if (timeline !== 'no_deadline') {
    const months = timeline === '3_months' ? 3 : timeline === '6_months' ? 6 : 12
    weeksRemaining = months * 4
  }

  return {
    primaryGoal: ob.primaryGoal ?? 'improve_health',
    secondaryGoals: ob.secondaryGoals ?? [],
    timeline,
    motivations: ob.motivations ?? [],
    weeksRemaining,
  }
}

// ─── Training Profile ─────────────────────────────────────────────────────────

function buildTrainingProfile(ob: Partial<OnboardingData>): TrainingProfile {
  const durationMap: Record<NonNullable<OnboardingData['sessionDuration']>, number> = {
    '30min': 30,
    '45min': 45,
    '60min': 60,
    '75min': 75,
    '90min+': 90,
  }

  return {
    experienceLevel: ob.experienceLevel ?? 'beginner',
    daysPerWeekAvailable: ob.daysPerWeek ?? 3,
    sessionDurationMinutes: durationMap[ob.sessionDuration ?? '60min'],
    preferredTime: ob.preferredTime ?? 'flexible',
    environment: ob.trainingEnvironment ?? 'gym',
    gymEquipment: ob.gymEquipment ?? [],
    homeEquipment: ob.homeEquipment ?? [],
  }
}

// ─── Lifestyle Profile ────────────────────────────────────────────────────────

function buildLifestyleProfile(ob: Partial<OnboardingData>): LifestyleProfile {
  const sleep = ob.sleepQuality ?? 3
  const stress = ob.stressLevel ?? 3
  const energy = ob.energyLevel ?? 3

  // Recovery score: normalize each to 0–33.3, weight sleep highest
  const sleepScore = ((sleep - 1) / 4) * 40
  const stressScore = ((5 - stress) / 4) * 35   // Inverted — lower stress = better
  const energyScore = ((energy - 1) / 4) * 25

  const recoveryScore = Math.round(sleepScore + stressScore + energyScore)

  return {
    occupation: ob.occupation ?? 'desk_job',
    activityLevel: ob.activityLevel ?? 'lightly_active',
    sleepQuality: sleep,
    stressLevel: stress,
    energyLevel: energy,
    recoveryScore: Math.min(100, Math.max(0, recoveryScore)),
  }
}

// ─── Nutrition Profile ────────────────────────────────────────────────────────

function buildNutritionProfile(ob: Partial<OnboardingData>): NutritionProfile {
  return {
    dietStyle: ob.dietStyle ?? 'no_restrictions',
    allergies: ob.allergies ?? ['none'],
    mealFrequency: ob.mealFrequency ?? 3,
    cookingConfidence: ob.cookingConfidence ?? 3,
    currentSupplements: ob.supplements ?? ['none'],
  }
}

// ─── Health Context ───────────────────────────────────────────────────────────

function buildHealthContext(ob: Partial<OnboardingData>): HealthContext {
  const injuredAreas = ob.injuries ?? []
  const contraindications = injuredAreas.map((area) =>
    getInjuryContraindication(area)
  ).filter(Boolean)

  return {
    hasActiveInjuries: ob.hasInjuries ?? false,
    injuredAreas,
    injuryNotes: ob.injuryNotes ?? '',
    contraindications,
  }
}

// ─── Coach Context ────────────────────────────────────────────────────────────

function buildCoachContext(
  ob: Partial<OnboardingData>,
  interactionType?: CoachContext['interactionType']
): CoachContext {
  return {
    personality: ob.coachPersonality ?? 'balanced',
    sessionTimestamp: new Date().toISOString(),
    interactionType: interactionType ?? 'initial_analysis',
    daysSinceLastInteraction: null,  // Populated from memory in future sprints
  }
}

// ─── Physique Input ───────────────────────────────────────────────────────────

function buildPhysiqueInput(
  analyses?: Partial<Record<'front' | 'side' | 'back', PhysiqueAnalysis>>,
  skipped?: boolean
): PhysiqueInput {
  if (skipped || !analyses) {
    return { hasPhotos: false, analyses: {}, skipped: true }
  }

  const hasPhotos = Object.keys(analyses).length > 0
  return { hasPhotos, analyses, skipped: false }
}

// ─── Domain Helpers ───────────────────────────────────────────────────────────

function deriveBodyCompositionCategory(
  bfMin: number | undefined,
  bfMax: number | undefined,
  sex: 'male' | 'female',
  bmi: number
): string {
  if (bfMin !== undefined && bfMax !== undefined) {
    const mid = (bfMin + bfMax) / 2
    if (sex === 'male') {
      if (mid < 12) return 'lean'
      if (mid < 18) return 'average'
      if (mid < 25) return 'above_average'
      return 'high'
    } else {
      if (mid < 20) return 'lean'
      if (mid < 28) return 'average'
      if (mid < 35) return 'above_average'
      return 'high'
    }
  }

  // Fallback to BMI-based classification (less accurate)
  if (bmi < 18.5) return 'lean'
  if (bmi < 25) return 'average'
  if (bmi < 30) return 'above_average'
  return 'high'
}

function getInjuryContraindication(area: string): string {
  const map: Record<string, string> = {
    lower_back: 'spinal_flexion_under_load',
    upper_back: 'overhead_external_load',
    shoulder: 'upright_row_behind_neck',
    knee: 'deep_knee_flexion_loaded',
    hip: 'full_hip_flexion_loaded',
    ankle: 'high_impact_plyometrics',
    wrist: 'barbell_pressing',
    neck: 'neck_isolation',
    elbow: 'loaded_elbow_flexion',
  }
  return map[area] ?? `${area}_restricted`
}
