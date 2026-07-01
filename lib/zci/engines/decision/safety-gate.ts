/**
 * lib/zci/engines/decision/safety-gate.ts
 *
 * Safety Gate — hard-coded, pre-pipeline safety check.
 * This runs BEFORE any coaching logic.
 * It can STOP the pipeline entirely.
 *
 * Safety rules are structural. Not configurable. Cannot be overridden.
 * Per docs/02-ai-coach-spec.md §10.
 */

import type { UserContext } from '../../types/context'
import type { SafetyCheckResult, SafetySignal, EmergencyResponse } from '../../types/safety'
import { CALORIC_SAFETY_FLOORS } from '../../types/safety'

/**
 * Checks the UserContext for safety signals before the pipeline runs.
 * Returns a SafetyCheckResult that can block the pipeline.
 */
export function runSafetyGate(ctx: UserContext): SafetyCheckResult {
  const signals: SafetySignal[] = []

  // ─── Check 1: Caloric Floor ────────────────────────────────────────────────
  // (Will be relevant once users log nutrition — checked here for architecture)
  // Currently a structural placeholder — no intake data at onboarding stage.
  const floor = CALORIC_SAFETY_FLOORS[ctx.physical.biologicalSex]
  void floor  // Suppress unused warning — used when nutrition logging is wired

  // ─── Check 2: Injury + High-Intensity Request ─────────────────────────────
  if (ctx.health.hasActiveInjuries && ctx.health.injuredAreas.length > 0) {
    signals.push({
      type: 'training_through_pain',
      level: 'soft_warn',
      trigger: `Active injuries in: ${ctx.health.injuredAreas.join(', ')}`,
      requiredResponse: 'Movement patterns affecting injured areas will be excluded from programming.',
      permanentLog: true,
      includeReferral: false,
    })
  }

  // ─── Check 3: Body Composition Extremes ───────────────────────────────────
  // BMI under 17.5 is a clinical concern
  if (ctx.physical.bmi > 0 && ctx.physical.bmi < 17.5) {
    signals.push({
      type: 'extreme_restriction',
      level: 'hard_block',
      trigger: `BMI ${ctx.physical.bmi.toFixed(1)} is below clinical safety threshold (17.5)`,
      requiredResponse: 'This BMI level requires medical supervision before beginning an exercise or nutrition program. Please consult a healthcare professional.',
      permanentLog: true,
      includeReferral: true,
      referralCategory: 'medical',
    })
  }

  const emergencySignals = signals.filter((s) => s.level === 'emergency')
  const hardBlockSignals = signals.filter((s) => s.level === 'hard_block')

  const blockPipeline = emergencySignals.length > 0 || hardBlockSignals.length > 0

  const forcedResponse = blockPipeline
    ? buildForcedResponse(signals)
    : undefined

  return {
    safe: !blockPipeline,
    signals,
    violations: [],
    blockPipeline,
    forcedResponse,
  }
}

/**
 * Creates the EmergencyResponse structure for emergency-level signals.
 */
export function buildEmergencyResponse(signal: SafetySignal): EmergencyResponse {
  return {
    triggered: true,
    signalType: signal.type,
    message: signal.requiredResponse,
    resources: signal.includeReferral
      ? getEmergencyResources(signal.referralCategory)
      : [],
    sessionLocked: signal.level === 'emergency',
  }
}

function buildForcedResponse(signals: SafetySignal[]): string {
  const highest = signals.find((s) => s.level === 'emergency') ?? signals[0]
  return highest.requiredResponse
}

function getEmergencyResources(
  category: SafetySignal['referralCategory']
): EmergencyResponse['resources'] {
  const resources: Record<NonNullable<SafetySignal['referralCategory']>, EmergencyResponse['resources']> = {
    medical: [
      { name: 'Emergency Services', description: 'For immediate medical emergencies', action: 'Call your local emergency number' },
      { name: 'General Practitioner', description: 'For non-emergency health concerns', action: 'Book an appointment with your doctor' },
    ],
    mental_health: [
      { name: 'Crisis Text Line', description: 'Free 24/7 mental health crisis support', action: 'Text HOME to 741741' },
      { name: 'International Association for Suicide Prevention', description: 'Crisis centre directory', action: 'Visit https://www.iasp.info/resources/Crisis_Centres/' },
    ],
    physiotherapy: [
      { name: 'Registered Physiotherapist', description: 'For musculoskeletal injury assessment', action: 'Book a physiotherapy consultation' },
    ],
    dietitian: [
      { name: 'Registered Dietitian', description: 'For clinical nutrition guidance', action: 'Consult a registered dietitian or nutritionist' },
    ],
  }

  return category ? resources[category] ?? [] : []
}
