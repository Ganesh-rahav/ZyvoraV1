/**
 * lib/zci/types/safety.ts
 *
 * Safety system types — absolute hard rules, scope boundaries, emergency protocols.
 *
 * Safety rules are NOT configurable. They cannot be overridden by coaching style,
 * user preference, or any other input. They are structurally enforced.
 *
 * Per docs/02-ai-coach-spec.md §10.
 */

// ─── Safety Signal ────────────────────────────────────────────────────────────

export type SafetySignalType =
  | 'emergency_medical'        // Chest pain, fainting, acute injury
  | 'mental_health_crisis'     // Self-harm, suicidal ideation
  | 'extreme_restriction'      // Caloric intake below safety floor
  | 'training_through_pain'    // User trying to train through pain signal
  | 'medical_diagnosis_request'// User asking AI to diagnose a condition
  | 'medication_advice_request'// User asking for medication guidance
  | 'guaranteed_outcome'       // User demanding outcome guarantees
  | 'scope_violation'          // Request outside coaching scope

export type SafetyLevel =
  | 'emergency'    // Stop everything, provide emergency resources
  | 'hard_block'   // Block the action, explain why, offer alternative
  | 'soft_warn'    // Warn but do not block — log and note

export interface SafetySignal {
  type: SafetySignalType
  level: SafetyLevel
  /** What triggered this signal */
  trigger: string
  /** The response the coach must give */
  requiredResponse: string
  /** Should this be logged permanently? */
  permanentLog: boolean
  /** Should a professional referral be provided? */
  includeReferral: boolean
  /** Relevant professional category to reference */
  referralCategory?: 'medical' | 'mental_health' | 'physiotherapy' | 'dietitian'
}

// ─── Caloric Safety Floors ────────────────────────────────────────────────────

export const CALORIC_SAFETY_FLOORS = {
  male: 1500,    // kcal/day
  female: 1200,  // kcal/day
} as const

// ─── Scope Violation ──────────────────────────────────────────────────────────

export type ScopeViolationType =
  | 'medical_diagnosis'
  | 'therapeutic_diet'
  | 'clinical_rehabilitation'
  | 'psychological_counseling'
  | 'medication_prescription'
  | 'supplement_prescription'

export interface ScopeViolation {
  type: ScopeViolationType
  userQuery: string
  /** What the coach CAN say */
  inScopeResponse: string
  /** Where to direct the user */
  referralGuidance: string
}

// ─── Safety Check Result ──────────────────────────────────────────────────────

export interface SafetyCheckResult {
  safe: boolean
  signals: SafetySignal[]
  violations: ScopeViolation[]
  /** If safe === false, no further pipeline processing occurs */
  blockPipeline: boolean
  /** Forced coaching response if pipeline is blocked */
  forcedResponse?: string
}

// ─── Emergency Protocol ───────────────────────────────────────────────────────

export interface EmergencyResponse {
  triggered: boolean
  signalType?: SafetySignalType
  /** The exact message the coach must deliver */
  message: string
  resources: Array<{
    name: string
    description: string
    /** e.g. "Call 112", "Text HOME to 741741" */
    action: string
  }>
  /** Once triggered, no fitness content in this session */
  sessionLocked: boolean
}
