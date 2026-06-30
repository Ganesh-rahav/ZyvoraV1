/**
 * lib/ai/services/analysis-service.ts
 *
 * Physique analysis orchestrator.
 * Converts a stored photo into a PhysiqueAnalysis by:
 *   1. Fetching the photo as base64 (from object URL or storage)
 *   2. Calling the active IVisionProvider
 *   3. Auditing the result
 *
 * All vision provider calls go through this service — never called directly from UI.
 */

import type { PhysiqueAnalysis, VisionAnalysisInput } from '../types/vision'
import type { PhotoViewType } from '@/types/photo-analysis'
import { getVisionProvider }       from '../providers'
import { emitAuditEvent, getSessionId } from '../security'
import { toAIError }               from '../errors'
import { logger }                  from '@/lib/logger'

export interface AnalysisServiceInput {
  /** Object URL or HTTP URL to the photo */
  photoUrl: string
  viewType: PhotoViewType
  uploadId?: string
  userContext?: VisionAnalysisInput['userContext']
}

/**
 * Convert a blob: or https: URL to a base64 string.
 * Runs entirely client-side for blob: URLs.
 */
async function urlToBase64(url: string): Promise<{ base64: string; mimeType: 'image/jpeg' | 'image/png' | 'image/webp' }> {
  const response = await fetch(url)
  const blob = await response.blob()
  const mimeType = (blob.type || 'image/jpeg') as 'image/jpeg' | 'image/png' | 'image/webp'

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      // Strip the data URL prefix: "data:image/jpeg;base64,"
      const base64 = result.split(',')[1] ?? ''
      resolve({ base64, mimeType })
    }
    reader.onerror = () => reject(new Error('Failed to read photo as base64'))
    reader.readAsDataURL(blob)
  })
}

export async function analysePhoto(input: AnalysisServiceInput): Promise<PhysiqueAnalysis> {
  const { photoUrl, viewType, uploadId, userContext } = input
  const sessionId = getSessionId()
  const startTime = Date.now()

  logger.info('Physique analysis started', { operation: 'analysePhoto', meta: { viewType, uploadId } })
  emitAuditEvent('PHOTO_ANALYSIS_STARTED', sessionId, true, { uploadId })

  try {
    // Convert photo URL → base64
    const { base64, mimeType } = await urlToBase64(photoUrl)

    const visionInput: VisionAnalysisInput = {
      imageBase64: base64,
      mimeType,
      viewType,
      userContext,
    }

    const provider = getVisionProvider()
    const result = await provider.analyze(visionInput)

    const durationMs = Date.now() - startTime
    logger.info('Physique analysis completed', {
      operation: 'analysePhoto',
      durationMs,
      meta: { provider: result.provider, viewType },
    })

    emitAuditEvent('PHOTO_ANALYSIS_COMPLETED', sessionId, true, {
      uploadId,
      durationMs,
    })

    return result
  } catch (err) {
    const aiError = toAIError(err)
    logger.error('Physique analysis failed', aiError, { meta: { viewType, uploadId } })
    emitAuditEvent('PHOTO_ANALYSIS_FAILED', sessionId, false, {
      uploadId,
      errorCode: aiError.code,
    })
    throw aiError
  }
}

/**
 * Run a lightweight quality check on a photo without full analysis.
 * Used by the Validation screen to give immediate quality feedback.
 */
export async function validatePhotoQuality(photoUrl: string) {
  const { base64, mimeType } = await urlToBase64(photoUrl)
  const provider = getVisionProvider()
  return provider.validate(base64, mimeType)
}
