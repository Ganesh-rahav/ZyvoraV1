/**
 * lib/pie/analyzers/posture.ts
 *
 * PostureAnalyzer
 * Evaluates 8 posture dimensions from available views.
 * Best assessed from side view. Front view adds left/right dimensions.
 */

import type { PhysiqueAnalysis } from '@/lib/ai/types/vision'
import type {
  PostureObservation,
  HeadPosition,
  ShoulderRounding,
  ThoracicCurve,
  LumbarPosition,
  PelvicTilt,
  KneeAlignment,
  WeightDistribution,
  StandingSymmetry,
} from '../types/posture'
import type { ViewType } from '../types/model'
import { pieId, now, scoreToConfidence, viewBonus, viewsToSources } from './utils'

type PostureDim<T> = {
  id: string
  observedAt: string
  analyzer: string
  value: T
  confidence: ReturnType<typeof scoreToConfidence>
  visibility: 'clearly_visible' | 'partially_visible' | 'not_visible'
  reason: string
  evidenceSources: ReturnType<typeof viewsToSources>
  needsHumanReview: boolean
  reviewReason?: string
}

// Severity helpers — avoids TS narrowing issue from ternary assignments
function headSeverity(pos: HeadPosition): 'significant' | 'none' {
  return pos === 'moderate_forward_head' || pos === 'severe_forward_head' ? 'significant' : 'none'
}
function shoulderSeverity(rounding: ShoulderRounding): 'significant' | 'none' {
  return rounding === 'moderate_rounding' || rounding === 'severe_rounding' ? 'significant' : 'none'
}
function thoracicSeverity(curve: ThoracicCurve): 'significant' | 'none' {
  return curve === 'moderate_kyphosis' ? 'significant' : 'none'
}
function kneeSeverity(alignment: KneeAlignment): 'significant' | 'none' {
  return alignment === 'moderate_valgus' || alignment === 'moderate_varus' ? 'significant' : 'none'
}

export function analyzePosture(
  analyses: Partial<Record<ViewType, PhysiqueAnalysis>>
): PostureObservation {
  const views = Object.keys(analyses) as ViewType[]
  const sideAnalysis = analyses.side
  const frontAnalysis = analyses.front
  const bonus = viewBonus(views.length)
  const evidenceSources = viewsToSources(views)
  const hasSide = !!sideAnalysis
  const hasFront = !!frontAnalysis

  // Read posture from vision provider
  const postureData = sideAnalysis?.posture ?? frontAnalysis?.posture
  const postureConfScore = postureData?.confidence ?? 0.50
  const postureLabels = postureData?.labels ?? []
  const primaryPattern = postureData?.primaryPattern ?? 'unknown'

  // ─── Head Position ────────────────────────────────────────────────────────
  const headLabel = postureLabels.find((l) =>
    l.includes('forward_head') || l.includes('head')
  )
  const headPos: HeadPosition = !hasSide && !hasFront
    ? 'not_assessable'
    : headLabel?.includes('forward_head')
    ? 'mild_forward_head'
    : 'neutral'

  // ─── Shoulder Rounding ────────────────────────────────────────────────────
  const roundingLabel = postureLabels.find((l) =>
    l.includes('rounded') || l.includes('shoulder')
  )
  const shoulderRound: ShoulderRounding = !hasSide
    ? 'not_assessable'
    : roundingLabel?.includes('rounded')
    ? 'mild_rounding'
    : 'neutral'

  // ─── Thoracic Curve ───────────────────────────────────────────────────────
  const thoracicLabel = postureLabels.find((l) =>
    l.includes('kyphosis') || l.includes('thoracic')
  )
  const thoracicCurve: ThoracicCurve = !hasSide
    ? 'not_assessable'
    : thoracicLabel?.includes('kyphosis')
    ? 'mild_kyphosis'
    : 'normal'

  // ─── Lumbar Position ──────────────────────────────────────────────────────
  const lumbarLabel = postureLabels.find((l) =>
    l.includes('lordosis') || l.includes('lumbar') || l.includes('flat_back')
  )
  const lumbarPos: LumbarPosition = !hasSide
    ? 'not_assessable'
    : lumbarLabel?.includes('lordosis')
    ? 'mild_lordosis'
    : lumbarLabel?.includes('flat')
    ? 'flat_lumbar'
    : 'neutral'

  // ─── Pelvic Tilt ──────────────────────────────────────────────────────────
  const pelvicLabel = postureLabels.find((l) =>
    l.includes('pelvic') || l.includes('anterior') || l.includes('posterior')
  )
  const pelvicTilt: PelvicTilt = !hasSide
    ? 'not_assessable'
    : pelvicLabel?.includes('anterior')
    ? 'anterior_tilt'
    : pelvicLabel?.includes('posterior')
    ? 'posterior_tilt'
    : 'neutral'

  // ─── Knee Alignment ───────────────────────────────────────────────────────
  const kneeLabel = postureLabels.find((l) =>
    l.includes('valgus') || l.includes('varus') || l.includes('knee')
  )
  const kneeAlignment: KneeAlignment = !hasFront
    ? 'not_assessable'
    : kneeLabel?.includes('valgus')
    ? 'mild_valgus'
    : kneeLabel?.includes('varus')
    ? 'mild_varus'
    : 'neutral'

  // ─── Weight Distribution ──────────────────────────────────────────────────
  const weightDist: WeightDistribution = primaryPattern === 'neutral' ? 'balanced' : 'not_assessable'

  // ─── Standing Symmetry ────────────────────────────────────────────────────
  const symLabel = postureLabels.find((l) =>
    l.includes('symmetric') || l.includes('lean') || l.includes('asymmetric')
  )
  const standingSymm: StandingSymmetry = !hasFront
    ? 'not_assessable'
    : symLabel?.includes('asymmetric')
    ? 'compensatory_pattern'
    : 'symmetric'

  // ─── Build all dimensions ─────────────────────────────────────────────────
  function makeDim<T>(
    prefix: string,
    value: T,
    requiresSide: boolean,
    reasonText: string,
    medicalConcern = false
  ): PostureDim<T> {
    const hasRequired = requiresSide ? hasSide : hasFront || hasSide
    const conf = hasRequired ? scoreToConfidence(postureConfScore, bonus) : 'unknown'
    return {
      id: pieId(prefix),
      observedAt: now(),
      analyzer: 'posture',
      value,
      confidence: conf,
      visibility: hasRequired ? 'clearly_visible' : 'not_visible',
      reason: hasRequired ? reasonText : `${requiresSide ? 'Side' : 'Front or side'} view required to assess this dimension.`,
      evidenceSources,
      needsHumanReview: medicalConcern && conf !== 'unknown',
      reviewReason: medicalConcern && conf !== 'unknown'
        ? 'Significant postural deviation detected — recommend physiotherapy assessment'
        : undefined,
    }
  }

  // Derive notable patterns and contraindications using severity helpers
  // (avoids TS narrowing errors from ternary-assigned union values)
  const notablePatterns: string[] = []
  const suggestedContraindications: string[] = []

  if (headSeverity(headPos) === 'significant') {
    notablePatterns.push('Significant forward head posture')
    suggestedContraindications.push('Heavy neck isolation exercises')
  }
  if (shoulderSeverity(shoulderRound) === 'significant') {
    notablePatterns.push('Rounded shoulders observed')
    suggestedContraindications.push('Behind-neck press, upright rows')
  }
  if (thoracicSeverity(thoracicCurve) === 'significant') {
    notablePatterns.push('Increased thoracic kyphosis')
    suggestedContraindications.push('Overhead pressing without thoracic mobility work')
  }
  if (pelvicTilt === 'anterior_tilt') {
    notablePatterns.push('Anterior pelvic tilt observed')
    suggestedContraindications.push('Heavy loaded spinal hyperextension')
  }
  if (kneeSeverity(kneeAlignment) === 'significant') {
    notablePatterns.push('Knee alignment deviation')
    suggestedContraindications.push('Deep loaded knee flexion without alignment correction')
  }

  const kneeHasConcern = kneeSeverity(kneeAlignment) === 'significant'

  return {
    headPosition: makeDim('hp', headPos, true, `Head position assessed as '${headPos}' from posture analysis.`),
    shoulderRounding: makeDim('sr', shoulderRound, true, `Shoulder rounding: '${shoulderRound}'.`),
    thoracicCurve: makeDim('tc', thoracicCurve, true, `Thoracic curve: '${thoracicCurve}'.`),
    lumbarPosition: makeDim('lp', lumbarPos, true, `Lumbar position: '${lumbarPos}'.`),
    pelvicTilt: makeDim('pt', pelvicTilt, true, `Pelvic tilt: '${pelvicTilt}'.`),
    kneeAlignment: makeDim('ka', kneeAlignment, false, `Knee alignment: '${kneeAlignment}'.`, kneeHasConcern),
    weightDistribution: makeDim('wd', weightDist, false, `Weight distribution: '${weightDist}'.`),
    standingSymmetry: makeDim('ss', standingSymm, false, `Standing symmetry: '${standingSymm}'.`),
    notablePatterns,
    suggestedContraindications,
  }
}
