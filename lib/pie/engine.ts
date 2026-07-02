/**
 * lib/pie/engine.ts
 *
 * PIEEngine — the complete Physique Intelligence Engine orchestrator.
 *
 * PIE = Eyes. ZCI = Brain. Coach = Voice.
 *
 * This engine:
 * 1. Validates input quality
 * 2. Runs all 8 analyzers in dependency order
 * 3. Produces a complete PhysiqueModel
 * 4. Generates a PhysiqueBaseline for progress tracking
 *
 * PIE never coaches.
 * PIE never recommends.
 * PIE never generates user-facing text.
 * PIE only observes.
 */

import type { PhysiqueAnalysis } from '@/lib/ai/types/vision'
import type { PhysiqueModel, PIEInputSummary, PIEMeta, ViewType } from './types/model'
import type { PhysiqueBaseline, BaselineKeyMetrics } from './types/baseline'
import { analyzeBodyComposition } from './analyzers/body-composition'
import { analyzeMuscleGroups } from './analyzers/muscle-group'
import { analyzeSymmetry } from './analyzers/symmetry'
import { analyzeFrame } from './analyzers/frame'
import { analyzePosture } from './analyzers/posture'
import { analyzeTrainingIndicators } from './analyzers/training-indicator'
import { analyzePotential } from './analyzers/potential'
import { analyzeSafety } from './analyzers/safety'
import { PIE_CONFIG } from './config'
import { PIEEngineError, PIEInsufficientDataError, toPIEError } from './errors'
import { avg } from './analyzers/utils'

// ─── PIE Input ────────────────────────────────────────────────────────────────

export interface PIEInput {
  analyses: Partial<Record<'front' | 'side' | 'back', PhysiqueAnalysis>>
  /** From onboarding */
  heightCm: number
  /** From onboarding */
  biologicalSex: 'male' | 'female'
  /** User ID for baseline persistence */
  userId: string
  /** ZCI session ID */
  sessionId: string
}

// ─── ID helpers (local — avoids circular import with nanoid) ──────────────────
let _counter = 0
function genId(prefix: string): string {
  return `${prefix}_${Date.now()}_${(++_counter).toString(36)}`
}

// ─── Engine ───────────────────────────────────────────────────────────────────

export async function runPIEEngine(input: PIEInput): Promise<PhysiqueModel> {
  const engineStart = Date.now()
  const analyzerResults: PIEMeta['analyzerResults'] = []

  const { analyses, heightCm, biologicalSex, userId, sessionId } = input
  const views = Object.keys(analyses).filter((k) =>
    ['front', 'side', 'back'].includes(k)
  ) as ViewType[]

  // ─── Validate Input ─────────────────────────────────────────────────────────
  if (views.length === 0) {
    throw new PIEInsufficientDataError('PIEEngine requires at least one PhysiqueAnalysis to proceed.')
  }
  if (heightCm <= 0) {
    throw new PIEInsufficientDataError('Valid heightCm is required for frame and composition analysis.')
  }

  const allAnalyses = views.map((v) => analyses[v]!).filter(Boolean) as PhysiqueAnalysis[]
  const avgQuality = avg(allAnalyses.map((a) => a.imageQuality.overallScore))
  const qualitySufficient = avgQuality >= PIE_CONFIG.quality.sufficientQualityScore
  const qualityIssues = allAnalyses.flatMap((a) => a.imageQuality.warnings)

  const inputSummary: PIEInputSummary = {
    viewsProvided: views,
    photoCount: views.length,
    averageImageQuality: Math.round(avgQuality),
    qualitySufficient,
    qualityIssues: [...new Set(qualityIssues)],
  }

  // ─── Overall confidence from quality + view count ─────────────────────────
  const overallConfidence =
    !qualitySufficient ? 'low' :
    views.length >= 3 ? 'high' :
    views.length === 2 ? 'moderate' : 'low'

  // ─── Step 1: Muscle Groups ───────────────────────────────────────────────────
  const muscleDevelopment = await runAnalyzer('muscle-group', analyzerResults, () =>
    analyzeMuscleGroups(analyses)
  )

  // ─── Step 2: Body Composition ─────────────────────────────────────────────
  const bodyComposition = await runAnalyzer('body-composition', analyzerResults, () =>
    analyzeBodyComposition(analyses, biologicalSex)
  )

  // ─── Step 3: Symmetry (depends on muscleDevelopment) ─────────────────────
  const symmetry = await runAnalyzer('symmetry', analyzerResults, () =>
    analyzeSymmetry(analyses, muscleDevelopment)
  )

  // ─── Step 4: Frame ────────────────────────────────────────────────────────
  const frame = await runAnalyzer('frame', analyzerResults, () =>
    analyzeFrame(analyses, heightCm, biologicalSex)
  )

  // ─── Step 5: Posture ──────────────────────────────────────────────────────
  const posture = await runAnalyzer('posture', analyzerResults, () =>
    analyzePosture(analyses)
  )

  // ─── Step 6: Training Indicators (depends on muscleDevelopment) ───────────
  const trainingIndicator = await runAnalyzer('training-indicator', analyzerResults, () =>
    analyzeTrainingIndicators(analyses, muscleDevelopment)
  )

  // ─── Step 7: Potential (depends on frame + muscleDevelopment) ─────────────
  const potential = await runAnalyzer('potential', analyzerResults, () =>
    analyzePotential(frame, muscleDevelopment, views)
  )

  // ─── Step 8: Safety (depends on all above) ────────────────────────────────
  const safety = await runAnalyzer('safety', analyzerResults, () =>
    analyzeSafety(bodyComposition, muscleDevelopment, symmetry, posture, biologicalSex)
  )

  // ─── Build Baseline ───────────────────────────────────────────────────────
  const keyMetrics: BaselineKeyMetrics = {
    estimatedBodyFatMidpoint: bodyComposition.bodyFat.midpoint,
    averageMuscleScore: muscleDevelopment.averageDevelopmentScore,
    symmetryScore: symmetry.overallScore,
    postureConcernCount: posture.notablePatterns.length,
    muscleWeaknessCount: muscleDevelopment.notableWeaknesses.length,
    muscleStrengthCount: muscleDevelopment.notableStrengths.length,
    visualTrainingProfile: trainingIndicator.visualProfile.value as string,
  }

  const baseline: PhysiqueBaseline = {
    id: genId('baseline'),
    sessionId,
    userId,
    capturedAt: new Date().toISOString(),
    photoViews: views,
    viewCount: views.length,
    bodyComposition,
    muscleDevelopment,
    symmetry,
    frame,
    posture,
    trainingIndicator,
    keyMetrics,
  }

  // ─── Build Meta ───────────────────────────────────────────────────────────
  const meta: PIEMeta = {
    pieVersion: PIE_CONFIG.version,
    producedAt: new Date().toISOString(),
    processingMs: Date.now() - engineStart,
    viewsAnalysed: views,
    analyzerResults,
  }

  return {
    id: genId('pie'),
    sessionId,
    userId,
    producedAt: new Date().toISOString(),
    input: inputSummary,
    bodyComposition,
    muscleDevelopment,
    symmetry,
    frame,
    posture,
    trainingIndicator,
    potential,
    safety,
    baseline,
    meta,
    overallConfidence,
  }
}

// ─── Analyzer runner (catches per-analyzer errors, records timing) ─────────────

async function runAnalyzer<T>(
  name: string,
  results: PIEMeta['analyzerResults'],
  fn: () => T | Promise<T>
): Promise<T> {
  const start = Date.now()
  try {
    const result = await fn()
    results.push({ analyzer: name, success: true, durationMs: Date.now() - start })
    return result
  } catch (err) {
    const pieErr = toPIEError(err, name)
    results.push({
      analyzer: name,
      success: false,
      durationMs: Date.now() - start,
      error: pieErr.message,
    })
    throw new PIEEngineError(`Analyzer '${name}' failed: ${pieErr.message}`, pieErr)
  }
}
