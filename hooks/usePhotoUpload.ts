'use client'

/**
 * hooks/usePhotoUpload.ts
 *
 * React hook wrapping the upload pipeline service.
 * Manages upload state machine, progress, and error handling.
 * Designed to replace the mock setTimeout loop in UploadScreen.tsx.
 */

import { useState, useCallback, useRef } from 'react'
import { uploadPhoto }         from '@/lib/ai/services'
import type { UploadResult, UploadStatus, UploadProgressEvent } from '@/lib/ai/types/upload'
import type { PhotoViewType }  from '@/types/photo-analysis'
import { toAIError }           from '@/lib/ai/errors'

export interface UsePhotoUploadState {
  status: UploadStatus
  progress: number
  label: string
  result: UploadResult | null
  error: string | null
}

export interface UsePhotoUploadReturn {
  uploadState: UsePhotoUploadState
  upload: (file: File, viewType: PhotoViewType, onProgress?: (event: UploadProgressEvent) => void) => Promise<UploadResult | null>
  reset: () => void
  cancel: () => void
}

const IDLE_STATE: UsePhotoUploadState = {
  status:   'idle',
  progress: 0,
  label:    '',
  result:   null,
  error:    null,
}

export function usePhotoUpload(): UsePhotoUploadReturn {
  const [uploadState, setUploadState] = useState<UsePhotoUploadState>(IDLE_STATE)
  const cancelledRef = useRef(false)

  const handleProgress = useCallback((event: UploadProgressEvent) => {
    if (cancelledRef.current) return
    setUploadState((prev) => ({
      ...prev,
      status:   event.status,
      progress: event.progress,
      label:    event.label,
    }))
  }, [])

  const upload = useCallback(async (
    file: File,
    viewType: PhotoViewType,
    externalOnProgress?: (event: UploadProgressEvent) => void
  ): Promise<UploadResult | null> => {
    cancelledRef.current = false

    setUploadState({
      status: 'validating', progress: 0, label: 'Preparing...', result: null, error: null,
    })

    const combinedProgress = (event: UploadProgressEvent) => {
      handleProgress(event)
      externalOnProgress?.(event)
    }
    try {
      const result = await uploadPhoto({
        file,
        viewType,
        onProgress: combinedProgress,
      })

      if (cancelledRef.current) return null

      setUploadState((prev) => ({
        ...prev,
        status:   'complete',
        progress: 100,
        label:    'Upload complete',
        result,
        error:    null,
      }))

      return result
    } catch (err) {
      const aiError = toAIError(err)
      setUploadState((prev) => ({
        ...prev,
        status:   'error',
        progress: 0,
        label:    'Upload failed',
        result:   null,
        error:    aiError.message,
      }))
      return null
    }
  }, [handleProgress])

  const reset = useCallback(() => {
    cancelledRef.current = false
    setUploadState(IDLE_STATE)
  }, [])

  const cancel = useCallback(() => {
    cancelledRef.current = true
    setUploadState((prev) => ({ ...prev, status: 'cancelled', label: 'Cancelled' }))
  }, [])

  return { uploadState, upload, reset, cancel }
}
