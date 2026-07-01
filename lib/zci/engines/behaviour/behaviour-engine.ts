/**
 * lib/zci/engines/behaviour/behaviour-engine.ts
 *
 * BehaviourEngine — orchestrates recommendation generation from strategy + priorities.
 * The final step before output formatting.
 */

import type { CoachingOutput } from '../../types/recommendation'
import type { CoachingStrategy } from '../../types/decision'
import type { PriorityRanking } from '../../types/priority'
import type { UserContext } from '../../types/context'
import type { ReasoningStep } from '../../types/reasoning'
import { buildRecommendations } from './action-planner'
import { ZCI_CONFIG } from '../../config'

export function runBehaviourEngine(
  priorityRanking: PriorityRanking,
  strategy: CoachingStrategy,
  ctx: UserContext,
  pipelineStartMs: number
): { output: CoachingOutput; step: ReasoningStep } {
  const startMs = Date.now()

  const recommendations = buildRecommendations(
    priorityRanking.selectedPriorities,
    strategy,
    ctx
  )

  const sessionOpeningMessage = buildSessionOpeningMessage(priorityRanking, strategy, ctx)

  const output: CoachingOutput = {
    sessionId: ctx.sessionId,
    generatedAt: new Date().toISOString(),
    recommendations,
    strategyId: ctx.sessionId,
    sessionOpeningMessage,
    safetyNotices: strategy.training.contraindicated.length > 0
      ? [`Movement modifications applied due to ${ctx.health.injuredAreas.join(', ')} injury history.`]
      : [],
    emergencyTriggered: false,
    meta: {
      pipelineVersion: ZCI_CONFIG.pipelineVersion,
      totalPrioritiesIdentified: priorityRanking.totalOpportunities,
      totalRecommendationsGenerated: recommendations.length,
      processingMs: Date.now() - pipelineStartMs,
    },
  }

  const step: ReasoningStep = {
    step: 'recommendations_generated',
    completedAt: new Date().toISOString(),
    durationMs: Date.now() - startMs,
    keyFindings: [
      `${recommendations.length} recommendations generated`,
      ...recommendations.map((r, i) => `#${i + 1}: "${r.headline}"`),
    ],
    decisions: [
      'Recommendations ordered by priority rank',
      'Each recommendation includes action steps, expected benefit, and alternatives',
    ],
    assumptions: [
      'Coaching language calibrated to user coaching personality preference',
      'Recommendations are opening guidance — they evolve with weekly check-ins',
    ],
    pivoted: false,
  }

  return { output, step }
}

function buildSessionOpeningMessage(
  priorityRanking: PriorityRanking,
  strategy: CoachingStrategy,
  ctx: UserContext
): string {
  const firstName = ctx.onboarding.firstName ?? 'there'
  const goal = ctx.goals.primaryGoal.replace('_', ' ')
  const topPriority = priorityRanking.selectedPriorities[0]
  const phase = strategy.training.phase

  if (!topPriority) {
    return `Welcome, ${firstName}. Your profile is looking good and your foundations are solid. Let's start building your plan.`
  }

  return `${firstName}, I've reviewed everything you've shared. You're in a good position to make real progress on your ${goal} goal. There are a few clear areas where focused effort will make the biggest difference — the most important one right now is ${topPriority.label.toLowerCase()}. We're entering a ${phase} phase, and that's exactly the right context to address this. Here's what I want to focus on with you over the next ${strategy.recommendedCycleLengthWeeks} weeks.`
}
