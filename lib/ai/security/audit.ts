/**
 * lib/ai/security/audit.ts
 *
 * Audit event logger for the photo analysis pipeline.
 *
 * In production this would emit events to a backend audit service.
 * For now it wraps the existing logger with structured audit context.
 * The AI_CONFIG.features.auditLogging flag gates emission.
 */

import type { AuditEvent, AuditEventType } from '../types/security'
import { AI_CONFIG } from '../config'
import { logger } from '@/lib/logger'

/**
 * Emit a structured audit event.
 * Always includes: eventType, timestamp, sessionId, success.
 */
export function emitAuditEvent(
  eventType: AuditEventType,
  sessionId: string,
  success: boolean,
  overrides: Partial<Omit<AuditEvent, 'eventType' | 'timestamp' | 'sessionId' | 'success'>> = {}
): void {
  const event: AuditEvent = {
    eventType,
    timestamp: new Date().toISOString(),
    sessionId,
    success,
    ...overrides,
  }

  if (!AI_CONFIG.features.auditLogging) {
    // Development: log at debug level only
    logger.debug(`[AUDIT] ${eventType}`, { meta: event as unknown as Record<string, unknown> })
    return
  }

  // Production: emit structured JSON — integrate with audit service here
  logger.info(`[AUDIT] ${eventType}`, {
    operation: eventType,
    status: success ? 'success' : 'failure',
    meta: event as unknown as Record<string, unknown>,
  })
}

/** Helper: build a stable pseudonymous session ID from browser fingerprint */
export function getSessionId(): string {
  if (typeof window === 'undefined') return 'server'
  try {
    const stored = sessionStorage.getItem('zyvora_audit_session')
    if (stored) return stored
    const id = `sess_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
    sessionStorage.setItem('zyvora_audit_session', id)
    return id
  } catch {
    return 'unknown'
  }
}
