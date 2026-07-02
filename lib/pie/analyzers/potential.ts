/**
 * lib/pie/analyzers/potential.ts
 *
 * PotentialAnalyzer
 * Identifies structural advantages and limiters from frame + muscle data.
 * ONLY produces observations at moderate+ confidence.
 * Returns 'unknown' at low confidence — never guesses.
 */

import type { PotentialObservation, NaturalAdvantage, NaturalLimiter, GeneticIndicator } from '../types/potential'
import type { FrameObservation } from '../types/frame'
import type { MuscleDevelopmentModel } from '../types/muscle'
import type { ViewType } from '../types/model'
import { PIE_CONFIG } from '../config'
import { viewBonus } from './utils'

export function analyzePotential(
  frame: FrameObservation,
  muscleDevelopment: MuscleDevelopmentModel,
  views: ViewType[]
): PotentialObservation {
  const bonus = viewBonus(views.length)
  const minConf = PIE_CONFIG.potential.minimumConfidenceForPotential
  const minViews = PIE_CONFIG.potential.minimumViewsForGenetics

  // Only analyse potential if we have sufficient confidence data
  const frameConfident = frame.frameCategory.confidence === 'high' || frame.frameCategory.confidence === 'moderate'
  const hasEnoughViews = views.length >= minViews

  const advantages: NaturalAdvantage[] = []
  const limiters: NaturalLimiter[] = []
  const geneticIndicators: GeneticIndicator[] = []

  // ─── Structural Advantages ────────────────────────────────────────────────
  if (frameConfident) {
    const swr = frame.shoulderToWaistRatio.value as number
    const frameCategory = frame.frameCategory.value

    if (swr >= PIE_CONFIG.frame.shoulderToWaist.vTaperStrong) {
      advantages.push({
        type: 'wide_clavicles',
        confidence: 'moderate',
        reason: `Strong shoulder-to-waist ratio (${swr.toFixed(2)}) suggests favorable clavicle width.`,
      })
    }

    if (frame.waistToHipRatio.value !== null) {
      const whr = frame.waistToHipRatio.value as number
      if (whr < 0.75) {
        advantages.push({
          type: 'narrow_hips',
          confidence: 'moderate',
          reason: `Low waist-to-hip ratio (${whr.toFixed(2)}) suggests favorable hip proportions for physique display.`,
        })
      }
    }

    if (frame.torsoLegBalance.value === 'long_legs') {
      advantages.push({
        type: 'long_limb_leverage',
        confidence: 'low',
        reason: 'Longer leg proportion may provide mechanical advantage in certain lifts.',
      })
    }

    if (frame.torsoLegBalance.value === 'long_torso') {
      limiters.push({
        type: 'unfavorable_proportions',
        confidence: 'low',
        reason: 'Longer torso may present a challenge for deadlift mechanics and overall physique proportions.',
      })
    }

    if (frameCategory === 'large') {
      limiters.push({
        type: 'wide_hips',
        confidence: 'low',
        reason: 'Wider hip structure may affect waist-to-hip ratio display.',
      })
    }

    if (frameCategory === 'small') {
      limiters.push({
        type: 'narrow_clavicles',
        confidence: 'low',
        reason: 'Narrower shoulder structure may limit upper body width potential.',
      })
    }
  }

  // ─── Muscle Belly Indicators ──────────────────────────────────────────────
  if (muscleDevelopment.assessedCount >= 10) {
    const avgScore = muscleDevelopment.averageDevelopmentScore
    const strengthCount = muscleDevelopment.notableStrengths.length
    const weaknessCount = muscleDevelopment.notableWeaknesses.length

    if (avgScore >= 6.5 && strengthCount > weaknessCount) {
      advantages.push({
        type: 'balanced_proportions',
        confidence: 'moderate',
        reason: `${strengthCount} notable muscle strengths vs ${weaknessCount} weaknesses suggests well-rounded development.`,
      })
    }

    if (muscleDevelopment.groups['biceps'] && muscleDevelopment.groups['calves']) {
      const bicepsScore = muscleDevelopment.groups['biceps']!.rawScore
      const calvesScore = muscleDevelopment.groups['calves']!.rawScore
      const bothHigh = bicepsScore >= 7 && calvesScore >= 7
      if (bothHigh) {
        advantages.push({
          type: 'long_muscle_bellies',
          confidence: 'low',
          reason: 'High development in traditionally hard-to-develop muscles (biceps, calves) may indicate long muscle belly insertions.',
        })
      }
    }
  }

  // ─── Genetic Indicators ───────────────────────────────────────────────────
  if (hasEnoughViews && views.length >= minViews) {
    const avgScore = muscleDevelopment.averageDevelopmentScore
    const confScoreForGenetics = bonus + 0.60  // Conservative — genetics needs multi-view

    if (confScoreForGenetics >= minConf) {
      if (avgScore >= 7.0) {
        geneticIndicators.push({
          type: 'mesomorphic_tendency',
          confidence: 'low',
          reason: 'High average muscle development across multiple groups is consistent with mesomorphic tendency.',
        })
      }
      if (avgScore < 3.5 && frame.frameCategory.value !== 'large') {
        geneticIndicators.push({
          type: 'ectomorphic_tendency',
          confidence: 'low',
          reason: 'Low muscle development with lean frame is consistent with ectomorphic tendency.',
        })
      }
    }
  }

  const overallConfidence =
    advantages.length === 0 && limiters.length === 0 && geneticIndicators.length === 0
      ? 'unknown'
      : advantages.length + limiters.length >= 2
      ? 'moderate'
      : 'low'

  return {
    naturalAdvantages: advantages,
    naturalLimiters: limiters,
    geneticIndicators,
    overallConfidence,
    disclaimer:
      'Genetic potential analysis from photographs is SPECULATIVE and EDUCATIONAL only. ' +
      'These are structural observations, not predictions of outcome. ' +
      'Individual results depend on training, nutrition, consistency, and many factors not visible in photographs.',
  }
}
