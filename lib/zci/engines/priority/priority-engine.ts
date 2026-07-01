/**
 * lib/zci/engines/priority/priority-engine.ts
 *
 * PriorityEngine — ranks all observations and selects top-N.
 *
 * This engine ensures:
 * 1. Users are never overwhelmed
 * 2. Highest-impact priorities are always surfaced first
 * 3. Every priority is explainable
 * 4. Safety-related priorities are always elevated
 */

import type { PriorityRanking, Priority } from '../../types/priority'
import type { ObservationSet, Observation } from '../../types/observation'
import type { EvidenceCollection } from '../../types/evidence'
import type { ConfidenceMap } from '../confidence/confidence-engine'
import type { UserContext } from '../../types/context'
import type { ReasoningStep } from '../../types/reasoning'
import { scoreObservation } from './priority-scorer'
import { ZCI_CONFIG } from '../../config'
import { nanoid } from '../../utils/nanoid'
import { PriorityEngineError } from '../../errors'

export function runPriorityEngine(
  observationSet: ObservationSet,
  evidenceCollection: EvidenceCollection,
  confidenceMap: ConfidenceMap,
  ctx: UserContext
): { priorityRanking: PriorityRanking; step: ReasoningStep } {
  const startMs = Date.now()

  try {
    const { priority: pConfig } = ZCI_CONFIG

    // Only score opportunities — strengths are preserved, not prioritised for change
    const opportunities = observationSet.opportunities

    // Score and build priority items
    const scored: Priority[] = opportunities.map((obs, index) => {
      const { score, domain } = scoreObservation(obs, evidenceCollection, confidenceMap, ctx)

      // Safety-related priorities get urgency multiplier
      const isSafetyRelated = ctx.health.hasActiveInjuries && obs.category === 'recovery'
      const finalTotal = isSafetyRelated
        ? Math.min(100, Math.round(score.total * pConfig.safetyUrgencyMultiplier))
        : score.total

      return {
        id: nanoid('pri'),
        label: buildPriorityLabel(obs),
        description: obs.statement,
        domain,
        observationCategory: obs.category,
        supportingObservationIds: [obs.id],
        score: { ...score, total: finalTotal },
        confidence: obs.confidence,
        rank: index + 1,  // Temporary — will be reassigned after sort
        selected: false,   // Will be set after ranking
        rankingRationale: '',  // Will be set after ranking
      }
    })

    // Sort by total score descending
    scored.sort((a, b) => b.score.total - a.score.total)

    // Assign final ranks
    scored.forEach((p, i) => {
      p.rank = i + 1
      p.rankingRationale = buildRankingRationale(p, i, ctx)
    })

    // Filter below minimum threshold
    const eligible = scored.filter((p) => p.score.total >= pConfig.minimumScoreThreshold)

    // Select top N
    const maxSelected = pConfig.maxSelectedPriorities
    const selected = eligible.slice(0, maxSelected)
    selected.forEach((p) => { p.selected = true })

    const deferred = eligible.slice(maxSelected)
    const selectionRationale = buildSelectionRationale(selected, deferred, ctx)

    const priorityRanking: PriorityRanking = {
      sessionId: ctx.sessionId,
      rankedAt: new Date().toISOString(),
      allPriorities: scored,
      selectedPriorities: selected,
      totalOpportunities: opportunities.length,
      selectionRationale,
    }

    const step: ReasoningStep = {
      step: 'priorities_ranked',
      completedAt: new Date().toISOString(),
      durationMs: Date.now() - startMs,
      keyFindings: [
        `${opportunities.length} opportunities identified`,
        `${eligible.length} met the minimum score threshold`,
        `${selected.length} selected for this coaching cycle`,
        selected.length > 0
          ? `Top priority: "${selected[0].label}" (score: ${selected[0].score.total})`
          : 'No priorities above threshold',
      ],
      decisions: [
        `Selected top ${selected.length} of ${eligible.length} eligible priorities`,
        `${deferred.length} priorities deferred to future cycles`,
      ],
      assumptions: [
        'Priority selection maximises transformation impact given current context',
        'Safety-related priorities receive an urgency multiplier',
      ],
      pivoted: selected.length === 0,
      pivotReason: selected.length === 0
        ? 'No opportunities met the minimum priority threshold — coaching cycle may focus on maintenance'
        : undefined,
    }

    return { priorityRanking, step }
  } catch (err) {
    throw new PriorityEngineError('Priority engine failed', { cause: String(err) })
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildPriorityLabel(obs: Observation): string {
  if (obs.bodyRegion) {
    return obs.bodyRegion.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  }
  return obs.category.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function buildRankingRationale(p: Priority, rank: number, ctx: UserContext): string {
  const factorStrings = [
    `impact ${p.score.breakdown.impact}`,
    `goal alignment ${p.score.breakdown.goalAlignment}`,
    `confidence ${p.score.breakdown.confidence}`,
    `feasibility ${p.score.breakdown.feasibility}`,
  ]

  if (rank === 0) {
    return `Highest overall priority for ${ctx.goals.primaryGoal.replace('_', ' ')} goal. Factors: ${factorStrings.join(', ')}.`
  }
  return `Ranked #${rank + 1} by composite score. Factors: ${factorStrings.join(', ')}.`
}

function buildSelectionRationale(selected: Priority[], deferred: Priority[], ctx: UserContext): string {
  const selectedLabels = selected.map((p) => p.label).join(', ')
  const deferredCount = deferred.length

  return `Selected ${selected.length} highest-impact priorities for the current cycle: ${selectedLabels}. ${
    deferredCount > 0
      ? `${deferredCount} additional opportunities identified but deferred to prevent overwhelm.`
      : ''
  } Selection optimised for ${ctx.goals.primaryGoal.replace('_', ' ')} goal.`
}
