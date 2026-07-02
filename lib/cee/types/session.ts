/**
 * lib/cee/types/session.ts
 *
 * CoachingSession — the complete, formatted coaching experience.
 *
 * CEE consumes CoachingOutput (from ZCI) and produces a CoachingSession
 * that the UI renders as the first coaching interaction.
 *
 * CoachingSession is NOT raw data — it is formatted, voice-calibrated,
 * and confidence-filtered content ready to be shown to the user.
 *
 * CEE rule: The user never reads an AI report. They hear a coach.
 */

// ─── Voice / Confidence ───────────────────────────────────────────────────────

export type SessionConfidence = 'high' | 'moderate' | 'low'

export interface ConfidenceCaveat {
  text: string
  isTransparent: boolean
}

// ─── Section 1 — Greeting ─────────────────────────────────────────────────────

export interface GreetingSection {
  /** e.g. "I've finished reviewing everything you've shared." */
  openingLine: string
  /** One-sentence context setter. No hype. */
  contextSetter: string
  /** What the user can expect from this session */
  sessionIntent: string
}

// ─── Section 2 — Foundation ───────────────────────────────────────────────────

export interface FoundationStrength {
  id: string
  label: string
  /** One-line evidence statement. Must be grounded — never invented. */
  evidenceStatement: string
  /** Icon key for UI rendering */
  icon: 'muscle' | 'recovery' | 'consistency' | 'nutrition' | 'structure' | 'habit'
}

export interface FoundationSection {
  headline: string
  strengths: FoundationStrength[]
  /** True when there are no clear evidence-backed strengths */
  noStrengthsFound: boolean
  /** Shown when noStrengthsFound is true — honest, never deflating */
  honestAcknowledgement?: string
}

// ─── Section 3 — Focus Areas ─────────────────────────────────────────────────

export interface FocusArea {
  id: string
  /** 1 | 2 | 3 */
  priorityNumber: 1 | 2 | 3
  /** Short coaching label e.g. "Upper Chest Development" */
  label: string
  /** The domain this belongs to */
  domain: string
  /**
   * Single coaching statement.
   * Formatted in coach voice — not a report line.
   * e.g. "This is where focused effort will make the most visible difference."
   */
  coachingStatement: string
  /** From ZCI recommendation */
  headline: string
  /** Confidence of this priority */
  confidence: SessionConfidence
  caveat?: ConfidenceCaveat
}

export interface FocusSection {
  /** Always: max 3 */
  areas: FocusArea[]
  /** Intro line before the priority list */
  introLine: string
}

// ─── Section 4 — Reasoning ────────────────────────────────────────────────────

export interface ReasoningItem {
  focusId: string
  /** Why this priority? */
  whyThis: string
  /** Why right now? */
  whyNow: string
  /** Why before the other areas? */
  whyFirst: string
  /** Confidence caveat if applicable */
  caveat?: ConfidenceCaveat
}

export interface ReasoningSection {
  items: ReasoningItem[]
}

// ─── Section 5 — Baseline ─────────────────────────────────────────────────────

export interface BaselineMetric {
  id: string
  label: string
  /** Formatted display value e.g. "14–18%" or "5.8 / 10" */
  displayValue: string
  /** Optional context line e.g. "Estimated from 2 photos" */
  context?: string
  /** Source: 'pie' | 'self_report' | 'derived' */
  source: 'pie' | 'self_report' | 'derived'
}

export interface BaselineSection {
  headline: string
  /** "This is your starting point." */
  anchorStatement: string
  metrics: BaselineMetric[]
  forwardStatement: string
  /** Disclaimer shown when source is 'pie' */
  measurementDisclaimer?: string
}

// ─── Section 6 — Participation ────────────────────────────────────────────────

export type ParticipationResponse = 'agree' | 'adjust' | 'add_context' | null

export interface ParticipationSection {
  /** The question posed to the user */
  question: string
  /** Sub-text below the question */
  subtext: string
  options: {
    agree: string
    adjust: string
    addContext: string
  }
}

// ─── Complete Coaching Session ────────────────────────────────────────────────

export interface CoachingSession {
  id: string
  generatedAt: string
  firstName: string
  greeting: GreetingSection
  foundation: FoundationSection
  focus: FocusSection
  reasoning: ReasoningSection
  baseline: BaselineSection
  participation: ParticipationSection
  /** Overall confidence of the session's content */
  overallConfidence: SessionConfidence
  /** Any non-blocking safety notices */
  safetyNotices: string[]
  /** Whether a safety block was triggered (pipeline blocked) */
  emergencyTriggered: boolean
  /** User's response to the participation section */
  participationResponse: ParticipationResponse
  participationNotes?: string
}
