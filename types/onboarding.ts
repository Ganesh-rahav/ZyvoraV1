/**
 * Zyvora Onboarding — Type Definitions
 * Single source of truth for all onboarding data shapes.
 */

// ─── Enums ────────────────────────────────────────────────────────────────────

export type Units = 'metric' | 'imperial'
export type BiologicalSex = 'male' | 'female'

export type GoalType =
  | 'lose_fat'
  | 'build_muscle'
  | 'recomposition'
  | 'build_strength'
  | 'improve_health'

export type TimelineType = '3_months' | '6_months' | '12_months' | 'no_deadline'

export type MotivationType =
  | 'confidence'
  | 'health'
  | 'sports'
  | 'lifestyle'
  | 'appearance'
  | 'performance'
  | 'custom'

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced'

export type SessionDuration = '30min' | '45min' | '60min' | '75min' | '90min+'

export type TrainingTime = 'early_morning' | 'morning' | 'afternoon' | 'evening' | 'night' | 'flexible'

export type ScheduleFlexibility = 'fixed' | 'flexible'

export type TrainingEnvironment = 'gym' | 'home' | 'hybrid'

export type GymEquipment =
  | 'barbells'
  | 'dumbbells'
  | 'cables'
  | 'machines'
  | 'smith_machine'
  | 'leg_press'
  | 'pull_up_bar'
  | 'cardio'

export type HomeEquipment =
  | 'dumbbells'
  | 'resistance_bands'
  | 'pull_up_bar'
  | 'kettlebells'
  | 'bench'
  | 'barbell'
  | 'bodyweight_only'

export type OccupationCategory =
  | 'desk_job'
  | 'physically_active_job'
  | 'student'
  | 'healthcare'
  | 'shift_work'
  | 'other'

export type ActivityLevel =
  | 'sedentary'
  | 'lightly_active'
  | 'moderately_active'
  | 'very_active'
  | 'extremely_active'

export type DietStyle =
  | 'no_restrictions'
  | 'vegetarian'
  | 'vegan'
  | 'keto'
  | 'paleo'
  | 'mediterranean'
  | 'halal'
  | 'kosher'
  | 'gluten_free'

export type AllergyType =
  | 'none'
  | 'gluten'
  | 'dairy'
  | 'nuts'
  | 'eggs'
  | 'soy'
  | 'shellfish'
  | 'fish'

export type SupplementType =
  | 'none'
  | 'protein_powder'
  | 'creatine'
  | 'pre_workout'
  | 'vitamins'
  | 'omega3'
  | 'bcaa'

export type InjuryArea =
  | 'lower_back'
  | 'upper_back'
  | 'shoulder'
  | 'knee'
  | 'hip'
  | 'ankle'
  | 'wrist'
  | 'neck'
  | 'elbow'

export type CoachPersonality =
  | 'high_performance'
  | 'encouraging'
  | 'scientific'
  | 'balanced'
  | 'friendly'

// ─── Scale type (1–5) ─────────────────────────────────────────────────────────
export type Scale5 = 1 | 2 | 3 | 4 | 5

// ─── Core onboarding data ─────────────────────────────────────────────────────
export interface OnboardingData {
  // Demographics
  firstName: string
  dateOfBirth: string
  biologicalSex: BiologicalSex
  heightCm: number
  weightKg: number
  units: Units

  // Goals
  primaryGoal: GoalType
  secondaryGoals: GoalType[]
  timeline: TimelineType

  // Motivation
  motivations: MotivationType[]
  motivationCustom: string

  // Experience
  experienceLevel: ExperienceLevel

  // Schedule
  daysPerWeek: number
  sessionDuration: SessionDuration
  preferredTime: TrainingTime
  scheduleFlexibility: ScheduleFlexibility

  // Environment
  trainingEnvironment: TrainingEnvironment

  // Equipment
  gymEquipment: GymEquipment[]
  homeEquipment: HomeEquipment[]

  // Lifestyle
  occupation: OccupationCategory
  activityLevel: ActivityLevel
  sleepQuality: Scale5
  stressLevel: Scale5
  energyLevel: Scale5

  // Nutrition
  dietStyle: DietStyle
  allergies: AllergyType[]
  mealFrequency: number
  cookingConfidence: Scale5
  supplements: SupplementType[]

  // Health & Safety
  hasInjuries: boolean
  injuries: InjuryArea[]
  injuryNotes: string

  // Coach personality
  coachPersonality: CoachPersonality
}

// ─── Onboarding state ────────────────────────────────────────────────────────
export interface OnboardingState {
  currentStep: number
  totalSteps: number
  data: Partial<OnboardingData>
  isSubmitting: boolean
  isComplete: boolean
}

// ─── Step definition ─────────────────────────────────────────────────────────
export interface StepDefinition {
  id: string
  progressLabel: string
  component: React.ComponentType<StepProps>
  /** Return false to skip this step during navigation */
  condition?: (data: Partial<OnboardingData>) => boolean
}

// ─── Props passed to every step component ────────────────────────────────────
export interface StepProps {
  data: Partial<OnboardingData>
  onChange: (updates: Partial<OnboardingData>) => void
  onValidChange: (isValid: boolean) => void
}
