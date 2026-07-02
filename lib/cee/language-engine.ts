/**
 * lib/cee/language-engine.ts
 *
 * LanguageEngine — enforces coach voice across all CEE output.
 *
 * Rules:
 * 1. Never use: Amazing, Perfect, Awesome, Fantastic, Incredible, Outstanding
 * 2. Preferred openers: "Based on what I observed...", "From the information available...",
 *    "At this stage...", "My current understanding is..."
 * 3. Confidence transparency: low confidence → caveat is added
 * 4. No judgment. No shame. No exaggeration.
 * 5. Coach earns authority through reasoning, not enthusiasm.
 */

import type { SessionConfidence, ConfidenceCaveat } from './types/session'
import type { CoachPersonality } from '@/types/onboarding'

// ─── Banned phrases ───────────────────────────────────────────────────────────

const BANNED_WORDS = [
  'amazing', 'incredible', 'outstanding', 'fantastic', 'awesome', 'perfect',
  'excellent', 'brilliant', 'superb', 'phenomenal', 'exceptional', 'extraordinary',
]

/**
 * Sanitise a string to remove banned enthusiastic language.
 * Replaces with neutral equivalents.
 */
export function sanitiseCoachVoice(text: string): string {
  let result = text
  const replacements: Record<string, string> = {
    'amazing': 'solid',
    'incredible': 'meaningful',
    'outstanding': 'clear',
    'fantastic': 'positive',
    'awesome': 'useful',
    'perfect': 'clear',
    'excellent': 'strong',
    'brilliant': 'well-considered',
    'superb': 'strong',
    'phenomenal': 'notable',
    'exceptional': 'distinct',
    'extraordinary': 'meaningful',
  }

  for (const [banned, neutral] of Object.entries(replacements)) {
    // Case-insensitive whole-word replacement
    result = result.replace(
      new RegExp(`\\b${banned}\\b`, 'gi'),
      (match) => match[0] === match[0].toUpperCase() ? neutral[0].toUpperCase() + neutral.slice(1) : neutral
    )
  }

  return result
}

/**
 * Assert a string is coach-voice clean (for testing).
 */
export function assertsCoachVoice(text: string): boolean {
  const lower = text.toLowerCase()
  return !BANNED_WORDS.some((w) => lower.includes(w))
}

// ─── Greeting builders ────────────────────────────────────────────────────────

export function buildGreetingOpener(
  firstName: string,
  personality: CoachPersonality
): string {
  const name = firstName || 'there'
  const openers: Record<CoachPersonality, string> = {
    high_performance: `${name}, I've reviewed your full profile — let's get to work.`,
    encouraging:      `${name}, I've finished going through everything you've shared — and there's a lot to work with here.`,
    scientific:       `${name}, I've completed my review of your profile and physique data.`,
    balanced:         `${name}, I've taken time to go through everything — your goals, your lifestyle, and your photos.`,
    friendly:         `${name}, I've had a good look through everything you shared — thanks for taking the time.`,
  }
  return openers[personality] ?? openers['balanced']
}

export function buildContextSetter(
  primaryGoal: string,
  hasPhotos: boolean,
  overallConfidence: SessionConfidence
): string {
  const goal = primaryGoal.replace(/_/g, ' ')

  if (!hasPhotos) {
    return `Based on what you've shared about your ${goal} goal and your current lifestyle, there are clear areas where focused effort will drive real progress.`
  }

  const confText = overallConfidence === 'high'
    ? 'The photo analysis gave me a clear picture of your current physique.'
    : overallConfidence === 'moderate'
    ? 'The photos provided useful information about your physique, with some areas requiring further context.'
    : 'The photos were helpful, though some observations carry more uncertainty than others — I\'ll be clear about that as we go.'

  return `${confText} Combined with your profile data, I have a solid starting point for your ${goal} coaching.`
}

export function buildSessionIntent(priority1Label?: string): string {
  if (!priority1Label) {
    return `This session sets your starting point. I'll share what I observed, what I think matters most right now, and why — and then I'd like to hear your perspective before we move forward.`
  }
  return `This session sets your starting point. I'll walk through what I observed, why ${priority1Label.toLowerCase()} is the first priority, and what that means in practice. Then I'd like to hear your perspective.`
}

// ─── Coaching statement builders ─────────────────────────────────────────────

export function buildCoachingStatement(
  domain: string,
  label: string,
  personality: CoachPersonality
): string {
  const starters: Record<CoachPersonality, string[]> = {
    high_performance: [
      `This is where focused effort gives you the highest return right now.`,
      `Addressing this systematically will have a clear impact on your ${domain.replace(/_/g, ' ')}.`,
      `This is the most efficient use of your training attention at this stage.`,
    ],
    scientific: [
      `Based on what I observed, this area has the strongest evidence for prioritisation.`,
      `From the available data, this represents the highest-impact opportunity in your ${domain.replace(/_/g, ' ')}.`,
      `The evidence supports this as the primary focus for measurable progress.`,
    ],
    encouraging: [
      `Giving this area your attention over the next few weeks will build a foundation you'll feel.`,
      `At this stage, this is the area where your effort will translate most clearly into results.`,
      `From what I can see, this is where your consistency will pay off most directly.`,
    ],
    balanced: [
      `This is a clear, addressable priority that matches where you are right now.`,
      `The evidence points here — and the path forward is straightforward.`,
      `This is your highest-leverage move at this stage of your training.`,
    ],
    friendly: [
      `This stood out to me as a great place to start — it's the area that'll make the most difference.`,
      `From everything I looked at, this is where your energy will go furthest right now.`,
      `This is the area I'd focus on first — it has the most direct connection to what you're after.`,
    ],
  }

  const options = starters[personality] ?? starters['balanced']
  const idx = label.length % options.length
  return sanitiseCoachVoice(options[idx]!)
}

// ─── Confidence caveat builders ───────────────────────────────────────────────

export function buildCaveat(confidence: SessionConfidence): ConfidenceCaveat | undefined {
  if (confidence === 'high') return undefined
  if (confidence === 'moderate') {
    return {
      text: 'Based on the available information — I\'d want to revisit this as we gather more data.',
      isTransparent: true,
    }
  }
  return {
    text: 'I\'m working with limited information on this point — treat this as a hypothesis to test, not a firm conclusion.',
    isTransparent: true,
  }
}

// ─── Baseline statement builders ─────────────────────────────────────────────

export function buildForwardStatement(weeksRemaining: number | null): string {
  if (!weeksRemaining) {
    return 'These are your reference points. Everything from here is measured against this baseline.'
  }
  if (weeksRemaining <= 8) {
    return `With ${weeksRemaining} weeks to your goal, this baseline matters. Progress is measured from exactly here.`
  }
  return `This is where we start. Future check-ins will measure your progress against exactly these numbers.`
}

// ─── Foundation statement builders ───────────────────────────────────────────

export function buildHonestAcknowledgement(hasPhotos: boolean): string {
  if (!hasPhotos) {
    return `Without photo data, I'm working from your self-reported information. That's a clear starting point — and as you complete your first check-in, the picture will sharpen.`
  }
  return `At this early stage, I'm building a picture from limited data. As we work together, I'll have more context to identify your specific strengths.`
}

export function buildFoundationHeadline(strengthCount: number): string {
  if (strengthCount === 0) {
    return 'Starting Point'
  }
  if (strengthCount === 1) {
    return 'One clear strength to build from'
  }
  return `${strengthCount} strengths identified`
}

// ─── Reasoning statement builders ────────────────────────────────────────────

export function buildWhyNow(
  label: string,
  rankingRationale: string,
  _personality: CoachPersonality
): string {
  const base = sanitiseCoachVoice(rankingRationale)
  if (base.length > 20) return base
  return `At this stage, addressing ${label.toLowerCase()} has the clearest evidence and the most direct path to your goal.`
}

export function buildWhyFirst(rank: number, totalPriorities: number): string {
  if (rank === 1) {
    return `Out of ${totalPriorities} areas I identified, this one has the strongest combination of impact, confidence, and feasibility for where you are right now.`
  }
  if (rank === 2) {
    return `This is the second-highest priority — closely behind the first, and worth attention in parallel or shortly after.`
  }
  return `This rounds out your three focus areas. It's important, but the first two take precedence while you're establishing your rhythm.`
}
