/**
 * lib/zci/engines/evidence/evidence-collector.ts
 *
 * EvidenceCollector — orchestrates all domain-specific collectors.
 * Single entry point for building the complete EvidenceCollection.
 *
 * Sprint 5A: accepts optional PIE PhysiqueModel for richer physique evidence.
 */

import type { EvidenceCollection } from '../../types/evidence'
import type { UserContext } from '../../types/context'
import type { ReasoningStep } from '../../types/reasoning'
import type { PhysiqueModel } from '@/lib/pie/types/model'
import { collectPhysiqueEvidence } from './physique-evidence'
import { collectLifestyleEvidence } from './lifestyle-evidence'
import { collectGoalEvidence } from './goal-evidence'
import { EvidenceCollectionError } from '../../errors'

const TOTAL_CATEGORIES = 12  // From EvidenceCategory union length

export async function collectEvidence(
  ctx: UserContext,
  /** Optional — when provided, uses richer PIE-powered physique evidence */
  pieModel?: PhysiqueModel
): Promise<{ collection: EvidenceCollection; step: ReasoningStep }> {
  const startMs = Date.now()

  try {
    const physiqueItems = collectPhysiqueEvidence(ctx, pieModel)
    const lifestyleItems = collectLifestyleEvidence(ctx)
    const goalItems = collectGoalEvidence(ctx)

    const allItems = [...physiqueItems, ...lifestyleItems, ...goalItems]

    const categoriesCovered = new Set(allItems.map((i) => i.category)).size
    const coveragePercent = Math.round((categoriesCovered / TOTAL_CATEGORIES) * 100)

    const collection: EvidenceCollection = {
      sessionId: ctx.sessionId,
      collectedAt: new Date().toISOString(),
      items: allItems,
      totalCollected: allItems.length,
      coveragePercent,
    }

    const step: ReasoningStep = {
      step: 'evidence_collected',
      completedAt: new Date().toISOString(),
      durationMs: Date.now() - startMs,
      keyFindings: [
        `${allItems.length} evidence items collected across ${categoriesCovered} categories`,
        `Coverage: ${coveragePercent}%`,
        pieModel
          ? `PIE PhysiqueModel used — ${pieModel.meta.viewsAnalysed.length} views, ${pieModel.muscleDevelopment.assessedCount} muscle groups`
          : ctx.physique.hasPhotos
          ? 'Raw vision analysis used (no PIE model)'
          : 'No physique photos — visual assessment unavailable',
      ],
      decisions: [],
      assumptions: ['Self-reported data assumed accurate at time of onboarding'],
      pivoted: false,
    }

    return { collection, step }
  } catch (err) {
    throw new EvidenceCollectionError('Failed to collect evidence', {
      sessionId: ctx.sessionId,
      cause: String(err),
    })
  }
}
