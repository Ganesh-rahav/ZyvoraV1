/**
 * lib/zci/types/context.ts
 *
 * The User Context Model — the complete structured knowledge about a user
 * assembled before every ZCI pipeline invocation.
 *
 * This is the INPUT to the ZCI pipeline.
 * Every engine reads from this. Nothing writes back to it.
 */

import type { OnboardingData } from '@/types/onboarding'
import type { PhysiqueAnalysis } from '@/lib/ai/types/vision'

// ─── Physical Profile ─────────────────────────────────────────────────────────

export interface PhysicalProfile {
  /** User age derived from dateOfBirth */
  ageYears: number
  biologicalSex: 'male' | 'female'
  heightCm: number
  currentWeightKg: number
  /** Estimated BMI — derived, not stored */
  bmi: number
  /** Estimated body fat % range from vision analysis */
  estimatedBodyFatMin?: number
  estimatedBodyFatMax?: number
  /** e.g. 'lean' | 'average' | 'above_average' */
  bodyCompositionCategory?: string
}

// ─── Goal Context ─────────────────────────────────────────────────────────────

export interface GoalContext {
  primaryGoal: OnboardingData['primaryGoal']
  secondaryGoals: OnboardingData['secondaryGoals']
  timeline: OnboardingData['timeline']
  motivations: OnboardingData['motivations']
  /** Weeks remaining until timeline deadline (null = no deadline) */
  weeksRemaining: number | null
}

// ─── Training Profile ─────────────────────────────────────────────────────────

export interface TrainingProfile {
  experienceLevel: OnboardingData['experienceLevel']
  daysPerWeekAvailable: number
  sessionDurationMinutes: number
  preferredTime: OnboardingData['preferredTime']
  environment: OnboardingData['trainingEnvironment']
  gymEquipment: OnboardingData['gymEquipment']
  homeEquipment: OnboardingData['homeEquipment']
}

// ─── Lifestyle Profile ────────────────────────────────────────────────────────

export interface LifestyleProfile {
  occupation: OnboardingData['occupation']
  activityLevel: OnboardingData['activityLevel']
  /** 1–5 scale from onboarding */
  sleepQuality: number
  stressLevel: number
  energyLevel: number
  /** Composite recovery score derived from sleep + stress + energy (0–100) */
  recoveryScore: number
}

// ─── Nutrition Profile ────────────────────────────────────────────────────────

export interface NutritionProfile {
  dietStyle: OnboardingData['dietStyle']
  allergies: OnboardingData['allergies']
  mealFrequency: number
  cookingConfidence: number
  currentSupplements: OnboardingData['supplements']
}

// ─── Health & Safety Context ─────────────────────────────────────────────────

export interface HealthContext {
  hasActiveInjuries: boolean
  injuredAreas: OnboardingData['injuries']
  injuryNotes: string
  /** Derived from injury list — movement patterns to avoid */
  contraindications: string[]
}

// ─── Coach Context ────────────────────────────────────────────────────────────

export interface CoachContext {
  personality: OnboardingData['coachPersonality']
  /** ISO timestamp of this coaching session */
  sessionTimestamp: string
  /** Type of interaction driving this ZCI invocation */
  interactionType: 'initial_analysis' | 'weekly_checkin' | 'chat' | 'plan_generation' | 'progress_review'
  /** Days since last coach interaction (null = first interaction) */
  daysSinceLastInteraction: number | null
}

// ─── Physique Input ───────────────────────────────────────────────────────────

export interface PhysiqueInput {
  /** Whether the user provided any photos */
  hasPhotos: boolean
  /** Analyses indexed by view type */
  analyses: Partial<Record<'front' | 'side' | 'back', PhysiqueAnalysis>>
  /** True if vision analysis was skipped */
  skipped: boolean
}

// ─── Full User Context ────────────────────────────────────────────────────────

/**
 * UserContext is the complete, assembled knowledge payload passed to the ZCI pipeline.
 * It is immutable once assembled — engines read from it, they never mutate it.
 */
export interface UserContext {
  /** Unique ZCI session identifier */
  sessionId: string

  /** Raw onboarding data — kept for reference */
  onboarding: Partial<OnboardingData>

  physical: PhysicalProfile
  goals: GoalContext
  training: TrainingProfile
  lifestyle: LifestyleProfile
  nutrition: NutritionProfile
  health: HealthContext
  coach: CoachContext
  physique: PhysiqueInput
}
