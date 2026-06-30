/**
 * Shared domain types for Zyvora.
 * These represent the application-layer models — distinct from raw
 * database rows in types/database.ts.
 */

// ─── Auth ────────────────────────────────────────────────────────────────────
export interface AuthUser {
  id: string
  email: string
  emailVerified: boolean
  onboardingStatus: 'incomplete' | 'completed'
}

// ─── Profile ─────────────────────────────────────────────────────────────────
export type BiologicalSex = 'male' | 'female'
export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced'
export type EquipmentAccess = 'gym_full' | 'gym_basic' | 'home_dumbbells' | 'home_bodyweight'
export type PrimaryGoal = 'fat_loss' | 'muscle_gain' | 'recomposition' | 'general_fitness'

export interface UserProfile {
  id: string
  fullName: string
  dateOfBirth: string
  biologicalSex: BiologicalSex
  heightCm: number
  currentWeightKg: number
  targetWeightKg: number
  fitnessLevel: FitnessLevel
  equipmentAccess: EquipmentAccess
  injuriesList: string[]
  dietaryRestrictions: string[]
  updatedAt: string
}

// ─── API Response Envelope ───────────────────────────────────────────────────
export interface ApiSuccessResponse<T = unknown> {
  success: true
  data: T
}

export interface ApiErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: { field: string; issue: string }[]
  }
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse

// ─── Pagination ───────────────────────────────────────────────────────────────
export interface PaginationMeta {
  limit: number
  nextCursor: string | null
  hasMore: boolean
}

export interface PaginatedResponse<T> extends ApiSuccessResponse<T[]> {
  pagination: PaginationMeta
}
