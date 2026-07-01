/**
 * lib/zci/engines/observation/observation-engine.ts
 *
 * ObservationEngine — orchestrates all observers and produces ObservationSet.
 */

import type { ObservationSet } from '../../types/observation'
import type { EvidenceCollection } from '../../types/evidence'
import type { ConfidenceMap } from '../confidence/confidence-engine'
import type { UserContext } from '../../types/context'
import type { ReasoningStep } from '../../types/reasoning'
import { generateBodyObservations } from './body-observer'
import { generateLifestyleObservations } from './lifestyle-observer'
import { ObservationError } from '../../errors'

const BODY_REGIONS_TRACKED = 20 // From BodyRegion union length

export function runObservationEngine(
  collection: EvidenceCollection,
  confidenceMap: ConfidenceMap,
  ctx: UserContext
): { observationSet: ObservationSet; step: ReasoningStep } {
  const startMs = Date.now()

  try {
    const bodyObs = generateBodyObservations(collection.items, confidenceMap, ctx)
    const lifestyleObs = generateLifestyleObservations(collection.items, confidenceMap, ctx)

    const allObs = [...bodyObs, ...lifestyleObs]
    const strengths = allObs.filter((o) => o.isStrength)
    const opportunities = allObs.filter((o) => o.isOpportunity)

    // Physique coverage: unique body regions observed
    const regionsObserved = new Set(
      allObs.filter((o) => o.bodyRegion).map((o) => o.bodyRegion)
    ).size
    const physiqueConverage = Math.round((regionsObserved / BODY_REGIONS_TRACKED) * 100)

    const observationSet: ObservationSet = {
      sessionId: ctx.sessionId,
      observations: allObs,
      strengths,
      opportunities,
      totalObservations: allObs.length,
      physiqueConverage,
    }

    const step: ReasoningStep = {
      step: 'observations_generated',
      completedAt: new Date().toISOString(),
      durationMs: Date.now() - startMs,
      keyFindings: [
        `${allObs.length} total observations`,
        `${strengths.length} strengths identified`,
        `${opportunities.length} opportunities identified`,
        `Physique coverage: ${physiqueConverage}%`,
      ],
      decisions: [
        'Observations separated into strengths and opportunities for priority engine',
      ],
      assumptions: [
        'Each observation references at least one evidence item',
        'Strength vs opportunity classification based on development status and score thresholds',
      ],
      pivoted: false,
    }

    return { observationSet, step }
  } catch (err) {
    throw new ObservationError('Observation engine failed', { cause: String(err) })
  }
}
