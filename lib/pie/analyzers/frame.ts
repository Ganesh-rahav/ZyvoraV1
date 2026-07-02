/**
 * lib/pie/analyzers/frame.ts
 *
 * FrameAnalyzer
 * Estimates skeletal frame proportions from landmark positions.
 * Frame is NOT modifiable through training — it informs potential and programming.
 */

import type { PhysiqueAnalysis } from '@/lib/ai/types/vision'
import type { FrameObservation, FrameCategory, SWRCategory, WHRCategory, TorsoLegBalance } from '../types/frame'
import type { ViewType } from '../types/model'
import { PIE_CONFIG } from '../config'
import { pieId, now, scoreToConfidence, viewBonus, viewsToSources } from './utils'

export function analyzeFrame(
  analyses: Partial<Record<ViewType, PhysiqueAnalysis>>,
  heightCm: number,
  biologicalSex: 'male' | 'female'
): FrameObservation {
  const views = Object.keys(analyses) as ViewType[]
  const bonus = viewBonus(views.length)
  const evidenceSources = viewsToSources(views)

  const hasFrontView = views.includes('front')
  const hasSideView = views.includes('side')

  // ─── Extract landmarks from front view ───────────────────────────────────
  const frontAnalysis = analyses.front
  let shoulderWidthRel = 0.28  // Default relative shoulder width (28% of height)
  let hipWidthRel = 0.22       // Default relative hip width
  let waistRel = 0.18          // Default relative waist

  if (frontAnalysis) {
    const landmarks = frontAnalysis.landmarks
    const leftShoulder = landmarks.find((l) => l.id === 'left_shoulder')
    const rightShoulder = landmarks.find((l) => l.id === 'right_shoulder')
    const leftHip = landmarks.find((l) => l.id === 'left_hip')
    const rightHip = landmarks.find((l) => l.id === 'right_hip')
    const headTop = landmarks.find((l) => l.id === 'head_top')
    const ankle = landmarks.find((l) => l.id === 'left_ankle')

    if (leftShoulder && rightShoulder) {
      shoulderWidthRel = Math.abs(rightShoulder.x - leftShoulder.x)
    }
    if (leftHip && rightHip) {
      hipWidthRel = Math.abs(rightHip.x - leftHip.x)
    }
    // Waist is estimated as 80% of hip width (anatomical approximation)
    waistRel = hipWidthRel * 0.80

    // Torso/leg ratio from landmark positions
    if (headTop && leftHip && ankle) {
      const torsoFraction = leftHip.y - headTop.y   // Head to hip
      const legFraction = ankle.y - leftHip.y        // Hip to ankle
      // Store for use below
      void torsoFraction
      void legFraction
    }
  }

  const shoulderCm = shoulderWidthRel * heightCm
  const hipCm = hipWidthRel * heightCm
  const waistCm = waistRel * heightCm
  const frameConf = hasFrontView ? scoreToConfidence(0.75, bonus) : 'unknown'

  // ─── Shoulder Width Observation ───────────────────────────────────────────
  const shoulderWidth = {
    id: pieId('sw'),
    observedAt: now(),
    analyzer: 'frame',
    min: Math.round(shoulderCm * 0.95 * 10) / 10,
    max: Math.round(shoulderCm * 1.05 * 10) / 10,
    midpoint: Math.round(shoulderCm * 10) / 10,
    unit: 'cm (estimated)',
    confidence: frameConf,
    visibility: hasFrontView ? 'clearly_visible' as const : 'not_visible' as const,
    reason: `Shoulder width estimated from landmark positions relative to height (${heightCm}cm).`,
    evidenceSources,
    needsHumanReview: false,
  }

  const hipWidth = {
    id: pieId('hw'),
    observedAt: now(),
    analyzer: 'frame',
    min: Math.round(hipCm * 0.95 * 10) / 10,
    max: Math.round(hipCm * 1.05 * 10) / 10,
    midpoint: Math.round(hipCm * 10) / 10,
    unit: 'cm (estimated)',
    confidence: frameConf,
    visibility: hasFrontView ? 'clearly_visible' as const : 'not_visible' as const,
    reason: `Hip width estimated from landmark positions relative to height (${heightCm}cm).`,
    evidenceSources,
    needsHumanReview: false,
  }

  // ─── Shoulder-to-Waist Ratio ──────────────────────────────────────────────
  const swr = waistCm > 0 ? shoulderCm / waistCm : 0
  const swrCategory = classifySWR(swr)

  // ─── Waist-to-Hip Ratio ───────────────────────────────────────────────────
  const whr = hipCm > 0 ? waistCm / hipCm : 0
  const whrCategory = classifyWHR(whr, biologicalSex)

  // ─── Torso/Leg Balance ────────────────────────────────────────────────────
  const torsoLegBalance = hasSideView || hasFrontView
    ? classifyTorsoLeg(frontAnalysis, heightCm)
    : 'not_assessable' as TorsoLegBalance

  // ─── Frame Category ───────────────────────────────────────────────────────
  const frameCategory = classifyFrame(shoulderWidthRel, hipWidthRel, swr)

  return {
    shoulderWidth,
    hipWidth,
    shoulderToWaistRatio: {
      id: pieId('swr'),
      observedAt: now(),
      analyzer: 'frame',
      value: Math.round(swr * 100) / 100,
      category: swrCategory,
      confidence: hasFrontView ? scoreToConfidence(0.70, bonus) : 'unknown',
      visibility: hasFrontView ? 'clearly_visible' : 'not_visible',
      reason: `Shoulder-to-waist ratio: ${swr.toFixed(2)}. Classification: ${swrCategory}.`,
      evidenceSources,
      needsHumanReview: false,
    },
    waistToHipRatio: {
      id: pieId('whr'),
      observedAt: now(),
      analyzer: 'frame',
      value: Math.round(whr * 100) / 100,
      category: whrCategory,
      confidence: hasFrontView ? scoreToConfidence(0.68, bonus) : 'unknown',
      visibility: hasFrontView ? 'clearly_visible' : 'not_visible',
      reason: `Waist-to-hip ratio: ${whr.toFixed(2)}. Classification: ${whrCategory}.`,
      evidenceSources,
      needsHumanReview: false,
    },
    torsoLegBalance: {
      id: pieId('tlb'),
      observedAt: now(),
      analyzer: 'frame',
      value: torsoLegBalance,
      confidence: hasFrontView ? scoreToConfidence(0.60, bonus) : 'unknown',
      visibility: hasFrontView ? 'partially_visible' : 'not_visible',
      reason: `Torso/leg balance ${torsoLegBalance === 'not_assessable' ? 'could not be assessed from available views' : `classified as '${torsoLegBalance}' from landmark proportions`}.`,
      evidenceSources,
      needsHumanReview: false,
    },
    frameCategory: {
      id: pieId('fc'),
      observedAt: now(),
      analyzer: 'frame',
      value: frameCategory,
      confidence: hasFrontView ? scoreToConfidence(0.65, bonus) : 'unknown',
      visibility: hasFrontView ? 'clearly_visible' : 'not_visible',
      reason: `Frame classified as '${frameCategory}' from shoulder width (${shoulderWidthRel.toFixed(2)}), hip width (${hipWidthRel.toFixed(2)}), and SWR (${swr.toFixed(2)}).`,
      evidenceSources,
      needsHumanReview: false,
    },
    disclaimer:
      'Frame analysis from photographs has significant limitations (±15%). ' +
      'Accurate proportional measurements require calibrated photography or clinical measurement.',
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function classifySWR(swr: number): SWRCategory {
  const t = PIE_CONFIG.frame.shoulderToWaist
  if (swr === 0) return 'not_assessable'
  if (swr >= t.vTaperStrong) return 'v_taper_strong'
  if (swr >= t.vTaperModerate) return 'v_taper_moderate'
  if (swr >= t.straight) return 'straight'
  return 'inverse'
}

function classifyWHR(whr: number, sex: 'male' | 'female'): WHRCategory {
  const t = PIE_CONFIG.frame.waistToHip[sex]
  if (whr === 0) return 'not_assessable'
  if (whr < t.veryLow) return 'very_low'
  if (whr < t.low) return 'low'
  if (whr < t.average) return 'average'
  return 'high'
}

function classifyTorsoLeg(
  frontAnalysis: PhysiqueAnalysis | undefined,
  _heightCm: number
): TorsoLegBalance {
  if (!frontAnalysis) return 'not_assessable'

  const landmarks = frontAnalysis.landmarks
  const headTop = landmarks.find((l) => l.id === 'head_top')
  const hip = landmarks.find((l) => l.id === 'left_hip')
  const ankle = landmarks.find((l) => l.id === 'left_ankle')

  if (!headTop || !hip || !ankle) return 'not_assessable'

  const torso = hip.y - headTop.y
  const legs = ankle.y - hip.y
  const ratio = torso / legs

  if (ratio > 0.65) return 'long_torso'
  if (ratio < 0.45) return 'long_legs'
  return 'balanced'
}

function classifyFrame(
  shoulderRel: number,
  hipRel: number,
  swr: number
): FrameCategory {
  if (shoulderRel > 0.32 && swr >= 1.35) return 'mesomorphic'
  if (shoulderRel > 0.32) return 'large'
  if (shoulderRel < 0.24) return 'small'
  if (hipRel > 0.26) return 'endomorphic'
  if (shoulderRel < 0.28 && hipRel < 0.22) return 'ectomorphic'
  return 'medium'
}
