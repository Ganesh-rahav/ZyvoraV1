/**
 * lib/zci/engines/decision/decision-engine.ts
 *
 * DecisionEngine — orchestrates safety, strategy, and recommendation generation.
 * This is the final reasoning step before text generation.
 */

import type { CoachingStrategy } from '../../types/decision'
import type { PriorityRanking } from '../../types/priority'
import type { UserContext } from '../../types/context'
import type { ReasoningStep } from '../../types/reasoning'
import { buildCoachingStrategy } from './coaching-strategy'
import { DecisionEngineError } from '../../errors'

export function runDecisionEngine(
  priorityRanking: PriorityRanking,
  ctx: UserContext
): { strategy: CoachingStrategy; step: ReasoningStep } {
  const startMs = Date.now()

  try {
    const strategy = buildCoachingStrategy(priorityRanking, ctx)

    const step: ReasoningStep = {
      step: 'decision_made',
      completedAt: new Date().toISOString(),
      durationMs: Date.now() - startMs,
      keyFindings: [
        `Training phase: ${strategy.training.phase}`,
        `Caloric balance: ${strategy.nutrition.caloricBalance}`,
        `Recovery limiting: ${strategy.recovery.isRecoveryLimiting}`,
        `Volume modification: ${strategy.recovery.volumeModification}`,
        `Predicted adherence: ${Math.round(strategy.behaviour.predictedAdherenceProbability * 100)}%`,
        `Cycle length: ${strategy.recommendedCycleLengthWeeks} weeks`,
      ],
      decisions: [
        `Training focus: ${strategy.training.primaryMuscleGroups.join(', ')}`,
        `Nutrition: ${strategy.nutrition.caloricBalance} (${strategy.nutrition.dailyCaloriesMin}–${strategy.nutrition.dailyCaloriesMax} kcal)`,
        `Protein target: ${strategy.nutrition.proteinGramsPerKg}g/kg`,
        strategy.training.contraindicated.length > 0
          ? `Contraindicated movements identified: ${strategy.training.contraindicated.length}`
          : 'No movement contraindications',
      ],
      assumptions: strategy.assumptions,
      pivoted: false,
    }

    return { strategy, step }
  } catch (err) {
    throw new DecisionEngineError('Decision engine failed', { cause: String(err) })
  }
}
