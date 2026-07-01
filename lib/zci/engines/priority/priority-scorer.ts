/**
 * lib/zci/engines/priority/priority-scorer.ts
 *
 * Priority scoring — computes the 5-factor score for each opportunity.
 *
 * Score = weighted sum of:
 *   Impact × GoalAlignment × Confidence × Feasibility × Urgency
 *
 * All factors normalised to 0–100.
 */

import type { Observation } from '../../types/observation'
import type { PriorityScore, ImpactDomain } from '../../types/priority'
import type { UserContext } from '../../types/context'
import type { ConfidenceMap } from '../confidence/confidence-engine'
import type { EvidenceCollection } from '../../types/evidence'
import { CONFIDENCE_SCORES } from '../../types/confidence'
import { aggregateConfidence } from '../confidence/confidence-rules'
import { ZCI_CONFIG } from '../../config'

// ─── Domain Impact Baseline ───────────────────────────────────────────────────
// How impactful is addressing something in this domain? 0–100 baseline.

const DOMAIN_IMPACT_BASELINE: Record<ImpactDomain, number> = {
  physique_transformation: 85,
  nutrition_metabolism:    80,
  recovery_health:         75,
  adherence_behaviour:     70,
  strength_performance:    65,
  injury_prevention:       60,
  lifestyle_integration:   55,
}

// ─── Category → Domain Mapping ────────────────────────────────────────────────

const CATEGORY_TO_DOMAIN: Record<string, ImpactDomain> = {
  physique:        'physique_transformation',
  performance:     'strength_performance',
  nutrition:       'nutrition_metabolism',
  recovery:        'recovery_health',
  lifestyle:       'lifestyle_integration',
  psychological:   'adherence_behaviour',
  goal_alignment:  'adherence_behaviour',
}

// ─── Goal Alignment Scores ────────────────────────────────────────────────────

function computeGoalAlignment(obs: Observation, ctx: UserContext): number {
  const goal = ctx.goals.primaryGoal

  const alignmentMatrix: Record<string, Record<string, number>> = {
    lose_fat: {
      physique:      70,
      nutrition:     95,
      recovery:      75,
      performance:   50,
      lifestyle:     80,
      goal_alignment: 85,
      psychological:  80,
    },
    build_muscle: {
      physique:      95,
      nutrition:     90,
      recovery:      85,
      performance:   90,
      lifestyle:     60,
      goal_alignment: 85,
      psychological:  70,
    },
    recomposition: {
      physique:      90,
      nutrition:     90,
      recovery:      80,
      performance:   80,
      lifestyle:     70,
      goal_alignment: 85,
      psychological:  75,
    },
    build_strength: {
      physique:      60,
      nutrition:     80,
      recovery:      85,
      performance:   95,
      lifestyle:     65,
      goal_alignment: 85,
      psychological:  70,
    },
    improve_health: {
      physique:      60,
      nutrition:     85,
      recovery:      90,
      performance:   65,
      lifestyle:     90,
      goal_alignment: 80,
      psychological:  80,
    },
  }

  return alignmentMatrix[goal]?.[obs.category] ?? 65
}

// ─── Feasibility Score ────────────────────────────────────────────────────────

function computeFeasibility(obs: Observation, ctx: UserContext): number {
  let score = 80 // Base feasibility

  // Reduce if injured and this is a physique observation
  if (ctx.health.hasActiveInjuries && obs.category === 'physique') {
    score -= 15
  }

  // Reduce if low training availability
  if (ctx.training.daysPerWeekAvailable < 3) {
    score -= 10
  }

  // Reduce if beginner — some observations need baseline fitness first
  if (ctx.training.experienceLevel === 'beginner' && obs.category === 'performance') {
    score -= 10
  }

  // Boost if equipment available
  const hasFullEquipment =
    ctx.training.gymEquipment.length >= 3 || ctx.training.homeEquipment.length >= 3
  if (hasFullEquipment) score += 10

  return Math.max(0, Math.min(100, score))
}

// ─── Urgency Score ────────────────────────────────────────────────────────────

function computeUrgency(obs: Observation, ctx: UserContext): number {
  let urgency = 0

  // Injuries dramatically increase urgency of recovery observations
  if (ctx.health.hasActiveInjuries && obs.category === 'recovery') urgency = 90

  // Critical recovery deficit
  if (ctx.lifestyle.recoveryScore < 40 && obs.category === 'recovery') urgency = 80

  // Very short timeline increases urgency on all opportunity observations
  if (ctx.goals.weeksRemaining !== null && ctx.goals.weeksRemaining < 8) {
    urgency = Math.max(urgency, 60)
  }

  return urgency
}

// ─── Main Scorer ──────────────────────────────────────────────────────────────

export function scoreObservation(
  obs: Observation,
  evidenceCollection: EvidenceCollection,
  _confidenceMap: ConfidenceMap,
  ctx: UserContext
): { score: PriorityScore; domain: ImpactDomain } {
  const domain = CATEGORY_TO_DOMAIN[obs.category] ?? 'lifestyle_integration'
  const weights = ZCI_CONFIG.priority.scoreWeights

  // Impact — from domain baseline + development status modifier
  const domainImpact = DOMAIN_IMPACT_BASELINE[domain]
  const developmentModifier =
    obs.developmentStatus === 'underdeveloped' ? 15 :
    obs.developmentStatus === 'well_developed' ? -20 : 0
  const impact = Math.min(100, domainImpact + developmentModifier)

  // Confidence — from evidence confidence scores
  const supportingEvidence = evidenceCollection.items.filter((e) =>
    obs.supportingEvidenceIds.includes(e.id)
  )
  const confAssessment = aggregateConfidence(supportingEvidence)
  const confidence = Math.round(CONFIDENCE_SCORES[confAssessment.level] * 100)

  // Goal alignment
  const goalAlignment = computeGoalAlignment(obs, ctx)

  // Feasibility
  const feasibility = computeFeasibility(obs, ctx)

  // Urgency
  const urgency = computeUrgency(obs, ctx)

  // Composite score (weighted)
  const total = Math.round(
    impact        * weights.impact        +
    confidence    * weights.confidence    +
    goalAlignment * weights.goalAlignment +
    feasibility   * weights.feasibility   +
    urgency       * weights.urgency
  )

  return {
    score: { total: Math.min(100, total), breakdown: { impact, confidence, goalAlignment, feasibility, urgency } },
    domain,
  }
}
