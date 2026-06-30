/**
 * Application-wide constants for Zyvora.
 * Import from this file instead of hard-coding values.
 */

// ─── App ─────────────────────────────────────────────────────────────────────
export const APP_NAME = 'Zyvora'
export const APP_TAGLINE = 'From Potential to Physique.'
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://zyvora.ai'

// ─── Navigation ──────────────────────────────────────────────────────────────
export const NAV_ROUTES = {
  home: '/',
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',
  authCallback: '/auth/callback',
  dashboard: '/dashboard',
  coach: '/coach',
  workouts: '/workouts',
  nutrition: '/nutrition',
  progress: '/progress',
  settings: '/settings',
  physique: '/physique',
} as const

// ─── Onboarding ───────────────────────────────────────────────────────────────
export const ONBOARDING_TOTAL_STEPS = 4

// ─── Fitness domain constraints ───────────────────────────────────────────────
export const FITNESS_CONSTRAINTS = {
  weight: { min: 30, max: 300, unit: 'kg' },
  height: { min: 100, max: 250, unit: 'cm' },
  age: { min: 16, max: 80 },
  workoutFrequency: { min: 2, max: 6 },
} as const

// ─── AI Coach ────────────────────────────────────────────────────────────────
export const AI_COACH = {
  maxMessageLength: 1000,
  shortTermMemoryDays: 14,
  streamingModel: 'gpt-4o',
  visionModel: 'gpt-4o',
  embeddingModel: 'text-embedding-3-small',
  embeddingDimensions: 1536,
} as const

// ─── Rate limits (client-side feedback only — enforced server-side) ───────────
export const RATE_LIMITS = {
  chat: { requests: 20, windowMs: 60_000 },
  photoUpload: { requests: 3, windowMs: 3_600_000 },
} as const

// ─── File upload ──────────────────────────────────────────────────────────────
export const UPLOAD_CONSTRAINTS = {
  maxFileSizeMb: 10,
  maxFileSizeBytes: 10 * 1024 * 1024,
  acceptedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
  acceptedMimeExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
} as const

// ─── Pagination ───────────────────────────────────────────────────────────────
export const PAGINATION = {
  defaultLimit: 20,
  maxLimit: 100,
} as const
