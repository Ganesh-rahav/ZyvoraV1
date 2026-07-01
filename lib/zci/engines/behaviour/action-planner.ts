/**
 * lib/zci/engines/behaviour/action-planner.ts
 *
 * ActionPlanner — converts coaching decisions into specific, executable action steps.
 *
 * The Golden Rule: every action step must influence BEHAVIOUR.
 * Bad:  "Eat more protein."
 * Good: "Add one palm-sized portion of chicken or Greek yoghurt after training.
 *        That single habit, done consistently, will add ~30g protein to your daily intake."
 */

import type { ActionStep, BehaviourGoal, Recommendation } from '../../types/recommendation'
import type { Priority } from '../../types/priority'
import type { CoachingStrategy } from '../../types/decision'
import type { UserContext } from '../../types/context'
import { nanoid } from '../../utils/nanoid'

export function buildRecommendations(
  selectedPriorities: Priority[],
  strategy: CoachingStrategy,
  ctx: UserContext
): Recommendation[] {
  return selectedPriorities.map((priority) =>
    buildRecommendationForPriority(priority, strategy, ctx)
  )
}

function buildRecommendationForPriority(
  priority: Priority,
  strategy: CoachingStrategy,
  ctx: UserContext
): Recommendation {
  const domain = priority.domain

  // Domain-specific recommendation builders
  if (domain === 'physique_transformation' || domain === 'strength_performance') {
    return buildTrainingRecommendation(priority, strategy, ctx)
  }
  if (domain === 'nutrition_metabolism') {
    return buildNutritionRecommendation(priority, strategy, ctx)
  }
  if (domain === 'recovery_health') {
    return buildRecoveryRecommendation(priority, strategy, ctx)
  }

  // Default recommendation builder for other domains
  return buildDefaultRecommendation(priority, strategy, ctx)
}

// ─── Training Recommendation ──────────────────────────────────────────────────

function buildTrainingRecommendation(
  priority: Priority,
  strategy: CoachingStrategy,
  ctx: UserContext
): Recommendation {
  const { training } = strategy
  const muscleFocus = priority.label
  const firstName = ctx.onboarding.firstName ?? 'you'

  const coachingMessage = buildTrainingMessage(muscleFocus, training, ctx)
  const actionSteps = buildTrainingActionSteps(muscleFocus, training)

  return {
    id: nanoid('rec'),
    headline: `Priority focus: ${muscleFocus} development over the next ${strategy.recommendedCycleLengthWeeks} weeks`,
    coachingMessage,
    whyNow: `Based on your physique assessment, ${muscleFocus.toLowerCase()} is the highest-impact area to address for your ${ctx.goals.primaryGoal.replace('_', ' ')} goal.`,
    expectedBenefit: `With ${training.recommendedFrequencyPerWeek} sessions per week and consistent focus on ${muscleFocus.toLowerCase()}, you should notice improved muscle balance and overall physique proportion within 6–8 weeks.`,
    alternatives: [
      `Alternatively, you could focus on overall volume increase across all muscle groups — this is less targeted but still effective.`,
    ],
    actionSteps,
    behaviourGoal: buildMuscleBehaviourGoal(muscleFocus, training, firstName),
    priorityId: priority.id,
    domain: priority.domain,
    confidence: priority.confidence,
    reasoningTraceId: ctx.sessionId,
  }
}

// ─── Nutrition Recommendation ─────────────────────────────────────────────────

function buildNutritionRecommendation(
  priority: Priority,
  strategy: CoachingStrategy,
  ctx: UserContext
): Recommendation {
  const { nutrition } = strategy
  const { physical, goals } = ctx
  const targetProteinG = Math.round(physical.currentWeightKg * nutrition.proteinGramsPerKg)

  const coachingMessage = `Nutrition is going to be a significant driver of your ${goals.primaryGoal.replace('_', ' ')} results. Based on your stats and activity level, you're looking at a daily calorie target of approximately ${nutrition.dailyCaloriesMin}–${nutrition.dailyCaloriesMax} kcal. The most important variable right now is protein. At your body weight, we're aiming for around ${targetProteinG}g per day — that's the foundation everything else builds on.`

  const actionSteps: ActionStep[] = [
    {
      id: nanoid('act'),
      action: `Hit ${targetProteinG}g of protein daily`,
      rationale: 'Protein is the primary driver of muscle preservation during a deficit and muscle growth in a surplus.',
      timing: 'Daily — spread across all meals',
      successCriteria: 'Protein target hit on 5 out of 7 days per week',
      difficulty: 'moderate',
      frequency: 'daily',
    },
    {
      id: nanoid('act'),
      action: `Stay within the ${nutrition.dailyCaloriesMin}–${nutrition.dailyCaloriesMax} kcal range`,
      rationale: 'Caloric balance is the primary driver of weight direction.',
      timing: 'Track at the end of each day for the first 2 weeks',
      difficulty: 'moderate',
      frequency: 'daily',
    },
  ]

  if (nutrition.behavioralFocus.length > 0) {
    actionSteps.push({
      id: nanoid('act'),
      action: nutrition.behavioralFocus[0],
      rationale: 'Behavioural consistency matters more than precision at this stage.',
      difficulty: 'easy',
      frequency: 'daily',
    })
  }

  return {
    id: nanoid('rec'),
    headline: `Build your nutrition foundation: ${targetProteinG}g protein, ${nutrition.dailyCaloriesMin}–${nutrition.dailyCaloriesMax} kcal`,
    coachingMessage,
    whyNow: 'Starting with nutrition clarity gives every training session a purpose — your body needs the right input to produce the results you want.',
    expectedBenefit: `Consistently hitting these targets should produce ${
      nutrition.caloricBalance === 'deficit' ? '0.3–0.5kg of fat loss per week' :
      nutrition.caloricBalance === 'surplus' ? '0.2–0.4kg of lean mass per month' :
      'stable body composition while recomposition occurs'
    }.`,
    alternatives: [
      'If full tracking feels overwhelming, start by just tracking protein. That single macro accounts for most of the results.',
    ],
    actionSteps,
    priorityId: priority.id,
    domain: priority.domain,
    confidence: priority.confidence,
    reasoningTraceId: ctx.sessionId,
  }
}

// ─── Recovery Recommendation ──────────────────────────────────────────────────

function buildRecoveryRecommendation(
  priority: Priority,
  strategy: CoachingStrategy,
  ctx: UserContext
): Recommendation {
  const { recovery } = strategy
  const { lifestyle } = ctx

  const coachingMessage = `Your recovery is the piece we need to address first. With a sleep quality of ${lifestyle.sleepQuality}/5 and stress at ${lifestyle.stressLevel}/5, your body isn't adapting from training as efficiently as it could. This isn't a minor detail — inadequate recovery limits muscle protein synthesis, elevates cortisol, and makes fat loss harder regardless of how well you train or eat. The good news is that improving sleep quality has a faster payoff than almost any other change you can make.`

  const actionSteps: ActionStep[] = recovery.interventions.map((intervention) => ({
    id: nanoid('act'),
    action: intervention,
    rationale: 'Recovery improvements directly increase the ROI of every training session.',
    difficulty: 'easy' as const,
    frequency: 'daily' as const,
  }))

  return {
    id: nanoid('rec'),
    headline: 'Improve your recovery to unlock your training results',
    coachingMessage,
    whyNow: `Your recovery score is ${lifestyle.recoveryScore}/100 — training on top of poor recovery accumulates fatigue without proportional adaptation.`,
    expectedBenefit: 'Improving sleep quality by 1 point on the 1–5 scale typically improves workout energy, mood, and body composition outcomes within 2–3 weeks.',
    alternatives: [
      'If sleep timing is beyond your control, focus on sleep quality: dark room, cool temperature, no screens 30 minutes before bed.',
    ],
    actionSteps: actionSteps.length > 0 ? actionSteps : [{
      id: nanoid('act'),
      action: 'Set a consistent sleep and wake time — even on weekends',
      rationale: 'Circadian consistency is the highest-leverage sleep improvement.',
      difficulty: 'easy',
      frequency: 'daily',
    }],
    priorityId: priority.id,
    domain: priority.domain,
    confidence: priority.confidence,
    reasoningTraceId: ctx.sessionId,
  }
}

// ─── Default Recommendation ───────────────────────────────────────────────────

function buildDefaultRecommendation(
  priority: Priority,
  _strategy: CoachingStrategy,
  ctx: UserContext
): Recommendation {
  return {
    id: nanoid('rec'),
    headline: `Address: ${priority.label}`,
    coachingMessage: priority.description,
    whyNow: `This was identified as a top-${priority.rank} priority for your ${ctx.goals.primaryGoal.replace('_', ' ')} goal.`,
    expectedBenefit: 'Addressing this priority will contribute to your overall transformation trajectory.',
    alternatives: ['Other approaches exist — this is the highest-impact starting point based on your profile.'],
    actionSteps: [{
      id: nanoid('act'),
      action: `Focus on ${priority.label.toLowerCase()} this coaching cycle`,
      rationale: priority.rankingRationale,
      difficulty: 'moderate',
      frequency: 'weekly',
    }],
    priorityId: priority.id,
    domain: priority.domain,
    confidence: priority.confidence,
    reasoningTraceId: ctx.sessionId,
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildTrainingMessage(
  muscleFocus: string,
  training: CoachingStrategy['training'],
  ctx: UserContext
): string {
  const goal = ctx.goals.primaryGoal.replace('_', ' ')
  const freq = training.recommendedFrequencyPerWeek
  const duration = training.recommendedSessionMinutes

  return `You've got a solid starting point. Looking at your physique, ${muscleFocus.toLowerCase()} is the area where targeted work will make the most visible difference to your overall balance. Over the next ${6} weeks, we're going to give this priority within your ${freq}-day, ${duration}-minute sessions. This isn't about neglecting everything else — it's about making sure your training has a clear direction. For your ${goal} goal, this is the highest-leverage move we can make right now.`
}

function buildTrainingActionSteps(
  muscleFocus: string,
  training: CoachingStrategy['training']
): ActionStep[] {
  return [
    {
      id: nanoid('act'),
      action: `Include 2–3 direct ${muscleFocus.toLowerCase()} exercises per training week`,
      rationale: `Increased volume on the lagging muscle group is the primary driver of hypertrophy in that area.`,
      timing: 'Each training session — place ${muscleFocus.toLowerCase()} work early in the session when fresh',
      successCriteria: 'Progressive overload on at least one exercise each week',
      difficulty: 'moderate',
      frequency: 'per_session',
    },
    {
      id: nanoid('act'),
      action: `Train ${training.recommendedFrequencyPerWeek} days per week consistently`,
      rationale: 'Consistency is the foundation. Missing sessions is the primary reason people plateau.',
      successCriteria: 'At least 90% of planned sessions completed over 4 weeks',
      difficulty: 'moderate',
      frequency: 'weekly',
    },
  ]
}

function buildMuscleBehaviourGoal(
  muscleFocus: string,
  training: CoachingStrategy['training'],
  firstName: string
): BehaviourGoal {
  return {
    id: nanoid('bhv'),
    label: `Establish ${muscleFocus} training priority`,
    currentState: `${muscleFocus} appears underdeveloped relative to overall physique`,
    targetState: `${muscleFocus} receives targeted training 2–3× per week for 6 weeks`,
    personalisation: `Based on ${firstName}'s physique assessment and ${training.phase} training phase`,
    minimumViableAction: `Add one additional ${muscleFocus.toLowerCase()} exercise to this week's training`,
    timeframeDays: 42,
    trackingMethod: 'Progressive overload log — weight/reps on primary exercise weekly',
    domain: 'physique_transformation',
  }
}
