/**
 * Feature flags configuration for Zyvora.
 * Controls which features are enabled per environment.
 * Allows safe, incremental feature rollout without code changes.
 */

interface FeatureFlags {
  /** AI physique analysis — requires OpenAI Vision API */
  physiqueAnalysis: boolean
  /** AI Coach conversational interface */
  aiCoach: boolean
  /** Stripe subscription billing */
  billing: boolean
  /** Google OAuth login */
  googleAuth: boolean
  /** Weekly check-in system */
  weeklyCheckin: boolean
  /** Push notifications */
  pushNotifications: boolean
}

const flags: FeatureFlags = {
  physiqueAnalysis: process.env.NEXT_PUBLIC_FEATURE_PHYSIQUE_ANALYSIS === 'true',
  aiCoach: process.env.NEXT_PUBLIC_FEATURE_AI_COACH === 'true',
  billing: process.env.NEXT_PUBLIC_FEATURE_BILLING === 'true',
  googleAuth: process.env.NEXT_PUBLIC_FEATURE_GOOGLE_AUTH === 'true',
  weeklyCheckin: process.env.NEXT_PUBLIC_FEATURE_WEEKLY_CHECKIN === 'true',
  pushNotifications: false, // Not yet implemented
}

export const featureFlags = Object.freeze(flags)

export type { FeatureFlags }
