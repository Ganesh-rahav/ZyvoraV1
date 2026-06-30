'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react'
import type { OnboardingData, OnboardingState } from '@/types/onboarding'

// ─── Actions ─────────────────────────────────────────────────────────────────
type Action =
  | { type: 'UPDATE_DATA'; payload: Partial<OnboardingData> }
  | { type: 'NEXT_STEP'; totalVisible: number }
  | { type: 'PREV_STEP' }
  | { type: 'GO_TO_STEP'; step: number }
  | { type: 'SET_SUBMITTING'; value: boolean }
  | { type: 'COMPLETE' }

// ─── Initial state ────────────────────────────────────────────────────────────
const INITIAL_STATE: OnboardingState = {
  currentStep: 0,
  totalSteps: 14,         // updated by engine after filtering conditions
  data: {
    units: 'metric',
    secondaryGoals: [],
    motivations: [],
    motivationCustom: '',
    gymEquipment: [],
    homeEquipment: [],
    allergies: ['none'],
    supplements: ['none'],
    injuries: [],
    hasInjuries: false,
    injuryNotes: '',
    daysPerWeek: 4,
    mealFrequency: 3,
    sleepQuality: 3,
    stressLevel: 3,
    energyLevel: 3,
    cookingConfidence: 3,
  },
  isSubmitting: false,
  isComplete: false,
}

// ─── Reducer ──────────────────────────────────────────────────────────────────
function onboardingReducer(state: OnboardingState, action: Action): OnboardingState {
  switch (action.type) {
    case 'UPDATE_DATA':
      return { ...state, data: { ...state.data, ...action.payload } }

    case 'NEXT_STEP':
      return {
        ...state,
        currentStep: Math.min(state.currentStep + 1, action.totalVisible - 1),
      }

    case 'PREV_STEP':
      return { ...state, currentStep: Math.max(state.currentStep - 1, 0) }

    case 'GO_TO_STEP':
      return { ...state, currentStep: action.step }

    case 'SET_SUBMITTING':
      return { ...state, isSubmitting: action.value }

    case 'COMPLETE':
      return { ...state, isComplete: true }

    default:
      return state
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────
interface OnboardingContextValue {
  state: OnboardingState
  updateData: (updates: Partial<OnboardingData>) => void
  nextStep: (totalVisible: number) => void
  prevStep: () => void
  goToStep: (step: number) => void
  setSubmitting: (value: boolean) => void
  complete: () => void
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null)

// ─── Provider ─────────────────────────────────────────────────────────────────
const STORAGE_KEY = 'zyvora_onboarding_state'

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(onboardingReducer, INITIAL_STATE, (initial) => {
    // Hydrate from localStorage on first mount
    if (typeof window === 'undefined') return initial
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) return initial
      const parsed = JSON.parse(raw) as Partial<OnboardingState>
      return {
        ...initial,
        currentStep: parsed.currentStep ?? initial.currentStep,
        data: { ...initial.data, ...(parsed.data ?? {}) },
      }
    } catch {
      return initial
    }
  })

  // Persist to localStorage on every state change
  const persist = useCallback((s: OnboardingState) => {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ currentStep: s.currentStep, data: s.data })
      )
    } catch {
      // Storage quota exceeded — silent fail
    }
  }, [])

  const updateData = useCallback(
    (updates: Partial<OnboardingData>) => {
      dispatch({ type: 'UPDATE_DATA', payload: updates })
      // Persist after update (state hasn't updated yet so compute manually)
      const next = { ...state, data: { ...state.data, ...updates } }
      persist(next)
    },
    [state, persist]
  )

  const nextStep = useCallback(
    (totalVisible: number) => {
      dispatch({ type: 'NEXT_STEP', totalVisible })
      const next = { ...state, currentStep: Math.min(state.currentStep + 1, totalVisible - 1) }
      persist(next)
    },
    [state, persist]
  )

  const prevStep = useCallback(() => {
    dispatch({ type: 'PREV_STEP' })
    const next = { ...state, currentStep: Math.max(state.currentStep - 1, 0) }
    persist(next)
  }, [state, persist])

  const goToStep = useCallback(
    (step: number) => {
      dispatch({ type: 'GO_TO_STEP', step })
      persist({ ...state, currentStep: step })
    },
    [state, persist]
  )

  const setSubmitting = useCallback((value: boolean) => {
    dispatch({ type: 'SET_SUBMITTING', value })
  }, [])

  const complete = useCallback(() => {
    dispatch({ type: 'COMPLETE' })
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  const value = useMemo(
    () => ({ state, updateData, nextStep, prevStep, goToStep, setSubmitting, complete }),
    [state, updateData, nextStep, prevStep, goToStep, setSubmitting, complete]
  )

  return (
    <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useOnboarding() {
  const ctx = useContext(OnboardingContext)
  if (!ctx) throw new Error('useOnboarding must be used within OnboardingProvider')
  return ctx
}
