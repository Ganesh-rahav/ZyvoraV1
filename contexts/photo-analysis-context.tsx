'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react'
import type {
  PhotoAnalysisData,
  PhotoAnalysisState,
  PhotoAnalysisStep,
  PhotoFile,
  PhotoViewType,
  PhysiqueAnalysis,
} from '@/types/photo-analysis'
import { PHOTO_ANALYSIS_STEPS } from '@/types/photo-analysis'

// ─── Actions ─────────────────────────────────────────────────────────────────
type Action =
  | { type: 'SET_STEP'; step: PhotoAnalysisStep }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'SET_PHOTO'; viewType: PhotoViewType; photo: PhotoFile }
  | { type: 'REMOVE_PHOTO'; viewType: PhotoViewType }
  | { type: 'SET_ACTIVE_VIEW'; viewType: PhotoViewType }
  | { type: 'SET_SKIPPED'; value: boolean }
  | { type: 'SET_PROCESSING'; value: boolean }
  | { type: 'SET_DONE' }
  | { type: 'SET_ANALYSIS_RESULT'; viewType: PhotoViewType; result: PhysiqueAnalysis }

// ─── Initial state ────────────────────────────────────────────────────────────
const INITIAL_DATA: PhotoAnalysisData = {
  photos: {},
  activeView: 'front',
  skipped: false,
  preparationComplete: false,
  analysisResults: {},
}

const INITIAL_STATE: PhotoAnalysisState = {
  currentStep: 'welcome',
  data: INITIAL_DATA,
  isProcessing: false,
  isDone: false,
}

// ─── Reducer ──────────────────────────────────────────────────────────────────
function reducer(state: PhotoAnalysisState, action: Action): PhotoAnalysisState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.step }

    case 'NEXT_STEP': {
      const idx = PHOTO_ANALYSIS_STEPS.indexOf(state.currentStep)
      const next = PHOTO_ANALYSIS_STEPS[Math.min(idx + 1, PHOTO_ANALYSIS_STEPS.length - 1)]
      return { ...state, currentStep: next ?? state.currentStep }
    }

    case 'PREV_STEP': {
      const idx = PHOTO_ANALYSIS_STEPS.indexOf(state.currentStep)
      const prev = PHOTO_ANALYSIS_STEPS[Math.max(idx - 1, 0)]
      return { ...state, currentStep: prev ?? state.currentStep }
    }

    case 'SET_PHOTO':
      return {
        ...state,
        data: {
          ...state.data,
          photos: { ...state.data.photos, [action.viewType]: action.photo },
        },
      }

    case 'REMOVE_PHOTO': {
      const photos = { ...state.data.photos }
      delete photos[action.viewType]
      return { ...state, data: { ...state.data, photos } }
    }

    case 'SET_ACTIVE_VIEW':
      return { ...state, data: { ...state.data, activeView: action.viewType } }

    case 'SET_SKIPPED':
      return { ...state, data: { ...state.data, skipped: action.value } }

    case 'SET_PROCESSING':
      return { ...state, isProcessing: action.value }

    case 'SET_DONE':
      return { ...state, isDone: true, data: { ...state.data, preparationComplete: true } }

    case 'SET_ANALYSIS_RESULT':
      return {
        ...state,
        data: {
          ...state.data,
          analysisResults: { ...state.data.analysisResults, [action.viewType]: action.result },
        },
      }

    default:
      return state
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────
interface PhotoAnalysisContextValue {
  state: PhotoAnalysisState
  nextStep: () => void
  prevStep: () => void
  setStep: (step: PhotoAnalysisStep) => void
  setPhoto: (viewType: PhotoViewType, photo: PhotoFile) => void
  removePhoto: (viewType: PhotoViewType) => void
  setActiveView: (viewType: PhotoViewType) => void
  setSkipped: (value: boolean) => void
  setProcessing: (value: boolean) => void
  setDone: () => void
  setAnalysisResult: (viewType: PhotoViewType, result: PhysiqueAnalysis) => void
}

const PhotoAnalysisContext = createContext<PhotoAnalysisContextValue | null>(null)

// ─── Storage ──────────────────────────────────────────────────────────────────
const STORAGE_KEY = 'zyvora_photo_analysis_step'

function persistStep(step: PhotoAnalysisStep) {
  if (typeof window === 'undefined') return
  try { window.localStorage.setItem(STORAGE_KEY, step) } catch { /* quota */ }
}

function hydrateStep(): PhotoAnalysisStep {
  if (typeof window === 'undefined') return 'welcome'
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY) as PhotoAnalysisStep | null
    if (raw && PHOTO_ANALYSIS_STEPS.includes(raw)) return raw
  } catch { /* ignore */ }
  return 'welcome'
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function PhotoAnalysisProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE, (initial) => ({
    ...initial,
    currentStep: hydrateStep(),
  }))

  const nextStep = useCallback(() => {
    dispatch({ type: 'NEXT_STEP' })
    const idx = PHOTO_ANALYSIS_STEPS.indexOf(state.currentStep)
    const next = PHOTO_ANALYSIS_STEPS[Math.min(idx + 1, PHOTO_ANALYSIS_STEPS.length - 1)]
    if (next) persistStep(next)
  }, [state.currentStep])

  const prevStep = useCallback(() => {
    dispatch({ type: 'PREV_STEP' })
    const idx = PHOTO_ANALYSIS_STEPS.indexOf(state.currentStep)
    const prev = PHOTO_ANALYSIS_STEPS[Math.max(idx - 1, 0)]
    if (prev) persistStep(prev)
  }, [state.currentStep])

  const setStep = useCallback((step: PhotoAnalysisStep) => {
    dispatch({ type: 'SET_STEP', step })
    persistStep(step)
  }, [])

  const setPhoto = useCallback((viewType: PhotoViewType, photo: PhotoFile) => {
    dispatch({ type: 'SET_PHOTO', viewType, photo })
  }, [])

  const removePhoto = useCallback((viewType: PhotoViewType) => {
    dispatch({ type: 'REMOVE_PHOTO', viewType })
  }, [])

  const setActiveView = useCallback((viewType: PhotoViewType) => {
    dispatch({ type: 'SET_ACTIVE_VIEW', viewType })
  }, [])

  const setSkipped = useCallback((value: boolean) => {
    dispatch({ type: 'SET_SKIPPED', value })
  }, [])

  const setProcessing = useCallback((value: boolean) => {
    dispatch({ type: 'SET_PROCESSING', value })
  }, [])

  const setDone = useCallback(() => {
    dispatch({ type: 'SET_DONE' })
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  const setAnalysisResult = useCallback((viewType: PhotoViewType, result: PhysiqueAnalysis) => {
    dispatch({ type: 'SET_ANALYSIS_RESULT', viewType, result })
  }, [])

  const value = useMemo(
    () => ({ state, nextStep, prevStep, setStep, setPhoto, removePhoto, setActiveView, setSkipped, setProcessing, setDone, setAnalysisResult }),
    [state, nextStep, prevStep, setStep, setPhoto, removePhoto, setActiveView, setSkipped, setProcessing, setDone, setAnalysisResult]
  )

  return (
    <PhotoAnalysisContext.Provider value={value}>
      {children}
    </PhotoAnalysisContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function usePhotoAnalysis() {
  const ctx = useContext(PhotoAnalysisContext)
  if (!ctx) throw new Error('usePhotoAnalysis must be used within PhotoAnalysisProvider')
  return ctx
}
