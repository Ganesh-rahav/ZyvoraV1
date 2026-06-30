'use client'

/**
 * hooks/usePhotoValidation.ts
 *
 * React hook wrapping the AI quality validation service.
 * Replaces the mockValidatePhoto() call in ValidationScreen.tsx.
 */

import { useState, useCallback } from 'react'
import { validatePhotoQuality } from '@/lib/ai/services'
import type { ImageQualityMetrics } from '@/lib/ai/types/vision'
import { toAIError } from '@/lib/ai/errors'

export interface UsePhotoValidationState {
  isValidating: boolean
  result: ImageQualityMetrics | null
  error: string | null
}

export interface UsePhotoValidationReturn {
  validationState: UsePhotoValidationState
  validate: (photoUrl: string) => Promise<ImageQualityMetrics | null>
  reset: () => void
}

const IDLE: UsePhotoValidationState = {
  isValidating: false,
  result: null,
  error: null,
}

export function usePhotoValidation(): UsePhotoValidationReturn {
  const [validationState, setValidationState] = useState<UsePhotoValidationState>(IDLE)

  const validate = useCallback(async (photoUrl: string): Promise<ImageQualityMetrics | null> => {
    setValidationState({ isValidating: true, result: null, error: null })
    try {
      const result = await validatePhotoQuality(photoUrl)
      setValidationState({ isValidating: false, result, error: null })
      return result
    } catch (err) {
      const aiError = toAIError(err)
      setValidationState({ isValidating: false, result: null, error: aiError.message })
      return null
    }
  }, [])

  const reset = useCallback(() => {
    setValidationState(IDLE)
  }, [])

  return { validationState, validate, reset }
}
