'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CoachingSessionPage } from '@/components/coaching-session'
import { assembleCEESession } from '@/lib/cee'
import { assembleUserContext, runZCIPipeline } from '@/lib/zci'
import type { CoachingSession } from '@/lib/cee/types/session'
import type {
  OnboardingData,
  GoalType,
  MotivationType,
  Scale5,
  SupplementType,
  AllergyType,
  GymEquipment,
} from '@/types/onboarding'

// ─── Fallback demo data ───────────────────────────────────────────────────────
// Used when localStorage has no onboarding data yet.

const DEMO_ONBOARDING: Partial<OnboardingData> = {
  firstName:           'there',
  biologicalSex:       'male',
  heightCm:            178,
  weightKg:            80,
  primaryGoal:         'build_muscle' as GoalType,
  secondaryGoals:      ['build_strength'] as GoalType[],
  timeline:            '6_months',
  motivations:         ['confidence', 'performance'] as MotivationType[],
  experienceLevel:     'intermediate',
  daysPerWeek:         4,
  sessionDuration:     '60min',
  preferredTime:       'morning',
  trainingEnvironment: 'gym',
  activityLevel:       'moderately_active',
  sleepQuality:        3 as Scale5,
  stressLevel:         3 as Scale5,
  energyLevel:         3 as Scale5,
  dietStyle:           'no_restrictions',
  mealFrequency:       3,
  cookingConfidence:   3 as Scale5,
  coachPersonality:    'balanced',
  hasInjuries:         false,
  injuries:            [],
  supplements:         ['none'] as SupplementType[],
  allergies:           ['none'] as AllergyType[],
  gymEquipment:        ['barbells', 'dumbbells', 'cables'] as GymEquipment[],
  homeEquipment:       [],
  occupation:          'desk_job',
}

// ─── Read onboarding from localStorage ────────────────────────────────────────

function readOnboardingData(): Partial<OnboardingData> {
  if (typeof window === 'undefined') return DEMO_ONBOARDING
  try {
    const raw = window.localStorage.getItem('zyvora_onboarding')
    if (raw) return JSON.parse(raw) as Partial<OnboardingData>
  } catch { /* ignore */ }
  return DEMO_ONBOARDING
}

// ─── Page component ───────────────────────────────────────────────────────────

export default function CoachingSessionRoute() {
  const router = useRouter()
  const [session, setSession] = useState<CoachingSession | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function buildSession() {
      try {
        const onboarding = readOnboardingData()

        // Assemble ZCI user context
        const ctx = assembleUserContext({
          onboarding,
          interactionType: 'initial_analysis',
        })

        // Run the ZCI pipeline (async — may call Vision API in production)
        const { output } = await runZCIPipeline(ctx)

        if (cancelled) return

        // Assemble CEE session
        // PIE model omitted in Sprint 5B — photo results wired in Sprint 6
        const ceeSession = assembleCEESession(output, ctx)

        setSession(ceeSession)
      } catch (err) {
        if (cancelled) return
        console.error('[CEE] Session assembly failed:', err)
        setError('Something went wrong preparing your session. Redirecting…')
        setTimeout(() => router.push('/dashboard'), 2000)
      }
    }

    void buildSession()
    return () => { cancelled = true }
  }, [router])

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0F172A]">
        <p className="text-[14px] text-[#475569]">{error}</p>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0F172A]">
        <div className="flex flex-col items-center gap-5">
          <div className="relative flex h-14 w-14 items-center justify-center">
            <div className="absolute inset-0 animate-ping rounded-full bg-[#3B82F6]/20" />
            <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#3B82F6] to-[#10B981] shadow-lg shadow-[#3B82F6]/20">
              <span className="text-lg font-bold text-white">Z</span>
            </div>
          </div>
          <div className="text-center">
            <p className="text-[15px] font-medium text-[#E2E8F0]">Preparing your session</p>
            <p className="mt-1 text-[13px] text-[#475569]">Reviewing your profile…</p>
          </div>
        </div>
      </div>
    )
  }

  return <CoachingSessionPage session={session} />
}
