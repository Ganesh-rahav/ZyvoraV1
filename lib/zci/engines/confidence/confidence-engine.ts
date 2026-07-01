/**
 * lib/zci/engines/confidence/confidence-engine.ts
 *
 * ConfidenceEngine — applies confidence rules to a full EvidenceCollection.
 * Returns an evidence-indexed confidence map used by downstream engines.
 */

import type { EvidenceCollection } from '../../types/evidence'
import type { ConfidenceAssessment } from '../../types/confidence'
import type { ReasoningStep } from '../../types/reasoning'
import { assessEvidenceConfidence } from './confidence-rules'

export type ConfidenceMap = Map<string, ConfidenceAssessment>

export function runConfidenceEngine(
  collection: EvidenceCollection
): { confidenceMap: ConfidenceMap; step: ReasoningStep } {
  const startMs = Date.now()
  const confidenceMap: ConfidenceMap = new Map()

  let highCount = 0
  let moderateCount = 0
  let lowCount = 0
  let unknownCount = 0

  for (const item of collection.items) {
    const assessment = assessEvidenceConfidence(item)
    confidenceMap.set(item.id, assessment)

    switch (assessment.level) {
      case 'high':     highCount++;     break
      case 'moderate': moderateCount++; break
      case 'low':      lowCount++;      break
      case 'unknown':  unknownCount++;  break
    }
  }

  const step: ReasoningStep = {
    step: 'confidence_assessed',
    completedAt: new Date().toISOString(),
    durationMs: Date.now() - startMs,
    keyFindings: [
      `${highCount} high-confidence items`,
      `${moderateCount} moderate-confidence items`,
      `${lowCount} low-confidence items`,
      `${unknownCount} unknown-confidence items`,
    ],
    decisions: [],
    assumptions: [
      'Source reliability values are fixed constants — not dynamically calibrated yet',
      'All self-reports are treated as equally reliable',
    ],
    pivoted: false,
  }

  return { confidenceMap, step }
}
