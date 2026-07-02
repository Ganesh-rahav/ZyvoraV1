/**
 * lib/cee/cee-assembler.ts
 *
 * CEEAssembler — the core of the Coaching Experience Engine.
 *
 * Takes:
 *   - CoachingOutput (from ZCI pipeline)
 *   - UserContext    (assembled onboarding + physique data)
 *   - PhysiqueModel  (optional, from PIE Sprint 5A)
 *
 * Produces:
 *   - CoachingSession — the complete, formatted coaching experience
 *
 * CEE does NOT reason. It formats.
 * Every string comes from ZCI decisions, filtered through the LanguageEngine.
 */

import type { CoachingOutput, Recommendation } from '@/lib/zci/types/recommendation'
import type { UserContext } from '@/lib/zci/types/context'
import type { PhysiqueModel } from '@/lib/pie/types/model'
import type {
  CoachingSession,
  GreetingSection,
  FoundationSection,
  FoundationStrength,
  FocusSection,
  FocusArea,
  ReasoningSection,
  ReasoningItem,
  BaselineSection,
  BaselineMetric,
  ParticipationSection,
  SessionConfidence,
} from './types/session'
import {
  sanitiseCoachVoice,
  buildGreetingOpener,
  buildContextSetter,
  buildSessionIntent,
  buildCoachingStatement,
  buildCaveat,
  buildForwardStatement,
  buildHonestAcknowledgement,
  buildFoundationHeadline,
  buildWhyNow,
  buildWhyFirst,
} from './language-engine'
import {
  toSessionConfidence,
  computeSessionConfidence,
} from './confidence-filter'

// ─── ID helper ────────────────────────────────────────────────────────────────

let _idCount = 0
function ceeId(prefix: string): string {
  return `${prefix}_${Date.now()}_${(++_idCount).toString(36)}`
}

// ─── Main assembler ───────────────────────────────────────────────────────────

export function assembleCEESession(
  output: CoachingOutput,
  ctx: UserContext,
  pieModel?: PhysiqueModel
): CoachingSession {
  // personality is passed through ctx to sub-assemblers
  const firstName = ctx.onboarding.firstName ?? 'there'
  const recommendations = output.recommendations.slice(0, 3)

  // ─── Confidence mapping ────────────────────────────────────────────────────
  const confidenceLevels = recommendations.map((r) => toSessionConfidence(r.confidence))
  const overallConfidence = computeSessionConfidence(confidenceLevels)

  // ─── Section 1: Greeting ──────────────────────────────────────────────────
  const greeting = assembleGreeting(ctx, overallConfidence, recommendations[0])

  // ─── Section 2: Foundation ────────────────────────────────────────────────
  const foundation = assembleFoundation(ctx, pieModel)

  // ─── Section 3: Focus areas ───────────────────────────────────────────────
  const focus = assembleFocus(recommendations, ctx, confidenceLevels)

  // ─── Section 4: Reasoning ────────────────────────────────────────────────
  const reasoning = assembleReasoning(recommendations, ctx, confidenceLevels)

  // ─── Section 5: Baseline ─────────────────────────────────────────────────
  const baseline = assembleBaseline(ctx, pieModel)

  // ─── Section 6: Participation ─────────────────────────────────────────────
  const participation = assembleParticipation()

  return {
    id: ceeId('session'),
    generatedAt: new Date().toISOString(),
    firstName,
    greeting,
    foundation,
    focus,
    reasoning,
    baseline,
    participation,
    overallConfidence,
    safetyNotices: output.safetyNotices,
    emergencyTriggered: output.emergencyTriggered,
    participationResponse: null,
    participationNotes: undefined,
  }
}

// ─── Section assemblers ───────────────────────────────────────────────────────

function assembleGreeting(
  ctx: UserContext,
  overallConfidence: SessionConfidence,
  topRecommendation?: Recommendation
): GreetingSection {
  const firstName = ctx.onboarding.firstName ?? 'there'
  const personality = ctx.coach.personality
  const primaryGoal = ctx.goals.primaryGoal

  return {
    openingLine: buildGreetingOpener(firstName, personality),
    contextSetter: buildContextSetter(primaryGoal, ctx.physique.hasPhotos, overallConfidence),
    sessionIntent: buildSessionIntent(topRecommendation?.priorityId ? topRecommendation.headline : undefined),
  }
}

function assembleFoundation(ctx: UserContext, pieModel?: PhysiqueModel): FoundationSection {
  const strengths: FoundationStrength[] = []

  // ── Evidence-backed strengths from PIE model ──────────────────────────────
  if (pieModel) {
    // Structural strengths
    const { muscleDevelopment, posture, trainingIndicator, symmetry } = pieModel

    if (muscleDevelopment.notableStrengths.length > 0) {
      const topStrength = muscleDevelopment.notableStrengths[0]!
      const obs = muscleDevelopment.groups[topStrength]
      if (obs && obs.confidence !== 'unknown') {
        strengths.push({
          id: ceeId('str'),
          label: obs.label,
          evidenceStatement: `Observed as a relative strength across your physique assessment (${obs.rawScore.toFixed(1)}/10).`,
          icon: 'muscle',
        })
      }
    }

    if (symmetry.overallScore >= 0.85 && symmetry.leftRight.confidence !== 'unknown') {
      strengths.push({
        id: ceeId('str'),
        label: 'Bilateral symmetry',
        evidenceStatement: `Your left/right balance scores in the upper ${Math.round((1 - symmetry.overallScore) * 100)}% — this is a structural advantage.`,
        icon: 'structure',
      })
    }

    if (trainingIndicator.visualProfile.value === 'athletic' || trainingIndicator.visualProfile.value === 'bodybuilder') {
      strengths.push({
        id: ceeId('str'),
        label: 'Training history visible',
        evidenceStatement: `Visual indicators suggest a background of consistent training — that foundation is yours to build on.`,
        icon: 'consistency',
      })
    }

    if (posture.notablePatterns.length === 0 && posture.headPosition.confidence !== 'unknown') {
      strengths.push({
        id: ceeId('str'),
        label: 'Postural alignment',
        evidenceStatement: 'No significant postural concerns detected from available views — a solid structural baseline.',
        icon: 'structure',
      })
    }
  }

  // ── Lifestyle/recovery strengths from context ─────────────────────────────
  if (ctx.lifestyle.recoveryScore >= 70) {
    strengths.push({
      id: ceeId('str'),
      label: 'Recovery capacity',
      evidenceStatement: `Your recovery indicators — sleep, stress, and energy — are in a range that supports consistent training adaptation.`,
      icon: 'recovery',
    })
  }

  if (ctx.lifestyle.sleepQuality >= 4) {
    strengths.push({
      id: ceeId('str'),
      label: 'Sleep quality',
      evidenceStatement: `You rated your sleep quality at ${ctx.lifestyle.sleepQuality}/5 — quality sleep is one of the most underrated performance factors, and you're in a good position here.`,
      icon: 'recovery',
    })
  }

  // ── Nutrition strengths ───────────────────────────────────────────────────
  if (ctx.nutrition.cookingConfidence >= 3 && ctx.nutrition.mealFrequency >= 3) {
    strengths.push({
      id: ceeId('str'),
      label: 'Nutritional consistency',
      evidenceStatement: `With ${ctx.nutrition.mealFrequency} meals per day and solid cooking confidence, you have the habits needed to support your training.`,
      icon: 'nutrition',
    })
  }

  // Limit to most meaningful 3 strengths
  const selectedStrengths = strengths.slice(0, 3)
  const noStrengthsFound = selectedStrengths.length === 0

  return {
    headline: buildFoundationHeadline(selectedStrengths.length),
    strengths: selectedStrengths,
    noStrengthsFound,
    honestAcknowledgement: noStrengthsFound
      ? buildHonestAcknowledgement(ctx.physique.hasPhotos)
      : undefined,
  }
}

function assembleFocus(
  recommendations: Recommendation[],
  ctx: UserContext,
  confidenceLevels: SessionConfidence[]
): FocusSection {
  const personality = ctx.coach.personality
  const areas: FocusArea[] = recommendations.map((rec, i) => {
    const conf = confidenceLevels[i] ?? 'low'
    return {
      id: rec.id,
      priorityNumber: (i + 1) as 1 | 2 | 3,
      label: sanitiseCoachVoice(rec.headline.length < 60 ? rec.headline : rec.headline.substring(0, 57) + '…'),
      domain: rec.domain,
      coachingStatement: buildCoachingStatement(rec.domain, rec.headline, personality),
      headline: sanitiseCoachVoice(rec.headline),
      confidence: conf,
      caveat: buildCaveat(conf),
    }
  })

  const primaryGoal = ctx.goals.primaryGoal.replace(/_/g, ' ')

  const introLines: Record<string, string> = {
    '1': `There's one clear starting point for your ${primaryGoal} goal.`,
    '2': `Two areas stand out as the highest-leverage starting points.`,
    '3': `Three areas stand out right now. Addressing these in order gives you the clearest path forward.`,
  }

  return {
    areas,
    introLine: introLines[String(areas.length)] ?? `Here are the priorities that emerged from your review.`,
  }
}

function assembleReasoning(
  recommendations: Recommendation[],
  ctx: UserContext,
  confidenceLevels: SessionConfidence[]
): ReasoningSection {
  const personality = ctx.coach.personality
  const totalPriorities = recommendations.length

  const items: ReasoningItem[] = recommendations.map((rec, i) => {
    const conf = confidenceLevels[i] ?? 'low'
    return {
      focusId: rec.id,
      whyThis: sanitiseCoachVoice(rec.coachingMessage.length > 280
        ? rec.coachingMessage.substring(0, 277) + '…'
        : rec.coachingMessage),
      whyNow: buildWhyNow(rec.headline, rec.whyNow, personality),
      whyFirst: buildWhyFirst(i + 1, totalPriorities),
      caveat: buildCaveat(conf),
    }
  })

  return { items }
}

function assembleBaseline(ctx: UserContext, pieModel?: PhysiqueModel): BaselineSection {
  const metrics: BaselineMetric[] = []

  // ── Self-reported fundamentals (always included) ─────────────────────────
  metrics.push({
    id: ceeId('bm'),
    label: 'Body weight',
    displayValue: `${ctx.physical.currentWeightKg} kg`,
    source: 'self_report',
  })

  if (ctx.physical.heightCm > 0) {
    metrics.push({
      id: ceeId('bm'),
      label: 'Height',
      displayValue: `${ctx.physical.heightCm} cm`,
      source: 'self_report',
    })
  }

  if (ctx.physical.bmi > 0) {
    metrics.push({
      id: ceeId('bm'),
      label: 'BMI',
      displayValue: ctx.physical.bmi.toFixed(1),
      context: 'Derived from height and weight — not a measure of fitness',
      source: 'derived',
    })
  }

  // ── PIE-sourced metrics ─────────────────────────────────────────────────
  if (pieModel) {
    const bf = pieModel.bodyComposition.bodyFat
    if (bf.confidence !== 'unknown') {
      metrics.push({
        id: ceeId('bm'),
        label: 'Estimated body fat',
        displayValue: `${bf.min}–${bf.max}%`,
        context: `Estimated from ${pieModel.input.viewsProvided.length} photo view(s) · ±5–8% accuracy`,
        source: 'pie',
      })
    }

    if (pieModel.muscleDevelopment.averageDevelopmentScore > 0) {
      metrics.push({
        id: ceeId('bm'),
        label: 'Average muscle development',
        displayValue: `${pieModel.muscleDevelopment.averageDevelopmentScore.toFixed(1)} / 10`,
        context: `${pieModel.muscleDevelopment.assessedCount} of 21 muscle groups assessed`,
        source: 'pie',
      })
    }

    if (pieModel.symmetry.overallScore > 0) {
      metrics.push({
        id: ceeId('bm'),
        label: 'Bilateral symmetry',
        displayValue: `${Math.round(pieModel.symmetry.overallScore * 100)}%`,
        context: 'Left/right balance across observed muscle groups',
        source: 'pie',
      })
    }
  } else if (ctx.physical.estimatedBodyFatMin !== undefined && ctx.physical.estimatedBodyFatMax !== undefined) {
    // Fallback: raw vision-only BF estimate
    metrics.push({
      id: ceeId('bm'),
      label: 'Estimated body fat',
      displayValue: `${ctx.physical.estimatedBodyFatMin}–${ctx.physical.estimatedBodyFatMax}%`,
      context: 'Estimated from photo analysis · ±5–8% accuracy',
      source: 'pie',
    })
  }

  // ── Recovery baseline ──────────────────────────────────────────────────────
  metrics.push({
    id: ceeId('bm'),
    label: 'Recovery score',
    displayValue: `${ctx.lifestyle.recoveryScore} / 100`,
    context: `Derived from sleep (${ctx.lifestyle.sleepQuality}/5), stress (${ctx.lifestyle.stressLevel}/5), energy (${ctx.lifestyle.energyLevel}/5)`,
    source: 'derived',
  })

  const hasPieMetrics = pieModel !== undefined && pieModel.input.viewsProvided.length > 0

  return {
    headline: 'Your starting point',
    anchorStatement: 'This is where we begin. Every future measurement is relative to this.',
    metrics,
    forwardStatement: buildForwardStatement(ctx.goals.weeksRemaining),
    measurementDisclaimer: hasPieMetrics
      ? 'Body composition values are estimated from photographs. For precise measurements, clinical testing (DEXA, hydrostatic weighing) is the gold standard.'
      : undefined,
  }
}

function assembleParticipation(): ParticipationSection {
  return {
    question: 'Do these priorities reflect what you\'re experiencing?',
    subtext: 'Your perspective matters. If something feels off, or if there\'s context I\'m missing, I want to know before we move forward.',
    options: {
      agree: 'Yes, this resonates — let\'s continue',
      adjust: 'Something feels different — let me note it',
      addContext: 'I have additional context to share',
    },
  }
}
