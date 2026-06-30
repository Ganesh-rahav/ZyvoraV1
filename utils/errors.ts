import type { ApiErrorResponse, ApiSuccessResponse } from '@/types'

/**
 * Standard error codes matching docs/05-api-specification.md Section 16.
 */
export const ErrorCodes = {
  // Auth
  EMAIL_TAKEN: 'AUTH-001',
  INVALID_CREDENTIALS: 'AUTH-002',
  SESSION_EXPIRED: 'AUTH-003',
  INVALID_REFRESH_TOKEN: 'AUTH-004',
  RESET_TOKEN_EXPIRED: 'AUTH-005',
  VERIFICATION_EXPIRED: 'AUTH-006',
  ACCESS_DENIED: 'AUTH-007',
  // Validation
  VALIDATION_FAILED: 'VAL-001',
  // AI
  MODEL_CONNECTION_FAILED: 'AI-001',
  JOB_NOT_FOUND: 'AI-002',
  ANALYSIS_NOT_FOUND: 'AI-003',
  MODEL_PROCESSING_FAILED: 'AI-004',
  SAFETY_BOUNDARY_TRIGGERED: 'AI-005',
  CONVERSATION_NOT_FOUND: 'AI-006',
  // Upload
  UNSUPPORTED_FILE_TYPE: 'UPL-001',
  FILE_TOO_LARGE: 'UPL-002',
  FILE_NOT_FOUND: 'UPL-003',
  // Subscription
  ACTIVE_SUBSCRIPTION_BLOCKS: 'SUB-001',
  PLAN_NOT_FOUND: 'SUB-002',
  ALREADY_SUBSCRIBED: 'SUB-003',
  NO_SUBSCRIPTION: 'SUB-004',
  // Server
  DATABASE_ERROR: 'SRV-001',
  EXTERNAL_SERVICE_UNAVAILABLE: 'SRV-002',
} as const

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes]

/**
 * Build a typed success API response.
 */
export function successResponse<T>(data: T): ApiSuccessResponse<T> {
  return { success: true, data }
}

/**
 * Build a typed error API response.
 */
export function errorResponse(
  code: string,
  message: string,
  details?: { field: string; issue: string }[]
): ApiErrorResponse {
  return {
    success: false,
    error: { code, message, ...(details ? { details } : {}) },
  }
}

/**
 * Extract a user-friendly message from an unknown error.
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return 'An unexpected error occurred'
}

/**
 * Type guard: check if an API response is an error.
 */
export function isApiError(response: unknown): response is ApiErrorResponse {
  return (
    typeof response === 'object' &&
    response !== null &&
    'success' in response &&
    (response as { success: boolean }).success === false
  )
}
